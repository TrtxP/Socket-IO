import { socket, messages } from "./script.js"

socket.on('chat message', (data) => {
    displayMessage(data)
})

function displayMessage (data) {
    const item = document.createElement('li')
    item.innerHTML = `<strong>${data.username}:</strong> ${data.message}`
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
}

socket.on('load history', (history) => {
    messages.innerHTML = ''
    history.forEach(msg => displayMessage(msg))
})

socket.on('user left', (data) => {
    const item = document.createElement('li')
    item.className = 'system-message'
    item.textContent = `${data.username} has left the chat server`
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
})