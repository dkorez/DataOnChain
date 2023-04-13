# DataOnChain API

## Description

This is a REST API for accessing and saving document on blockchain

## Installation

```bash
$ npm install
```

## Running with docker

```bash
# Building an image
$ docker build -t dkorez/data-onchain-api -f DockerfileDev .

# Starting container
$ docker run -p 9082:3000 dkorez/data-onchain-api
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Once the application is running, visit `http://localhost:3000/api` to view the documentation
