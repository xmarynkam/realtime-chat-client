import { createRouter, createWebHistory } from 'vue-router';
import CabinetView from "@/views/CabinetView.vue";
import HomeView from "@/views/HomeView.vue";
import RouterNames from "@/router/routerNames.js";
import {useUserStore} from "@/stores/user.js";

const routes = [
    {
        path: '/',
        name: RouterNames.HOME,
        component: HomeView,
    },
    {
        path: '/cabinet',
        name: RouterNames.CABINET,
        component: CabinetView,
        meta: { requiresAuth: true },
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    if (userStore.isAuthenticated) {
        return next();
    }

    if (to.meta.requiresAuth) {
        userStore.fetchUser().then(() => {
            if (!userStore.isAuthenticated) {
                return next({ name: RouterNames.HOME });
            }
            next();
        }).catch(() => {
            return next({ name: RouterNames.HOME });
        });

        return;
    }

    next();
})
