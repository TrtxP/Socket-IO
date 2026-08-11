import { socket, messages, currentRoom as _currentRoom } from "./script.js"

const roomList = document.getElementById('room-list')
const newRoomInput = document.getElementById('new-room')
const createRoomBtn = document.getElementById('create-room-btn')
const typingIndicators = document.getElementById('typing-indicators')

// Typing debounce timeout
let typingTimeout = null
const TYPING_DELAY = 500 // ms
// Local reference to track current room (updated from script.js export)
let currentRoom = _currentRoom

export function switchRoom(roomName, element) {
    document.querySelectorAll('.room').forEach(r => r.classList.remove('active'))

    if (roomName) {
        element.classList.add('active')
        currentRoom = roomName
        socket.emit('join room', roomName)
        updateURL(roomName)
    } else {
        updateURL('')
    }
}

roomList.addEventListener('click', (e) => {
    const targetRoom = e.target

    if (targetRoom.classList.contains('room')) {
        const roomName = targetRoom.dataset.room

        if (targetRoom.classList.contains('active')) {
            targetRoom.classList.remove('active')
            socket.emit('left room', roomName)
            updateURL('')
            messages.innerHTML = ''
        } else {
            targetRoom.classList.add('active')
            switchRoom(roomName, targetRoom)
        }
    }
})

function updateURL(room) {
    const newUrl = window.location.origin + (room ? '/chat' + `/${room}` : '/chat')
    window.history.pushState({ path: newUrl }, '', newUrl)
}

createRoomBtn.addEventListener('click', () => {
    const roomName = newRoomInput.value.trim()
    if (roomName && !document.querySelector(`[data-room="${roomName}"]`)) {
        socket.emit('create room', roomName)
        newRoomInput.value = ''
    }
})

function renderRoom(roomName) {
    if (!document.querySelector(`[data-room="${roomName}"]`)) {
        const roomItem = document.createElement('li')
        roomItem.className = 'room'
        roomItem.dataset.room = roomName
        roomItem.textContent = roomName
        roomList.appendChild(roomItem)
    }
}

socket.on('init rooms', (allRooms) => {
    roomList.innerHTML = ''
    allRooms.forEach((roomName) => {
        renderRoom(roomName)
    })

    // Check if URL specifies a particular room
    const pathParts = window.location.pathname.split('/')
    const roomFromUrl = pathParts[pathParts.length - 1]

    if (roomFromUrl && roomFromUrl !== 'chat' && roomFromUrl !== '') {
        // Join the room specified in the URL
        const roomElement = document.querySelector(`[data-room="${roomFromUrl}"]`)
        if (roomElement) {
            switchRoom(roomFromUrl, roomElement)
        }
    } else {
        // Auto-join the general room by default
        const generalRoom = document.querySelector('[data-room="general"]')
        if (generalRoom) {
            switchRoom('general', generalRoom)
        }
    }
})

// Handle typing updates from server
socket.on('typing update', (data) => {
    const { room, users, username } = data

    // Only show typing indicators for the current room
    if (room !== currentRoom) return

    // Clear previous typing indicators
    typingIndicators.innerHTML = ''

    if (users.length > 0) {
        const typingText = document.createElement('span')
        if (users.length === 1 && users[0] === username) {
            typingText.textContent = 'You are typing...'
        } else if (users.length === 1 && users[0] !== username) {
            typingText.textContent = `${users[0]} is typing...`
        } else if (users.length === 2) {
            const otherUser = users.find(u => u !== username) || users[0]
            typingText.textContent = `${otherUser} and ${users.find(u => u !== otherUser)} are typing...`
        } else {
            typingText.textContent = `${users.length} people are typing...`
        }
        typingIndicators.appendChild(typingText)
    }
})

// Handle typing when user types in the input field
const messageInput = document.getElementById('input')
if (messageInput) {
    messageInput.addEventListener('input', () => {
        // Emit typing start
        socket.emit('typing', { room: currentRoom, isTyping: true })

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout)
        }

        // Set timeout to emit typing stop
        typingTimeout = setTimeout(() => {
            socket.emit('typing', { room: currentRoom, isTyping: false })
        }, TYPING_DELAY)
    })

    // Also handle stop typing when user stops typing for a bit
    messageInput.addEventListener('blur', () => {
        socket.emit('typing', { room: currentRoom, isTyping: false })
    })
}

socket.on('room created', (roomName) => renderRoom(roomName))

socket.on('room message', (data) => {
    const item = document.createElement('li')
    item.className = 'system-message'
    item.textContent = data.message
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
})

// Handle user list updates
socket.on('user list update', (data) => {
    const { room, users } = data

    // Only update user list for the current room
    if (room !== currentRoom) return

    // Update the room header or create a user list element
    let userListElement = document.getElementById(`user-list-${room}`)
    if (!userListElement) {
        // Create user list element if it doesn't exist
        userListElement = document.createElement('div')
        userListElement.id = `user-list-${room}`
        userListElement.className = 'user-list'

        // Insert it after the room header or at the top of messages
        const roomHeader = document.querySelector(`[data-room="${room}"]`)
        if (roomHeader && roomHeader.parentNode) {
            roomHeader.parentNode.insertBefore(userListElement, roomHeader.nextSibling)
        } else {
            // Fallback: insert before messages
            messages.parentNode.insertBefore(userListElement, messages)
        }
    }

    // Update the user list content
    if (users.length === 0) {
        userListElement.innerHTML = '<em>No users online</em>'
    } else if (users.length === 1) {
        userListElement.innerHTML = `<strong>${users[0]}</strong> (you)${users[0] === socket.user ? ' (you)' : ''}`
    } else {
        const currentUserIndex = users.indexOf(socket.user)
        const userList = users.map((user, index) => {
            if (index === currentUserIndex) {
                return `<strong>${user}</strong> (you)`
            }
            return `<strong>${user}</strong>`
        }).join(', ')
        userListElement.innerHTML = `Online: ${userList}`
    }
})