import React from "react";
import namesAndIds from "./namesAndIds.js";

class HomePageTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            isLoaded: false,
            table: null,
            darkMode: false,
            sortConfig: { key: null, direction: 'ascending' },
        };
    }

    componentDidMount() {
        this.setState({ data: this.props.data });
        this.setState({ table: this.props.table });
        this.setState({ darkMode: this.props.darkMode });
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.setState({ data: this.props.data });
        }
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

    render() {
        const { data, isLoaded, table, darkMode } = this.state

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
                }
            })
        }

        rows = this.sortData(rows);

        return (
            <div>
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
                                <td><img src={`https://images.evetech.net/types/${row.type_id}/icon?size=32`} alt="Item" /></td>
                                <td><a href={`/subsystem/${row.type_id}`}>{row.name}</a></td>
                                <td>{Number(row.buy).toLocaleString()}</td>
                                <td>{Number(row.sell).toLocaleString()}</td>
                                <td>{Number(row.buyVolume).toLocaleString()}</td>
                                <td>{Number(row.sellVolume).toLocaleString()}</td>
                                <td>{Number(row.losses).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default HomePageTable;