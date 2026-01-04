import { useEffect, useState } from "react";
import { socket } from "./socket";
import Player from "./Player";

export default function App() {
  const [room, setRoom] = useState("");
  const [device, setDevice] = useState("");
  const [joined, setJoined] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [error, setError] = useState("");
  const [mediaType, setMediaType] = useState("video");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const joinRoom = () => {
    if (!room.trim() || !device.trim()) {
      setError("Room ID and Name are required");
      return;
    }

    setError("");

    socket.emit("join", {
      roomId: room.trim(),
      device: device.trim(),
    });

    setJoined(true);
  };

  return (
    <div className="app">
      <div className="card">
        <div className="top-bar">
          <h1>🎬 Sync Watch</h1>
        </div>

        <div className={`view ${!joined ? "active" : ""}`}>
          {!joined && (
            <>
              <p className="join-sub">
                Watch together in perfect sync.
              </p>

              <form
                className="join-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  joinRoom();
                }}
              >
                <input
                  autoFocus
                  placeholder="Enter Room ID"
                  value={room}
                  onChange={(e) =>
                    setRoom(e.target.value.replace(/\s/g, ""))
                  }
                />

                <input
                  placeholder="Enter Your Name"
                  value={device}
                  onChange={(e) =>
                    setDevice(e.target.value.trimStart())
                  }
                />

                <button type="submit">Join</button>

                {error && (
                  <p style={{ color: "#ff6b6b", fontSize: "0.8rem" }}>
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
        </div>

        <div className={`view ${joined ? "active" : ""}`}>
          {joined && (
            <Player
              room={room}
              device={device}
              mediaType={mediaType}
              setMediaType={setMediaType}
            />
          )}
        </div>
      </div>
      <div
        id="themeCircle"
        onClick={() =>
          setTheme(theme === "dark" ? "light" : "dark")
        }
      >
        <span>{theme === "dark" ? "🌙" : "☀️"}</span>
      </div>
    </div>
  );
}