import React from 'react';
import Chart from 'react-apexcharts';
import 'react-loading-skeleton/dist/skeleton.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Section, Flex, Link, Heading, Text, Button, IconButton, Container, Card } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons"


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
        if (this.props.darkMode !== prevProps.darkMode) {
            this.setState({ darkMode: this.props.darkMode })
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
        let { darkMode, options, series, cardTitle, bigNum, percentage, loading } = this.state;
        // const loading = true;
        const darkModeClass = "bg-dark text-white";
        if (cardTitle === "Losses" || cardTitle === "Sell" || cardTitle === "Trade Volume" || cardTitle === "Profit") {
            let classText = "danger";
            if (percentage > 0) {
                classText = "success";
            }
            let showMillion = "";
            if (cardTitle === "Sell" || cardTitle === "Profit") {
                showMillion = "M";
            }
            return (
                <Card style={{width: "25%"}} className="micro_cards">
                    <Flex direction="row" justify="space-between" align="center" mt="1" mb="1" ml="1" mr="1">
                        <Flex width="40%" direction="column">
                            <Heading maxWidth="100%" mb="4">{loading ?
                                <SkeletonTheme baseColor='#313131' highlightColor='#313131'>
                                    <Skeleton count={1} height={24} />
                                </SkeletonTheme>
                                : <Text truncate>{this.props.cardTitle}</Text>}</Heading>
                            {loading ? (
                                <SkeletonTheme baseColor='#313131' highlightColor='#313131'>
                                    <Skeleton count={1} height={32.117} />
                                </SkeletonTheme>
                            ) : (
                                <Flex mb="4" gap="1" direction="row" align="end">
                                    <Heading mb="0">{bigNum}</Heading>
                                    <Text size="4" color="gray">{showMillion}</Text>
                                </Flex>
                            )}
                            <Text>
                                {loading ?
                                    <SkeletonTheme baseColor='#313131' highlightColor='#313131'>
                                        <Skeleton count={1} height={"auto"} />
                                    </SkeletonTheme>
                                    : <span className={classText}>{percentage}%</span>}
                            </Text>
                        </Flex>
                        <Flex width="60%" direction="column" align="center">
                            <Flex>
                                {loading ? (
                                    <SkeletonTheme baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                                        <Skeleton count={4} height={80 / 4} />
                                    </SkeletonTheme>
                                ) : (
                                    <Chart options={options} series={series} type="line" width={'100%'} height={80} />
                                )}
                            </Flex>
                        </Flex>
                    </Flex>
                </Card>
            )
        } else {
            return null;
            // return (
            //     <div className="col-md-6 col-xl-3">
            //         <div className="card">
            //             <div className="card-body">
            //                 <div className="row align-items-center">
            //                     <div className="col-6">
            //                         <h5 className="text-muted fw-normal mt-0 text-truncate" title="New Leads">{this.props.cardTitle}</h5>
            //                         <h3 className="my-2 py-1">3,254</h3>
            //                         <p className="mb-0 text-muted">
            //                             <span className="text-danger me-2"><i className="mdi mdi-arrow-down-bold"></i> 5.38%</span>
            //                         </p>
            //                     </div>
            //                     <div className="col-4">
            //                         <div className="text-end">
            //                             {/* add something here later */}
            //                         </div>
            //                     </div>
            //                 </div>
            //             </div>
            //         </div>
            //     </div>
            // )
        }
    }
}

export default MicroCard;