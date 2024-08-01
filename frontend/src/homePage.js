import React from "react";
import namesAndIds from "./namesAndIds.js";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import axios from "axios";
import weebImage from './weeb.jpeg';

export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recommendedSubsystems: [],
            highTradeVolume: [],
            overSupplied: [],
            underSupplied: [],
            darkMode: false,
            isLoaded: false,
            data: null,
        }
    }

    // componentDidMount() {
    //     axios.get(`/api/home`)
    //         .then(response => {
    //             this.setState({ data: response.data })
    //         })
    //         .catch(err => {
    //             console.log(err);
    //         })
    // }

    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            this.setState({
                darkMode: this.props.darkMode
            });
            this.setState({
                data: this.props.data
            })
        }
    }

    render() {
        const { darkMode, data } = this.state;
        const darkModeClass = "bg-dark text-white";

        if (!data) {
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
        } else {
            return (
                <div>
                    <div className={!darkMode ? "row subsystem_title" : "row bg-dark text-white subsystem_title"}>
                        <div className="col-12">
                            <div className="page-title-box">
                                <h1 className={!darkMode ? "page-title" : "page-title bg-dark text-white"}>
                                    Recommended Subsystems
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className={darkMode ? "home-table row " + darkModeClass : "home-table row"}>
                        <div className="col-lg">
                            <div className={darkMode ? "card " + darkModeClass : "card"}>
                                <div className="card-header d-flex justify-content-between header-row">
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Name</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Profit</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Lost</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Volume</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Sell/Buy</h5>
                                </div>
                                <div className="card-body pt-0">
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div className={!darkMode ? "row subsystem_title" : "row bg-dark text-white subsystem_title"}>
                        <div className="col-12">
                            <div className="page-title-box">
                                <h1 className={!darkMode ? "page-title" : "page-title bg-dark text-white"}>
                                    High Trade Volume
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className={darkMode ? "home-table row " + darkModeClass : "home-table row"}>
                        <div className="col-lg">
                            <div className={darkMode ? "card " + darkModeClass : "card"}>
                                <div className="card-header d-flex justify-content-between header-row">
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Name</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Profit</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Lost</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Volume</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Sell/Buy</h5>
                                </div>
                                <div className="card-body pt-0">
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div className={!darkMode ? "row subsystem_title" : "row bg-dark text-white subsystem_title"}>
                        <div className="col-12">
                            <div className="page-title-box">
                                <h1 className={!darkMode ? "page-title" : "page-title bg-dark text-white"}>
                                    Undersupplied
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className={darkMode ? "home-table row " + darkModeClass : "home-table row"}>
                        <div className="col-lg">
                            <div className={darkMode ? "card " + darkModeClass : "card"}>
                                <div className="card-header d-flex justify-content-between header-row">
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Name</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Profit</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Lost</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Volume</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Sell/Buy</h5>
                                </div>
                                <div className="card-body pt-0">
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div className={!darkMode ? "row subsystem_title" : "row bg-dark text-white subsystem_title"}>
                        <div className="col-12">
                            <div className="page-title-box">
                                <h1 className={!darkMode ? "page-title" : "page-title bg-dark text-white"}>
                                    Oversupplied
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className={darkMode ? "home-table row " + darkModeClass : "home-table row"}>
                        <div className="col-lg">
                            <div className={darkMode ? "card " + darkModeClass : "card"}>
                                <div className="card-header d-flex justify-content-between header-row">
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Name</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Profit</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Lost</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Volume</h5>
                                    <h5 className="home-heading fw-normal mt-0 text-truncate">Sell/Buy</h5>
                                </div>
                                <div className="card-body pt-0">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}


// <div className="col">
//     <table className={darkMode ? "table table-dark" : "table table-striped"}>
//         <thead>
//             <tr>
//                 <th>ID</th>
//                 <th>Name</th>
//             </tr>
//         </thead>
//         <tbody>
//             {namesAndIds.map((item) => (
//                 <tr key={item.id}>
//                     <td>{item.id}</td>
//                     <td>
//                         <a href={`/subsystem/${item.id}`}>{item.name}</a>
//                     </td>
//                 </tr>
//             ))}
//         </tbody>
//     </table>
// </div>