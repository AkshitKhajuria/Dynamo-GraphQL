/// Import required AWS SDK clients and commands for Node.js
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { numberToDate } from '../utils/common';
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
          ':department': args.department
        },
        Limit: args.limit || undefined,
        ExclusiveStartKey:
          (args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey)) || undefined,
        ScanIndexForward: args.sortDateAscending
      })
    );
    return {
      count: data.Count,
      data: data.Items.map(numberToDate),
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
      ':department': args.department,
      ':startDate': new Date(args.startDate).getTime(),
      ':endDate': new Date(args.endDate).getTime()
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
        Limit: args.limit || undefined,
        ExclusiveStartKey:
          (args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey)) || undefined,
        ScanIndexForward: args.sortDateAscending
      })
    );
    return {
      count: data.Count,
      data: data.Items.map(numberToDate),
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
