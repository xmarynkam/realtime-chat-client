<template>
    <div>
        <h2>Чат #{{ chatId }}</h2>

        <div v-for="msg in chatStore.messages" :key="msg.id" class="message">
            <strong>{{ msg.sender?.name || 'User' }}:</strong> {{ msg.body }}
        </div>

        <form @submit.prevent="sendMessage">
            <input v-model="newMessage" placeholder="Введіть повідомлення" />
            <button type="submit">Надіслати</button>
        </form>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { echo } from '@/echo'

const route = useRoute()
const chatId = route.params.id
const chatStore = useChatStore()
const newMessage = ref('')

onMounted(() => {
    echo.private(`chat.${chatId}`)
        .listen('MessageSent', (e) => {
            chatStore.addMessage(e.message)
        })
        .listen('message.deleted', (e) => {
            chatStore.messages = chatStore.messages.filter(m => m.id !== e.message.id)
        })
})

async function sendMessage() {
    const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
            body: newMessage.value,
            chat_id: chatId,
        }),
    })

    const data = await response.json()
    newMessage.value = ''
}
</script>

<style scoped>
.message {
    margin-bottom: 8px;
}
</style>
