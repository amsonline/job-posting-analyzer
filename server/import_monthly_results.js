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
      DROP TABLE ${schemaName}.job_monthly_results
    `);
        console.log(`Table job_monthly_results created.`);
    } catch (error) {
        console.error(`Error creating table job_monthly_results:`, error);
    }
    try {
        await db.none(`
      CREATE TABLE ${schemaName}.job_monthly_results (
        job_id VARCHAR(24) PRIMARY KEY,
        company_id VARCHAR(24),
        company_name VARCHAR(200),
        job_opening_date TIMESTAMP,
        job_closing_date TIMESTAMP,
        status VARCHAR(10),
        salary_calc VARCHAR(20),
        salary_type VARCHAR(20),
        annual_salary_avg NUMERIC(10, 2),
        annual_salary_min NUMERIC(10, 2),
        annual_salary_max NUMERIC(10, 2),
        number_of_hires_calc VARCHAR(10),
        job_title VARCHAR(250),
        industry VARCHAR(50),
        zip_code VARCHAR(10),
        city VARCHAR(50),
        state VARCHAR(6),
        certification TEXT[],
        skill TEXT[],
        skill_weights NUMERIC[],
        soft_skill TEXT[],
        soft_skill_weights NUMERIC[],
        qualification TEXT[],
        degree_min VARCHAR(35),
        degree_level TEXT[],
        soc VARCHAR(10),
        soc_probability NUMERIC(4, 2),
        normalized_title VARCHAR(200)
      );
        
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
    fs.createReadStream('../01-2023_Monthly_Results.csv')
        .pipe(csvParser())
        .on('data', async (row) => {
            readRecords++;
            batch.push(row);
            if (batch.length >= batchSize && activeWorkers <= 5) {
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

    const parseNumeric = (value) => {
        return value !== '' ? parseFloat(value) : null;
    };

    const parseArray = (value) => {
        try {
            return value && value !== 'NAN'
                ? JSON.parse(
                      value
                          .replaceAll("['", '["')
                          .replaceAll("']", '"]')
                          .replaceAll(",'", ',"')
                          .replaceAll(", '", ', "')
                          .replaceAll("',", '",')
                          .replaceAll("' ,", '" ,')
                  )
                : null;
        } catch (e) {
            console.error(
                'Value:',
                value
                    .replaceAll("['", '["')
                    .replaceAll("']", '"]')
                    .replaceAll(",'", ',"')
                    .replaceAll(", '", ', "')
                    .replaceAll("',", '",')
                    .replaceAll("' ,", '" ,'),
                'Error:',
                e
            );
        }
    };

    async function processBatch() {
        const client = await db.connect(); // Acquire a connection from the pool
        try {
            await client.tx(async (t) => {
                for (const row of rowData) {
                    try {
                        const openingDate = row['JobOpeningDate']
                            ? new Date(row['JobOpeningDate'])
                            : null;
                        const closingDate = row['JobClosingDate']
                            ? new Date(row['JobClosingDate'])
                            : null;

                        await t.none(
                            `
            INSERT INTO ${schemaName}.job_monthly_results (
              job_id,
              company_id,
              company_name,
              job_opening_date,
              job_closing_date,
              status,
              salary_calc,
              salary_type,
              annual_salary_avg,
              annual_salary_min,
              annual_salary_max,
              number_of_hires_calc,
              job_title,
              industry,
              zip_code,
              city,
              state,
              certification,
              skill,
              skill_weights,
              soft_skill,
              soft_skill_weights,
              qualification,
              degree_min,
              degree_level,
              soc,
              soc_probability,
              normalized_title
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19,
              $20, $21, $22, $23, $24, $25, $26, $27, $28
            )
          `,
                            [
                                row['Job ID'],
                                row['CompanyID'],
                                row['CompanyName'],
                                openingDate,
                                closingDate,
                                row['Status'],
                                row['salary_calc'],
                                row['salary_type'],
                                parseNumeric(row['annual_salary_avg']),
                                parseNumeric(row['annual_salary_min']),
                                parseNumeric(row['annual_salary_max']),
                                row['number_of_hires_calc'],
                                row['JobTitle'],
                                row['Industry'],
                                row['ZipCode'],
                                row['City'],
                                row['State'],
                                parseArray(row['Certification']),
                                parseArray(row['Skill']),
                                parseArray(row['Skill Weights']),
                                parseArray(row['SoftSkill']),
                                parseArray(row['SoftSkill Weights']),
                                parseArray(row['Qualification']),
                                row['Degree Min'],
                                parseArray(row['Degree Level']),
                                row['SOC'],
                                parseNumeric(row['SOC Probability']),
                                row['Normalized Title'],
                            ]
                        );
                    } catch (error) {
                        console.error(`Error inserting`, row, ':', error);
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
