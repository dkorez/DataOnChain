export default () => {
  if (process.env.NODE_ENV == 'local') {
    return {
      env: 'local',
      RPC_URL: 'https://rpc-mumbai.maticvigil.com',
      ADDRESS: '0x98Be659544A82f781E5d11e061De5D0dDb15a5B5',
    };
  }
  if (process.env.NODE_ENV == 'test') {
    return {
      env: 'test',
      RPC_URL: 'https://rpc-mumbai.maticvigil.com',
      ADDRESS: '0x98Be659544A82f781E5d11e061De5D0dDb15a5B5',
    };
  }
};
