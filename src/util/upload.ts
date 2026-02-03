import { axiosInstance } from '../lib/request';
import type { AxiosInstance } from 'axios';

import HashWorker from './hash.worker?worker';

interface UploaderOptions {
    uploadUrl: string; // 上传接口
    mergeUrl: string; // 合并接口
    verifyUrl: string; // 校验接口
    chunkSize?: number; // 分片大小，默认 5MB
    concurrency?: number; // 并发数，默认 3
    maxRetries?: number; // 失败重试次数，默认 3
}

// 基础切片：只包含 Blob 和 索引，最纯粹的数据结构
interface RawChunk {
    blob: Blob;
    index: number;
}

// 进度事件数据结构
interface UploadProgress {
    step: 'hashing' | 'uploading' | 'merging' | 'done';
    percentage: number;
    loaded: number;
    total: number;
}

class ChunkUploader {
    private options: Required<UploaderOptions>;
    private axiosInstance: AxiosInstance;
    private aborted: boolean = false;
    private worker: Worker | null = null;

    constructor(options: UploaderOptions) {
        this.options = {
            chunkSize: 5 * 1024 * 1024, // 5MB
            concurrency: 3,
            maxRetries: 3,
            ...options
        };
        this.axiosInstance = axiosInstance;
    }

    /**
     * 核心入口
     */
    public async upload(file: File, onProgress?: (progress: UploadProgress) => void) {
        this.aborted = false;
        const totalSize = file.size;

        // 1. 文件大小校验 (2GB)
        if (totalSize > 2 * 1024 * 1024 * 1024) {
            throw new Error('File is too large (max 2GB)');
        }

        try {
            // ==============================================
            // 步骤 A: 统一文件切片 (Single Source of Truth)
            // ==============================================
            // 这里只是创建了 Blob 的引用数组，非常快，不占用内存
            const rawChunks: RawChunk[] = this._createFileChunks(file);

            // ==============================================
            // 步骤 B: 利用切片计算 Hash (Web Worker)
            // ==============================================
            onProgress?.({ step: 'hashing', percentage: 0, loaded: 0, total: totalSize });

            const fileHash = await this._calculateHashInWorker(rawChunks, percent => {
                onProgress?.({ step: 'hashing', percentage: percent, loaded: 0, total: totalSize });
            });

            if (this.aborted) return;

            // ==============================================
            // 步骤 C: 秒传/断点续传验证
            // ==============================================
            const { shouldUpload, uploadedChunkIndices } = await this._verifyFile(file.name, fileHash);

            if (!shouldUpload) {
                onProgress?.({ step: 'done', percentage: 100, loaded: totalSize, total: totalSize });

                return { message: 'Rapid upload successful' };
            }

            // ==============================================
            // 步骤 D: 过滤并并发上传
            // ==============================================
            // 找出还需要上传的分片
            const chunksToUpload = rawChunks.filter(c => !uploadedChunkIndices.includes(c.index));

            if (chunksToUpload.length > 0) {
                onProgress?.({ step: 'uploading', percentage: 0, loaded: 0, total: totalSize });

                // 传入所有分片(rawChunks)是为了准确计算总进度，传入待传分片(chunksToUpload)是为了执行任务
                await this._uploadChunksConcurrency(chunksToUpload, rawChunks, file.name, fileHash, totalSize, onProgress);
            }

            // ==============================================
            // 步骤 E: 合并请求
            // ==============================================
            if (this.aborted) return;
            onProgress?.({ step: 'merging', percentage: 99, loaded: totalSize, total: totalSize });

            const result = await this._mergeRequest(file.name, fileHash);

            onProgress?.({ step: 'done', percentage: 100, loaded: totalSize, total: totalSize });

            return result;
        } catch (err) {
            this.cleanup();
            throw err;
        }
    }

    public abort() {
        this.aborted = true;
        this.cleanup();
    }

