import { QueryCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import CONSTANTS from '../constants/constants';
import { getBatchRequestData } from '../utils/common';

const getPetById = async (_parent, args, context) => {
  try {
    const data = await context.client.send(
      new GetCommand({
        TableName: CONSTANTS.tableNames.Pets,
        Key: {
          id: args.id
        }
      })
    );
    return data.Item;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * Resolves list of pets along with comapny data 'joined' from Compant Table.
 * Uses a simple but inefficient hack to join data as dynamoDB is a key-value store
 * and does not support joins. Feasable for very limited data. Expect high costing.
 * @param {*} _parent
 * @param {*} args
 * @param {*} context
 * @returns
 */
const getPetsAndCompanyByPetType = async (_parent, args, context) => {
  try {
    const companyIdToDataMap = {};
    const filterExpressionList = [];
    const expressionAttributeValues = {
      ':petType': args.petType
    };
    if (args.petName) {
      filterExpressionList.push('contains(pet_name, :petName)');
      expressionAttributeValues[':petName'] = args.petName;
    }
    if (args.policyStatus && args.policyStatus.length) {
      const policyStatuses = args.policyStatus.map((value, index) => {
        expressionAttributeValues[`:policyStatus${index}`] = value;
        return `:policyStatus${index}`;
      });
      filterExpressionList.push(`policy_status in (${policyStatuses.join(',')})`);
    }
    const data = await context.client.send(
      new QueryCommand({
        TableName: CONSTANTS.tableNames.Pets,
        IndexName: 'PetTypes',
        KeyConditionExpression: `pet_type = :petType`,
        FilterExpression: filterExpressionList.length
          ? filterExpressionList.join(' or ')
          : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: args.limit || undefined,
        ExclusiveStartKey: (args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey)) || undefined
      })
    );

    if (data.Items.length) {
      // get list of all companies from list of company_id's
      const batchRequestCompanyIds = data.Items.map((v) => ({ id: v.company_id }));
      // we'll use batch request here to get all data
      const companyDetails = await getBatchRequestData(
        context.client,
        batchRequestCompanyIds,
        CONSTANTS.tableNames.Company
      );
      /*
       create mapping for all data fetched
       this will significantly improve performance (but memory use as well)
       since object access has O(1) complexity
      */
      companyDetails.forEach((v) => {
        companyIdToDataMap[v.id] = v;
      });
      // loop over data and attach companies
      data.Items.forEach((v) => (v.company = companyIdToDataMap[v.company_id]));
    }

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

const getAllPets = async (_parent, args, context) => {
  try {
    const filterExpressionList = [];
    const expressionAttributeValues = {};
    const conditionalANDOR = args.enforceANDCondition ? 'and' : 'or';
    if (args.id) {
      filterExpressionList.push('id = :id');
      expressionAttributeValues[':id'] = args.id;
    }
    if (args.petType) {
      filterExpressionList.push('contains(pet_type, :petType)');
      expressionAttributeValues[':petType'] = args.petType;
    }
    if (args.petName) {
      filterExpressionList.push('contains(pet_name, :petName)');
      expressionAttributeValues[':petName'] = args.petName;
    }
    if (args.companyId) {
      filterExpressionList.push('company_id = :companyId');
      expressionAttributeValues[':companyId'] = args.companyId;
    }
    if (args.policyNumber) {
      filterExpressionList.push('policy_number = :policyNumber');
      expressionAttributeValues[':policyNumber'] = args.policyNumber;
    }
    if (args.customerId) {
      filterExpressionList.push('customer_id = :customerId');
      expressionAttributeValues[':customerId'] = args.customerId;
    }
    if (args.familyName) {
      filterExpressionList.push('contains(family_name, :familyName)');
      expressionAttributeValues[':familyName'] = args.familyName;
    }
    if (args.policyStatus) {
      filterExpressionList.push('policy_status = :policyStatus');
      expressionAttributeValues[':policyStatus'] = args.policyStatus;
    }

    const data = await context.client.send(
      new ScanCommand({
        TableName: CONSTANTS.tableNames.Pets,
        ExclusiveStartKey:
          (args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey)) || undefined,
        Limit: args.limit || undefined,
        FilterExpression: filterExpressionList.length
          ? filterExpressionList.join(` ${conditionalANDOR} `)
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

const getPetsByPolicyStatus = async (_parent, args, context) => {
  try {
    const filterExpressionList = [];
    const expressionAttributeValues = {
      ':policyStatus': args.policyStatus
    };
    if (args.petType) {
      filterExpressionList.push('pet_type = :petType');
      expressionAttributeValues[':petType'] = args.petType;
    }
    if (args.petName) {
      filterExpressionList.push('contains(pet_name, :petName)');
      expressionAttributeValues[':petName'] = args.petName;
    }
    const data = await context.client.send(
      new QueryCommand({
        TableName: CONSTANTS.tableNames.Pets,
        IndexName: 'PetsPolicyStatus',
        KeyConditionExpression: `policy_status = :policyStatus`,
        FilterExpression: filterExpressionList.length
          ? filterExpressionList.join(' and ')
          : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: args.limit || undefined,
        ExclusiveStartKey:
          (args.lastEvaluatedKey && JSON.parse(args.lastEvaluatedKey)) || undefined,
        ScanIndexForward: args.sortByPolicyNumAcsending
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
    getPetById,
    getPetsAndCompanyByPetType,
    getPetsByPolicyStatus,
    getAllPets
  }
};
