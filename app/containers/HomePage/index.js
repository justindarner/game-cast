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
import classnames from 'classnames';
import { map, times } from 'lodash';
import { FormattedMessage } from 'react-intl';
import './styles.scss';

const getBit = (number, bitPosition) =>
  (number & (1 << bitPosition)) === 0 ? 0 : 1;

/* eslint-disable react/prefer-stateless-function */
export default class HomePage extends React.PureComponent {
  state = {};

  componentDidMount() {
    const socket = io(location.origin);
    socket.on('connect', () => {
      console.log('socket connected');
    });
    socket.on('buttons', data => {
      const { length, value } = data;
      console.log(data);
      const buttonMap = {};
      times(length * 8, i => {
        buttonMap[`button-${i + 1}`] = getBit(value, i) === 0;
      });
      console.log(buttonMap);
      this.setState({
        buttonMap,
      });
    });
  }

  render() {
    const { buttonMap } = this.state;
    return (
      <div className="home-page">
        {map(
          buttonMap,
          (value, key) =>
            value && <span key={key} className={`${key} button`} />,
        )}
        <img src="/static/images/nes.svg" />
      </div>
    );
  }
}
