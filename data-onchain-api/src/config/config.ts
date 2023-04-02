export default () => {
  if (process.env.NODE_ENV == 'local') {
    return {
      env: 'local',
      RPC_URL: 'https://rpc-mumbai.maticvigil.com',
      ADDRESS: '0x74B745A15AA1Cb7dB608fa31BB42D52e411AAd97',
    };
  }
  if (process.env.NODE_ENV == 'test') {
    return {
      env: 'test',
      RPC_URL: 'https://rpc-mumbai.maticvigil.com',
      ADDRESS: '0x74B745A15AA1Cb7dB608fa31BB42D52e411AAd97',
    };
  }
};
