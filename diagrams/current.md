## Architectual Diagram of how system works currently

### Diagram
![Current Diagram](https://github.com/amsonline/job-posting-analyzer/blob/main/assets/current-diagram.png?raw=true)

## Explanation

The architectural diagram illustrates the primary components and data flow within the "Job Postings Analyzer" system. This system allows users to analyze job postings data, apply various filters, and gain insights.

### User Interface
- The "User Interface" represents the front-end of the application, where users interact with the system.
- It provides the graphical interface for users to input queries, view results, and access analytical insights.

### Web Application (Front-end)
- The "Web Application" is the front-end layer responsible for rendering the user interface.
- It communicates with the RESTful API to request and retrieve data from the back-end.
- This component handles the presentation and user experience.

### RESTful API (Back-end)
- The "RESTful API" serves as the back-end of the system.
- It receives requests from the Web Application, processes them, and interacts with the Database to fetch or store data.
- This component manages the business logic, data processing, and communication with the front-end.

### Data Ingestion (Optional)
- "Data Ingestion" is an optional component that handles the import of data into the system.
- It can update the job postings data from external sources, ensuring that the information remains current.

### Database (Job Postings Data)
- The "Database" stores the job postings data, including details such as job titles, descriptions, company information, and more.
- It serves as the central repository for the application's data.