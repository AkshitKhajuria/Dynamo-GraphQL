# Dynamo-GraphQL

Sample Project Using DynamoDB, Apollo GraphQL, Node, Express

# Requirements

- [node](https://nodejs.org/en/download/) v16 +
- [npm](https://nodejs.org/en/download/) v8 +
- [DynamoDB Local Setup](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) Running at port 8000 **OR**
- `Optional` [Docker](https://docs.docker.com/get-docker/) v20 +
- `Optional` [Docker-Compose](https://docs.docker.com/compose/install/) v1 +

# Setup

Run following commands to setup project. This is a one time activity

1.  npm install
2.  `Optional` npm run docker:up
3.  npm run db:init

The Apollo server will serve playground at http://localhost:3000

# Useful Commands

Useful list of commands to reset DB or close containers use the following commands -
|Command| Action |
|--|--|
| npm run dev | Run server |
| npm run db:init | Creates and populates tables into DynamoDB. Skips any Existing Table |
| npm run db:prune | Reset. Deletes all tables from DynamoDB |
| npm run docker:up | Builds and starts DynamoDB as a local dockerised service |
| npm run docker:start | Start previously stopped DynamoDB local service |
| npm run docker:stop | Stop running DynamoDB local service (Can be started again later) |
| npm run docker:down | Stop DynamoDB local service and remove containers and associated volumes |
