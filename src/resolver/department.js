/// Import required AWS SDK clients and commands for Node.js
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { toDeptArray } from '../utils/deptDataFormatter';
import CONSTANTS from '../constants/constants';

// query on GSI
const getDeptEmployees = async (_parent, args, context) => {
  try {
    const data = await context.client.send(
      new QueryCommand({
        TableName: CONSTANTS.tableNames.Employee,
        IndexName: 'DepartmentEmployees',
        KeyConditionExpression: 'Department = :department',
        ExpressionAttributeValues: {
          ':department': {
            S: args.department
          }
        },
        ExclusiveStartKey: args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey),
        ScanIndexForward: args.sortDateAscending
      })
    );
    return {
      count: data.Count,
      data: toDeptArray(data.Items),
      lastEvaluatedKey: data.LastEvaluatedKey && JSON.stringify(data.LastEvaluatedKey)
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

// query sort with filter
const getDeptEmployeesJoinedBetween = async (_parent, args, context) => {
  try {
    const expressionAttributeValues = {
      ':department': {
        S: args.department
      },
      ':startDate': {
        N: new Date(args.startDate).getTime()
      },
      ':endDate': {
        N: new Date(args.endDate).getTime()
      }
    };
    if (args.loginBeginsWith) {
      expressionAttributeValues[':loginBeginsWith'] = {
        S: args.loginBeginsWith
      };
    }
    const data = await context.client.send(
      new QueryCommand({
        TableName: CONSTANTS.tableNames.Employee,
        IndexName: 'DepartmentEmployees',
        KeyConditionExpression:
          'Department = :department and JoinDate between :startDate AND :endDate',
        FilterExpression: args.loginBeginsWith && 'begins_with (LoginAlias, :loginBeginsWith)',
        ExpressionAttributeValues: expressionAttributeValues,
        ExclusiveStartKey: args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey),
        ScanIndexForward: args.sortDateAscending
      })
    );
    return {
      count: data.Count,
      data: toDeptArray(data.Items),
      lastEvaluatedKey: data.LastEvaluatedKey && JSON.stringify(data.LastEvaluatedKey)
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default {
  Query: {
    getDeptEmployees,
    getDeptEmployeesJoinedBetween
  }
};
