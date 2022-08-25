import { unmarshall } from '@aws-sdk/util-dynamodb';

export const toDept = (data) => {
  if (!data) return null;
  const item = unmarshall(data);
  item.JoinDate = item.JoinDate && new Date(item.JoinDate);
  return item;
};

export const toDeptArray = (data) => {
  if (!data) return null;
  return data.map(toDept);
};
