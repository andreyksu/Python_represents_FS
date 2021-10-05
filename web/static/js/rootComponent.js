'use strict';
import TreeWorkerCl from './own_scripts/TreeWorker.js';

class RootComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>This will be a {this.props.name}!!!</h1>
        <TreeWorkerCl name='TREEEEE' />
      </div>
    )
  }
}

const element = <RootComponent name="Tree" />;

ReactDOM.render(
  element,
  document.getElementById('tree-container')
);