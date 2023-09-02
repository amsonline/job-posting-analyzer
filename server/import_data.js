const fs = require('fs');
const csvParser = require('csv-parser');
const {
    Worker,
    isMainThread,
    parentPort,
    workerData,
} = require('worker_threads');
const pgp = require('pg-promise')();
let activeWorkers = 0;

const connectionString = 'postgresql://postgres@localhost:5432/postgres';
const db = pgp({
    connectionString,
    max: 20,
});

const schemaName = 'jobs';

async function createDatabaseAndTable() {
    try {
        await db.none(`CREATE SCHEMA ${schemaName}`);
        console.log(`Schema ${schemaName} created.`);
    } catch (error) {
        console.error(`Error creating schema ${schemaName}:`, error);
    }

    try {
        await db.none(`
      DROP TABLE ${schemaName}.job_descriptions
    `);
        console.log(`Table job_description created.`);
    } catch (error) {
        console.error(`Error creating table job_descriptions:`, error);
    }
    try {
        await db.none(`
      CREATE TABLE ${schemaName}.job_descriptions (
        job_id TEXT PRIMARY KEY,
        job_description TEXT
      )
    `);
        console.log(`Table job_description created.`);
    } catch (error) {
        console.error(`Error creating table job_descriptions:`, error);
    }
}

if (isMainThread) {
    // Call the function to create the database and table
    createDatabaseAndTable();
    let readRecords = 0;

    const batchSize = 10000;
    let batch = [];

    // Read CSV file and insert data using worker threads
    fs.createReadStream('../01-2023_Descriptions.csv')
        .pipe(csvParser())
        .on('data', async (row) => {
            readRecords++;
            batch.push(row);
            if (batch.length >= batchSize && activeWorkers <= 4) {
                console.log(
                    `EXECUTING A BATCH (Read: ${readRecords}, Length: ${batch.length} and size: ${batchSize}) and ${activeWorkers} workers working....`
                );
                await insertBatch(batch.splice(0, batchSize));
            }
        })
        .on('end', async () => {
            // Insert any remaining rows in the last batch
            if (batch.length > 0) {
                await insertBatch(batch);
            }
            console.log('CSV file successfully processed.');
        });
}

// Insert a batch of data using worker threads
async function insertBatch(data) {
    activeWorkers++;
    const worker = new Worker(__filename, { workerData: data });
    await new Promise((resolve) => {
        worker.on('message', (message) => {
            if (message === 'done') {
                activeWorkers--;
                resolve();
            }
        });
    });
}

if (!isMainThread) {
    const rowData = workerData;

    async function processBatch() {
        const client = await db.connect(); // Acquire a connection from the pool
        try {
            await client.tx(async (t) => {
                for (const row of rowData) {
                    try {
                        await t.none(
                            `INSERT INTO ${schemaName}.job_descriptions(job_id, job_description) VALUES($1, $2)`,
                            [row['Job ID'], row['Job Description']]
                        );
                        // console.log(`Inserted: ${row['Job ID']}`);
                    } catch (error) {
                        console.error(
                            `Error inserting ${row['Job ID']}:`,
                            error
                        );
                    }
                }
            });
        } finally {
            // client.release();
            parentPort.postMessage('done');
        }
    }

    setTimeout(async () => {
        await processBatch();
    }, 1000);
}
