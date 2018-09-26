/* eslint-disable no-bitwise no-console */
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
import { find, map, times } from 'lodash';

import { get, post } from 'api/client';
import './styles.scss';

const defaultButtonStyle = {
  position: 'absolute',
};

const getBit = (number, bitPosition) =>
  (number & (1 << bitPosition)) === 0 ? 0 : 1;

export default class HomePage extends React.PureComponent {
  state = {
    config: { skins: {} },
    serials: [],
    isLoading: true,
    buttonMap: [],
  };

  componentDidMount() {
    // handle socket io
    const socket = io(window.location.origin);
    socket.on('connect', () => {
      console.log('socket connected');
    });
    socket.on('buttons', data => {
      const { length, value } = data;
      const buttonMap = [];
      times(length * 8, i => {
        buttonMap[i] = getBit(value, i) === 0;
      });
      this.setState({
        buttonMap,
      });
    });

    get('/api/serials')
      .then((serials) => this.setState({ serials }))
      .then(() => get('/api/config'))
      .then((config) => this.setState({ config, isLoading: false }))
      .catch(() => this.setState({ isLoading: false }));
  }

  connect = ({ comName }) => {
    this.setState({ isLoading: true });
    post('/api/serials/connect', { comName })
      .then(() => get('/api/serials'))
      .then(serials => this.setState({ serials, isLoading: false }))
      .catch(() => this.setState({ isLoading: false }));
  };

  render() {
    const { buttonMap, isLoading, serials, config } = this.state;
    const connectedSerial = (find(serials, { connected: true }) || {}).comName;
    const skin = find(config.skins.options, { id: config.skins.selected }) || { buttons: [] };

    return (
      <div className="home-page">
        <div className="controller">
          {map(
            buttonMap,
            (value, index) => {
              if (!value) {
                // return null; // no component
              }
              const button = skin.buttons[index] || {};
              const style = {
                ...defaultButtonStyle,
                ...button,
                type: undefined,
              };
              return <span key={index} style={style} className={`button-${button.type}`} />
            }
          )}
          <img alt={skin.name} src={skin.image} />
        </div>
        <div className="config container">
          <div className="row">
            <div>
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {connectedSerial || 'Select Serial Port'}
                </button>
                <div
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  {map(serials, ({ comName }) => (
                    <a
                      key={comName}
                      className="dropdown-item"
                      href="#"
                      onClick={() => this.connect({ comName })}
                    >
                      {comName}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div>
              {connectedSerial ? (
                <i className="far fa-check-circle green" />
              ) : (
                <i className="far fa-times-circle red" />
              )}
            </div>
            <div>{isLoading && <i className="fas fa-spinner fa-spin" />}</div>
          </div>
        </div>
      </div>
    );
  }
}
