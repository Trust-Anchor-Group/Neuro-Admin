"use server";
const config = {
  protocol: process.env.NEXT_PUBLIC_PROTOCOL,
  origin: process.env.NEXT_PUBLIC_ORIGIN ,
  api: {
    agent: {
      host: process.env.AGENT_HOST || 'kikkin.lab.tagroot.io',
    },
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY,
  },
};

export default config;
