import { Api, ApiUrl, ApiWithToken } from '@/api';

const TOKEN_KEY = 'auth_token';
const api = Api();

export const authService = {
    async login(email, password) {
        const response = await api.post(ApiUrl.login, { email, password });

        localStorage.setItem(TOKEN_KEY, response.data.access_token);

        return response.data.user;
    },

    async logout() {
        const authApi = ApiWithToken();
        const response = await authApi.post(ApiUrl.logout);

        localStorage.removeItem(TOKEN_KEY);

        return response;
    },
};
