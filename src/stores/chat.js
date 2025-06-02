import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
    const messages = ref([])

    function addMessage(message) {
        messages.value.push(message)
    }

    return {
        messages,
        addMessage
    }
})
