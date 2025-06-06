import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userService } from '@/services/userService';

export const useUserStore = defineStore('user', () => {
    const user = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const isAuthenticated = computed(() => !!user.value);
    const userId = computed(() => user.value?.id ?? null);

    const fullName = computed(() => {
        if (!user.value) return '';
        return `${user.value.firstName} ${user.value.lastName}`;
    });

    async function setUser(userData) {
        user.value = userData;
    }

    async function fetchUser() {
        loading.value = true;
        error.value = null

        try {
            user.value = await userService.fetchUser();
        } catch (e) {
            user.value = null;
            error.value = 'Data retrieval error';
        } finally {
            loading.value = false;
        }
    }

    function clearUser() {
        user.value = null;
        error.value = null;
    }

    return {
        user,
        loading,
        error,
        isAuthenticated,
        userId,
        fullName,
        setUser,
        fetchUser,
        clearUser,
    };
});
