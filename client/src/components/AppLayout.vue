<template>
    <div>
        <nav class="nav-container">
            <ul class="nav-list">
                <li class="nav-item">
                    <router-link class="nav-link" to="/">Home</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/analytics"
                        >Analytics</router-link
                    >
                </li>
            </ul>
        </nav>

        <router-view></router-view>
    </div>
</template>

<style scoped>
@import './AppLayout.css';
</style>
