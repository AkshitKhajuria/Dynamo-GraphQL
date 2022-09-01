require('dotenv').config();
const { client } = require('./ddbClient');
const {
  ListTablesCommand,
  CreateTableCommand,
  BatchWriteItemCommand
} = require('@aws-sdk/client-dynamodb');
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

// Globals
let COMPANYIDS = [1950732001];

async function run() {
  try {
    const data = await client.send(new ListTablesCommand({}));
    const tableNames = data.TableNames;
    await createAndPopulateEmployee(tableNames);
    await createAndPopulateCompany(tableNames);
    await createAndPopulatePets(tableNames);
    console.log('Done');
  } catch (err) {
    console.error(err);
  }
}

async function createAndPopulateEmployee(tableNames) {
  if (!tableNames.includes('Employee')) {
    await createEmployee();
    await populateEmployee();
  } else {
    console.log('Table Already Exists: Employee');
  }
}

async function createAndPopulatePets(tableNames) {
  if (!tableNames.includes('Pets')) {
    await createPets();
    await populatePets();
  } else {
    console.log('Table Already Exists: Pets');
  }
}

async function createAndPopulateCompany(tableNames) {
  if (!tableNames.includes('Company')) {
    await createCompany();
    await populateCompany();
  } else {
    console.log('Table Already Exists: Company');
  }
}

async function createEmployee() {
  try {
    const table = await client.send(
      new CreateTableCommand({
        TableName: 'Employee',
        AttributeDefinitions: [
          {
            AttributeName: 'LoginAlias',
            AttributeType: 'S'
          },
          {
            AttributeName: 'FirstName',
            AttributeType: 'S'
          },
          {
            AttributeName: 'LastName',
            AttributeType: 'S'
          },
          {
            AttributeName: 'ManagerLoginAlias',
            AttributeType: 'S'
          },
          {
            AttributeName: 'Department',
            AttributeType: 'S'
          },
          {
            AttributeName: 'JoinDate',
            AttributeType: 'N'
          }
        ],
        KeySchema: [
          {
            AttributeName: 'LoginAlias',
            KeyType: 'HASH'
          }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'DirectReports',
            KeySchema: [
              {
                AttributeName: 'ManagerLoginAlias',
                KeyType: 'HASH'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
            }
          },
          {
            IndexName: 'NameIndexSearch',
            KeySchema: [
              {
                AttributeName: 'FirstName',
                KeyType: 'HASH'
              },
              {
                AttributeName: 'LastName',
                KeyType: 'RANGE'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
            }
          },
          {
            IndexName: 'DepartmentEmployees',
            KeySchema: [
              {
                AttributeName: 'Department',
                KeyType: 'HASH'
              },
              {
                AttributeName: 'JoinDate',
                KeyType: 'RANGE'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
            }
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        }
      })
    );
    console.log('Table Created: Employee');
    return table;
  } catch (error) {
    console.log('Create Table Employee Error', error);
  }
}

async function createCompany() {
  try {
    const table = await client.send(
      new CreateTableCommand({
        TableName: 'Company',
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH'
          },
          {
            AttributeName: 'company_title',
            KeyType: 'RANGE'
          }
        ],
        BillingMode: 'PROVISIONED',
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'N'
          },
          {
            AttributeName: 'company_title',
            AttributeType: 'S'
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        }
      })
    );
    console.log('Table Created: Company');
    return table;
  } catch (error) {
    console.log('Create Table Company Error', error);
  }
}

async function createPets() {
  try {
    const table = await client.send(
      new CreateTableCommand({
        TableName: 'Pets',
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH'
          }
        ],
        BillingMode: 'PROVISIONED',
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S'
          },
          {
            AttributeName: 'pet_type',
            AttributeType: 'S'
          },
          {
            AttributeName: 'pet_name',
            AttributeType: 'S'
          },
          {
            AttributeName: 'policy_status',
            AttributeType: 'S'
          },
          {
            AttributeName: 'policy_number',
            AttributeType: 'N'
          },
          {
            AttributeName: 'company_id',
            AttributeType: 'N'
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        },
        GlobalSecondaryIndexes: [
          {
            IndexName: 'PetTypes',
            KeySchema: [
              {
                AttributeName: 'pet_type',
                KeyType: 'HASH'
              },
              {
                AttributeName: 'pet_name',
                KeyType: 'RANGE'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
            }
          },
          {
            IndexName: 'PetsPolicyStatus',
            KeySchema: [
              {
                AttributeName: 'policy_status',
                KeyType: 'HASH'
              },
              {
                AttributeName: 'policy_number',
                KeyType: 'RANGE'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
            }
          },
          {
            IndexName: 'JoinCompany',
            KeySchema: [
              {
                AttributeName: 'company_id',
                KeyType: 'HASH'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
            }
          }
        ]
      })
    );
    console.log('Table Created: Pets');
    return table;
  } catch (error) {
    console.log('Create Table Pets Error', error);
  }
}

