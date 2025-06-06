<template>
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>{{ userStore.user.firstName }} {{ userStore.user.lastName }}</div>
            <button class="btn btn-outline-secondary btn-sm" @click="logout">Вийти</button>
        </div>

        <div class="row">
            <div class="col-md-4 border-end pe-3">
                <h4 class="mb-3">My chats</h4>
                <ul class="list-group">
                    <li
                        v-for="chat in chats"
                        :key="chat.id"
                        :class="['list-group-item', { active: selectedChat?.id === chat.id }]"
                        style="cursor: pointer"
                        @click="selectChat(chat)"
                    >
                        {{ getChatTitle(chat) }}
                    </li>
                </ul>

                <h5 class="mt-4">New chat</h5>
                <select class="form-select my-2" v-model="selectedUserId">
                    <option disabled value="">Select user</option>
                    <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                        {{ user.firstName }} {{ user.lastName }}
                    </option>
                </select>
                <button
                    class="btn btn-primary"
                    :disabled="!selectedUserId"
                    @click="startNewChat(selectedUserId)"
                >
                    Start a chat
                </button>
            </div>

            <div class="col-md-8 ps-4" v-if="selectedChat && selectedChat.participants">
                <h4 class="mb-3">Чат з {{ getChatTitle(selectedChat) }}</h4>
                <div class="border p-3 mb-3" style="height: 300px; overflow-y: auto;" ref="messagesContainer">
                    <div
                        v-for="message in selectedChat.messages"
                        :key="message.id"
                        class="mb-2 d-flex"
                        :class="{
                            'justify-content-end': message.senderId === userStore.userId,
                            'justify-content-start': message.senderId !== userStore.userId
                        }"
                    >
                        <div class="rounded message text-dark">
                            {{ message.message }}
                        </div>
                    </div>
                </div>

                <div v-if="Object.values(typingUsers).some(v => v)" class="text-muted fst-italic mb-2">
                    The interlocutor is typing...
                </div>

                <textarea
                    class="form-control mb-2"
                    v-model="newMessage"
                    rows="3"
                    placeholder="Your message..."
                    @input="sendTypingWhisper"
                />
                <button class="btn btn-success" @click="sendMessage" :disabled="!newMessage">
                    Send
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import { userService } from '@/services/userService';
import { chatService } from '@/services/chatService';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import echo from '@/echo.js';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const chats = ref([]);
const availableUsers = ref([]);
const selectedUserId = ref('');
const initialMessage = ref('');
const selectedChat = ref(null);
const newMessage = ref('');
const typingUsers = ref({});
const messagesContainer = ref(null);

const getChatTitle = (chat) => {
    if (!chat?.participants || !Array.isArray(chat.participants)) return 'Untitled';

    const otherParticipants = chat.participants.filter(p => p.id !== userStore.userId);

    if (!otherParticipants.length) return 'Untitled';

    return otherParticipants
        .map(p => `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim())
        .join(', ');
};

const getUsersWithoutChats = async () => {
    availableUsers.value = await userService.getAvailableUsers();
};

const getChats = async () => {
    chats.value = await userService.getUserChats();
};

const startNewChat = async (participantId) => {
    const userId = userStore.userId;

    const newChat = {
        id: null,
        participants: [
            { id: userId, firstName: userStore.user.firstName, lastName: userStore.user.lastName },
            availableUsers.value.find(u => u.id === participantId),
        ],
        messages: [],
    };

    chats.value.push(newChat);
    selectedChat.value = newChat;
    selectedUserId.value = '';
    initialMessage.value = '';
    newMessage.value = '';
};

const selectChat = (chat) => {
    if (!chat?.participants) return;
    selectedChat.value = chat;

    subscribeToMessages(chat.id);
    subscribeToTyping(chat.id);
};

const sendMessage = async () => {
    const userId = userStore.userId;
    const participants = selectedChat.value?.participants;

    if (! participants || participants.length !== 2) return;

    const receiver = participants.find(p => p.id !== userId);
    if (! receiver) return;

    if (! selectedChat.value?.id) {
        const created = await userService.createChat({
            participant_ids: [userId, receiver.id],
            messages: [{
                sender_id: userId,
                receiver_id: receiver.id,
                message: newMessage.value,
            }],
        });

        await getChats();
        await getUsersWithoutChats();
        selectedChat.value = created;
        newMessage.value = '';

        return;
    }

    const payload = {
        chat_id: selectedChat.value.id,
        sender_id: userId,
        receiver_id: receiver.id,
        message: newMessage.value,
    };

    try {
        const response = await chatService.sendMessage(payload);

        selectedChat.value.messages.push({
            id: response.id ?? null,
            senderId: response.senderId,
            receiverId: response.receiverId,
            message: response.message,
            createdAt: response.createdAt ?? new Date().toISOString(),
        });

        newMessage.value = '';
    } catch (e) {
        console.error('Failed to send message', e);
    }
};

const logout = async () => {
    await authStore.logout();
    userStore.clearUser();
    await router.push({ name: 'home' });
};

const subscribeToMessages = (chatId) => {
    echo.private(`chat.${chatId}`)
        .listen('MessageSent', (e) => {
            if (selectedChat.value?.id === chatId) {
                selectedChat.value.messages.push(e.message);
            }
        });
};

const subscribeToTyping = (chatId) => {
    echo.private(`chat.${chatId}`).listenForWhisper('typing', (e) => {
        typingUsers.value[e.user_id] = true;
        setTimeout(() => {
            typingUsers.value[e.user_id] = false;
        }, 3000);
    });
};

const sendTypingWhisper = debounce(() => {
    if (selectedChat.value && selectedChat.value.id) {
        echo.private(`chat.${selectedChat.value.id}`).whisper('typing', {
            user_id: userStore.userId,
        });
    }
}, 500);

onMounted(() => {
    getChats();
    getUsersWithoutChats();
});

onBeforeUnmount(() => {
    if (selectedChat.value) {
        echo.leave(`chat.${selectedChat.value.id}`);
    }
});

watch(
    () => selectedChat.value?.messages?.length,
    () => {
        nextTick(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
        });
    }
);
</script>

<style scoped>
select {
    padding: 6px;
    margin-right: 8px;
}
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.message {
    background-color: #f3f2f2;
    max-width: 70%;
    padding: 5px 10px;
    white-space: pre-wrap;
}
</style>
