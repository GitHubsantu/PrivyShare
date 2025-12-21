// Created by DevOps
// GitHub: https://github.com/githubsantu

import { io, Socket } from "socket.io-client";

export const socket: Socket = io("http://localhost:5000");

export const createPeerConnection = () => {
  return new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
    ],
  });
};
