import React from "react";
import axios from "axios";
import HomePageTable from "./homePageTable.js";
import { Flex, Card } from "@radix-ui/themes";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

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
            colorBlindMode: this.props.colorBlindMode,
            data: null,
            loading: true,
            hub: {
                tradeHub: 10000002,
            },
        }
        this.refreshData = this.refreshData.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.colorBlindMode !== prevProps.colorBlindMode) {
            this.setState({
                colorBlindMode: this.props.colorBlindMode
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
        const { data, loading, hub, colorBlindMode } = this.state;

        return (
            <Flex>
                {loading ? (
                    <Card className="dashboard-loading" style={{ width: "100%" }}>
                        <Flex justify="center" align="center" height="100%">
                            <FontAwesomeIcon icon={faCircleNotch} spin size="xl" />
                        </Flex>
                    </Card>
                ) : (
                    <HomePageTable hub={hub} loading={loading} refreshData={this.refreshData} data={data} table={"Losses"} colorBlindMode={colorBlindMode} />
                )}
            </Flex>
        )
    }
}
