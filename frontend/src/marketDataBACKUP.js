import React, { Component } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import MicroCard from './micro_card';
import namesAndIds from './namesAndIds.js';
import { Section, Flex, Link, Heading, Text, IconButton, Container, Card, Box, Button, DropdownMenu } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons"

class MarketData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      graphDays: 360,
      optionsDialogData: {},
      id: this.props.id,
      name: namesAndIds.find(x => x.id == this.props.id).name,
      description: null,
      darkMode: this.props.darkMode,
      // Market Data
      marketData: [],
      subsystemCosts: [],
      options: {
        chart: {
          type: 'line',
          // height: 350,
          // width: '100%',
          toolbar: {
            show: false,
          },
          background: 'transparent',
        },
        xaxis: {
          categories: [],
          tickAmount: 5,
        },
        yaxis: [{
          title: {
            text: 'ISK'
          }
        }],
        tooltip: {
          shared: true,
          intersect: false,
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
          background: 'transparent',
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
          colors: ['transparent'],
          width: 0,
        },

      },
      pieSeries: [],
      lossesData: [],
      // Recent Losses (Micro Card)
      recentLossesSeries: [
        {
          name: 'Losses',
          data: [],
        },
      ],
      recentLossesBigNum: null,
      recentLossesPercentage: null,
      // Jita Sell (Micro Card)
      microCardOptions: {
        grid: {
          show: false,
        },
        chart: {
          type: 'line',
          height: 90,
          width: "90%",
          toolbar: {
            show: false,
          },
          background: 'transparent',
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
      sellVolumeSeries: [
        {
          name: 'Trade Volume',
          data: [],
        },
      ],
      sellVolumeBigNum: null,
      sellVolumePercentage: null,
      // Profit (Micro Card)
      profitSeries: [
        {
          name: 'Profit',
          data: [],
        },
      ],
      profitBigNum: null,
      profitPercentage: null,
    }
  }

  componentDidMount() {
    this.fetchMarketData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.fetchMarketData();
    }
  }

  fetchMarketData = () => {
    const { id } = this.props;
    axios.get(`/api/subsystem/${id}`)
      .then(response => {
        this.setState({
          lossesData: () => {
            for (let i = 0; i < Object.values(response.data.pieChartData).length; i++) {
              const lossesDataArray = [];
              lossesDataArray.push({
                name: Object.values(response.data.pieChartData)[i].name,
                value: Object.values(response.data.pieChartData)[i].value,
              });
              return lossesDataArray;
            }
          }
        });
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
          const currentSub = this.state.id;
          // const currentSubColor = "#e74535";
          const currentSubColor = this.state.darkMode ? "#b6db63" : "#03e496";
          const otherSubColor = this.state.darkMode ? "#46ada8" : "#038ffb";

          // const otherSubColor = "#3ca1fc";
          if (pieChartData.hasOwnProperty(key)) {
            const value = pieChartData[key].value;
            if (Number(key) === currentSub) {
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
              background: this.state.darkMode ? '#1d1d1f' : 'white',
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
          microCardOptions: {
            ...this.state.microCardOptions,
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

    const url = `https://esi.evetech.net/latest/universe/types/${id}`;

    axios.get(url)
      .then(response => {
        this.setState({ description: response.data.description });
      })
      .catch(err => {
        console.log(err);
      })
  }

  handleClick = (days) => {
    const { marketData, subsystemCosts, graphDays } = this.state;
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
      graphDays: days,
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

  toggleOptionsPieChart = (opt1, opt2, opt3) => {
    this.setState({
      optionsDialogData: {
        opt1,
        opt2,
        opt3
      }
    });
  }

  filterPieChart = (option) => {
    const { pieOptions, lossesData, id, name, darkMode } = this.state;

    if (option == "all") {
      this.setState({
        pieSeries: lossesData.map(item => item.value),
        pieOptions: {
          ...pieOptions,
          colors: lossesData.map(item => {
            if (item.name == name) {
              if (darkMode) {
                return "#b6db63";
              } else {
                return "#03e496";
              }
            } else {
              if (darkMode) {
                return "#46ada8";
              } else {
                return "#038ffb";
              }
            }
          }),
          labels: lossesData.map(item => item.name)
        },
      });
      return;
    }

    const filteredData = lossesData.filter(item => item.name.includes(option));
    const filteredSeries = filteredData.map(item => item.value);
    const filteredLabels = filteredData.map(item => item.name);

    const colors = [];

    for (let i = 0; i < filteredLabels.length; i++) {
      if (filteredLabels[i] == name) {
        if (darkMode) {
          colors.push("#b6db63");
        } else {
          colors.push("#03e496");
        }
      } else {
        if (darkMode) {
          colors.push("#46ada8");
        } else {
          colors.push("#038ffb");
        }
      }
    }

    this.setState({
      pieSeries: filteredSeries, // Update with the numeric series
      pieOptions: {
        ...pieOptions,
        colors: colors,
        labels: filteredLabels // Update the labels
      },
    });
  }

  render() {
    const { graphDays, loading, id, darkMode, pieOptions, pieSeries, options, series, recentLossesOptions, recentLossesSeries, recentLossesBigNum, recentLossesPercentage, jitaSellBigNum, jitaSellPercentage, microCardOptions, jitaSellSeries, sellVolumeBigNum, sellVolumePercentage, sellVolumeOptions, sellVolumeSeries, profitBigNum, profitPercentage, profitOptions, profitSeries } = this.state;
    const name = namesAndIds.find(x => x.id == id).name;
    const firstWord = name.split(' ')[0];
    const secondWord = name.split(' ')[1];
    const bothWords = firstWord + " " + secondWord;

    return (
      <Box width="100%">
        <Flex alignItems="center" justifyContent="space-between" className="mb-4" gap="4">
          <MicroCard darkMode={darkMode} cardTitle={"Sell"} options={microCardOptions} series={jitaSellSeries} loading={loading} bigNum={jitaSellBigNum} percentage={jitaSellPercentage} />
          <MicroCard darkMode={darkMode} cardTitle={"Losses"} options={microCardOptions} series={recentLossesSeries} loading={loading} bigNum={recentLossesBigNum} percentage={recentLossesPercentage} />
          <MicroCard darkMode={darkMode} cardTitle={"Trade Volume"} options={microCardOptions} series={sellVolumeSeries} loading={loading} bigNum={sellVolumeBigNum} percentage={sellVolumePercentage} />
          <MicroCard darkMode={darkMode} cardTitle={"Profit"} options={microCardOptions} series={profitSeries} loading={loading} bigNum={profitBigNum} percentage={profitPercentage} />
        </Flex>
        <Flex id="pieChartContainer" alignItems="center" justifyContent="space-between" className="mb-4" gap="4" width="100%" height="calc(100vw * 0.27)">
          <Card style={{ width: "41%"}}>
            <Flex alignItems="center" gap="4" style={{ width: "100%", justifyContent: "space-between" }} mt="1" mb="1" ml="1" mr="1">
              {loading ? (
                <SkeletonTheme baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                  <Skeleton count={1}
                    height={'1.25rem'}
                    width={'5rem'}
                  />
                </SkeletonTheme>
              ) : (
                <Heading>Losses</Heading>
              )}
              <Flex gap="2">
                {loading ? (
                  <SkeletonTheme baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                    <Skeleton count={1}
                      height={'2rem'}
                      width={'2rem'}
                    />
                  </SkeletonTheme>
                ) : (
                  <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="outline">
                      <DotsHorizontalIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => this.filterPieChart("all")}>All</DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => this.filterPieChart(firstWord)}>{firstWord}</DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => this.filterPieChart(secondWord)}>{secondWord}</DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => this.filterPieChart(bothWords)}>{bothWords}</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
                )}
              </Flex>
            </Flex>
            <Flex id="pieChart" height="100%" width="100%" align="center" justify="center">
              {loading ? (
                <SkeletonTheme borderRadius={'50%'} baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                  <Skeleton count={1}
                    height={300}
                    width={300}
                  />
                </SkeletonTheme>
              ) : (
                <Chart options={pieOptions} series={pieSeries} type="donut"/>
              )}
            </Flex>
          </Card>
          <Card style={{ width: "59%" }}>
            <Flex alignItems="center" gap="4" style={{ width: "100%", justifyContent: "space-between" }} mt="1" mb="1" ml="1" mr="1">
              {loading ? (
                <SkeletonTheme baseColor='#313131' highlightColor='#313131'>
                  <Skeleton count={1}
                    height={'1.25rem'}
                    width={'5rem'}
                  />
                </SkeletonTheme>
              ) : (
                <Heading>Market</Heading>
              )}
              {loading ? (
                <Flex gap="2">
                  <SkeletonTheme baseColor='#313131' highlightColor='#313131'>
                    <Skeleton count={1}
                      height={'2rem'}
                      width={'2rem'}
                    />
                    <Skeleton count={1}
                      height={'2rem'}
                      width={'2rem'}
                    />
                    <Skeleton count={1}
                      height={'2rem'}
                      width={'2rem'}
                    />
                  </SkeletonTheme>
                </Flex>
              ) : (
                <Flex gap="2">
                  <Button variant={graphDays == 30 ? "solid" : "outline"} onClick={() => this.handleClick(30)}>
                    1m
                  </Button>
                  <Button variant={graphDays == 90 ? "solid" : "outline"} onClick={() => this.handleClick(90)}>
                    3m
                  </Button>
                  <Button variant={graphDays == 360 ? "solid" : "outline"} onClick={() => this.handleClick(360)}>
                    1y
                  </Button>
                </Flex>
              )}
            </Flex>
            {loading ? (
              <SkeletonTheme baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                <Skeleton count={7} height={309 / 7} />
              </SkeletonTheme>
            ) : (
              <Chart
                options={options}
                series={series}
                type="line"
                height={"20px"}
              />
            )}
          </Card>
        </Flex>
      </Box>
    );
  }
}

export default MarketData;