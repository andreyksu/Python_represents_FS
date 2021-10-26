'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import TreeWorkerCl from './tree/TreeWorker.js';

class RootComponent extends React.Component {
  render() {
    return (
      <div>
        <h3>Result {this.props.name}!!!</h3>
        <TreeWorkerCl />
      </div>
    );
  }
}

const element = <RootComponent name="Sikuli Test" />;

ReactDOM.render(
  element,
  document.getElementById('tree-container')
);