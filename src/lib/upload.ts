import { Upload } from '@aws-sdk/lib-storage';
import S3 from '@/lib/config/cloudFlare';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { cloudConfig } from '@env';
import { toast } from './hooks/useToast';

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

//签发授权上传Url到R2
export async function uploadFileByUrl(file: File) {
    try {
        const getUrl = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type
            })
        });
        const getUrlRes: IResponse<{
            uploadUrl: string;
            publicUrl: string;
        }> = await getUrl.json();

        if (!getUrlRes.success || !getUrlRes.data?.uploadUrl || !getUrlRes.data?.publicUrl) {
            throw new Error(getUrlRes.message);
        }

        const { uploadUrl, publicUrl } = getUrlRes.data;

        const upload = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });

        if (upload.ok) {
            return publicUrl;
        } else {
            throw new Error('上传失败');
        }
    } catch (error) {
        console.error(error);
        toast({
            title: '失败',
            description: '上传失败',
            variant: 'destructive'
        });
    }
}

export { uploadFile, generatePresignedUrl };
