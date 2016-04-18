'use strict';
import 'babel-polyfill';
import React from 'react';
import {render} from 'react-dom';
import socketIO from 'socket.io-client';
import App from './components/app';

const socket = socketIO();

render(<App socket={socket} />, document.getElementById('app'));
