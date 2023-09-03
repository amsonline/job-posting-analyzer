# Job Postings Analyzer

## Description

The **Job Postings Analyzer** is a web application that allows users to analyze several months of job postings data. Users can filter job postings based on multiple criteria, visualize trends, and derive insights from the data.

## Challenge: Handling Large CSV Files

One of the biggest challenges in this project was dealing with two large CSV files, one of which was 1.5GB and the other 8GB in size. Initially, my laptop didn't even have enough storage space to store these files. To overcome this challenge, I implemented a solution using separate scripts and worker processes.

- **CSV Reading Scripts:** I created two separate scripts, one for each CSV file. These scripts read the records from the CSV files one by one, processing them in smaller batches.

- **Worker Processes:** Whenever the script read a batch of 1000 records, it initiated a new worker process. These worker processes were responsible for inserting the batch of records into the database. This approach helped distribute the processing load and prevented memory issues.

- **Batch Processing:** By breaking the records into smaller batches, I could efficiently insert data into the database without overwhelming system resources.

This approach allowed me to successfully import the data from the large CSV files into the PostgreSQL database, ensuring that the application could handle large datasets without compromising performance or running into storage limitations.


## Challenge: Vue.js Integration

Working with Vue.js, a front-end framework, presented a learning curve, especially for those less experienced with front-end technologies. Key challenges included:

- **Learning Curve:** Adapting to Vue.js's unique syntax and concepts.
  
- **Front-end Design:** Developing responsive and visually appealing user interfaces.

- **Integration:** Coordinating Vue.js with the back-end and ensuring smooth API communication.

- **Data Visualization:** Implementing charts and graphs using Chart.js, which might be unfamiliar for some.

Despite these challenges, Vue.js offers powerful tools for building dynamic web apps, enhancing user interfaces, and improving overall user experiences.


## Features

- **Search Interface:** Users can query job postings based on various filters such as job title, company, posting date range, location, and job type.

- **Results Display:** Matching job postings are presented in a user-friendly format.

- **Job Details:** Users can click on a job posting to view more information about the job.

- **Analytics Page:** Visualizes trends in the job postings data, including charts like the number of job postings per company, distribution of job types, timeline of job postings over time, and a heat map showing job postings by location.

## Tech Stack

- **Front-end:** Vue.js
- **Back-end:** Node.js
- **Database:** PostgreSQL
- **Data Visualization:** Chart.js
- **Styling:** CSS

## Getting Started

1. Clone this repository:

```bash
git clone https://github.com/amsonline/job-postings-analyzer.git
```

2. Navigate to the project directory:

```bash
cd job-postings-analyzer
```

3. Install dependencies:

```bash
npm install
```

4. Create and configure the database as described in the `database-setup.md` file.

5. Start the back-end and front-end development server together:

```bash
npm start
```

6. Access the application in your browser at [http://localhost:8080](http://localhost:8080).

## Database Setup

Detailed instructions for setting up the database can be found in the `database-setup.md` file.

## Usage

- Use the search interface to filter job postings based on your criteria.

- Click on a job posting to view more details.

- Explore the analytics page to visualize some sample trends in the data.

## Architectual Diagrams
You can see the diagrams of how system works currently and the ideal solution on `diagrams/` folder.

## Acknowledgments

- This project was a take home test which took 17 hours in total to research and develop.
- **The Videoshot of the project is available on ``assets/`` folder of the repository.**

## Contact

- [Ahmad Sadeghi](mailto:allaboutams@gmail.com)
