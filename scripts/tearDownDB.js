require('dotenv').config();
const { client } = require('./ddbClient');
const { ListTablesCommand, DeleteTableCommand } = require('@aws-sdk/client-dynamodb');

async function run() {
  try {
    const data = await client.send(new ListTablesCommand({}));
    const tableNames = data.TableNames;
    await deleteTables(tableNames);
  } catch (err) {
    console.error(err);
  }
}

async function deleteTables(tableNames) {
  if (tableNames.length) {
    for (const table of tableNames) {
      await deleteSingleTable(table);
    }
  } else {
    console.log('No Tables exist');
  }
}

async function deleteSingleTable(tableName) {
  try {
    const deletedtable = await client.send(
      new DeleteTableCommand({
        TableName: tableName
      })
    );
    console.log(`Deleted: ${tableName}`);
    return deletedtable;
  } catch (error) {
    console.log(`Failed to deleted ${tableName}`, error);
  }
}

run();
