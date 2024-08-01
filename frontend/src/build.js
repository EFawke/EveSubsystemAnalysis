import React from "react";
import Characters from './characters.js';
import { MDCDataTable } from '@material/data-table';
import BasicTable from "./shoppingList.js";
import weebImage from './weeb.jpeg';


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
        const { search, aggregateRuns, characters, darkMode } = this.state;
        return (
            <div className = "working_on_it">
                <div className={!darkMode ? "row subsystem_title" : "row bg-dark text-white subsystem_title"}>
                    <div className="col-12">
                        <div className="page-title-box">
                            <h1 className={!darkMode ? "page-title" : "page-title bg-dark text-white"}>
                                Page Under Construction
                            </h1>
                        </div>
                    </div>
                </div>
                <div>
                    <img className = "im_building_it" src={weebImage} alt="Under Construction" />
                </div>
            </div>
        )
        // return (
        //     <div>
        //         <div className="row" style={{ marginTop: "2rem" }}>
        //             <div className="col-sm-3">
        //                 <div className="card">
        //                     <div className="card-body">
        //                         <h5 className="card-title">Settings</h5>
        //                         <div className="row align-items-center">
        //                             <div>
        //                                 <label for="customRange2" className="form-label text-muted fw-normal mt-0 text-truncate">Aggregate runs: </label>
        //                                 <p>{aggregateRuns}</p>
        //                                 <input type="range" className="form-range" min="1" max="5" id="customRange2" onChange={this.handleChange}></input>
        //                             </div>
        //                         </div>
        //                         <div className="row align-items-center">
        //                             <div>
        //                                 <label for="customRange2" className="form-label text-muted fw-normal mt-0 text-truncate">Reaction runs: </label>
        //                                 <p>{aggregateRuns}</p>
        //                                 {/* <input type="range" className="form-range" min="0" max="5" id="customRange2" onChange={this.handleChange}></input> */}
        //                             </div>
        //                         </div>
        //                         {characters && <Characters />}
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="col-sm-6">
        //                 <div className="card">
        //                     <div className="card-body">
        //                         <h5 className="card-title">Shopping List</h5>
        //                         <div className="form-group">
        //                             <label for="exampleFormControlTextarea1">Paste Materials</label>
        //                             <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
        //                         </div>
        //                         <BasicTable/>
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="col-sm-3">
        //             </div>
        //         </div>
        //     </div>
        // );
    }
}

export default Build;