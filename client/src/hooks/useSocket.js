import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSocket(roomId) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      socketRef.current = null;
      return undefined;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    const onMessage = (message) => {
      setMessages((previousMessages) => [...previousMessages, message]);
    };

    socket.on("chat:message", onMessage);
    socket.emit("room:join", roomId);

    return () => {
      socket.off("chat:message", onMessage);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [token, roomId]);

  const sendMessage = useCallback(
    (text) => {
      socketRef.current?.emit("chat:message", { roomId, text });
    },
    [roomId]
  );

  return { messages, sendMessage };
}
