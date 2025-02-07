import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Message {
  userId: string;
  message: string;
}

interface JoinRoom{
    type:"join",
    payload:{
      roomId:string
    }
}



interface SentMessage{
    type:"chat",
    payload:{
      roomId:string ,
      userId:string,
      message:string
    },
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  console.log(messages);
  const [joinRoomLoading,setJoinRoomLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [room,setRoom] = useState<string>('')
  const myRoomId = useRef<string | undefined>('124')
  const wss = useRef<WebSocket | null>(null);
  const userId = useRef<string | undefined>(localStorage.getItem('chatUser'))
  // console.log('room value is ',room);
  // console.log("user id is ",userId.current);
  

  function joinRoomHandler(){
    const joinRoom:JoinRoom = {
        type:"join",
        payload:{
          roomId:room
        }
    }
    if(wss){
      //@ts-ignore
      wss.current.send(JSON.stringify(joinRoom));
    }
    myRoomId.current = room;

    setJoinRoomLoading(true);
    
  }

  const sendMessage = () => {
    const sentMessage:SentMessage = {
         type:"chat",
         payload:{
           roomId:myRoomId.current || "",
           userId:userId.current || "",
           message:message
         }
    }
    if(wss.current){
        wss?.current.send(JSON.stringify(sentMessage));
        setMessage('');
    }
  };

  
 

  useEffect(()=>{
      // Generate user ID only once and store it in localStorage
      let storedUser = localStorage.getItem("chatUser");
      if (!storedUser) {
        storedUser = "User" + Math.floor(Math.random() * 100);
        userId.current = storedUser;
        localStorage.setItem("chatUser", storedUser);
      }
     
    const ws = new WebSocket("ws://localhost:8000");
    wss.current = ws;

    ws.onopen = ()=>{
      ws.send(JSON.stringify({
        type:"join",
        payload:{
          roomId:"124"
        }
      }))
    }


    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('data is',data);
        setMessages((m) => [...m,data]);
      };
   

    return ()=>{
      ws.close();
    }
   
  },[])
 



  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <div className="w-[80%] mx-auto flex justify-between items-center">
      <header className="text-xl font-bold mb-4">Broadcast Chat</header>
      <Dialog>
      <DialogTrigger asChild>
      <Button className="mb-3 font-semibold" variant={"secondary"}>Join Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              RoomId
            </Label>
            <Input id="name" value={room} onChange={(e)=>{setRoom(e.target.value)}} className="col-span-3" />
          </div>
          
        </div>
        <DialogFooter>
          <Button 
          type="submit" 
          onClick={joinRoomHandler}
          >{joinRoomLoading ? "joining.." :" Join Room"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      
      </div>
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-800 p-4 rounded-xl">
        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.userId}
              className={`p-2 rounded-lg max-w-xs ${
                msg.userId === userId.current ? "bg-blue-500 ml-auto" : "bg-gray-700"
              }`}
            >
             
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex mt-4 gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 px-4 py-2 rounded text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
