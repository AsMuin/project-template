import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const S3 = new S3Client({
    region: 'auto',
    endpoint: process.env.CF_R2_ENDPOINT_URL,
    credentials: {
        accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!
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
            Bucket: process.env.CF_R2_BUCKET,
            Key: 'musicFiles/' + fileName,
            Body: buffer,
            ContentType
        };
        const response = await S3.send(new PutObjectCommand(params));
        if (response.$metadata.httpStatusCode !== 200) {
            console.error(response.$metadata.httpStatusCode);
        } else {
            return `${process.env.CF_R2_RETURN_HOST}/musicFiles/${fileName}`;
        }
    } catch (e: any) {
        console.error(e);
    }
}
export default uploadFile;
