const socket = io()

//Elements 
const $chatForm = document.querySelector("#chatForm")
const $messageFormInbut = document.querySelector("#messageFormInput")
const $messageFormButton = document.querySelector("#messageFormButton")

const $sendLocation = document.querySelector("#send-location")
const $messages = document.querySelector("#message-form")

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // //new message element
    // const $newMessage = $messages.lastElementChild

    // //Height of the new message 
    // const newMessageStyle = getComputedStyle($newMessage)
    // const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    // const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // //visible height
    // const visiableHeight = $messages.offsetHeight

    // //height of messages container 
    // const containerHeight = $messages.scrollHeight

    // //how far have I scrolled?
    // const scrollOffset = $messages.scrollTop + visiableHeight

    // if(containerHeight - newMessageHeight <= scrollOffset){
    //     $messages.scrollTop = $messages.scrollHeight 
    // }
    $messages.scrollTop = $messages.scrollHeight
}


function chosenRoom(room) {document.querySelector("#room").value = room }

//--------------------------------



//---------------------------------
//message to All
socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML("beforeend", html)
    // $messages.lastElementChild.classList.add("admin")
    autoscroll()
})
//----------------------------------
//Send message
$chatForm.addEventListener("submit", (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute("disabled", "disabled")//disabling the button to evade the duplication

    const message = e.target.elements.sendMessage.value
    if (message.trim() === "") { //check if the message is empty
        event.preventDefault(); // Blocks the form from sending
        $messageFormButton.removeAttribute("disabled")
        $messageFormInbut.focus()
        return
    }
    socket.emit("send", message, (error) => {//#1
        $messageFormButton.removeAttribute("disabled")
        $messageFormInbut.value = ""
        $messageFormInbut.focus()

        if (error) {
            return console.log(error)
        }
        console.log("Message send!")
        const hmtl = Mustache.render(messageTemplate, {
            message
        })
        $messages.insertAdjacentHTML("beforeend", hmtl)
    })
})
//send it
socket.on("receiveMessage", (message, id) => { //#4

    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML("beforeend", html)

    if (socket.id === id) {
        $messages.lastElementChild.classList.add("outgoing")
    } else {
        $messages.lastElementChild.classList.add("incoming")
    }
    autoscroll()
})
//----------------------------------

$sendLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.")
    }
    $sendLocation.setAttribute("disabled", "disabled")
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            lantitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("Location send successfully!")
            $sendLocation.removeAttribute("disabled")
        })
    })
})
//Send the location 
socket.on("locationMessage", (message, id) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm.a"),
        username: message.username
    })
    $messages.insertAdjacentHTML("beforeend", html)
        if (socket.id === id) {
        $messages.lastElementChild.classList.add("outgoing")
    } else {
        $messages.lastElementChild.classList.add("incoming")
    }
    autoscroll()
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})