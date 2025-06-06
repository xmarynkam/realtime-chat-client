import { ApiWithToken } from '@/api';
import { ApiUrl } from '@/api/ApiUrl';

const api = ApiWithToken();

export const userService = {
    async getAvailableUsers() {
        const res = await api.get(ApiUrl.users);
        return res.data?.users;
    },

    async fetchUser() {
        const res = await api.get(ApiUrl.user);
        return res.data?.user;
    },

    async getUserChats() {
        const res = await api.get(ApiUrl.chats);
        return res.data?.chats;
    },

    async createChat(payload) {
        const res = await api.post(ApiUrl.chats, payload);
        return res.data?.chat;
    },
};
