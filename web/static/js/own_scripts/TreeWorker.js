'use strict';

class TreeWorkerCl extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 'date': new Date() };
    }

    render() {
        return (
            <div>
                <h1>Yes, this will {this.state.date.toLocaleTimeString()}</h1>
            </div>
        );
    }
}

export default TreeWorkerCl;