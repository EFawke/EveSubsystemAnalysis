import React from "react";
import namesAndIds from "./namesAndIds.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { faEquals } from '@fortawesome/free-solid-svg-icons'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

class HomePageTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            isLoaded: false,
            table: null,
            darkMode: false,
            sortConfig: { key: null, direction: 'ascending' },
            showOptionsDialog: false,
        }
        this.setButtonVariant = this.setButtonVariant.bind(this);
        this.toggleMobileMarketMenu = this.toggleMobileMarketMenu.bind(this);
    }

    componentDidMount() {
        // this.setState({ data: this.props.data });
        this.setState({ table: this.props.table });
        this.setState({ darkMode: this.props.darkMode });
    }

    componentDidUpdate(prevProps) {
        // if (this.props.data !== prevProps.data) {
        //     this.setState({ data: this.props.data });
        // }
        if (this.props.table !== prevProps.table) {
            this.setState({ table: this.props.table });
        }
        if (this.props.darkMode !== prevProps.darkMode) {
            this.setState({ darkMode: this.props.darkMode })
        }
        if (this.props.isLoaded !== prevProps.isLoaded) {
            this.setState({ isLoaded: this.props.isLoaded })
        }
    }

    handleSort = (key) => {
        let direction = 'ascending';
        if (this.state.sortConfig.key === key && this.state.sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        this.setState({ sortConfig: { key, direction } });
    }

    sortData = (data) => {
        const { key, direction } = this.state.sortConfig;
        if (!key) return data;

        return [...data].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    setButtonVariant = (hub, button) => {
        if (hub.tradeHub == button || hub == button) {
            return "primary";
        } else {
            return "dark";
        }
    }

    toggleMobileMarketMenu = () => {
        this.setState({
            showOptionsDialog: !this.state.showOptionsDialog
        });
    }

    render() {
        const { isLoaded, table, darkMode } = this.state
        const { data, hub } = this.props;

        let rows = [];

        if (data) {
            rows = data.map((item) => {
                return {
                    type_id: item.type_id,
                    name: item.type_name,
                    buy: Number(item.buy),
                    sell: Number(item.sell),
                    volRatio: Number(item.volRatio),
                    sellVolume: Number(item.sellVolume),
                    buyVolume: Number(item.buyVolume),
                    losses: Number(item.losses),
                    sellPercentageChange: Number(item.sellPercentageChange).toFixed(1),
                    buyPercentageChange: Number(item.buyPercentageChange).toFixed(1),
                    sellVolumePercentageChange: Number(item.sellVolumePercentageChange).toFixed(1),
                    buyVolumePercentageChange: Number(item.buyVolumePercentageChange).toFixed(1),
                }
            })
        }

        rows = this.sortData(rows);

        const width = window.innerWidth;

        return (
            <div className={darkMode ? "card " + "bg-dark" : "card"}>
                <div className="card-body">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className={darkMode ? "md-dark text-white home_page_header" : "md-light home_page_header_light"}>Suggested Subsystems</h5>
                        <div id = "desktop_trade_hub_menu" className="trade_hub_container">
                            <Button variant={this.setButtonVariant(hub, 10000002)} onClick={() => this.props.refreshData({ tradeHub: 10000002 })}>
                                Jita
                            </Button>
                            <Button variant={this.setButtonVariant(hub, 10000043)} onClick={() => this.props.refreshData({ tradeHub: 10000043 })}>
                                Amarr
                            </Button>
                            <Button variant={this.setButtonVariant(hub, 10000032)} onClick={() => this.props.refreshData({ tradeHub: 10000032 })}>
                                Dodixie
                            </Button>
                            <Button variant={this.setButtonVariant(hub, 10000042)} onClick={() => this.props.refreshData({ tradeHub: 10000042 })}>
                                Hek
                            </Button>
                            <Button variant={this.setButtonVariant(hub, 10000030)} onClick={() => this.props.refreshData({ tradeHub: 10000030 })}>
                                Rens
                            </Button>
                        </div>
                        <div className="trade_hub_container_mobile">
                            <div>
                                <Button variant={darkMode ? "dark" : "dark"} onClick={() => this.toggleMobileMarketMenu()}>
                                    <FontAwesomeIcon icon={faEllipsis} />
                                </Button>
                            </div>
                            {this.state.showOptionsDialog && (
                                <div id = "mobile_trade_hub_menu" className={darkMode ? "options-dialog" : "options-dialog-light"}>
                                    <div className="options-dialog-content">
                                        <ul>
                                            <li>
                                                <Button variant={this.setButtonVariant(hub, 10000002)} onClick={() => this.props.refreshData({ tradeHub: 10000002 })}>
                                                    Jita
                                                </Button>
                                            </li>
                                            <li>
                                                <Button variant={this.setButtonVariant(hub, 10000043)} onClick={() => this.props.refreshData({ tradeHub: 10000043 })}>
                                                    Amarr
                                                </Button>
                                            </li>
                                            <li>
                                                <Button variant={this.setButtonVariant(hub, 10000032)} onClick={() => this.props.refreshData({ tradeHub: 10000032 })}>
                                                    Dodixie
                                                </Button>
                                            </li>
                                            <li>
                                                <Button variant={this.setButtonVariant(hub, 10000042)} onClick={() => this.props.refreshData({ tradeHub: 10000042 })}>
                                                    Hek
                                                </Button>
                                            </li>
                                            <li>
                                                <Button variant={this.setButtonVariant(hub, 10000030)} onClick={() => this.props.refreshData({ tradeHub: 10000030 })}>
                                                    Rens
                                                </Button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <table className={darkMode ? "table table-hover table-dark" : "table table-hover"}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th onClick={() => this.handleSort('name')}>Name</th>
                                <th onClick={() => this.handleSort('buy')}>Buy</th>
                                <th onClick={() => this.handleSort('sell')}>Sell</th>
                                <th onClick={() => this.handleSort('buyVolume')}>Buy Volume</th>
                                <th onClick={() => this.handleSort('sellVolume')}>Sell Volume</th>
                                <th onClick={() => this.handleSort('losses')}>Losses</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.type_id}>
                                    <td className="home_page_td"><img src={`https://images.evetech.net/types/${row.type_id}/icon?size=32`} alt="Item" /></td>
                                    <td className="home_page_td"><a href={`/subsystem/${row.type_id}`}>{row.name}</a></td>
                                    <td className="home_page_td">
                                        <div className="cell-content">
                                            <span className={row.buyPercentageChange >= 0 ? "text-success percentage_span" : "text-danger percentage_span"}>
                                                {row.buyPercentageChange >= 0 ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />} {row.buyPercentageChange}%
                                            </span>
                                            <div className="value-container">
                                                {Number(row.buy).toLocaleString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="home_page_td">
                                        <div className="cell-content">
                                            <span className={row.sellPercentageChange >= 0 ? "text-success percentage_span" : "text-danger percentage_span"}>
                                                {row.sellPercentageChange >= 0 ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />} {row.sellPercentageChange}%
                                            </span>
                                            <div className="value-container">
                                                {Number(row.sell).toLocaleString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="home_page_td">
                                        <div className="cell-content">
                                            <span className={row.buyVolumePercentageChange >= 0 ? "text-success percentage_span" : "text-danger percentage_span"}>
                                                {row.buyVolumePercentageChange >= 0 ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />} {row.buyVolumePercentageChange}%
                                            </span>
                                            <div className="value-container">
                                                {Number(row.buyVolume).toLocaleString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="home_page_td">
                                        <div className="cell-content">
                                            <span className={row.sellVolumePercentageChange >= 0 ? "text-success percentage_span" : "text-danger percentage_span"}>
                                                {row.sellVolumePercentageChange >= 0 ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />} {row.sellVolumePercentageChange}%
                                            </span>
                                            <div className="value-container">
                                                {Number(row.sellVolume).toLocaleString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="home_page_td">{Number(row.losses).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default HomePageTable;