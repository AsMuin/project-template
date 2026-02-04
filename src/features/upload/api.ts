import { BaseRequest } from '@/lib/request';

const BASEURL = '/upload';

interface VerifyHashParams {
    fileName: string;
    fileHash: string;
}

interface VerifyHashResponse {
    hasUploaded: boolean;
    uploadedChunkIndices: number[];
}

interface UploadChunkParams {
    fileName: string;
    fileHash: string;
    chunkIndex: number;
    chunk: Blob;
}

interface MergeChunkParams {
    fileName: string;
    fileHash: string;
    chunkSize: number;
}

const verifyHash = new BaseRequest<VerifyHashParams, VerifyHashResponse>({
    method: 'post',
    url: `${BASEURL}/verifyHash`
});

const uploadChunk = new BaseRequest<UploadChunkParams>({
    method: 'post',
    url: `${BASEURL}/uploadChunk`
});

const mergeChunk = new BaseRequest<MergeChunkParams>({
    method: 'post',
    url: `${BASEURL}/mergeChunk`
});

export { verifyHash, uploadChunk, mergeChunk };
