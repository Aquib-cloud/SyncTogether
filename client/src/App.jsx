import { useState } from "react";
import Player from "./Player";
import { socket } from "./socket";

export default function App() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const join = () => {
    socket.emit("join", room);
    setJoined(true);
  };

  return !joined ? (
    <div>
      <input onChange={e => setRoom(e.target.value)} />
      <button onClick={join}>Join</button>
    </div>
  ) : (
    <Player room={room} />
  );
}