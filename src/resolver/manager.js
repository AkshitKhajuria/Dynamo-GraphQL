/// Import required AWS SDK clients and commands for Node.js
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import CONSTANTS from '../constants/constants';

const getEmployeesOfManager = async (_parent, args, context) => {
  try {
    const data = await context.client.send(
      new QueryCommand({
        TableName: CONSTANTS.tableNames.Employee,
        IndexName: 'DirectReports',
        KeyConditionExpression: 'ManagerLoginAlias = :managerLoginAlias',
        ProjectionExpression: 'LoginAlias,FirstName,LastName,ManagerLoginAlias,Skills',
        ExpressionAttributeValues: {
          ':managerLoginAlias': args.managerLoginAlias
        }
      })
    );
    return {
      count: data.Count,
      data: data.Items,
      lastEvaluatedKey: data.LastEvaluatedKey && JSON.stringify(data.LastEvaluatedKey)
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default {
  Query: {
    getEmployeesOfManager
  }
};
