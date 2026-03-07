import { socket, messages } from "./script.js"

const roomList = document.getElementById('room-list')
const newRoomInput = document.getElementById('new-room')
const createRoomBtn = document.getElementById('create-room-btn')

export function switchRoom(roomName, element) {
    document.querySelectorAll('.room').forEach(r => r.classList.remove('active'))

    if (roomName) {
        element.classList.add('active')
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
})

socket.on('room created', (roomName) => renderRoom(roomName))

socket.on('room message', (data) => {
    const item = document.createElement('li')
    item.className = 'system-message'
    item.textContent = data.message
    messages.appendChild(item)
    messages.scrollTop = messages.scrollHeight
})