import dotenv from 'dotenv';
dotenv.config();

const config = {
  local: {
    env: 'local',
    RPC_URL: 'https://rpc-mumbai.maticvigil.com',
    CONTRACT: {
      SIMPLE: '0x78eA79FaE26C107f016a9feBd933CB6d0176aE54',
      HASH: '0xf0FE1DA6faA1668524a2506f6073f976dca3C524',
      IPFS: '0xFDB751C7374C7ef778692cC9cB3d7FD0D2Fb270e',
    },
    PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  },
  test: {
    env: 'test',
    RPC_URL: 'https://rpc-mumbai.maticvigil.com',
    CONTRACT: {
      SIMPLE: '0x78eA79FaE26C107f016a9feBd933CB6d0176aE54',
      HASH: '0xf0FE1DA6faA1668524a2506f6073f976dca3C524',
      IPFS: '0xFDB751C7374C7ef778692cC9cB3d7FD0D2Fb270e',
    },
    PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  },
};

export default () => {
  const environment = process.env.NODE_ENV || 'local';
  const exportConfig = {
    ...config[environment],
    PINATA_APIKEY: process.env.PINATA_APIKEY,
    PINATA_APISECRET: process.env.PINATA_APISECRET,
  };

  return exportConfig;
};
