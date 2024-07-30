import React from "react";
import Characters from './characters.js';

class Build extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: '',
            aggregateRuns: 1,
            characters: null,
        };
    }

    handleChange = (e) => {
        this.setState({ aggregateRuns: e.target.value });
    }

    render() {
        const { search, aggregateRuns, characters } = this.state;
        return (
            <div>
                <div className="row">
                    <div className="col-sm-4">
                        <div className = "card">
                            <div className = "card-body">
                                <div class="row align-items-center">
                                    <div>
                                        <label for="customRange2" className="form-label text-muted fw-normal mt-0 text-truncate">Aggregate runs: </label>
                                        <p>{aggregateRuns}</p>
                                        <input type="range" className="form-range" min="0" max="5" id="customRange2" onChange={this.handleChange}></input>
                                    </div>
                                </div>
                                <div class="row align-items-center">
                                    <div>
                                        <label for="customRange2" className="form-label text-muted fw-normal mt-0 text-truncate">Reaction runs: </label>
                                        <p>{aggregateRuns}</p>
                                        {/* <input type="range" className="form-range" min="0" max="5" id="customRange2" onChange={this.handleChange}></input> */}
                                    </div>
                                </div>
                                {characters && <Characters/>}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-8">
                    </div>
                    <div className="col-sm-2">
                    </div>
                </div>
            </div>
        );
    }
}

export default Build;