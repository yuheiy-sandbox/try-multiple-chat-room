'use strict';
import {EventEmitter} from 'events';
import React, {Component} from 'react';
import Header from './header';
import Selection from './selection';
import ChatRoom from './chat-room';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rooms: [],
      activeRoom: '',
      messages: []
    };

    const {socket} = this.props;
    this.emitter = new EventEmitter();

    // rooms
    this.emitter.on('create room', (roomName) => {
      socket.emit('create room', roomName);
    });

    this.emitter.on('update rooms', (rooms) => {
      this.setState({rooms});
    });

    this.emitter.on('change active room', (roomId) => {
      this.setState({activeRoom: roomId});
    });

    this.emitter.on('join room', (roomId) => {
      socket.emit('join room', roomId);
    });

    this.emitter.on('leave room', () => {
      this.emitter.emit('add message', {text: 'Left'});
      socket.emit('leave room', this.state.activeRoom);

      // reset
      this.setState({messages: []});
    });

    this.emitter.on('init rooms', () => {
      socket.emit('init rooms');
    });

    // chat room
    this.emitter.on('add message', (message) => {
      socket.emit('add message', this.state.activeRoom, message);
    });

    this.emitter.on('update messages', (messages) => {
      this.setState({messages});
    });

    this.emitter.on('init messages', (roomId) => {
      socket.emit('init messages', roomId);
    });

    this.emitter.on('init user name', (userName) => {
      socket.emit('init user name', userName);
      this.emitter.emit('add message', {text: 'Joined'});
    });
  }

  componentDidMount() {
    const {socket} = this.props;

    socket.on('update rooms', (rooms) => {
      this.emitter.emit('update rooms', rooms);
    });

    socket.on('change active room', (roomId) => {
      this.emitter.emit('change active room', roomId);
    });

    socket.on('update messages', (messages) => {
      this.emitter.emit('update messages', messages);
    });
  }

  render() {
    const {rooms, activeRoom, messages} = this.state;
    const room = rooms.find(({id}) => id === activeRoom);

    return (
      <div>
        <Header />
        {!activeRoom ? (
          <Selection
            emitter={this.emitter}
            rooms={rooms}
          />
        ) : (
          <ChatRoom
            emitter={this.emitter}
            room={room}
            messages={messages} />
        )}
      </div>
    );
  }
}
