import dotenv from 'dotenv';

dotenv.config({path: './.env'});

export default {
    protocol: 'http',
    origin: 'localhost:3000',
    api: {
        agent: {
            host: 'https://lab.tagroot.io',
        }
    },
    quickLogin: {
        callBackUrl: 'https://4d77-13-53-207-73.ngrok-free.app/api/auth/quickLogin/callback', // HTTPS only
    },
    jwt: {
        secretKey: process.env.JWT_SECRET_KEY,
    }
}