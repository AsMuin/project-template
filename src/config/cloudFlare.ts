import { Upload } from '@aws-sdk/lib-storage';
import { cloudConfig } from '../../envConfig';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const S3 = new S3Client({
    region: 'auto',
    endpoint: cloudConfig.endpoint,
    credentials: {
        accessKeyId: cloudConfig.accessKeyId!,
        secretAccessKey: cloudConfig.secretAccessKey!
    }
});

function fetContentType(fileName: string) {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'pdf':
            return 'application/pdf';
        case 'txt':
            return 'text/plain';
        case 'mp4':
            return 'video/mp4';
        case 'mp3':
            return 'audio/mpeg';
        default:
            return 'application/octet-stream';
    }
}

async function uploadFile(buffer: Buffer, fileName: string) {
    try {
        const ContentType = fetContentType(fileName);
        const params = {
            Bucket: cloudConfig.Bucket!,
            Key: `${cloudConfig.BucketFolder}/${fileName}`,
            Body: buffer,
            ContentType
        };

        // 使用 lib-storage 进行分片上传
        const upload = new Upload({
            client: S3,
            params,
            queueSize: 4, // 并发分片数
            partSize: 5 * 1024 * 1024 // 每片的大小（这里设置为 5MB）
        });

        upload.on('httpUploadProgress', progress => {
            console.log(`Uploaded ${progress.loaded}/${progress.total} bytes`);
        });

        await upload.done();

        return `${cloudConfig.ReturnHost}/${cloudConfig.BucketFolder}/${fileName}`;
    } catch (e: any) {
        console.error(e);

        return Promise.reject(e);
    }
}

async function generatePresignedUrl(fileName: string, fileType: string) {
    const params = {
        Bucket: cloudConfig.Bucket,
        Key: `${cloudConfig.BucketFolder}/${fileName}`,
        ContentType: fileType // 必须指定文件类型
    };

    // 生成一个有效期为 1 小时的预签名 URL
    const presignedUrl = await getSignedUrl(S3, new PutObjectCommand(params), { expiresIn: 3600 });

    return {
        presignedUrl,
        publicUrl: `${cloudConfig.ReturnHost}/${cloudConfig.BucketFolder}/${fileName}`
    };
}

export { uploadFile, generatePresignedUrl };
