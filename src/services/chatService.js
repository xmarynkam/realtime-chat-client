import { ApiWithToken } from '@/api';
import { ApiUrl } from '@/api/ApiUrl';

const api = ApiWithToken();

export const chatService = {
    async sendMessage(payload) {
        const res = await api.post(ApiUrl.messages, payload);
        return res.data?.message;
    },
};
