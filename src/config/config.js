
const config = {
    protocol: 'http',
    origin: 'localhost:3000',
    api: {
        agent: {
            host: 'mateo.lab.tagroot.io',
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