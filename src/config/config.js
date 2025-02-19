const config = {
  protocol: process.env.NEXT_PUBLIC_PROTOCOL,
  origin: process.env.NEXT_PUBLIC_ORIGIN ,
  api: {
    agent: {
      host: process.env.NEXT_PUBLIC_AGENT_HOST,
    },
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY,
  },
};

export default config;
