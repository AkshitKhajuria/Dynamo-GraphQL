/// Import required AWS SDK clients and commands for Node.js
import { GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import CONSTANTS from '../constants/constants';

const getEmployeeByLoginAlias = async (_parent, args, context) => {
  try {
    console.log();
    const data = await context.client.send(
      new GetItemCommand({
        TableName: CONSTANTS.tableNames.Employee,
        Key: {
          LoginAlias: {
            S: args.id
          }
        }
      })
    );
    const result = context.pretty(data.Item || '');
    if (result.JoinDate) {
      result.JoinDate = new Date(result.JoinDate);
    }
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAllEmployees = async (_parent, args, context) => {
  try {
    const filterExpressionList = [];
    const expressionAttributeValues = {};
    if (args.firstName) {
      filterExpressionList.push('FirstName = :firstName');
      expressionAttributeValues[':firstName'] = { S: args.firstName };
    }
    if (args.lastName) {
      filterExpressionList.push('LastName = :lastName');
      expressionAttributeValues[':lastName'] = { S: args.lastName };
    }
    if (args.loginAlias) {
      filterExpressionList.push('LoginAlias = :loginAlias');
      expressionAttributeValues[':loginAlias'] = { S: args.loginAlias };
    }
    if (args.managerLoginAlias) {
      filterExpressionList.push('ManagerLoginAlias = :managerLoginAlias');
      expressionAttributeValues[':managerLoginAlias'] = { S: args.managerLoginAlias };
    }
    if (args.skills && args.skills.length) {
      args.skills.forEach((value, index) => {
        filterExpressionList.push(`contains(Skills, :skill${index})`);
        expressionAttributeValues[`:skill${index}`] = { S: value };
      });
    }

    const data = await context.client.send(
      new ScanCommand({
        TableName: CONSTANTS.tableNames.Employee,
        ExclusiveStartKey: args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey),
        Limit: args.limit || 10,
        FilterExpression: filterExpressionList.length
          ? filterExpressionList.join(' and ')
          : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length
          ? expressionAttributeValues
          : undefined
      })
    );
    return {
      count: data.Count,
      // need to marshall individual records as marshall map does not work. Ref: https://github.com/aws/aws-sdk-js-v3/issues/3849
      data: data.Items.map((v) => {
        const item = context.pretty(v);
        item.JoinDate = item.JoinDate && new Date(item.JoinDate);
        return item;
      }),
      lastEvaluatedKey: data.LastEvaluatedKey && JSON.stringify(data.LastEvaluatedKey)
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default {
  Query: {
    getEmployeeByLoginAlias,
    getAllEmployees
  }
};
