<template>
    <div class="container mt-5" style="max-width: 400px;">
        <h2 class="mb-3">Вхід</h2>

        <div v-if="authStore.error" class="alert alert-danger">
            {{ authStore.error }}
        </div>

        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input v-model="email" type="email" id="email" class="form-control" required />
        </div>

        <div class="mb-3">
            <label for="password" class="form-label">Пароль</label>
            <input v-model="password" type="password" id="password" class="form-control" required />
        </div>

        <button class="btn btn-primary" @click="login" :disabled="authStore.loading">
            {{ authStore.loading ? 'Завантаження...' : 'Увійти' }}
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import RouterNames from "@/router/routerNames.js";
import { router } from "@/router/index.js";
import { useUserStore } from "@/stores/user.js";

const email = ref('')
const password = ref('')

const authStore = useAuthStore();
const userStore = useUserStore();

const login = async () => {
    await authStore.login(email.value, password.value)

    if (userStore.isAuthenticated) {
        await router.push({name: RouterNames.CABINET});
    }
}
</script>
