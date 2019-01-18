import React, { Component } from 'react';
import { interpret } from 'xstate/lib/interpreter';

import trafficLightMachine from './TrafficLightMachine';

class TrafficLight extends Component {
  constructor() {
    this.state = {
      current: trafficLightMachine.initialState,
    };

    this.service = interpret(trafficLightMachine).onTransition(current =>
      this.setState({ current })
    );
  }

  componentDidMount() {
    this.service.start();
  }

  componentWillUnmount() {
    this.service.stop();
  }

  render() {
    const { current } = this.state;
    const { send } = this.service;

    return (
      <div>
        <div>{current}</div>
        <button onClick={() => send('WALK_BUTTON')}>WALK</button>
      </div>
    );
  }
}

export default TrafficLight;
