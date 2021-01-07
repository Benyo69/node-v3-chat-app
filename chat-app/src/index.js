const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {generateLocationMessage} = require('./utils/messages')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


//a connectionnál írja ki szerver oldalon
io.on('connection', (socket)=>{
    console.log('New websocket connection')

    socket.on('join', (options, callback)=>{
        const {error, user} = addUser({id: socket.id, ...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        //socket.emit, io.emit, socket.broadcast.emit
        //io.to.emit, socket.broadcast.to.emit

        //üdvözlő üzenet(első komponens hogy micsoda a második hogy mit írjon)
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        //mindenkinek megjelenik rajta kívül a szobában
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
    
    socket.on('sendLocation', (coords, callback)=>{
        const user= getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    
    //DC-nél
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port,()=>{
    console.log(`Server is up on port ${port}!`)
})





//#region COMMENT
    /* 
    let count = 0
    //egy porton számolja
    socket.emit('countUpdated', count)
    //növeljük a kattintások számát eggyel ha kattintanak rá
    socket.on('increment', ()=>{
        count ++        
        //összes porton számolja
        io.emit('countUpdated', count)
    }) */
//#endregion