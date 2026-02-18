import { socket, messages } from "./script.js"

const roomList = document.getElementById('room-list')
const newRoomInput = document.getElementById('new-room')
const createRoomBtn = document.getElementById('create-room-btn')

roomList.addEventListener('click', (e) => {
    const targetRoom = e.target

    if (targetRoom.classList.contains('room')) {
        const currentActive = document.querySelector('.room.active')

        if (currentActive && currentActive !== targetRoom) {
            currentActive.classList.remove('active')
        }

        const isActiveNow = targetRoom.classList.toggle('active')

        if (isActiveNow) {
            const roomName = targetRoom.dataset.room
            socket.emit('join room', roomName)
            updateURL(roomName)  
        } else {
            socket.emit('left room', targetRoom.dataset.room)
            updateURL('')
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
})

socket.on('room created', (roomName) => renderRoom(roomName))

socket.on('joined room', (room) => {
    const item = document.createElement('li')
    item.className = 'system-message'
    item.textContent = `You joined ${room}`
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
})

socket.on('left room', (room) => {
    const item = document.createElement('li')
    item.className = 'system-message'
    item.textContent = `You left ${room}`
    messages.appendChild(item)
    messages.innerHTML = ''
})

socket.on('room message', (data) => {
    const item = document.createElement('li')
    item.className = 'system-message'
    item.textContent = data.message
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
})