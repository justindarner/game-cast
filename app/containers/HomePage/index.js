/* eslint-disable no-bitwise no-console */
/*
 * HomePage
 *
 *
 */

import React from 'react';
import io from 'socket.io-client';
import { find, map, times, filter } from 'lodash';

import Draggable from 'react-draggable';
import { SketchPicker } from 'react-color';

import { get, post } from 'api/client';
import './styles.scss';

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;


const defaultButtonStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
};

const getBit = (number, bitPosition) =>
  (number & (1 << bitPosition)) === 0 ? 0 : 1;

export default class HomePage extends React.PureComponent {
  state = {
    config: { skins: {} },
    serials: [],
    isLoading: true,
    buttonMap: [
      // true, true, true, true, true, true, true, true
    ],
    selectedSkin: { buttons: [] },
    buttonFocus: undefined,
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

   this.fetch();
  }

  fetch = () => {
    this.setState({ isLoading: true });
    return get('/api/serials')
      .then(serials => this.setState({ serials }))
      .then(() => get('/api/config'))
      .then(config => {
        const selectedSkin = find(config.skins.options, { id: config.skins.selected }) || {
          buttons: [],
        };
        this.setState({ config, originalSelectedSkin: selectedSkin, selectedSkin, isLoading: false });
      })
      .catch(() => this.setState({ isLoading: false }));
  }

  connect = ({ comName }) => {
    this.setState({ isLoading: true });
    post('/api/serials/connect', { comName })
      .then(() => get('/api/serials'))
      .then(serials => this.setState({ serials, isLoading: false }))
      .catch(() => this.setState({ isLoading: false }));
  }

  handleButtonChange = (index) => (changes) => {
    const { selectedSkin } = this.state;
    const newState = {
      selectedSkin: {
        ...selectedSkin,
        buttons: [...selectedSkin.buttons],
      },
    };
    newState.selectedSkin.buttons[index] = {
      ...selectedSkin.buttons[index],
      ...changes
    };
    this.setState(newState);
  }

  handleButtonStyleChange = (index) => (changes) => {
    const { selectedSkin } = this.state;
    const button = selectedSkin.buttons[index];
    this.handleButtonChange(index)({
      ...button,
      style: {
        ...button.style,
        ...changes,
      }
    });
  }

  handleOnStop = (index) => (event) => {
    const { x, y } = event.target.getClientRects()[0];
    this.handleButtonChange(index)({
      x: x + window.scrollX,
      y: y + window.scrollY,
    });
  }

  handleKeyDown = (index) => (event) => {
    event.preventDefault();
    const { selectedSkin } = this.state;
    const selectedButton = selectedSkin.buttons[index];
    const buttons = [...selectedSkin.buttons];

    if (event.keyCode === ARROW_LEFT) {
      buttons[index] = {
        ...selectedButton,
        x: selectedButton.x - 1,
      };
    }
    if (event.keyCode === ARROW_UP) {
      buttons[index] = {
        ...selectedButton,
        y: selectedButton.y - 1,
      };
    }
    if (event.keyCode === ARROW_RIGHT) {
      buttons[index] = {
        ...selectedButton,
        x: selectedButton.x + 1,
      };
    }
    if (event.keyCode === ARROW_DOWN) {
      buttons[index] = {
        ...selectedButton,
        y: selectedButton.y + 1,
      };
    }
    this.setState({
      selectedSkin: {
        ...selectedSkin,
        buttons,
      },
    });
  }
  handleFocus = (index) => () => {
    this.setState({ selectedButtonIndex: index });
  }

  save = () => {
    this.setState({ selectedButtonIndex: undefined })
    const { config, selectedSkin } = this.state;
    const options = filter(config.skins.options, (option) => option.id !== selectedSkin.id);
    options.push(selectedSkin);
    post('/api/config', {
      ...config,
      skins: {
        ...config.skins,
        options,
      },
    }).then(this.fetch)
  }

  render() {
    const { handleFocus, handleOnStop, handleKeyDown } = this;
    const { buttonMap, isLoading, serials, config, selectedSkin, selectedButtonIndex, originalSelectedSkin } = this.state;
    const connectedSerial = (find(serials, { connected: true }) || {}).comName;
    const isDirty = originalSelectedSkin !== selectedSkin;
    const selectedButton = selectedSkin.buttons[selectedButtonIndex];

    return (
      <div className="home-page">
          <div className="controller">
            {map(buttonMap, (value, index) => {
              if (!value) {
                // return null; // no component
              }
              const { x, y, style, type } = selectedSkin.buttons[index] || {};
              return (
                <Draggable
                  key={index}
                  position={{x, y}}
                  onStop={handleOnStop(index)}
                >
                  <span
                    tabIndex={-1}
                    style={{ ...defaultButtonStyle, ...style }}
                    className={`controller-button button-${type}`}
                    onKeyDown={handleKeyDown(index)}
                    onFocus={handleFocus(index)}
                  />
                </Draggable>
              );
            })}
            <img alt={selectedSkin.name} src={selectedSkin.image} />
          </div>
          <div className="config">
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
            <div className="row">
              {isDirty && (
                <button
                  className="btn btn-primary"
                  onClick={() => this.save()}
                >
                  Save
                </button>
              )}
            </div>
            {selectedButton && (
              <form className="button-control-panel">
                <h3>Button {selectedButtonIndex + 1}</h3>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label">Type</label>
                  <div className="col-sm-9">
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        {selectedButton.type || 'Select Type'}
                      </button>
                      <div
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => this.handleButtonChange(selectedButtonIndex)({type: 'round'})}
                        >
                          round
                        </a>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => this.handleButtonChange(selectedButtonIndex)({type: 'square'})}
                        >
                          square
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label">Width</label>
                  <div className="col-sm-9">
                    <input onChange={(event) => this.handleButtonStyleChange(selectedButtonIndex)({ width: `${event.target.value}px` })} type="number" className="form-control"  value={parseInt(selectedButton.style.width)} />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label">Height</label>
                  <div className="col-sm-9">
                    <input onChange={(event) => this.handleButtonStyleChange(selectedButtonIndex)({ height: `${event.target.value}px` })} type="number" className="form-control"  value={parseInt(selectedButton.style.height)} />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label">X Position</label>
                  <div className="col-sm-9">
                    <input onChange={(event) => this.handleButtonChange(selectedButtonIndex)({ x: event.target.value })} type="number" className="form-control"  value={selectedButton.x} />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label">Y Position:</label>
                  <div className="col-sm-9">
                    <input onChange={(event) => this.handleButtonChange(selectedButtonIndex)({ y: event.target.value })} type="number" className="form-control"  value={selectedButton.y} />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label">Color</label>
                  <div className="col-sm-9">
                  <SketchPicker
                    color={ selectedButton.style.background }
                    onChangeComplete={ ({rgb: { r, g, b, a }}) => this.handleButtonStyleChange(selectedButtonIndex)({ background: `rgba(${r}, ${g}, ${b}, ${a})`}) }
                  />
                  </div>
                </div>
              </form>
            )}
        </div>
      </div>
    );
  }
}
