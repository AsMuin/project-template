import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const DatabaseConfig = {
    connectUrl: process.env.DATABASE_URL!
};
const SecretKey = process.env.JWT_SECRET!;
const cloudConfig = {
    endpoint: process.env.CF_R2_ENDPOINT_URL!,
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
    Bucket: process.env.CF_R2_BUCKET!,
    BucketFolder: process.env.CF_R2_BUCKET_FOLDER!,
    ReturnHost: process.env.CF_R2_RETURN_HOST!
};

export { DatabaseConfig, cloudConfig, SecretKey };
