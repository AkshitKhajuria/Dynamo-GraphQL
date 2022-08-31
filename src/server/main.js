import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core';
import express from 'express';
import http from 'http';
import helmet from 'helmet';

// setup loading gql schemas and resolvers
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';
import { client } from '../libs/ddbClient';
const schema = loadSchemaSync('src/schema/**/*.graphql', {
  loaders: [new GraphQLFileLoader()]
});
const resolverFiles = loadFilesSync('src/resolver/**/*.js');
const resolvers = mergeResolvers(resolverFiles);

const app = express();
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    client
  },
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({ embed: true })
  ]
});

(async () => {
  await server.start();
  server.applyMiddleware({ app });
  httpServer.listen(3000);
  console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`);
})();
