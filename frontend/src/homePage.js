import React from "react";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import axios from "axios";
import HomePageTable from "./homePageTable.js";

export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recommendedSubsystems: [],
            highTradeVolume: [],
            overSupplied: [],
            underSupplied: [],
            darkMode: this.props.darkMode,
            isLoaded: false,
            data: null,
            loading: true,
            hub: 10000002,
        }
        this.refreshData = this.refreshData.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.darkMode !== prevProps.darkMode) {
            this.setState({
                darkMode: this.props.darkMode
            });
        }
    }

    componentDidMount() {
        // Fetch data from the backend
        axios.post('/api/home', { tradeHub: 10000002 }, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                this.setState({
                    data: response.data,
                    loading: false,
                    isLoaded: true
                });
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                this.setState({ loading: false });
            });
    }

    refreshData = (tradeHub) => {
        this.setState({ isLoaded: false });
        this.setState({ loading: true });
        axios.post('/api/home', tradeHub).then((response) => {
            console.log(response.data);
            this.setState({
                data: response.data,
                isLoaded: true,
                loading: false,
                hub: tradeHub,
            });
        }).catch((error) => {
            console.error("Error fetching data:", error);
            this.setState({ loading: false });
        });
    }

    render() {
        const { darkMode, data, loading, hub } = this.state;

        // const loading = true;

        const darkModeClass = "bg-dark text-white";

        //get the window width
        const width = window.innerWidth;

        return (
            <div>
                <div className={darkMode ? "row " + darkModeClass : "row"}>
                    <div className="col-lg-12">
                        {loading ? (
                            <div className={darkMode ? "card " + "bg-dark" : "card"}>
                                <div className="card-body">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <SkeletonTheme baseColor={darkMode ? "#313131" : "#ebebeb"} highlightColor={darkMode ? "#313131" : "#ebebeb"}>
                                            <h5 className={darkMode ? "md-dark text-white home_page_header" : "md-light home_page_header_light"}><Skeleton width={width > 600 ? 400 : 200} /></h5>
                                        </SkeletonTheme>
                                        <div className="trade_hub_container_loading">
                                            <SkeletonTheme baseColor={darkMode ? "#313131" : "#ebebeb"} highlightColor={darkMode ? "#313131" : "#ebebeb"}>
                                                <Skeleton width={40} />
                                                <Skeleton width={40} />
                                                <Skeleton width={40} />
                                                <Skeleton width={40} />
                                                <Skeleton width={40} />
                                            </SkeletonTheme>
                                        </div>
                                    </div>
                                    <table className={darkMode ? "table table-hover table-dark" : "table table-hover"}>
                                        <tbody>
                                            {[...Array(11)].map((_, index) => (
                                                <tr key={index}>
                                                    <td><SkeletonTheme height={40} baseColor={darkMode ? "#313131" : "#ebebeb"} highlightColor={darkMode ? "#313131" : "#ebebeb"}><Skeleton /></SkeletonTheme></td>
                                                    <td><SkeletonTheme height={40} baseColor={darkMode ? "#313131" : "#ebebeb"} highlightColor={darkMode ? "#313131" : "#ebebeb"}><Skeleton /></SkeletonTheme></td>
                                                    <td><SkeletonTheme height={40} baseColor={darkMode ? "#313131" : "#ebebeb"} highlightColor={darkMode ? "#313131" : "#ebebeb"}><Skeleton /></SkeletonTheme></td>
                                                    <td><SkeletonTheme height={40} baseColor={darkMode ? "#313131" : "#ebebeb"} highlightColor={darkMode ? "#313131" : "#ebebeb"}><Skeleton /></SkeletonTheme></td>
                                                    <td><SkeletonTheme height={40} baseColor={darkMode ? "#313131" : "#ebebeb"} highlightColor={darkMode ? "#313131" : "#ebebeb"}><Skeleton /></SkeletonTheme></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <HomePageTable hub={hub} loading={loading} refreshData={this.refreshData} data={data} darkMode={darkMode} table={"Losses"} />
                        )}
                    </div>
                </div>
            </div>
        )
    }
}
