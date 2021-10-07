'use strict';

import TreeWorkerCl from './own_scripts/TreeWorker.js';

class RootComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>Tree of Test Result {this.props.name}!!!</h1>
        <TreeWorkerCl />
      </div>
    );
  }
}

const element = <RootComponent name="!!!" />;

ReactDOM.render(
  element,
  document.getElementById('tree-container')
);