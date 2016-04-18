'use strict';
import React, {Component} from 'react';
import moment from 'moment';

export default class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textValue: ''
    };
  }

  handleChange(evt) {
    this.setState({textValue: evt.target.value});
  }

  handleSubmit(evt) {
    evt.preventDefault();
    const message = {
      text: this.state.textValue
    };
    this.props.emitter.emit('add message', message);
    this.setState({textValue: ''});
  }

  handleInitUserName() {
    let userName;
    while (
      !(userName = (prompt('あなたの名前を入力してください。') || '').trim())
    ) {}

    this.props.emitter.emit('init user name', userName);
  }

  componentDidMount() {
    this.props.emitter.emit('init messages', this.props.room.id);
    this.handleInitUserName();
  }

  render() {
    const {emitter, room, messages} = this.props;
    const {textValue} = this.state;
    const messageItems = messages.slice().reverse().map(({user, text, date}) => (
      <li key={date}>
        <dl>
          <dt>{user}</dt>
          <dd>
            {text}<br />
            ({moment(date).format('LTS')})
          </dd>
        </dl>
      </li>
    ));

    return (
      <section>
        <h1>{room.name}</h1>
        <p>{room.length} people</p>
        <p><button onClick={emitter.emit.bind(emitter, 'leave room')}>leave</button></p>

        <form onSubmit={this.handleSubmit.bind(this)}>
          <input
            value={this.state.textValue}
            onChange={this.handleChange.bind(this)}
            autoFocus
          />
          {' '}
          <button type='submit'>send</button>
        </form>

        <ul>{messageItems}</ul>
      </section>
    );
  }
}
