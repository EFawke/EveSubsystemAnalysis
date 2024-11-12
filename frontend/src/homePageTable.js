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

    render() {
        const { data, isLoaded, table, darkMode } = this.state

        let rows = [];

        if (data) {
            rows = data.map((item) => {
                console.log(item);
                return {
                    type_id: item.type_id,
                    name: item.type_name,
                    buy: item.buy,
                    sell: item.sell,
                    volRatio: item.volRatio,
                    sellVolume: item.sellVolume,
                    buyVolume: item.buyVolume,
                    losses: item.losses,
                }
            })
        }

        // const paginationModel = { page: 0, pageSize: 5 };

        return (
            <div>
                <table className={darkMode ? "table table-hover table-dark" : "table table-hover"}>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Name</th>
                            <th>Buy</th>
                            <th>Sell</th>
                            <th>Buy Volume</th>
                            <th>Sell Volume</th>
                            <th>Losses</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id}>
                                <td><img src={`https://images.evetech.net/types/${row.type_id}/icon?size=32`} alt="Item" /></td>
                                <td><a href={`/subsystem/${row.type_id}`}>{row.name}</a></td><td>{row.buy}</td><td>{row.sell}</td><td>{row.buyVolume}</td><td>{row.sellVolume}</td><td>{row.losses}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default HomePageTable;