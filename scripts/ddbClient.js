const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
module.exports.client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_DDB_ENDPOINT
});
