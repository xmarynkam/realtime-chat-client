<template>
    <div class="container py-4">
        <h2 class="mb-3">Новий чат</h2>
        <div class="row g-2 align-items-center mb-4">
            <div class="col-md-6">
                <select class="form-select" v-model="selectedUserId">
                    <option disabled value="">Оберіть користувача</option>
                    <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                        {{ user.name }} {{ user.surname }}
                    </option>
                </select>
            </div>
            <div class="col-auto">
                <button class="btn btn-primary" :disabled="!selectedUserId" @click="createChat(selectedUserId)">
                    Створити чат
                </button>
            </div>
        </div>

        <h2 class="mb-3">Мої чати</h2>
        <ul class="list-group">
            <li v-for="chat in chats" :key="chat.id" class="list-group-item">
                <router-link :to="`/chat/${chat.id}`">
                    {{ getChatTitle(chat) }}
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const availableUsers = ref([])
const chats = ref([])
const selectedUserId = ref('')
const userId = parseInt(localStorage.getItem('user_id'))

const getUsersWithoutChats = async () => {
    const res = await fetch('/api/users/available', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    })
    availableUsers.value = await res.json()
}

const getChats = async () => {
    const res = await fetch('/api/chats', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    })
    const data = await res.json()
    chats.value = data.chats
}

const createChat = async (participantId) => {
    const res = await fetch('/api/chats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
            participant_ids: [participantId],
            messages: [],
        }),
    })

    const newChat = await res.json()
    router.push(`/chat/${newChat.id}`)
}

function getChatTitle(chat) {
    return chat.participants
        .filter((p) => p.id !== userId)
        .map((p) => `${p.name} ${p.surname}`)
        .join(', ')
}

onMounted(() => {
    getUsersWithoutChats()
    getChats()
})
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
</style>
