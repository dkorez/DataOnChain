# DataOnChain

## Description

### This is a proof of concept project for storing data on blockchain
There are two implementations of storing data on blockchain: one is storing all the data which can be very expensive, and there is a cheaper way of storing hashes.\
The concept of storing hashes works in a way that random salt is generated and stored on blockchain. That same salt is used to encode data off-chain. To reference the data stored on blockchain, unique identifier is used (UUID).\
The encoding input format: `abi encode [uuid, content, salt]`, where uuid represents unique identifier, content is the payload we want to store, and the salt represents blockchain's generated salt that is stored on blockchain.\
Encoded data will be stored off-chain (TODO: needs to be implemented)
To get the original data, we have to retrieve salt from the blockchain, referenced by unique identifier. The reverse process of decoding decodes the payload (encoded content that is stored off-chain) into original values:\
`[uuid, content, salt] = abi decode (payload)`, decoded parameters uuid and salt must match the original one.\
This process can be done either on-chain (smart contract function that returns decoded content) or off-chain (using the same decoding algorithm and salt retrieved from the blockchain).\
\
#### Salt access is limited to only owner and authorities (eg. institutions that can have access to personal documents).
\
## Usage
This is only POC for now and serves as a study project of comparing gas prices of storing data on blockchain in various formats.\
Idea behind this project is that this project can extended to be used to store sensitive documents on blockchain (eg. insurance policies, medical records, patents ...)
\
## Structure
Project is split into two parts:\
`contract` - stores smart contracts
'api' - REST API that interacts with the smart contracts
\
### At this point only EVM smart contracts are supported. There is a plan to extend this functionality to other non-EVM blockchains (eg. solana, cardano, near, BSV)... The roadmap will be announced later


