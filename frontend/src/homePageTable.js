import React from "react";
import namesAndIds from "./namesAndIds.js";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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
        // function getPicture(id) {
        //     return (
        //         <div>
        //             <img src={`https://images.evetech.net/types/${id}/icon?size=32`} alt="Item" />
        //         </div>
        //     )
        // }
        const { data, isLoaded, table, darkMode } = this.state
        const columns = [
            { field: 'id', headerName: 'Item', width: 70,
                renderCell: (params) => (
                    <div>
                        <img src={`https://images.evetech.net/types/${params.value}/icon?size=32`} alt="Item" />
                    </div>
                )
             }, //contain a picture of the item
            { field: 'name', headerName: 'Name', width: 280 },
            { field: 'buy', headerName: 'Buy', type: 'number', width: 260 },
            { field: 'sell', headerName: 'Sell', type: 'number', width: 260 },
            { field: 'buyOrders', headerName: 'Buy Orders', type: 'number', width: 195 },
            { field: 'sellOrders', headerName: 'Sell Orders', type: 'number', width: 195 },
            // {
            //     field: 'profit', headerName: 'Profit',
            //     description: 'This column has a value getter and is not sortable.',
            //     width: 130,
            //     valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
            // },
            // { field: 'tradeVol', headerName: 'Trade Volume', type: 'number', width: 130 },
            // {
            //     field: 'losses', headerName: 'Losses',
            //     description: 'Number blown up in the past week.',
            //     sortable: false,
            //     type: 'number', width: 130
            // },
        ];

        console.log(data);



        //   const rows = [
        //     { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
        //     { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
        //     { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
        //     { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
        //     { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
        //     { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
        //     { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
        //     { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
        //     { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
        //   ];

        let rows = [];

        if (data) {
            rows = data.map((item) => {
                return {
                    // id: Number(item.item_id),
                    id: item.item_id,
                    name: namesAndIds.find(obj => obj.id === item.item_id)?.name || '',
                    buy: item.jitadata.maxBuy,
                    buyOrders: item.jitadata.buyOrders + " | " + item.jitadata.buyVolume,
                    sell: item.jitadata.minSell,
                    sellOrders: item.jitadata.sellOrders + " | " + item.jitadata.sellVolume,
                    profit: item.jitadata.sellOrders - item.jitadata.buyOrders,
                    tradeVol: item.jitadata.tradeVol,
                    losses: item.jitadata.losses,
                }
            })
        }

        // const paginationModel = { page: 0, pageSize: 5 };

        return (
            <Paper sx={{ height: 520, width: '100%' }} >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    // initialState={{ pagination: { paginationModel } }}
                    // pageSizeOptions={[5, 10]}
                    // checkboxSelection
                    sx={{ border: 0 }}
                />
            </Paper>
        );
    }
}

export default HomePageTable;