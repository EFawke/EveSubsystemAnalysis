import Chart from 'react-apexcharts';
import React from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

class LossesPieChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            pieChartData: [],
        };
        this.source = axios.CancelToken.source();
    }

    componentDidMount() {
        this.fetchContent();
    }

    componentDidUpdate(prevProps, prevState) {
        const currentSubsystem = window.location.pathname.split('/')[2];
        if (prevState.id !== currentSubsystem) {
            this.fetchContent();
        }
    }

    componentWillUnmount() {
        if (this.source) {
            this.source.cancel('Component unmounted');
        }
    }

    fetchContent() {
        const subsystem = window.location.pathname.split('/')[2];
        if (this.source) {
            this.source.cancel('New request');
        }
        this.source = axios.CancelToken.source();
        axios.get(`/api/market/${subsystem}`, { cancelToken: this.source.token })
            .then((res) => {
                const data = res.data;
                this.setState({
                    pieChartData: data.pieChartData || [],
                    id: data.id || null,
                });
            })
            .catch((error) => {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                } else {
                    console.log(error);
                }
            });
    }

    render() {
        const currentSubsystem = window.location.pathname.split('/')[2];

        if (this.state.pieChartData.length === 0 || this.state.id !== currentSubsystem) {
            return (
                <Skeleton count={7} height={305 / 7} />
            );
        } else {
            const { id, pieChartData } = this.state;

            if (!pieChartData[id]) {
                return <div>Error: Data not available for the current subsystem</div>;
            }

            const currentSub = pieChartData[id].name;
            const colors = [];
            const fillColors = [];
            const length = Object.keys(pieChartData).length;

            for(const key in pieChartData){
                const currentSub = window.location.pathname.split('/')[2];
                // console.log(currentSub);
                if(pieChartData.hasOwnProperty(key)){
                    const value = pieChartData[key].value;
                    if(key === currentSub){
                        colors.push('#FF0000');
                        fillColors.push('#FF0000');
                    } else {
                        colors.push('#000000');
                        fillColors.push('#000000');
                    }
                }
            }

            const valuesArray = Object.values(pieChartData).map(item => item.value);
            const options = {
                chart: {
                    type: 'pie',
                },
                colors: colors,
                dataLabels: {
                    enabled: false,
                },
                legend: {
                    show: false,
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '65%',
                            labels: {
                                show: true,
                                total: {
                                    show: true,
                                    showAlways: true,
                                    label: 'Total',
                                    formatter: function (w) {
                                        return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    },
                                },
                            },
                        },
                    },
                },
                labels: Object.values(pieChartData).map(item => item.name),
            };

            return (
                <Chart options={options} series={valuesArray} type="donut" width={500} height={320} />
            );
        }
    }
}

export default LossesPieChart;
