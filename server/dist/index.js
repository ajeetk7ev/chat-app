"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8000 });
let userCount = 0;
//[{socket,room}]
let allSockets = [];
console.log("all socket is", allSockets);
wss.on("connection", (socket) => {
    socket.on('message', (message) => {
        //@ts-ignore
        console.log("raw message is ", message);
        //@ts-ignore
        let parsedMessage = JSON.parse(message);
        console.log("parsed message", parsedMessage);
        if (parsedMessage.type === 'join') {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            });
        }
        if (parsedMessage.type === 'chat') {
            const sendData = {
                message: parsedMessage.payload.message,
                userId: parsedMessage.payload.userId
            };
            allSockets.forEach((user) => {
                if (user.room === parsedMessage.payload.roomId) {
                    user.socket.send(JSON.stringify(sendData));
                }
            });
        }
    });
});
