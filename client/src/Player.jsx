import { useEffect, useRef, useState } from "react";
import { socket } from "./socket";

export default function Player({ room, device, mediaType, setMediaType }) {

  const mediaRef = useRef(null);
  const remote = useRef(false);

  const [users, setUsers] = useState([]);
  const [action, setAction] = useState("No action yet");

  useEffect(() => {
    socket.on("users", setUsers);
    socket.on("action", setAction);

    socket.on("state", (s) => {
      remote.current = true;
      mediaRef.current.currentTime = s.time;
      s.playing ? mediaRef.current.play() : mediaRef.current.pause();
      setTimeout(() => (remote.current = false), 120);
    });

    socket.on("play", (t) => {
      remote.current = true;
      mediaRef.current.currentTime = t;
      mediaRef.current.play();
      setTimeout(() => (remote.current = false), 120);
    });

    socket.on("pause", (t) => {
      remote.current = true;
      mediaRef.current.currentTime = t;
      mediaRef.current.pause();
      setTimeout(() => (remote.current = false), 120);
    });

    socket.on("seek", (t) => {
      remote.current = true;
      mediaRef.current.currentTime = t;
      setTimeout(() => (remote.current = false), 120);
    });

    return () => socket.removeAllListeners();
  }, []);

  const emitAction = (type) => {
    socket.emit("action", {
      roomId: room,
      device,
      type,
      time: Math.floor(mediaRef.current.currentTime),
    });
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h3>👥 Listening / Watching</h3>
        {users.map((u, i) => (
          <div key={i} className="user">{u}</div>
        ))}
      </aside>

      {/* PLAYER */}
      <main className="player">
        <div className="room-header">
          <div className="room-badge">
            Room ID: <strong>{room}</strong>
          </div>

          <div className="media-toggle">
            <button
              type="button"
              className={mediaType === "video" ? "active" : ""}
              onClick={() => setMediaType("video")}
            >
              🎬 Video
            </button>

            <button
              type="button"
              className={mediaType === "audio" ? "active" : ""}
              onClick={() => setMediaType("audio")}
            >
              🎧 Audio
            </button>
          </div>
        </div>

        <div className="action-box">⚡ {action}</div>

        <input
          type="file"
          accept={mediaType === "video" ? "video/*" : "audio/*"}
          onChange={(e) =>
            (mediaRef.current.src = URL.createObjectURL(e.target.files[0]))
          }
        />

        {mediaType === "video" ? (
          <video
            ref={mediaRef}
            controls
            onPlay={() => {
              if (!remote.current) {
                emitAction("played");
                socket.emit("play", { roomId: room, time: mediaRef.current.currentTime });
              }
            }}
            onPause={() => {
              if (!remote.current) {
                emitAction("paused");
                socket.emit("pause", { roomId: room, time: mediaRef.current.currentTime });
              }
            }}
            onSeeked={() => {
              if (!remote.current) {
                emitAction("seeked");
                socket.emit("seek", { roomId: room, time: mediaRef.current.currentTime });
              }
            }}
          />
        ) : (
          <audio
            ref={mediaRef}
            controls
            style={{ width: "100%", marginTop: 20 }}
            onPlay={() => {
              if (!remote.current) {
                emitAction("played audio");
                socket.emit("play", { roomId: room, time: mediaRef.current.currentTime });
              }
            }}
            onPause={() => {
              if (!remote.current) {
                emitAction("paused audio");
                socket.emit("pause", { roomId: room, time: mediaRef.current.currentTime });
              }
            }}
            onSeeked={() => {
              if (!remote.current) {
                emitAction("seeked audio");
                socket.emit("seek", { roomId: room, time: mediaRef.current.currentTime });
              }
            }}
          />
        )}
      </main>
    </div>
  );
}