    private cleanup() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }

    /**
     * 1. 纯粹的切片生成器
     */
    private _createFileChunks(file: File) {
        const chunks: RawChunk[] = [];
        const size = this.options.chunkSize;
        let cur = 0;
        let index = 0;

        while (cur < file.size) {
            chunks.push({
                index,
                blob: file.slice(cur, cur + size) // 此时不产生 IO，仅切割指针
            });
            cur += size;
            index++;
        }

        return chunks;
    }

    /**
     * 2. 调用 Worker 计算 Hash
     */
    private _calculateHashInWorker(chunks: RawChunk[], onProgress: (p: number) => void): Promise<string> {
        return new Promise((resolve, reject) => {
            this.worker = new HashWorker();

            // 提取出纯 Blob 数组发送，Structured Clone 算法高效传输
            const blobs = chunks.map(c => c.blob);

            this.worker.postMessage({ chunks: blobs });

            this.worker.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
                const { type } = e.data;

                if (type === 'progress') {
                    onProgress(e.data.percentage);
                } else if (type === 'finish') {
                    this.cleanup(); // 计算完成，释放 Worker 资源
                    resolve(e.data.hash);
                }
            };

            this.worker.onerror = err => {
                this.cleanup();
                reject(err);
            };
        });
    }

    /**
     * 3. 验证文件状态
     */
    private async _verifyFile(filename: string, fileHash: string) {
        const { data } = await this.axiosInstance.post(this.options.verifyUrl, {
            filename,
            fileHash
        });

        return {
            shouldUpload: data.shouldUpload, // boolean
            uploadedChunkIndices: (data.uploadedList as number[]) || []
        };
    }

    /**
     * 4. 并发上传控制
     */
    private async _uploadChunksConcurrency(
        chunksToUpload: RawChunk[],
        allChunks: RawChunk[], // 用于计算总进度
        filename: string,
        fileHash: string,
        totalSize: number,
        onProgress?: (p: UploadProgress) => void
    ) {
        const limit = this.options.concurrency;
        const pool = [...chunksToUpload];
        const executing = new Set<Promise<any>>();

        // 进度表：记录每个分片已上传的大小
        // 初始状态：不需要上传的分片，进度直接设为 chunkSize (或实际大小)
        const progressMap = new Map<number, number>();

        allChunks.forEach(c => {
            if (!chunksToUpload.find(x => x.index === c.index)) {
                progressMap.set(c.index, c.blob.size);
            } else {
                progressMap.set(c.index, 0);
            }
        });

        const updateGlobalProgress = (chunkIndex: number, loaded: number) => {
            progressMap.set(chunkIndex, loaded);
            const totalLoaded = Array.from(progressMap.values()).reduce((a, b) => a + b, 0);
            const percent = Number(((totalLoaded / totalSize) * 100).toFixed(2));

            onProgress?.({
                step: 'uploading',
                percentage: percent,
                loaded: totalLoaded,
                total: totalSize
            });
        };

        // 递归执行器
        const run = async (): Promise<void> => {
            if (this.aborted) throw new Error('Aborted by user');
            if (pool.length === 0) return;

            const chunk = pool.shift()!;

            // 执行上传，并在完成后从 executing 集合移除
            const task = this._uploadSingleChunkWithRetry(chunk, filename, fileHash, updateGlobalProgress)
                .then(() => {
                    executing.delete(task);
                    if (pool.length > 0) return run(); // 接着干下一个
                })
                .catch(err => {
                    // 如果重试耗尽依然报错，则整体失败
                    this.abort();
                    throw err;
                });

            executing.add(task);
        };

        // 启动初始并发队列
        const starters = [];

        for (let i = 0; i < limit && i < chunksToUpload.length; i++) {
            starters.push(run());
        }

        await Promise.all(starters);
    }

    /**
     * 5. 单个分片上传 (带重试)
     */
    private async _uploadSingleChunkWithRetry(
        chunk: RawChunk,
        filename: string,
        fileHash: string,
        onProgress: (idx: number, loaded: number) => void,
        retryCount = 0
    ): Promise<any> {
        try {
            const formData = new FormData();

            formData.append('chunk', chunk.blob);
            formData.append('filename', filename);
            formData.append('fileHash', fileHash);
            formData.append('index', chunk.index.toString());
            // 可选：如果后端需要分片自身的 hash，可以在这里计算，但通常 fileHash + index 够用了

            await this.axiosInstance.post(this.options.uploadUrl, formData, {
                onUploadProgress: e => {
                    if (e.total) onProgress(chunk.index, e.loaded);
                }
            });
        } catch (e) {
            if (retryCount < this.options.maxRetries) {
                // 指数退避重试 (1s, 2s, 4s...)
                const delay = Math.pow(2, retryCount) * 1000;

                await new Promise(resolve => setTimeout(resolve, delay));

                return this._uploadSingleChunkWithRetry(chunk, filename, fileHash, onProgress, retryCount + 1);
            }

            throw e;
        }
    }

    /**
     * 6. 发送合并请求
     */
    private async _mergeRequest(filename: string, fileHash: string) {
        return this.axiosInstance.post(this.options.mergeUrl, {
            filename,
            fileHash,
            chunkSize: this.options.chunkSize
        });
    }
}

export default ChunkUploader;
