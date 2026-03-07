import { switchRoom } from "./chat-rooms.js"

window.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/')
    const roomFromUrl = pathParts.pop()
    
    if (roomFromUrl && roomFromUrl !== 'chat') {
        const roomElement = document.querySelector(`[data-room="${roomFromUrl}"]`)

        if (roomElement) {
            switchRoom(roomFromUrl, roomElement)
        }
    }
})