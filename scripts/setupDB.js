require('dotenv').config();
const { client } = require('./ddbClient');
const {
  ListTablesCommand,
  CreateTableCommand,
  BatchWriteItemCommand
} = require('@aws-sdk/client-dynamodb');

async function run() {
  try {
    const data = await client.send(new ListTablesCommand({}));
    const tableNames = data.TableNames;
    await createAndPopulateEmployee(tableNames);
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
            IndexName: 'Name',
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
              ProjectionType: 'INCLUDE',
              NonKeyAttributes: ['LoginAlias']
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

async function populateEmployee() {
  try {
    const batchInsert = await client.send(
      new BatchWriteItemCommand({
        RequestItems: {
          Employee: [
            {
              PutRequest: {
                Item: {
                  LoginAlias: {
                    S: 'johns'
                  },
                  LastName: {
                    S: 'Stiles'
                  },
                  ManagerLoginAlias: {
                    S: 'NA'
                  },
                  Skills: {
                    SS: ['executive management']
                  },
                  FirstName: {
                    S: 'John'
                  },
                  JoinDate: {
                    N: 1621217718115
                  },
                  Department: {
                    S: 'Board'
                  }
                }
              }
            },
            {
              PutRequest: {
                Item: {
                  LoginAlias: {
                    S: 'mateoj'
                  },
                  LastName: {
                    S: 'Jackson'
                  },
                  ManagerLoginAlias: {
                    S: 'marthar'
                  },
                  Skills: {
                    SS: ['software']
                  },
                  FirstName: {
                    S: 'Mateo'
                  },
                  JoinDate: {
                    N: 1661375630423
                  },
                  Department: {
                    S: 'Delivery'
                  }
                }
              }
            },
            {
              PutRequest: {
                Item: {
                  LoginAlias: {
                    S: 'janed'
                  },
                  LastName: {
                    S: 'Doe'
                  },
                  ManagerLoginAlias: {
                    S: 'marthar'
                  },
                  Skills: {
                    SS: ['software']
                  },
                  FirstName: {
                    S: 'Jane'
                  },
                  JoinDate: {
                    N: 1661417768115
                  },
                  Department: {
                    S: 'Delivery'
                  }
                }
              }
            },
            {
              PutRequest: {
                Item: {
                  LoginAlias: {
                    S: 'diegor'
                  },
                  LastName: {
                    S: 'Ramirez'
                  },
                  ManagerLoginAlias: {
                    S: 'johns'
                  },
                  Skills: {
                    SS: ['executive assistant']
                  },
                  FirstName: {
                    S: 'Diego'
                  },
                  JoinDate: {
                    N: 1661375649407
                  },
                  Department: {
                    S: 'Marketing'
                  }
                }
              }
            },
            {
              PutRequest: {
                Item: {
                  LoginAlias: {
                    S: 'marym'
                  },
                  LastName: {
                    S: 'Major'
                  },
                  ManagerLoginAlias: {
                    S: 'johns'
                  },
                  Skills: {
                    SS: ['operations']
                  },
                  FirstName: {
                    S: 'Mary'
                  },
                  JoinDate: {
                    N: 1661375658143
                  },
                  Department: {
                    S: 'Operations'
                  }
                }
              }
            },
            {
              PutRequest: {
                Item: {
                  LoginAlias: {
                    S: 'janer'
                  },
                  LastName: {
                    S: 'Roe'
                  },
                  ManagerLoginAlias: {
                    S: 'marthar'
                  },
                  Skills: {
                    SS: ['software']
                  },
                  FirstName: {
                    S: 'Jane'
                  },
                  JoinDate: {
                    N: 1660417768115
                  },
                  Department: {
                    S: 'Delivery'
                  }
                }
              }
            },
            {
              PutRequest: {
                Item: {
                  LoginAlias: {
                    S: 'marthar'
                  },
                  LastName: {
                    S: 'Rivera'
                  },
                  ManagerLoginAlias: {
                    S: 'johns'
                  },
                  Skills: {
                    SS: ['management', 'software']
                  },
                  FirstName: {
                    S: 'Martha'
                  },
                  JoinDate: {
                    N: Date.now()
                  },
                  Department: {
                    S: 'HR'
                  }
                }
              }
            }
          ]
        }
      })
    );
    console.log('Table Populated: Employee');
    return batchInsert;
  } catch (error) {
    console.log('Populate Table Employee Error', error);
  }
}

run();
