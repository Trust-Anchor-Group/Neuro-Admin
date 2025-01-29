import dotenv from 'dotenv';

dotenv.config({path: './.env'});

const config = {
    protocol: 'https',
    origin: 'neuro-admin-dev-gnega5g4acbpfddm.germanywestcentral-01.azurewebsites.net',
    api: {
        agent: {
            host: 'https://lab.tagroot.io',
        }
    },
    quickLogin: {
        callBackUrl: 'https://neuro-admin-dev-gnega5g4acbpfddm.germanywestcentral-01.azurewebsites.net/api/auth/quickLogin/callback', // HTTPS only
    },
    jwt: {
        secretKey: process.env.JWT_SECRET_KEY,
    }
};

export default config;