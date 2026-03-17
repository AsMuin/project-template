import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const DATABASE_CONFIG = {
    connectUrl: process.env.DATABASE_URL!
};
const SECRET_KEY = process.env.JWT_SECRET!;
const CLOUD_CONFIG = {
    endpoint: process.env.CF_R2_ENDPOINT_URL!,
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
    Bucket: process.env.CF_R2_BUCKET!,
    BucketFolder: process.env.CF_R2_BUCKET_FOLDER!,
    ReturnHost: process.env.CF_R2_RETURN_HOST!
};

const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST!,
    port: process.env.EMAIL_PORT!,
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
    noReplyEmail: process.env.NO_REPLY_EMAIL!
};

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || process.env.GEMINI_API_KEY || '';

const TWITTER_CONFIG = {
    apiKey: process.env.TWITTER_API_KEY!
};

export { DATABASE_CONFIG, CLOUD_CONFIG, SECRET_KEY, SILICONFLOW_API_KEY, TWITTER_CONFIG, BASE_URL, PORT, CLIENT_URL, EMAIL_CONFIG };
