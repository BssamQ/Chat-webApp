const users = []

const addUser = ({ id, username, room }) => {
    //clear data
    username = username.trim()
    // room = room.trim()

    //validate 
    if(!username || !room){
        return {
            error: "Username and room are required!"
        }
    }

    // check for duplicate
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username 
    })

    // validate username
    if(existingUser){
        return {
            error: "Sorry you cant use ths username in this room :'("
        }
    }

    //store user 
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user)=> user.id === id )

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user)=> user.id === id)

    // if(index !== -1){
    //     return users[index]
    // }else{
    //     return undefined
    // }
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)

    // if(usersInRoom.length !== 0){
    //     return usersInRoom
    // }else{
    //     return {error: "Room is empty"}
    // }

}



//Test cases
// addUser({
//     id: 1,
//     username: "bassam", 
//     room:1
// })

// const res = addUser({
//     id: 2,
//     username: 'Sara',
//     room: 1
// })

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}