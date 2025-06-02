import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
    },
    {
        path: '/chat/:id',
        name: 'chat',
        component: () => import('@/views/ChatView.vue'),
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
