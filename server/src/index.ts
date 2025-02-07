import { WebSocketServer,WebSocket } from "ws";

const wss = new WebSocketServer({port:8000});
let userCount = 0;

interface User{
    socket:WebSocket,
    room:string
}

//[{socket,room}]
let allSockets:User[] = [];
console.log("all socket is",allSockets);
wss.on("connection",(socket)=>{

    socket.on('message',(message)=>{
            //@ts-ignore
            console.log("raw message is ",message);
            //@ts-ignore
            let parsedMessage = JSON.parse(message);
            console.log("parsed message",parsedMessage);
            if(parsedMessage.type === 'join'){
                 allSockets.push({
                    socket,
                    room:parsedMessage.payload.roomId
                 })

            }

            if(parsedMessage.type === 'chat'){
                const sendData = {
                    message:parsedMessage.payload.message,
                    userId:parsedMessage.payload.userId
                }
                allSockets.forEach((user)=>{
                    if(user.room === parsedMessage.payload.roomId){
                       user.socket.send(JSON.stringify(sendData));
                       
                    }
                })
            }
    })

    
})