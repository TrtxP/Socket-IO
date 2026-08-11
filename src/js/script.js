export const socket = io()
export let currentRoom = 'general'
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

// Log errors
socket.on('connect_error', (err) => {
    console.error('Error websocket connection: ', err.message)
    console.error('Error data: ', err.data)
})