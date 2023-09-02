<template>
    <div>
        <h2>Job Postings Analytics</h2>

        <div>
            <h3>Top 5 job poster companies</h3>
            <canvas id="barChart"></canvas>

            <h3>Average salaries distribution</h3>
            <canvas id="lineChart"></canvas>
        </div>
        <div v-if="!analyticsData">
            <!-- Display a loading indicator or message -->
            <p>Loading...</p>
        </div>
    </div>
</template>

<script>
import {
    BarElement,
    PointElement,
    LineElement,
    Chart,
    LinearScale,
    CategoryScale,
    BarController,
    LineController,
} from 'chart.js';
import axiosInstance from '../axios-config';
export default {
    data() {
        return {
            analyticsData: null,
            chart: null,
            lineChart: null,
        };
    },
    created() {
        this.fetchAnalyticsData();
    },
    mounted() {
        if (this.analyticsData) {
            this.initializeChart();
        }
    },
    methods: {
        async fetchAnalyticsData() {
            try {
                const response = await axiosInstance.get('/api/analytics');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch analytics data');
                }

                this.analyticsData = response.data;
                this.initializeChart();
            } catch (error) {
                console.error(error);
            }
        },
        initializeChart() {
            this.initializeBarChart();
            this.initializeLineChart();
        },
        initializeBarChart() {
            const ctx = document.getElementById('barChart').getContext('2d');
            Chart.register(
                BarElement,
                LinearScale,
                CategoryScale,
                BarController
            );

            const labels = this.analyticsData.jobPostings.map(
                (item) => item.company_name
            );
            const amounts = this.analyticsData.jobPostings.map((item) =>
                parseFloat(item.amount)
            );

            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Data Label',
                            data: amounts,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        },
        initializeLineChart() {
            const ctx = document.getElementById('lineChart').getContext('2d');
            Chart.register(LineController, PointElement, LineElement);

            const labels = this.analyticsData.salaries.map(
                (item) => item.salary
            );
            const amounts = this.analyticsData.salaries.map((item) =>
                parseInt(item.amount)
            );

            this.lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Salaries distribution',
                            data: amounts,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4,
                        },
                    ],
                },
                options: {
                    plugins: {
                        responsive: true,
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1,
                            titleColor: 'white',
                            bodyColor: 'white',
                            bodySpacing: 10,
                            cornerRadius: 5,
                            displayColors: false,
                        },
                        title: {
                            display: true,
                            text: 'Salaries distribution',
                        },
                    },
                },
            });
        },
    },
};
</script>
