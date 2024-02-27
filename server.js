const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let currentDate = new Date();

const logsRelativePath = __dirname + '/logs.txt';

app.use(express.static(path.join(__dirname, 'webpage')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/webpage/index.html');
});

io.on('connection', async (socket) => {
  // When user joins
  const rawIpAddress = socket.handshake.address;
  
  currentDate = new Date();
  const userJoinMessage = `[${currentDate.toLocaleString()}] [Server]: ${rawIpAddress} connected`;
  io.emit('chat', userJoinMessage);
  console.log(userJoinMessage);

  try {
    await fs.appendFile(logsRelativePath, userJoinMessage + '\n');
  } catch (error) {
    console.error(`[${currentDate.toLocaleString()}] [Server] Error writing to file: `, error);
  }

  // When user sends message
  socket.on('chat', async (msg) => {
    currentDate = new Date();
    const message = `[${currentDate.toLocaleString()}] [${rawIpAddress}]: ${msg}`;
    io.emit('chat', message);
    console.log(message);

    try {
      await fs.appendFile(logsRelativePath, message + '\n');
    } catch (error) {
      console.error(`[${currentDate.toLocaleString()}] [Server] Error writing to file: `, error);
    }
  });

  // When user disconnects
  socket.on('disconnect', async () => {
    currentDate = new Date();
    const userLeaveMessage = `[${currentDate.toLocaleString()}] [Server]: ${rawIpAddress} disconnected`;
    console.log(userLeaveMessage);

    try {
      await fs.appendFile(logsRelativePath, userLeaveMessage + '\n');
    } catch (error) {
      console.error(`[${currentDate.toLocaleString()}] [Server] Error writing to file: `, error);
    }
  });
});

// Server on
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  currentDate = new Date();
  const startServerMessage = `[${currentDate.toLocaleString()}] [Server]: Server is running on http://localhost:${PORT}`;
  console.log(startServerMessage);

  try {
    await fs.writeFile(logsRelativePath, startServerMessage + '\n');
  } catch (error) {
    console.error(`[${currentDate.toLocaleString()}] [Server] Error writing to file: `, error);
  }
});

// Server off
server.on('close', async () => {
  currentDate = new Date();
  const stopServerMessage = `[${currentDate.toLocaleString()}] [Server]: Server closed`;
  console.log(stopServerMessage);

  try {
    await fs.appendFile(logsRelativePath, stopServerMessage);
  } catch (error) {
    console.error(`[${currentDate.toLocaleString()}] [Server] Error writing to file: `, error);
  }
});