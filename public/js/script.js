export const socket = io()
const form = document.getElementById('form')
const messageInput = document.getElementById('input')
export const messages = document.getElementById('messages')

form.addEventListener('submit', (e) => {
    e.preventDefault()

    const message = messageInput.value.trim()
    if (message) {
        socket.emit('chat message', message)
        messageInput.value = ''
    }
})