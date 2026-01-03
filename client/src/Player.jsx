import { useEffect, useRef } from "react";
import { socket } from "./socket";

export default function Player({ room }) {
  const video = useRef();
  const remote = useRef(false);

  useEffect(() => {
    socket.on("state", s => {
      remote.current = true;
      video.current.currentTime = s.time;
      s.playing ? video.current.play() : video.current.pause();
      setTimeout(() => remote.current = false, 100);
    });

    socket.on("play", t => {
      remote.current = true;
      video.current.currentTime = t;
      video.current.play();
      setTimeout(() => remote.current = false, 100);
    });

    socket.on("pause", t => {
      remote.current = true;
      video.current.currentTime = t;
      video.current.pause();
      setTimeout(() => remote.current = false, 100);
    });

    socket.on("seek", t => {
      remote.current = true;
      video.current.currentTime = t;
      setTimeout(() => remote.current = false, 100);
    });

    return () => socket.removeAllListeners();
  }, []);

  return (
    <>
      <input type="file" accept="video/*"
        onChange={e => video.current.src = URL.createObjectURL(e.target.files[0])}
      />
      <video
        ref={video}
        controls
        width="700"
        onPlay={() => !remote.current && socket.emit("play", { roomId: room, time: video.current.currentTime })}
        onPause={() => !remote.current && socket.emit("pause", { roomId: room, time: video.current.currentTime })}
        onSeeked={() => !remote.current && socket.emit("seek", { roomId: room, time: video.current.currentTime })}
      />
    </>
  );
}