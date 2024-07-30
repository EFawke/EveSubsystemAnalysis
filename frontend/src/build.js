import React from "react";
import Characters from './characters.js';
import { MDCDataTable } from '@material/data-table';

class Build extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: '',
            aggregateRuns: 5,
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
                <div className="row" style={{ marginTop: "2rem" }}>
                    <div className="col-sm-3">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Settings</h5>
                                <div className="row align-items-center">
                                    <div>
                                        <label for="customRange2" className="form-label text-muted fw-normal mt-0 text-truncate">Aggregate runs: </label>
                                        <p>{aggregateRuns}</p>
                                        <input type="range" className="form-range" min="1" max="5" id="customRange2" onChange={this.handleChange}></input>
                                    </div>
                                </div>
                                <div className="row align-items-center">
                                    <div>
                                        <label for="customRange2" className="form-label text-muted fw-normal mt-0 text-truncate">Reaction runs: </label>
                                        <p>{aggregateRuns}</p>
                                        {/* <input type="range" className="form-range" min="0" max="5" id="customRange2" onChange={this.handleChange}></input> */}
                                    </div>
                                </div>
                                {characters && <Characters />}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Shopping List</h5>
                                <div className="form-group">
                                    <label for="exampleFormControlTextarea1">Paste Materials</label>
                                    <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                                </div>
                                <div className="mdc-data-table">
                                    <table className="mdc-data-table__table" aria-label="Dessert calories">
                                        <thead>
                                            <tr className="mdc-data-table__header-row">
                                                <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Salvage</th>
                                                <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Need to Buy</th>
                                                <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Cost</th>
                                                <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Buy Order</th>
                                            </tr>
                                        </thead>
                                        <tbody className="mdc-data-table__content">
                                            <tr className="mdc-data-table__row">
                                                <td className="mdc-data-table__cell">Frozen yogurt</td>
                                                <td className="mdc-data-table__cell mdc-data-table__cell--numeric">24</td>
                                                <td className="mdc-data-table__cell mdc-data-table__cell--numeric">4.0</td>
                                                <td className="mdc-data-table__cell">Super tasty</td>
                                            </tr>
                                            <tr className="mdc-data-table__row">
                                                <td className="mdc-data-table__cell">Ice cream sandwich</td>
                                                <td className="mdc-data-table__cell mdc-data-table__cell--numeric">37</td>
                                                <td className="mdc-data-table__cell mdc-data-table__cell--numeric">4.3</td>
                                                <td className="mdc-data-table__cell">I like ice cream more</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                    </div>
                </div>
            </div>
        );
    }
}

export default Build;