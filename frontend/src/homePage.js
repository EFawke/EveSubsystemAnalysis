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
            loading: true
        }
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
        axios.get('/api/home')
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

    render() {
        const { darkMode, data, loading } = this.state;

        // const loading = true;

        const darkModeClass = "bg-dark text-white";

        //get the window width
        const width = window.innerWidth;

        return (
            <div>
                <div className={darkMode ? "row " + darkModeClass : "row"}>
                    <div className="col-lg-12">
                        {loading ? (
                            <div className = "d-flex justify-content-center">
                            <SkeletonTheme baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                                <Skeleton count={10}
                                    height={50}
                                    width={width * 0.8}
                                />
                            </SkeletonTheme>
                            </div>
                        ) : (
                            <HomePageTable data={data} darkMode={darkMode} table={"Losses"} />
                        )}
                    </div>
                </div>
            </div>
        )
    }
}
