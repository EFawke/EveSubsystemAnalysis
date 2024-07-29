import Chart from 'react-apexcharts';
import React from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

class ApexGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            marketData: this.props.marketData,
            subsystemCosts: this.props.subsystemCosts,
            period: 360,
            isLoaded: false,
            // period: this.props.period //max 360, min 30
        };
        this.source = axios.CancelToken.source();
        this.renderGraph = this.renderGraph.bind(this);
    }

    // componentDidMount() {
    //     this.fetchContent();
    // }

    renderGraph() {
        const inMillions = (num) => {
            return (Number(num) / 1000000).toFixed(2);
        }

        console.log(this.props)

        let numSCInDb = this.props.subsystemCosts.length
        let numMDInDb = this.props.marketData.length
        const subCosts = this.props.subsystemCosts.splice(numSCInDb - this.props.period, numSCInDb)
        const mktDat = this.props.marketData.splice(numMDInDb - this.props.period, numMDInDb)


        let options = {
            chart: {
                id: 'price-chart',
                type: 'line',
                toolbar: {
                    show: false,
                }
            },
            xaxis: {
                tickAmount: 5,
                categories: subCosts?.map((day) => {
                    let date = new Date(Number(day?.date));
                    let dd = date.getDate();
                    let mm = date.getMonth() + 1;
                    let yy = date.getFullYear();
                    return `${dd}/${mm}/${yy}`;
                }),
                labels: {
                    rotate: 0,
                }
            },
            yaxis: [{
                title: {
                    text: 'Price in Millions',
                },
            }],
            tooltip: {
                shared: true,
                intersect: false
            }
        };

        let series = [{
            name: 'average price',
            data: mktDat?.map((g) => {
                return inMillions(g?.average_price)
            })
        },
        {
            name: 'cost of materials',
            data: subCosts?.map((s_cost) => {
                return inMillions(s_cost?.average_price)
            })
        }];

        return (
            <div>
                <Chart options={options} series={series} type="line" width="100%" height={320} />
            </div>
        );
    }


    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            console.log("props changed in ApexGraph")
            this.setState({
                id: this.props.id,
                period: this.props.period,
                marketData: this.props.marketData,
                subsystemCosts: this.props.subsystemCosts,
                isLoaded: true
            })
        }
    }

    // componentWillUnmount() {
    //     if (this.source) {
    //         this.source.cancel('Component unmounted');
    //     }
    // }

    // fetchContent() {
    //     const subsystem = window.location.pathname.split('/')[2];
    //     if (this.source) {
    //         this.source.cancel('New request');
    //     }
    //     this.source = axios.CancelToken.source();
    //     axios.get(`/api/market/${subsystem}`, { cancelToken: this.source.token })
    //         .then((res) => {
    //             const data = res.data;
    //             this.setState({
    //                 marketData: data.marketData,
    //                 subsystemCosts: data.subsystemCosts,
    //                 id: data.id,
    //             });
    //         })
    //         .catch((error) => {
    //             if (axios.isCancel(error)) {
    //                 console.log('Request canceled', error.message);
    //             } else {
    //                 console.error(error);
    //             }
    //         });
    // }

    render() {

        console.log(this.props)

        if (this.props.isLoaded) {
            console.log(this.state)
            return (
                <div>
                    {this.renderGraph()}
                </div>
            );
        }

        const currentSubsystem = window.location.pathname.split('/')[2];

        if ((this.state.marketData?.length === 0 && this.state.subsystemCosts?.length === 0) || this.state.id !== currentSubsystem) {
            return (
                <Skeleton count={7} height={305 / 7} />
            );
        }
    }
}

export default ApexGraph;
