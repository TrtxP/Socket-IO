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

socket.on('session', (data) => {
    socket.user = data.username
})

// Log errors
socket.on('connect_error', (err) => {
    console.error('Error websocket connection: ', err.message)
    console.error('Error data: ', err.data)

    if (err.message.startsWith('Authentication error')) {
        const alertContainer = document.getElementById('alert-container')
        if (alertContainer && !alertContainer.innerHTML.includes('alert')) {
            alertContainer.innerHTML = `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    You are not authenticated. Please <a href="/login" class="alert-link">log in</a> to access the chat.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `
        }
    }
})