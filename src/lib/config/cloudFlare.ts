import { cloudConfig } from '@env';
import { S3Client } from '@aws-sdk/client-s3';

const S3 = new S3Client({
    region: 'auto',
    endpoint: cloudConfig.endpoint,
    credentials: {
        accessKeyId: cloudConfig.accessKeyId!,
        secretAccessKey: cloudConfig.secretAccessKey!
    }
});

export default S3;
