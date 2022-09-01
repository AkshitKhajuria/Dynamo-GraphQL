import { BatchGetCommand } from '@aws-sdk/lib-dynamodb';

export const numberToDate = (dataItem) => {
  if (!dataItem) return null;
  dataItem.JoinDate = dataItem.JoinDate && new Date(dataItem.JoinDate);
  return dataItem;
};

export const getBatchRequestData = async (
  client,
  batchRequestData,
  tablename,
  projectionExpression
) => {
  const getRequestsArray = [];
  const batchSize = 25;
  let batchStart = 0;

  const seen = {};
  let uniquebatchRequestData = batchRequestData.filter((v) => {
    const keyValue = Object.values(v)[0];
    if (!seen[keyValue]) {
      seen[keyValue] = true;
      return true;
    } else {
      return false;
    }
  });
  let batchData = uniquebatchRequestData.slice(batchStart, batchStart + batchSize);

  while (batchData.length > 0) {
    getRequestsArray.push(
      client.send(
        new BatchGetCommand({
          RequestItems: {
            [tablename]: {
              Keys: batchData,
              ProjectionExpression: projectionExpression || undefined
            }
          }
        })
      )
    );
    batchStart += batchSize;
    batchData = batchRequestData.slice(batchStart, batchStart + batchSize);
  }
  const rawData = await Promise.all(getRequestsArray);
  return rawData.map((value) => value.Responses[tablename]).flat();
};