async function populateEmployee() {
  try {
    const sampleData = [];
    const sampleSize = process.argv[2] && process.argv[2] > 10 ? parseInt(process.argv[2]) : 100;
    const numManagers = parseInt(sampleSize * 0.1);
    const randomEmployees = faker.helpers.uniqueArray(faker.name.firstName, sampleSize);
    const randomManagers = randomEmployees.slice(sampleSize - numManagers);
    const randomDepartments = faker.helpers.uniqueArray(faker.name.jobArea, 10);

    // Employees
    for (let index = 0; index < sampleSize - numManagers; index++) {
      sampleData.push({
        PutRequest: {
          Item: {
            LoginAlias: {
              S: randomEmployees[index].toLowerCase()
            },
            FirstName: {
              S: faker.name.lastName()
            },
            LastName: {
              S: faker.name.lastName()
            },
            ManagerLoginAlias: {
              S: faker.helpers.arrayElement(randomManagers).toLowerCase()
            },
            Skills: {
              SS: faker.helpers.uniqueArray(faker.name.jobType, Math.floor(Math.random() * 5 + 1))
            },
            JoinDate: {
              N: faker.date.between('2019-01-01', '2022-08-31').getTime()
            },
            Department: {
              S: faker.helpers.arrayElement(randomDepartments)
            }
          }
        }
      });
    }

    // Managers
    for (let index = 0; index < numManagers; index++) {
      sampleData.push({
        PutRequest: {
          Item: {
            LoginAlias: {
              S: randomManagers[index].toLowerCase()
            },
            LastName: {
              S: faker.name.lastName()
            },
            ManagerLoginAlias: {
              S: index === 0 ? 'NULL' : faker.helpers.arrayElement(randomManagers).toLowerCase()
            },
            Skills: {
              SS: faker.helpers.uniqueArray(faker.name.jobType, Math.floor(Math.random() * 5 + 1))
            },
            FirstName: {
              S: randomEmployees[index]
            },
            JoinDate: {
              N: faker.date.between('2018-01-01', '2021-08-31').getTime()
            },
            Department: {
              S: faker.helpers.arrayElement(randomDepartments)
            }
          }
        }
      });
    }

    const batchSize = 25;
    let batchStart = 0;
    let batchData = sampleData.slice(batchStart, batchStart + batchSize);

    console.log(`Employee: Populating ${sampleData.length} records`);
    while (batchData.length > 0) {
      await client.send(
        new BatchWriteItemCommand({
          RequestItems: {
            Employee: batchData
          }
        })
      );
      batchStart += batchSize;
      batchData = sampleData.slice(batchStart, batchStart + batchSize);
    }
    return;
  } catch (error) {
    console.log('Populate Table Employee Error', error);
  }
}

async function populateCompany() {
  try {
    const sampleData = [];
    let companyIds = faker.helpers.uniqueArray(() => parseInt(faker.random.numeric(10)), 20);
    const sampleSize = 20;
    for (let i = 0; i < sampleSize; i++) {
      sampleData.push({
        PutRequest: {
          Item: {
            id: {
              N: companyIds[i]
            },
            company_title: {
              S: faker.company.name()
            }
          }
        }
      });
    }

    const batchSize = 25;
    let batchStart = 0;
    let batchData = sampleData.slice(batchStart, batchStart + batchSize);

    console.log(`Company: Populating ${sampleData.length} records`);
    while (batchData.length > 0) {
      await client.send(
        new BatchWriteItemCommand({
          RequestItems: {
            Company: batchData
          }
        })
      );
      batchStart += batchSize;
      batchData = sampleData.slice(batchStart, batchStart + batchSize);
    }
    COMPANYIDS = companyIds;
    return;
  } catch (error) {
    console.log('Populate Table Company Error', error);
  }
}

async function populatePets() {
  try {
    const sampleData = [];
    const samplePermissions = [
      'info_and_claim',
      'info_only',
      'issue_insurance',
      'insurance_create'
    ];
    const samplePolicyStatus = [
      'ON_RISK',
      'CLAIMED',
      'LIABILITY',
      'CLAIM_PENDING',
      'INSURANCE_PENDING',
      'INSURED'
    ];
    const sampleSize = 100;
    for (let i = 0; i < sampleSize; i++) {
      sampleData.push({
        PutRequest: {
          Item: {
            id: {
              S: uuidv4()
            },
            accesses_permission: {
              S: faker.helpers.arrayElement(samplePermissions)
            },
            bbm_insured_entity_uuid: {
              S: uuidv4()
            },
            company_id: {
              N: faker.helpers.arrayElement(COMPANYIDS)
            },
            createdAt: {
              S: faker.date.past()
            },
            customer_id: {
              S: uuidv4()
            },
            family_name: {
              S: faker.name.fullName()
            },
            pet_name: {
              S: faker.name.firstName()
            },
            pet_type: {
              S: faker.animal.type().toUpperCase()
            },
            policy_number: {
              N: parseInt(faker.random.numeric(16))
            },
            policy_status: {
              S: faker.helpers.arrayElement(samplePolicyStatus)
            },
            updatedAt: {
              S: faker.date.recent(7)
            }
          }
        }
      });
    }

    const batchSize = 25;
    let batchStart = 0;
    let batchData = sampleData.slice(batchStart, batchStart + batchSize);

    console.log(`Pets: Populating ${sampleData.length} records`);
    while (batchData.length > 0) {
      await client.send(
        new BatchWriteItemCommand({
          RequestItems: {
            Pets: batchData
          }
        })
      );
      batchStart += batchSize;
      batchData = sampleData.slice(batchStart, batchStart + batchSize);
    }
    return;
  } catch (error) {
    console.log('Populate Table Pets Error', error);
  }
}

run();
