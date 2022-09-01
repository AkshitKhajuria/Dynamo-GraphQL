import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import CONSTANTS from '../constants/constants';

const getCompanyById = async (_parent, args, context) => {
  try {
    const data = await context.client.send(
      new GetCommand({
        TableName: CONSTANTS.tableNames.Company,
        Key: {
          id: parseInt(args.id)
        }
      })
    );
    return data.Item;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAllCompanies = async (_parent, args, context) => {
  try {
    const filterExpressionList = [];
    const expressionAttributeValues = {};
    if (args.id) {
      filterExpressionList.push('id = :id');
      expressionAttributeValues[':id'] = args.id;
    }
    if (args.companyTitle) {
      filterExpressionList.push('contains(company_title, :companyTitle)');
      expressionAttributeValues[':companyTitle'] = args.companyTitle;
    }

    const data = await context.client.send(
      new ScanCommand({
        TableName: CONSTANTS.tableNames.Company,
        ExclusiveStartKey:
          (args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey)) || undefined,
        Limit: args.limit || undefined,
        FilterExpression: filterExpressionList.length
          ? filterExpressionList.join(' and ')
          : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length
          ? expressionAttributeValues
          : undefined
      })
    );
    return {
      count: data.ScannedCount,
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
    getCompanyById,
    getAllCompanies
  }
};
