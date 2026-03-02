// =============================================
// socketClient.js — Socket.IO client connection
// =============================================

import { io } from 'socket.io-client';

// ⚠️ Replace this IP with your computer's local IP address
// To find it: run 'ipconfig' in PowerShell and look for 'IPv4 Address'
const SERVER_URL = 'http://192.168.1.154:3000';

let socket = null;

// Connect to the server (only once)
export function connectSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
    });
  }
  return socket;
}

// Get the existing socket instance
export function getSocket() {
  return socket;
}

// Disconnect from the server
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}