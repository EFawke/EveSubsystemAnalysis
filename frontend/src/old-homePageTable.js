import { dark } from "@mui/material/styles/createPalette";
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
        this.subRedirect = this.subRedirect.bind(this);
    }

    componentDidMount() {
        this.setState({ data: this.props.data });
        this.setState({ table: this.props.table });
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

    subRedirect = (event, item_id) => {
        console.log(item_id);
        if (item_id) {
            window.location.href = `/subsystem/${item_id}`;
          }
      };

    render() {
        const { data, isLoaded, table, darkMode } = this.state
        let floop = [];
        if (table == "Under Supplied"){
            floop = data.sort((a, b) => {
                const ratioA = a.jitadata.sellOrders / a.jitadata.buyOrders;
                const ratioB = b.jitadata.sellOrders / b.jitadata.buyOrders;
                return ratioA - ratioB;
            });
        }
        if (table == "Over Supplied"){
            floop = data.sort((a, b) => {
                const ratioA = a.jitadata.sellOrders / a.jitadata.buyOrders;
                const ratioB = b.jitadata.sellOrders / b.jitadata.buyOrders;
                return ratioB - ratioA;
            });
        }
        return (
            <div>
                <div className={!darkMode ? "row subsystem_title" : "row bg-dark text-white subsystem_title"}>
                    <div className="col-12">
                        <div className="page-title-box">
                            <h1 className={!darkMode ? "page-title" : "page-title bg-dark text-white"}>
                                {table}
                            </h1>
                        </div>
                    </div>
                </div>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Profit</th>
                            <th scope="col">Lost</th>
                            <th scope="col">Volume</th>
                            <th scope="col">Sell/Buy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {floop.map((item, index) => {
                            if (index < 10) {
                                return (
                                        <tr className="clickable_tr" key={item.item_id} onClick={(event) => this.subRedirect(event, item.item_id)}>   
                                            <td>{namesAndIds.find((element) => element.id === item.item_id).name}</td>
                                            <td>{item.jitadata.minSell}</td>
                                            <td>{item.jitadata.minSell}</td>
                                            <td>{item.jitadata.buyVolume + item.jitadata.sellVolume}</td>
                                            <td>{(item.jitadata.sellOrders / item.jitadata.buyOrders).toFixed(2)}</td>
                                        </tr>
                                )
                            }
                        }
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default HomePageTable;
