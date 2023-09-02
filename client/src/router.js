import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from './components/AppLayout.vue';
import JobSearch from './components/JobSearch.vue';
import JobAnalytics from './components/JobAnalytics.vue';

const routes = [
    {
        path: '/',
        name: 'JobSearch',
        component: AppLayout,
        children: [
            {
                path: '',
                component: JobSearch,
            },
        ],
    },
    {
        path: '/analytics',
        name: 'JobAnalytics',
        component: AppLayout,
        children: [
            {
                path: '',
                component: JobAnalytics,
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
