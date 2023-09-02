<!-- src/components/JobSearch.vue -->

<template>
    <div>
        <h1>Job Postings Analyzer</h1>
        <div>
            <input type="text" v-model="jobTitle" placeholder="Job Title" />
            <input type="text" v-model="companyName" placeholder="Company" />
            <input type="text" v-model="location" placeholder="Location" />

            <label for="startDate">Start Date:</label>
            <input
                type="date"
                id="startDate"
                v-model="startDate"
                @input="filterJobs"
            />

            <label for="endDate">End Date:</label>
            <input
                type="date"
                id="endDate"
                v-model="endDate"
                @input="filterJobs"
            />

            <button @click="searchJobs">Search</button>
        </div>
        <div class="split-view">
            <!-- Left half for job list -->
            <div class="job-list" v-if="searchResults.length > 0">
                <h2>Job List:</h2>
                <div
                    class="job-cell"
                    v-for="job in searchResults"
                    :key="job.job_id"
                    @click="showJobDetails(job)"
                    :class="{ selected: job === selectedJob }"
                >
                    {{ job.job_title }}
                </div>
                <ul class="pagination">
                    <li
                        @click="prevPage"
                        :class="{ disabled: currentPage === 1 }"
                    >
                        Previous
                    </li>
                    <li
                        v-for="page in totalPages"
                        :key="page"
                        @click="goToPage(page)"
                        :class="{ active: currentPage === page }"
                    >
                        {{ page }}
                    </li>
                    <li
                        @click="nextPage"
                        :class="{ disabled: currentPage === maxPage }"
                    >
                        Next
                    </li>
                </ul>
            </div>

            <!-- Right half for job details -->
            <div class="job-details" v-if="selectedJob">
                <h2>Job Details:</h2>
                <div v-if="selectedJob">
                    <h3>{{ selectedJob.job_title }}</h3>
                    <p>Company: {{ selectedJob.company_name }}</p>
                    <p>
                        Location: {{ selectedJob.city }},
                        {{ selectedJob.state }}
                    </p>
                    <p>Industry: {{ selectedJob.industry }}</p>

                    {{ selectedJob.job_description }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axiosInstance from '../axios-config';
import './JobSearch.css';

export default {
    data() {
        return {
            jobTitle: '',
            companyName: '',
            location: '',
            startDate: '',
            endDate: '',
            searchResults: [],
            selectedJob: null,
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            maxPage: 9999,
        };
    },
    computed: {
        totalPages() {
            let output = [this.currentPage];
            if (this.currentPage > 1) {
                output.unshift(this.currentPage - 1);
            }
            if (this.currentPage > 2) {
                output.unshift(this.currentPage - 2);
            }
            if (this.currentPage < this.maxPage) {
                output.push(this.currentPage + 1);
            }
            if (this.currentPage < this.maxPage - 1) {
                output.push(this.currentPage + 2);
            }
            return output;
        },
    },
    methods: {
        async searchJobs(pageChanged) {
            if (pageChanged != true) {
                this.currentPage = 1;
            }
            try {
                const response = await axiosInstance.post('/api/jobs', {
                    jobTitle: this.jobTitle,
                    companyName: this.companyName,
                    location: this.location,
                    startDate: this.startDate,
                    endDate: this.endDate,
                    page: this.currentPage,
                });

                if (response.status === 200) {
                    this.searchResults = response.data;
                    if (response.data.length < this.itemsPerPage) {
                        this.maxPage = this.currentPage;
                    }

                    this.selectedJob = null;
                } else {
                    console.error('Error fetching data:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        },
        showJobDetails(job) {
            this.selectedJob = job;
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage -= 1;
                this.searchJobs(true);
            }
        },
        nextPage() {
            if (this.jobPostings) {
                this.currentPage += 1;
                this.searchJobs(true);
            }
        },
        goToPage(page) {
            if (page >= 1) {
                this.currentPage = page;
                this.searchJobs(true);
            }
        },
    },
};
</script>
