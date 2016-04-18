'use strict';

const uuid = () => 'room-' + Date.now();

const generateRoomData = (adapterRooms, roomsInfo) => {
  return Object.keys(adapterRooms)
    .filter(id => id.startsWith('room-'))
    .map(id => {
      const room = adapterRooms[id];
      const info = roomsInfo.find(info => info.id === id);

      return Object.assign({}, room, info);
    });
};

export default (io) => {
  const _roomsInfo = [];
  const _userInfo = {};
  const _messages = {};

  io.on('connection', (socket) => {
    const socketId = socket.id;
    const emitUpdateRooms = (only = false) => {
      const rooms = generateRoomData(socket.adapter.rooms, _roomsInfo);
      const target = !only ? io : io.to(socketId);

      target.emit('update rooms', rooms);
    };
    const joinRoom = (roomId) => {
      socket.join(roomId);
      emitUpdateRooms();
      io.to(socketId).emit('change active room', roomId);
    };
    const deleteRoom = (roomId) => {
      const hasRoom = Object.keys(socket.adapter.rooms).includes(roomId);

      if (!hasRoom) {
        const index = _roomsInfo.findIndex(({id}) => id === roomId);
        _roomsInfo.splice(index, 1);

        delete _messages[roomId];
      }
    };

    socket.on('create room', (name) => {
      const id = uuid();

      _roomsInfo.push({id, name});
      joinRoom(id);
    });

    socket.on('join room', (roomId) => {
      joinRoom(roomId);
    });

    socket.on('leave room', (roomId) => {
      socket.leave(roomId);
      deleteRoom(roomId);

      io.to(socketId).emit('change active room', '');
      emitUpdateRooms();
    });

    socket.on('init rooms', () => {
      emitUpdateRooms(true);
    });

    // chat room
    const emitUpdateMessages = (roomId, user) => {
      const messages = _messages[roomId].map(message => {
        const id = message.user;
        return Object.assign({}, message, {user: _userInfo[id].name});
      });
      io.to(!user ? roomId : socketId).emit('update messages', messages);
    };

    socket.on('add message', (roomId, message) => {
      message.user = socketId;
      message.date = Date.now();
      _messages[roomId].push(message);

      emitUpdateMessages(roomId);
    });

    socket.on('init messages', (roomId) => {
      if (!_messages[roomId]) {
        _messages[roomId] = [];
      }

      emitUpdateMessages(roomId, socketId);
    });

    socket.on('init user name', (userName) => {
      if (!_userInfo[socketId]) {
        _userInfo[socketId] = {};
      }

      _userInfo[socketId].name = userName;
    });

    socket.on('disconnect', () => {
      if (_userInfo[socketId]) {
        delete _userInfo[socketId];
      }
      emitUpdateRooms();
    });

    // socket.on('disconnect', () => {
    //   const roomId = Object.keys(socket.adapter.rooms)
    //     .filter(id => id.startsWith('room-'))
    //     .find(id => {
    //       const {sockets} = socket.adapter.rooms[id];
    //       // console.log(Object.keys(sockets), socketId);
    //       return Object.keys(sockets).includes(socketId);
    //     });
    //
    //   if (roomId) {
    //     deleteRoom(roomId);
    //     emitUpdateRooms();
    //
    //     _messages[roomId].push({
    //       text: 'Left',
    //       date: Date.now(),
    //       user: socketId
    //     });
    //     emitUpdateMessages(roomId);
    //   }
    // });
  });
};
