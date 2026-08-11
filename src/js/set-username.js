import { socket, messages } from "./script.js"

// Track how many messages are loaded for pagination
export let messageOffset = 0
export let isLoadingMore = false
export let hasMoreMessages = true

export function startLoadingMore(room, offset) {
    if (isLoadingMore || !hasMoreMessages) return
    isLoadingMore = true
    socket.emit('load more', { room, offset })
}

socket.on('chat message', (data) => {
    displayMessage(data)
    messageOffset++
})

function displayMessage(data) {
    const rawDate = data.created_at || data.timestamp
    const timeString = new Date(rawDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const dateString = new Date(rawDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    const item = document.createElement('li')
    item.innerHTML = `<span style="font-size: 0.8em; color: #888; margin-right: 8px;">[${dateString} - ${timeString}]</span>
        <strong>${data.username}:</strong> ${data.message}`
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
}

socket.on('load history', (history) => {
    messages.innerHTML = ''
    history.forEach(msg => displayMessage(msg))
    messageOffset = history.length
    hasMoreMessages = history.length >= 100
})

socket.on('load more history', (olderMessages) => {
    if (olderMessages.length === 0) {
        hasMoreMessages = false
        isLoadingMore = false
        return
    }

    // Save current scroll position
    const previousScrollHeight = messages.scrollHeight

    // Prepend older messages at the top
    const fragment = document.createDocumentFragment()
    olderMessages.forEach(msg => {
        const rawDate = msg.created_at || msg.timestamp
        const timeString = new Date(rawDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        const dateString = new Date(rawDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        const item = document.createElement('li')
        item.innerHTML = `<span style="font-size: 0.8em; color: #888; margin-right: 8px;">[${dateString} - ${timeString}]</span>
        <strong>${msg.username}:</strong> ${msg.message}`
        fragment.appendChild(item)
    })
    messages.insertBefore(fragment, messages.firstChild)

    // Restore scroll position so the view doesn't jump
    messages.scrollTop = messages.scrollHeight - previousScrollHeight

    messageOffset += olderMessages.length
    hasMoreMessages = olderMessages.length >= 100
    isLoadingMore = false
})

socket.on('user left', (data) => {
    const item = document.createElement('li')
    item.className = 'system-message'
    item.textContent = `${data.username} has left the chat server`
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
})