import { config } from 'dotenv';

config({ path: '.env.local' });

const cloudConfig = {
    endpoint: process.env.CF_R2_ENDPOINT_URL,
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
    Bucket: process.env.CF_R2_BUCKET,
    BucketFolder: process.env.CF_R2_BUCKET_FOLDER,
    ReturnHost: process.env.CF_R2_RETURN_HOST
};

const dataBaseConfig = {
    url: process.env.NODE_ENV === 'development' ? process.env.DATABASE_URL : process.env.DATABASE_PRO_URL
};

const nextProdUrl = process.env.NEXT_PUBLIC_PROD_API_ENDPOINT || 'http://localhost:3000';

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_PROD_API_ENDPOINT;

const resendConfig = {
    token: process.env.RESEND_TOKEN
};

export { cloudConfig, dataBaseConfig, resendConfig, nextProdUrl, baseUrl };
