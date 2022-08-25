import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_DDB_ENDPOINT
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const client = ddbDocClient;
export const pretty = unmarshall;
