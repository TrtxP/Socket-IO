import { socket, messages } from "./script.js"

// const usernameInput = document.getElementById('username-input')
// const setUsernameBtn = document.getElementById('set-username')

// let currentUsername = 'Anonymous'

// setUsernameBtn.addEventListener('click', () => {
//     const newUsername = usernameInput.value.trim()
//     if (newUsername) {
//         socket.emit('set username', newUsername)
//         currentUsername = newUsername
//         usernameInput.value = ''
//     }
// })

socket.on('chat message', (data) => {
    const item = document.createElement('li')
    item.innerHTML = `<strong>${data.username}:</strong> ${data.message}`
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
})

// socket.on('user joined', (data) => {
//     const item = document.createElement('li')
//     item.className = 'system-message'
//     if (data.oldUsername === 'Anonymous') {
//         item.textContent = `${data.newUsername} has joined the chat`
//     } else {
//         item.textContent = `${data.oldUsername} is now known as ${data.newUsername}`
//     }
//     messages.appendChild(item)
//     messages.scrollTop = messages.scrollHeight
// })

socket.on('user left', (data) => {
    const item = document.createElement('li')
    item.className = 'system-message'
    item.textContent = `${data.username} has left the chat server`
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
})