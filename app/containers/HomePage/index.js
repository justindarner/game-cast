/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import io from 'socket.io-client';
import { FormattedMessage } from 'react-intl';
import './styles.scss';

/* eslint-disable react/prefer-stateless-function */
export default class HomePage extends React.PureComponent {
  componentDidMount() {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      console.log('socket connected');
    });
    socket.on('buttons', data => {
      console.log('buttons', data);
    });
  }
  render() {
    return (
      <div className="home-page">
        <img src="/static/images/nes.svg" />
      </div>
    );
  }
}
