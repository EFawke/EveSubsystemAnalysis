import React, { Component } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
// import Skeleton from 'react-loading-skeleton';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Button from 'react-bootstrap/Button';
import MicroCard from './micro_card';
import { mode } from 'crypto-js';

class MarketData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,

      darkMode: this.props.darkMode,

      // Market Data
      marketData: [],
      subsystemCosts: [],
      options: {
        chart: {
          type: 'line',
          height: 350,
          toolbar: {
            show: false,
          },
          background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
        },
        xaxis: {
          categories: [],
          tickAmount: 5,
        },
        yaxis: [{
          title: {
            text: 'Price in Millions'
          }
        }],
        tooltip: {
          shared: true,
          intersect: false,
        },
        theme: {
          mode: this.props.darkMode ? 'dark' : 'light',
        },
        responsive:[{
          breakpoint: 1000,
          options: {
            xaxis: {
              tickAmount: 2,
            }
          }
        }]
      },
      series: [
        {
          name: 'Sell Price',
          data: [],
        },
      ],
      // Pie Chart
      pieOptions: {
        theme: {
          mode: this.props.darkMode ? 'dark' : 'light',
        },
        chart: {
          type: 'pie',
          background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
        },
        colors: [],
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
        labels: [],
        stroke: {
          colors: this.props.darkMode ? ['rgb(55, 64, 74)'] : ['white'],
          width: 2.5,
        },
        responsive: [{
          breakpoint: 900,
          options: {
            chart: {
              height: 250,
              width: 250,
            }
          }
        }]
      },
      pieSeries: [],

      // Recent Losses (Micro Card)
      recentLossesOptions: {
        grid: {
          show: false,
        },
        chart: {
          type: 'line',
          height: 104,
          toolbar: {
            show: false,
          },
          background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
        },
        xaxis: {
          categories: [],
          labels: {
            show: false,
          },
          lines: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          }
        },
        yaxis: [{
          title: {
            text: '',
          },
          labels: {
            show: false,
          },
          lines: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        }],
        tooltip: {
          enabled: true,
          shared: true,
          intersect: false,
        },
        theme: {
          mode: this.props.darkMode ? 'dark' : 'light',
        }
      },
      recentLossesSeries: [
        {
          name: 'Losses',
          data: [],
        },
      ],
      recentLossesBigNum: null,
      recentLossesPercentage: null,

      // Jita Sell (Micro Card)
      jitaSellOptions: {
        grid: {
          show: false,
        },
        chart: {
          type: 'line',
          height: 104,
          toolbar: {
            show: false,
          },
          background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
        },
        theme: {
          mode: this.props.darkMode ? 'dark' : 'light',
        },
        xaxis: {
          categories: [],
          labels: {
            show: false,
          },
          lines: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          }
        },
        yaxis: [{
          title: {
            text: '',
          },
          labels: {
            show: false,
          },
          lines: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        }],
        tooltip: {
          enabled: true,
          shared: true,
          intersect: false,
        },
      },
      jitaSellSeries: [
        {
          name: 'Jita Sell',
          data: [],
        },
      ],
      jitaSellBigNum: null,
      jitaSellPercentage: null,

      // Trade Volume (Micro Card)
      sellVolumeOptions: {
        grid: {
          show: false,
        },
        chart: {
          type: 'line',
          height: 104,
          toolbar: {
            show: false,
          },
          background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
        },
        theme: {
          mode: this.props.darkMode ? 'dark' : 'light',
        },
        xaxis: {
          categories: [],
          labels: {
            show: false,
          },
          lines: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          }
        },
        yaxis: [{
          title: {
            text: '',
          },
          labels: {
            show: false,
          },
          lines: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        }],
        tooltip: {
          enabled: true,
          shared: true,
          intersect: false,
        },
      },
      sellVolumeSeries: [
        {
          name: 'Trade Volume',
          data: [],
        },
      ],
      sellVolumeBigNum: null,
      sellVolumePercentage: null,

      // Profit (Micro Card)
      profitOptions: {
        grid: {
          show: false,
        },
        theme: {
          mode: this.props.darkMode ? 'dark' : 'light',
        },
        chart: {
          type: 'line',
          height: 104,
          toolbar: {
            show: false,
          },
          background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
        },
        xaxis: {
          categories: [],
          labels: {
            show: false,
          },
          lines: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          }
        },
        yaxis: [{
          title: {
            text: '',
          },
          labels: {
            show: false,
          },
          lines: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        }],
        tooltip: {
          enabled: true,
          shared: true,
          intersect: false,
        },
      },
      profitSeries: [
        {
          name: 'Profit',
          data: [],
        },
      ],
      profitBigNum: null,
      profitPercentage: null,
    };
  }

  componentDidMount() {
    this.fetchMarketData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.darkMode !== prevProps.darkMode) {
      const darkMode = this.props.darkMode;
      this.setState({
        darkMode: this.props.darkMode,
        pieOptions: {
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
          chart: {
            type: 'pie',
            background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
          },
          stroke: {
            colors: this.props.darkMode ? ['rgb(55, 64, 74)'] : ['white'],
            width: 2.5,
          }
        },
        options: {
          chart: {
            type: 'line',
            height: 350,
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
          responsive: [{
            breakpoint: 1000,
            options: {
              xaxis: {
                tickAmount: 2,
              }
            }
          }]
        },
        recentLossesOptions: {
          chart: {
            type: 'line',
            height: 104,
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          }
        },
        jitaSellOptions: {
          chart: {
            type: 'line',
            height: 104,
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
        },
        sellVolumeOptions: {
          chart: {
            type: 'line',
            height: 104,
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
        },
        profitOptions: {
          chart: {
            type: 'line',
            height: 104,
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
        },
      })
    }
    if (this.props.id !== prevProps.id) {
      this.setState({
        loading: true,
        marketData: [],
        options: {
          chart: {
            type: 'line',
            height: 350,
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? 'rgb(55, 64, 74)' : 'white',
          },
          xaxis: {
            tickAmount: 5,
            categories: [],
            labels: {
              rotate: 0,
            },
          },
          yaxis: [{
            title: {
              text: 'Price in Millions',
            },
          }],
          tooltip: {
            shared: true,
            intersect: false,
          },
          theme: {
            mode: this.state.darkMode ? 'dark' : 'light',
          },
          responsive:[{
            breakpoint: 1000,
            options: {
              xaxis: {
                tickAmount: 2,
              }
            }
          }]
        },
        series: [
          {
            name: 'Sell Price',
            data: [],
          },
        ],
      }, this.fetchMarketData);
    }
  }

  fetchMarketData = () => {
    const { id } = this.props;
    axios.get(`/api/subsystem/${id}`)
      .then(response => {
        let jitaSellData = [];
        let profitData = [];
        const marketData = response.data.marketData;
        const tradeVolume = response.data.tradeVolume;
        this.setState({ marketData: marketData });
        const subsystemCosts = response.data.subsystemCosts;
        this.setState({ subsystemCosts: subsystemCosts });
        for (let i = 0; i < marketData.length; i++) {
          if (i >= marketData.length - 7) {
            jitaSellData.push({ date: marketData[i].date, price: (marketData[i].average_price / 1000000).toFixed(2) });
            profitData.push({ date: marketData[i].date, price: ((marketData[i].average_price - subsystemCosts[i].totalCost) / 1000000).toFixed(2) });
          }
        }
        const recentLosses = response.data.recentLossData;
        const categories = marketData.map((item) => {
          let date = new Date(Number(item.date));
          let dd = date.getDate();
          let mm = date.getMonth() + 1;
          let yy = date.getFullYear();
          return `${dd}/${mm}/${yy}`;
        }); // Assuming each data point has a 'date' field
        const data = marketData.map((item) => {
          return (item.average_price / 1000000).toFixed(2);
        }); // Assuming each data point has a 'value' field

        // QUICK FIX BUT NEEDS LOOKING INTO LATER
        const mktDataLength = marketData.length;
        //if subsystemCosts.length is greater than mktdatalength, then remove the last few elements of subsystemCosts

        if (subsystemCosts.length > mktDataLength) {
          const diff = subsystemCosts.length - mktDataLength;
          subsystemCosts.splice(mktDataLength, diff);
        }

        const costData = subsystemCosts.map((item) => {
          return (item.totalCost / 1000000).toFixed(2);
        });

        const pieChartData = response.data.pieChartData;
        const valuesArray = Object.values(pieChartData).map(item => item.value);
        const namesArray = Object.values(pieChartData).map(item => item.name);

        const colors = [];
        const fillColors = [];
        for (const key in pieChartData) {
          const currentSub = window.location.pathname.split('/')[2];
          const currentSubColor = "#e74535";
          const otherSubColor = "#3ca1fc";
          if (pieChartData.hasOwnProperty(key)) {
            const value = pieChartData[key].value;
            if (key === currentSub) {
              colors.push(currentSubColor);
              fillColors.push(currentSubColor);
            } else {
              colors.push(otherSubColor);
              fillColors.push(otherSubColor);
            }
          }
        }

        // Recent Losses
        let recentLossesBigNum = 0;
        let recentLossesCompareNum = 0;
        const recentLossesSeriesData = [];
        const recentLossesDays = [];
        for (let i = 0; i < recentLosses.length; i++) {
          if (i > 7) {
            recentLossesSeriesData.push(recentLosses[i].losses);
            recentLossesDays.push(recentLosses[i].day);
            recentLossesBigNum += recentLosses[i].losses;
          } else {
            recentLossesCompareNum += recentLosses[i].losses;
          }
        }
        this.setState({
          recentLossesBigNum: recentLossesBigNum,
        })
        this.setState({
          recentLossesPercentage: ((recentLossesBigNum - recentLossesCompareNum) / recentLossesCompareNum * 100).toFixed(2),
        })
        this.setState({
          recentLossesSeries: [
            {
              name: 'Losses',
              data: recentLossesSeriesData,
            },
          ],
          recentLossesOptions: {
            ...this.state.recentLossesOptions,
            chart: {
              background: this.state.darkMode ? 'rgb(55, 64, 74)' : 'white',
              toolbar: {
                show: false,
              },
            },
            xaxis: {
              categories: recentLossesDays,
              labels: {
                show: false,
              },
              lines: {
                show: false,
              },
              axisBorder: {
                show: false,
              },
              axisTicks: {
                show: false,
              }
            },
            stroke: {
              curve: 'smooth',
              width: 2,
            },
            tooltip: {
              enabled: true,
              x: {
                show: false,
              }
            },
            theme: {
              mode: this.props.darkMode ? 'dark' : 'light',
            }
          },
        })

        // Jita Sell
        const jitaSellBigNum = jitaSellData[jitaSellData.length - 1].price;
        const jitaSellSeriesData = [];
        const jitaSellDays = [];
        for (let i = 0; i < jitaSellData.length; i++) {
          jitaSellSeriesData.push(jitaSellData[i].price);
          const date = new Date(Number(jitaSellData[i].date));
          const dd = date.getDate();
          const mm = date.getMonth() + 1;
          const yy = date.getFullYear();
          const formattedDate = `${dd}/${mm}/${yy}`;
          jitaSellDays.push(formattedDate);
        }
        const jitaSellCompareNum = jitaSellData[0].price;
        const jitaSellPercentage = ((jitaSellBigNum - jitaSellCompareNum) / jitaSellCompareNum * 100).toFixed(2);
        this.setState({
          jitaSellBigNum: jitaSellBigNum,
          jitaSellPercentage: jitaSellPercentage,
          jitaSellSeries: [
            {
              name: 'Jita Sell',
              data: jitaSellSeriesData,
            },
          ],
          jitaSellOptions: {
            ...this.state.jitaSellOptions,
            xaxis: {
              categories: jitaSellDays,
              labels: {
                show: false,
              },
              lines: {
                show: false,
              },
              axisBorder: {
                show: false,
              },
              axisTicks: {
                show: false,
              }
            },
            stroke: {
              curve: 'smooth',
              width: 2,
            },
            tooltip: {
              enabled: true,
              x: {
                show: false,
              }
            },
          },
        })

        // Trade Volume Refactor
        const getAverageVolume = (data) => data.reduce((sum, item) => sum + item.volume, 0) / data.length;

        // Extract last 7 and 14 days data
        const last14DaysData = tradeVolume.slice(-14);
        const last7DaysData = tradeVolume.slice(-7);

        // Calculate volumes and averages
        const thisWeekSellVolumeAverage = getAverageVolume(last7DaysData);
        const lastWeekSellVolumeAverage = getAverageVolume(last14DaysData.slice(0, 7));
        const sellVolumePercentage = ((thisWeekSellVolumeAverage - lastWeekSellVolumeAverage) / lastWeekSellVolumeAverage * 100).toFixed(2);
        const sellVolumeBigNum = last7DaysData.reduce((sum, item) => sum + item.volume, 0);

        // Prepare data for series and x-axis
        const sellVolumeData = last7DaysData.map(item => ({ date: item.date, volume: item.volume }));
        const formattedCategories = sellVolumeData.map(item => {
          const date = new Date(item.date);
          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        });

        this.setState({
          sellVolumeBigNum,
          sellVolumePercentage,
          sellVolumeSeries: [
            {
              name: 'Trade Volume',
              data: sellVolumeData.map(item => item.volume),
            },
          ],
          sellVolumeOptions: {
            ...this.state.sellVolumeOptions,
            xaxis: {
              categories: formattedCategories,
              labels: { show: false },
              lines: { show: false },
              axisBorder: { show: false },
              axisTicks: { show: false }
            },
            stroke: {
              curve: 'smooth',
              width: 2,
            },
            tooltip: {
              enabled: true,
              x: { show: false }
            },
          },
        });

        // Profit
        let profitBigNum = profitData[profitData.length - 1].price;
        let profitCompareNum = profitData[0].price;
        let profitPercentage = ((profitBigNum - profitCompareNum) / profitCompareNum * 100).toFixed(2);
        this.setState({
          profitBigNum: profitBigNum,
          profitPercentage: profitPercentage,
          profitSeries: [
            {
              name: 'Profit',
              data: profitData.map(item => item.price),
            },
          ],
          profitOptions: {
            ...this.state.profitOptions,
            xaxis: {
              categories: profitData.map(item => {
                let date = new Date(Number(item.date));
                let dd = date.getDate();
                let mm = date.getMonth() + 1;
                let yy = date.getFullYear();
                return `${dd}/${mm}/${yy}`;
              }),
              labels: {
                show: false,
              },
              lines: {
                show: false,
              },
              axisBorder: {
                show: false,
              },
              axisTicks: {
                show: false,
              }
            },
            stroke: {
              curve: 'smooth',
              width: 2,
            },
            tooltip: {
              enabled: true,
              x: {
                show: false,
              }
            },
          },
        })

        this.setState({
          loading: false,
          options: {
            ...this.state.options,
            xaxis: {
              tickAmount: 5,
              categories: categories,
              labels: {
                rotate: 0,
              },
            },
          },
          series: [
            {
              name: 'Sell Price',
              data: data,
            },
            {
              name: 'Cost of Materials',
              data: costData,
            },
          ],
          responsive: [{
            breakpoint: 1000,
            options: {
              xaxis: {
                tickAmount: 1,
              }
            }
          }]
        });

        this.setState({
          pieOptions: {
            ...this.state.pieOptions,
            colors: colors,
            labels: namesArray,
          },
        })

        this.setState({
          pieSeries: valuesArray,
        });

      })
      .catch(error => {
        console.error('Error fetching market data:', error);
        this.setState({ loading: false });
      });
  }

  handleClick = (days) => {
    const { marketData, subsystemCosts } = this.state;
    const newMarketData = marketData.filter((item, index) => {
      return index >= marketData.length - days;
    });
    const categories = newMarketData.map((item) => {
      let date = new Date(Number(item.date));
      let dd = date.getDate();
      let mm = date.getMonth() + 1;
      let yy = date.getFullYear();
      return `${dd}/${mm}/${yy}`;
    }); // Assuming each data point has a 'date' field
    const data = newMarketData.map((item) => {
      return (item.average_price / 1000000).toFixed(2);
    }); // Assuming each data point has a 'value' field
    const newCostData = subsystemCosts.filter((item, index) => {
      return index >= subsystemCosts.length - days;
    });
    const costData = newCostData.map((item) => {
      return (item.totalCost / 1000000).toFixed(2);
    });

    this.setState({
      options: {
        ...this.state.options,
        xaxis: {
          tickAmount: 5,
          categories: categories,
          labels: {
            rotate: 0,
          },
        },
      },
      series: [
        {
          name: 'Sell Price',
          data: data,
        },
        {
          name: 'Cost of Materials',
          data: costData,
        },
      ],
    });
  }

  render() {
    const { darkMode, pieOptions, pieSeries, loading, options, series, recentLossesOptions, recentLossesSeries, recentLossesBigNum, recentLossesPercentage, jitaSellBigNum, jitaSellPercentage, jitaSellOptions, jitaSellSeries, sellVolumeBigNum, sellVolumePercentage, sellVolumeOptions, sellVolumeSeries, profitBigNum, profitPercentage, profitOptions, profitSeries } = this.state;
    const darkModeClass = "bg-dark text-white";
    console.log(options);
    return (
      <div>
        <div className={darkMode ? "row " + darkModeClass : "row"} id="micro_cards">
          <MicroCard darkMode={darkMode} cardTitle={"Sell"} options={jitaSellOptions} series={jitaSellSeries} loading={loading} bigNum={jitaSellBigNum} percentage={jitaSellPercentage} />
          <MicroCard darkMode={darkMode} cardTitle={"Losses"} options={recentLossesOptions} series={recentLossesSeries} loading={loading} bigNum={recentLossesBigNum} percentage={recentLossesPercentage} />
          <MicroCard darkMode={darkMode} cardTitle={"Trade Volume"} options={sellVolumeOptions} series={sellVolumeSeries} loading={loading} bigNum={sellVolumeBigNum} percentage={sellVolumePercentage} />
          <MicroCard darkMode={darkMode} cardTitle={"Profit"} options={profitOptions} series={profitSeries} loading={loading} bigNum={profitBigNum} percentage={profitPercentage} />
        </div>
        <div className={darkMode ? "row " + darkModeClass : "row"}>
          <div className="col-lg-5">
            <div className={darkMode ? "card " + darkModeClass : "card"}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="header-title">Losses</h4>
                <div className="dropdown">
                  <a href="#" className="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="mdi mdi-dots-vertical"></i>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a className="dropdown-item">Today</a>
                    <a className="dropdown-item">Yesterday</a>
                    <a className="dropdown-item">Last Week</a>
                    <a className="dropdown-item">Last Month</a>
                  </div>
                </div>
              </div>
              <div className="card-body pt-0"
                id="pieChart"
              >
                {loading ? (
                  <SkeletonTheme borderRadius={'50%'} baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                    <Skeleton count={1}
                      height={376}
                      width={376}
                    />
                  </SkeletonTheme>
                ) : (
                  <Chart options={pieOptions} series={pieSeries} type="donut"
                    height={386}
                    width={386}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className={darkMode ? "card " + darkModeClass : "card"}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="header-title">Market</h4>
                <div>
                  <Button variant="dark" className="me-2" onClick={() => this.handleClick(30)}>
                    1M
                  </Button>
                  <Button variant="dark" className="me-2" onClick={() => this.handleClick(90)}>
                    3M
                  </Button>
                  <Button variant="dark" className="me-2" onClick={() => this.handleClick(360)}>
                    1Y
                  </Button>
                </div>
              </div>
              <div className="card-body pt-0">
                {loading ? (
                  <SkeletonTheme baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                    <Skeleton count={7} height={350 / 7} />
                  </SkeletonTheme>
                ) : (
                  <Chart
                    options={options}
                    series={series}
                    type="line"
                    height={350}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MarketData;
