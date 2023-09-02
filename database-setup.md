# Database Setup Guide

This guide will walk you through the process of setting up the database for the Job Postings Analyzer project. We will be using PostgreSQL as the database management system.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [PostgreSQL](https://www.postgresql.org/download/)
- [pgAdmin](https://www.pgadmin.org/download/) (optional, for a graphical interface)

## Database Configuration

1. **Database Credentials:**

   - Open the `server/modules/config.js` file in the project and set the database connection credentials including the username, password, host, and database name.

2. **Create a Database:**

   - Open pgAdmin or use the PostgreSQL command line to create a new database. You can name it `job_postings_db` or choose a suitable name, as you submitted in `config.js`.

## Importing Data

To import job postings data into the database, you can follow these steps:

1. **Prepare CSV Files:**

   - Ensure you have the two CSV files: one with job descriptions (01-2023_Descriptions) and the other with additional job details (01-2023_Monthly_Results) in the root folder of the project (The files are not included here because of privacy policy of the original job).

2. **Import Data Scripts:**

   - Use the following scripts to import the data into the database:

```bash
    cd server/
    node import_data
    node import_monthly_results
```

   - These scripts will read the CSV files, process the data, and insert it into the corresponding database tables.

   - Note: The database tables will be created automatically by the scripts, so there's no need to create tables manually.

## Database Connection

Ensure that your Node.js application is configured to connect to the PostgreSQL database. The credentials should be set in the `server/modules/config.js` file as mentioned earlier.

With the database set up and configured, the Job Postings Analyzer application should be able to query and analyze job postings data effectively.
