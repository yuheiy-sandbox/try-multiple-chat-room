'use strict';
import 'babel-polyfill';
import path from 'path';
import http from 'http';
import express from 'express';
import socketIO from 'socket.io';
import handleSockets from './app/sockets';

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server litening at port ' + port);
});

app.use(express.static(path.join(__dirname, 'public')));

handleSockets(io);
