'use strict'
import React, {Component} from 'react';

export default class Selection extends Component {
  handleClick() {
    const roomName = (prompt('作成する部屋の名前を入力してください。') || '').trim();

    if (!roomName) {
      return;
    }

    this.props.emitter.emit('create room', roomName);
  }

  componentDidMount() {
    this.props.emitter.emit('init rooms');
  }

  render() {
    const {emitter, rooms} = this.props;
    const roomItems = rooms.slice().reverse().map(({id, name, length}) => (
      <li key={id}>
        {name}
        {' '}
        {length}people
        {' '}
        <button onClick={emitter.emit.bind(emitter, 'join room', id)}>join</button>
      </li>
    ));

    return (
      <div>
        <section>
          <h1>create room</h1>
          <p><button onClick={this.handleClick.bind(this)}>create</button></p>
        </section>

        <section>
          <h1>select room</h1>
          <ul>{roomItems}</ul>
        </section>
      </div>
    );
  }
}
