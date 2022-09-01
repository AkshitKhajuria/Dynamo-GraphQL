/// Import required AWS SDK clients and commands for Node.js
import {
  GetCommand,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { numberToDate } from '../utils/common';
import CONSTANTS from '../constants/constants';

const getEmployeeByLoginAlias = async (_parent, args, context) => {
  try {
    const data = await context.client.send(
      new GetCommand({
        TableName: CONSTANTS.tableNames.Employee,
        Key: {
          LoginAlias: args.id
        }
      })
    );
    if (data.Item && data.Item.JoinDate) {
      data.Item.JoinDate = new Date(data.Item.JoinDate);
    }
    return data.Item;
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
      filterExpressionList.push('contains(FirstName, :firstName)');
      expressionAttributeValues[':firstName'] = args.firstName;
    }
    if (args.lastName) {
      filterExpressionList.push('contains(LastName, :lastName)');
      expressionAttributeValues[':lastName'] = args.lastName;
    }
    if (args.loginAlias) {
      filterExpressionList.push('contains(LoginAlias, :loginAlias)');
      expressionAttributeValues[':loginAlias'] = args.loginAlias;
    }
    if (args.managerLoginAlias) {
      filterExpressionList.push('contains(ManagerLoginAlias, :managerLoginAlias)');
      expressionAttributeValues[':managerLoginAlias'] = args.managerLoginAlias;
    }
    if (args.department) {
      filterExpressionList.push('contains(Department, :department)');
      expressionAttributeValues[':department'] = args.department;
    }
    if (args.skills && args.skills.length) {
      args.skills.forEach((value, index) => {
        filterExpressionList.push(`contains(Skills, :skill${index})`);
        expressionAttributeValues[`:skill${index}`] = value;
      });
    }

    const data = await context.client.send(
      new ScanCommand({
        TableName: CONSTANTS.tableNames.Employee,
        ExclusiveStartKey:
          (args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey)) || undefined,
        Limit: args.limit || undefined,
        FilterExpression: filterExpressionList.length
          ? filterExpressionList.join(' or ')
          : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length
          ? expressionAttributeValues
          : undefined
      })
    );
    return {
      count: data.ScannedCount,
      data: data.Items.map(numberToDate),
      lastEvaluatedKey: data.LastEvaluatedKey && JSON.stringify(data.LastEvaluatedKey)
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getEmployeeByName = async (_parent, args, context) => {
  try {
    const data = await context.client.send(
      new QueryCommand({
        TableName: CONSTANTS.tableNames.Employee,
        IndexName: 'NameIndexSearch',
        KeyConditionExpression: `FirstName = :firstName`,
        ExpressionAttributeValues: {
          ':firstName': args.firstName
        },
        Limit: args.limit || undefined,
        ExclusiveStartKey:
          (args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey)) || undefined,
        ScanIndexForward: args.sortLastNameAscending
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

const addEmployee = async (_parent, args, context) => {
  try {
    await context.client.send(
      new PutCommand({
        TableName: CONSTANTS.tableNames.Employee,
        Item: {
          LoginAlias: args.loginAlias,
          LastName: args.lastName,
          ManagerLoginAlias: args.managerLoginAlias,
          Skills: args.skills,
          FirstName: args.firstName,
          JoinDate: args.joinDate && new Date(args.joinDate).getTime(),
          Department: args.department
        },
        ConditionExpression: 'attribute_not_exists(LoginAlias)',
        ReturnValues: 'ALL_OLD' // useless if inserting new item (ಠ_ಠ)
      })
    );
    // PutItem does not return anything if insertin a new record
    // so we'll cheat here and return the provided arguement ¯\_(⌣̯̀ ⌣́)_/¯
    return args.loginAlias;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteEmployee = async (_parent, args, context) => {
  try {
    const data = await context.client.send(
      new DeleteCommand({
        TableName: CONSTANTS.tableNames.Employee,
        Key: {
          LoginAlias: args.loginAlias
        },
        ConditionExpression: 'attribute_exists(LoginAlias)',
        ReturnValues: 'ALL_OLD'
      })
    );
    return numberToDate(data.Attributes);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default {
  Query: {
    getEmployeeByLoginAlias,
    getEmployeeByName,
    getAllEmployees
  },
  Mutation: {
    addEmployee,
    deleteEmployee
  }
};
