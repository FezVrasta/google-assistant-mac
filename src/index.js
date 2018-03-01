// @flow
import React from 'react';
import { render } from 'react-dom';
import App from './components/App.js';
import './index.css';

const appElement = document.querySelector('#root');

appElement && render(<App />, appElement);
