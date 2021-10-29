'use strict';

/** Import React*/
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/** Font for Mui. Becouse Mui uses the Roboto font.*/
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

/** Import Own*/
import TreeWorkerCl from './tree/TreeWorker.js';
import ViewerWorkerCl from './viewer/ViewerWorker.js'

class RootComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pathForFile: '',
      typeForFile: ''
    };
  }

  functionForExternal = (path, type) => {
    console.log("index -> functionForExternal() -> path ===== " + path);
    console.log("index -> functionForExternal() -> type ===== " + type);
    this.setState((state, props) => ({
      pathForFile: path,
      typeForFile: type
    }));

  }

  render() {
    console.log("RootComponent ReRender");
    return (
      <div className='main root-container'>
        <div className='main tree-container' id='tree-container'>
          <div className='tree-container'>
            <h3>Result {this.props.name}!!!</h3>
            <TreeWorkerCl functionForUpdateViewer={this.functionForExternal} />
          </div>
        </div>
        <div className='main view-container' id='view-container'>
          <ViewerWorkerCl pathForFile={this.state.pathForFile} typeForFile={this.state.typeForFile} />
        </div>
      </div>
    );
  }
}

const element = <RootComponent name="Sikuli-Test" />;

/** Что вставляем, кудавставляем */
ReactDOM.render(
  element,
  document.getElementById('root-container')
);