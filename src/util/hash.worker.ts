import SparkMD5 from 'spark-md5';

interface WorkerInputMessage {
    chunks: Blob[];
}

const ctx: Worker = self as any;

ctx.onmessage = async (e: MessageEvent<WorkerInputMessage>) => {
    const { chunks } = e.data;
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();

    let currentIndex = 0;

    // 定义读取完成后的回调
    reader.onload = event => {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        spark.append(arrayBuffer); // 增量计算 MD5

        currentIndex++;

        if (currentIndex < chunks.length) {
            // 发送计算进度
            const message: WorkerOutputMessage = {
                type: 'progress',
                percentage: Number(((currentIndex / chunks.length) * 100).toFixed(2))
            };

            ctx.postMessage(message);
            loadNext();
        } else {
            // 全部读取完毕
            const finalHash = spark.end();
            const finishMsg: WorkerOutputMessage = { type: 'finish', hash: finalHash };

            ctx.postMessage(finishMsg);
        }
    };

    reader.onerror = () => {
        // 实际项目中应向主线程发送错误消息
        throw new Error('Reading blob failed in worker');
    };

    // 递归读取函数
    const loadNext = () => {
        // 直接读取传入的 Blob 对象
        // Blob 在这里只是引用，不会导致内存暴涨，只有 readAsArrayBuffer 会将当前块读入内存
        reader.readAsArrayBuffer(chunks[currentIndex]);
    };

    // 启动读取
    if (chunks.length > 0) {
        loadNext();
    } else {
        // 处理空文件边缘情况
        ctx.postMessage({ type: 'finish', hash: spark.end() } as WorkerOutputMessage);
    }
};
