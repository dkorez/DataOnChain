# DataOnChain

## Project description

### This is a proof of concept project for storing data on blockchain
There are two implementations of storing data on blockchain: one is storing all the data which can be very expensive, and there is a cheaper way of storing hashes.\
The concept of storing hashes works in a way that random secret is generated and stored on blockchain. That same secret is used to encode data off-chain. To reference the data stored on blockchain, unique identifier is used (UUID).\
The encoding input format: `abi encode [uuid, content, secret]`, where uuid represents unique identifier, content is the payload we want to store, and the secret represents blockchain's generated secret that is stored on blockchain.\
Encoded data will be stored off-chain (TODO: needs to be implemented)
To get the original data, we have to retrieve secret from the blockchain, referenced by unique identifier. The reverse process of decoding decodes the payload (encoded content that is stored off-chain) into original values:\
`[uuid, content, secret] = abi decode (payload)`, decoded parameters uuid and secret must match the original one.\
This process can be done either on-chain (smart contract function that returns decoded content) or off-chain (using the same decoding algorithm and secret retrieved from the blockchain).
\
The second aproach stores data in local database, and this represents a single point of failure. Therefore this project will be upgraded in a way to store 
encoded content of a decentralised storage (IPFS)
#### Salt access is limited to only owner and authorities (eg. institutions that can have access to personal documents).

## Usage
This is only POC for now and serves as a study project of comparing gas prices of storing data on blockchain in various formats.\
Idea behind this project is that this project can extended to be used to store sensitive documents on blockchain (eg. insurance policies, medical records, patents ...)

## Structure
Project is split into two parts:\
`contract` - stores smart contracts\
`data-onchain-api` - REST API that interacts with the smart contracts

#### At this point only EVM smart contracts are supported. There is a plan to extend this functionality to other non-EVM blockchains (eg. solana, cardano, near, BSV)... The roadmap will be announced later

## Roadmap
### Extensive testing and bugfixes
The next step is to thouroughy test the concept developed so far. In this process, various unit and integration tests will be created

### Extending the concept
After the base of the project is tested and stabilised, the next step is to implement feature to store encoded data on a decentralised storage

### Migration to other networks
At the beginning, the aim of this project was to develop a concept on EVM compatible blockchain. Once the full concept is developed and tested, the idea is to implement this concept on other non-evm blockchains

## Changelog
### initial implementation of the concept
### API documentation (swagger)