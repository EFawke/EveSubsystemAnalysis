import React from "react";
import Characters from './characters.js';
import { MDCDataTable } from '@material/data-table';
import BasicTable from "./shoppingList.js";
import weebImage from './weeb.jpeg';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

class Build extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: '',
            aggregateRuns: 5,
            characters: null,
            numSlots: 1,
            darkMode: this.props.darkMode || false,
        };
    }

    componentDidUpdate() {
        if (this.state.darkMode !== this.props.darkMode) {
            this.setState({ darkMode: this.props.darkMode });
        }
    }

    handleReactionSlotsChange = (e) => {
        //check if e.target.value is an integer
        if(!Number.isInteger(parseInt(e.target.value))) {
            return;
        } else {
            this.setState({ numSlots: e.target.value });
        }
    }

    render() {
        const { search, aggregateRuns, characters, darkMode, numSlots } = this.state;
        if (window.location.href !== "http://localhost:3000/build/") {
            return (
                <div className="working_on_it">
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
                        <img className="im_building_it" src={weebImage} alt="Under Construction" />
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <div className={!darkMode ? "row" : "row bg-dark text-white"} style={{ marginTop: "2rem" }}>
                        <div className="col-sm-3">
                            <div className={!darkMode ? "card" : "card bg-dark text-white"}>
                                <div className="card-body">
                                    <div className="row align-items-center user-setup-form">
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className={!darkMode ? "card" : "card bg-dark text-white"}>
                                <div className="card-body">
                                    <div className="row align-items-center user-setup-form">
                                        
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
}

export default Build;