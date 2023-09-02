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

async function getRowCount() {
    try {
        const result = await db.one(
            'SELECT COUNT(*) FROM jobs.job_monthly_results'
        );
        const rowCount = result.count;
        console.log('Number of records:', rowCount);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pgp.end(); // Close the database connection
    }
}

getRowCount();
