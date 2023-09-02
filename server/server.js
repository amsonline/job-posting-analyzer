const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const db = require('./modules/db');

app.use(bodyParser.json());
app.use(cors());

// Get job postings
app.post('/api/jobs', async (req, res) => {
    const { jobTitle, companyName, location, startDate, endDate, page } =
        req.body;
    try {
        let sql =
            'SELECT j.*, jd.job_description FROM jobs.job_monthly_results AS j LEFT JOIN jobs.job_descriptions jd ON j.job_id = jd.job_id';
        let whereClause = [];
        if (jobTitle != '') {
            whereClause.push(`job_title LIKE '%${jobTitle}%'`);
        }
        if (companyName != '') {
            whereClause.push(`company_name LIKE '%${companyName}%'`);
        }
        if (location != '') {
            // Query city and state
            whereClause.push(
                `(city LIKE '%${location}%' OR state LIKE '%${location}%')`
            );
        }
        if (startDate != '' || endDate != '') {
            let whereItem = '';
            if (startDate != '' && endDate != '') {
                whereItem = `job_opening_date BETWEEN '${startDate}' AND '${endDate}'`;
            } else if (startDate != '') {
                whereItem = `job_opening_date >= '${startDate}'`;
            } else {
                whereItem = `job_opening_date <= '${endDate}'`;
            }
            whereClause.push(whereItem);
        }
        if (whereClause.length > 0) {
            // Update the query
            sql += ' WHERE ' + whereClause.join(' AND ');
        }

        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;

        // Limiting the data
        sql += ' LIMIT $1 OFFSET $2';
        const jobPostings = await db.any(sql, [itemsPerPage, offset]);
        res.json(jobPostings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Get analytics
app.get('/api/analytics', async (req, res) => {
    try {
        const jobPostings = await db.any(
            'SELECT company_id, company_name, COUNT(job_id) AS amount FROM jobs.job_monthly_results GROUP BY company_id, company_name ORDER BY amount DESC LIMIT 5'
        );

        const salaries = await db.any(
            'SELECT salary, COUNT(job_id) AS amount FROM (SELECT (CEILING(annual_salary_avg / 20000) * 20000) AS salary, job_id FROM jobs.job_monthly_results) j GROUP BY salary'
        );
        res.json({ jobPostings, salaries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
