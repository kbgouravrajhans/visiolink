import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

export const Room = () => {
    const [searchParams, setSearchParams] = useSearchParams("");
    const name = searchParams.get('name');
    const [socket, setSocket] = useState<null | Socket>(null);
    const [lobby, setLobby] = useState(true);
    

    useEffect(() => {
        const socket = io(URL);
        socket.on("send-offer", ({roomId}) => {
            alert("send offer please");
            setLobby(false);
            socket.emit("offer", {
                sdp : "",
                roomId
            })
        });

        socket.on("offer", ({roomId, offer}) => {
            alert("send answer please");
            setLobby(false);
            socket.emit("answer", {
                roomId,
                sdp : ""
            })
        });
console.log("before connection done");
        socket.on("answer", ({roomId, answer}) => {
            setLobby(false);
            alert("connection done!");
        });

        socket.on("lobby", () => {
            setLobby(true);
        })

        setSocket(socket)
    }, [name])

    if(lobby) {
        return <div>
            waiting to connect you to someone....
        </div>
    }

    return (
        <div>
            Hi {name}
            <video height={400} width={400}/>
            <video height={400} width={400}/>
        </div>
    )
}