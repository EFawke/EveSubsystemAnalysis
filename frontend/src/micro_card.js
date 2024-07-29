import React from 'react';
import Chart from 'react-apexcharts';
import 'react-loading-skeleton/dist/skeleton.css';
import Skeleton from 'react-loading-skeleton';


class MicroCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardTitle: null,
            options: null,
            series: null,
            loading: null,
            bigNum: null,
            percentage: null,
            darkMode: this.props.darkMode,
        }
    }

    componentDidMount() {
        // console.log(this.props);
        this.setState({
            cardTitle: this.props.cardTitle,
            options: this.props.options,
            series: this.props.series,
            loading: this.props.loading,
            bigNum: this.props.bigNum,
            percentage: this.props.percentage,
        })

    }

    componentDidUpdate(prevProps) {
        if (this.props.loading !== prevProps.loading) {
            this.setState({
                cardTitle: this.props.cardTitle,
                options: this.props.options,
                series: this.props.series,
                loading: this.props.loading,
                bigNum: this.props.bigNum,
                percentage: this.props.percentage,
            })
        }
        if(this.props.darkMode !== prevProps.darkMode){
            this.setState({darkMode: this.props.darkMode})
            this.setState({
                cardTitle: this.props.cardTitle,
                options: this.props.options,
                series: this.props.series,
                loading: this.props.loading,
                bigNum: this.props.bigNum,
                percentage: this.props.percentage,
            })
        }
    }

    render() {
        let { darkMode, loading, options, series, cardTitle, bigNum, percentage } = this.state;
        const darkModeClass = "bg-dark text-white";
        if (cardTitle === "Losses" || cardTitle === "Jita Sell" || cardTitle === "Trade Volume" || cardTitle === "Profit") {
            let classText = "text-danger me-2";
            if (percentage > 0) {
                classText = "text-success me-2";
            }
            let showMillion = "";
            if(cardTitle === "Jita Sell" || cardTitle === "Profit"){
                showMillion = "M";
            }
            return (
                <div className="col-md-6 col-xl-3">
                    <div className= {darkMode ? "card " + darkModeClass : "card"}>
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-5">
                                    <h5 className="text-muted fw-normal mt-0 text-truncate" title="New Leads">{loading ? <Skeleton count={1} height={24}/> : this.props.cardTitle}</h5>
                                    <h3 className="my-2 py-1">{loading ? <Skeleton count={1} height={32.117} /> : bigNum}<span className = "text-muted fs-6">{loading ? null : showMillion}</span></h3>
                                    <p className="mb-0 text-muted">
                                        {loading ? <Skeleton count={1} height={"auto"} /> : <span className={classText}><i className="mdi mdi-arrow-down-bold"></i> {percentage} %</span>}
                                    </p>
                                </div>
                                <div className={loading ? "col-6" : "col-4"}>
                                    <div className="text-end">
                                        {loading ? (
                                            <Skeleton count={4} height={80 / 4} />
                                        ) : (
                                            <Chart options={options} series={series} type="line" width={150} height={80} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="col-md-6 col-xl-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-6">
                                    <h5 className="text-muted fw-normal mt-0 text-truncate" title="New Leads">{this.props.cardTitle}</h5>
                                    <h3 className="my-2 py-1">3,254</h3>
                                    <p className="mb-0 text-muted">
                                        <span className="text-danger me-2"><i className="mdi mdi-arrow-down-bold"></i> 5.38%</span>
                                    </p>
                                </div>
                                <div className="col-4">
                                    <div className="text-end">
                                        {/* add something here later */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default MicroCard;