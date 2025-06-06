import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { useUserStore } from "@/stores/user.js";

export const useAuthStore = defineStore('auth', () => {
    const error = ref(null);
    const loading = ref(false);
    const userStore = useUserStore();

    async function login(email, password) {
        loading.value = true;
        error.value = null;

        try {
            const user = await authService.login(email, password);
            await userStore.setUser(user);
        } catch (e) {
            error.value = 'Incorrect email or password';
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        await authService.logout();
        userStore.clearUser();
    }

    return {
        error,
        loading,
        login,
        logout,
    }
})
