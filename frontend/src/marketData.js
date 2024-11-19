import React, { Component } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Button from 'react-bootstrap/Button';
import MicroCard from './micro_card';
import { mode } from 'crypto-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import namesAndIds from './namesAndIds.js';

class MarketData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      id: this.props.id,
      name: namesAndIds.find(x => x.id == this.props.id).name,

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
          background: this.props.darkMode ? '#1d1d1f' : 'white',
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
          background: this.props.darkMode ? '#1d1d1f' : 'white',
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
          colors: this.props.darkMode ? ['#1d1d1f'] : ['white'],
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

      lossesData: [],

      // Recent Losses (Micro Card)
      recentLossesOptions: {
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
          background: this.props.darkMode ? '#1d1d1f' : 'white',
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
          height: 90,
          width: "90%",
          toolbar: {
            show: false,
          },
          background: this.props.darkMode ? '#1d1d1f' : 'white',
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
          height: 90,
          width: "90%",
          toolbar: {
            show: false,
          },
          background: this.props.darkMode ? '#1d1d1f' : 'white',
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
          height: 90,
          width: "90%",
          toolbar: {
            show: false,
          },
          background: this.props.darkMode ? '#1d1d1f' : 'white',
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

      //floop

      // const currentSubColor = this.state.darkMode ? "#b6db63" : "#03e496";
      // const otherSubColor = this.state.darkMode ? "#46ada8" : "#038ffb";

      const currentColors = this.state.pieOptions.colors

      console.log(currentColors)

      const newColors = currentColors.map(color => {
        if (color == "#b6db63" || color == "#03e496") {
          return darkMode ? "#b6db63" : "#03e496";
        } else {
          return darkMode ? "#46ada8" : "#038ffb";
        }
      });

      

      this.setState({
        darkMode: this.props.darkMode,
        pieOptions: {
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
          chart: {
            type: 'pie',
            background: this.props.darkMode ? '#1d1d1f' : 'white',
          },
          stroke: {
            colors: this.props.darkMode ? ['#1d1d1f'] : ['white'],
            width: 2.5,
          },
          colors: newColors,
        },
        options: {
          chart: {
            type: 'line',
            height: 350,
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? '#1d1d1f' : 'white',
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
            height: 90,
            width: "90%",
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? '#1d1d1f' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          }
        },
        jitaSellOptions: {
          chart: {
            type: 'line',
            height: 90,
            width: "90%",
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? '#1d1d1f' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
        },
        sellVolumeOptions: {
          chart: {
            type: 'line',
            height: 90,
            width: "90%",
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? '#1d1d1f' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
        },
        profitOptions: {
          chart: {
            type: 'line',
            height: 90,
            width: "90%",
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? '#1d1d1f' : 'white',
          },
          theme: {
            mode: this.props.darkMode ? 'dark' : 'light',
          },
        },
      })
    }
    if (this.props.id !== prevProps.id) {
      this.setState({
        id: this.props.id,
        loading: true,
        marketData: [],
        options: {
          chart: {
            type: 'line',
            height: 350,
            toolbar: {
              show: false,
            },
            background: this.props.darkMode ? '#1d1d1f' : 'white',
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
              text: 'ISK',
            },
          }],
          tooltip: {
            shared: true,
            intersect: false,
          },
          theme: {
            mode: this.state.darkMode ? 'dark' : 'light',
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
      }, this.fetchMarketData);
    }
  }

  fetchMarketData = () => {
    const { id } = this.props;
    axios.get(`/api/subsystem/${id}`)
      .then(response => {
        const lossesDataArray = [];

        for(let i = 0; i < Object.values(response.data.pieChartData).length; i++) {
          lossesDataArray.push({
            name: Object.values(response.data.pieChartData)[i].name,
            value: Object.values(response.data.pieChartData)[i].value,
          });
        }

        this.setState({
          lossesData: lossesDataArray
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

  toggleOptionsPieChart = (opt1, opt2, opt3) => {
    this.setState({
      showOptionsDialog: !this.state.showOptionsDialog,
      optionsDialogData: {
        opt1,
        opt2,
        opt3
      }
    });
  }

  filterPieChart = (option) => {
    const { pieOptions, lossesData, id, name, darkMode } = this.state;

    if(option == "all") {
      this.setState({
        pieSeries: lossesData.map(item => item.value),
        pieOptions: {
          ...pieOptions,
          colors: lossesData.map(item => {
            if(item.name == name ) {
              if(darkMode) {
                return "#b6db63";
              } else {
                return "#03e496";
              }
            } else {
              if(darkMode) {
                return "#46ada8";
              } else {
                return "#038ffb";
              }
            }
          }),
          labels: lossesData.map(item => item.name)
        },
        showOptionsDialog: false
      });
      return;
    }
  
    // Filter the lossesData array based on the option
    const filteredData = lossesData.filter(item => item.name.includes(option));
  
    // Extract the series (numeric values) and labels from the filtered data
    const filteredSeries = filteredData.map(item => item.value); // Assuming `value` is the numeric property
    const filteredLabels = filteredData.map(item => item.name);

    const colors = [];

    for(let i = 0; i < filteredLabels.length; i++) {
      if(filteredLabels[i] == name){
        if(darkMode) {
          colors.push("#b6db63");
        } else {
          colors.push("#03e496");
        }
      } else {
        if(darkMode) {
          colors.push("#46ada8");
        } else {
          colors.push("#038ffb");
        }
      }
    }


  
    // Update the state
    this.setState({
      pieSeries: filteredSeries, // Update with the numeric series
      pieOptions: {
        ...pieOptions,
        colors: colors,
        labels: filteredLabels // Update the labels
      },
      showOptionsDialog: false // Close the options dialog
    });
  };
  

  render() {
    const { id, darkMode, pieOptions, pieSeries, loading, options, series, recentLossesOptions, recentLossesSeries, recentLossesBigNum, recentLossesPercentage, jitaSellBigNum, jitaSellPercentage, jitaSellOptions, jitaSellSeries, sellVolumeBigNum, sellVolumePercentage, sellVolumeOptions, sellVolumeSeries, profitBigNum, profitPercentage, profitOptions, profitSeries } = this.state;
    const darkModeClass = "bg-dark text-white";

    const name = namesAndIds.find(x => x.id == id).name;

    //get the first word in name
    const firstWord = name.split(' ')[0];
    const secondWord = name.split(' ')[1];
    const bothWords = firstWord + " " + secondWord;


    //split the 

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
                <div>
                  <Button variant={darkMode ? "dark" : "dark"} onClick={() => this.toggleOptionsPieChart(firstWord, secondWord, bothWords)}>
                    <FontAwesomeIcon icon={faEllipsis} />
                  </Button>
                </div>
                {this.state.showOptionsDialog && (
                  <div className={darkMode ? "options-dialog" : "options-dialog-light"}>
                    <div className="options-dialog-content">
                      <ul>
                        <li onClick={() => this.filterPieChart(this.state.optionsDialogData.opt1)}><Button variant={darkMode ? "dark" : "light"} className="me-2">{this.state.optionsDialogData.opt1}</Button></li>
                        <li onClick={() => this.filterPieChart(this.state.optionsDialogData.opt2)}><Button variant={darkMode ? "dark" : "light"} className="me-2">{this.state.optionsDialogData.opt2}</Button></li>
                        <li onClick={() => this.filterPieChart(this.state.optionsDialogData.opt3)}><Button variant={darkMode ? "dark" : "light"} className="me-2">{this.state.optionsDialogData.opt3}</Button></li>
                        <li onClick={() => this.filterPieChart("all")}><Button variant={darkMode ? "dark" : "light"} className="me-2">All</Button></li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-body pt-0"
                id="pieChart"
              >
                {loading ? (
                  <SkeletonTheme borderRadius={'50%'} baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                    <Skeleton count={1}
                      height={300}
                      width={300}
                    />
                  </SkeletonTheme>
                ) : (
                  <Chart options={pieOptions} series={pieSeries} type="donut"
                    height={350}
                    width={350}
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
                  <Button variant={darkMode ? "dark" : "dark"} className="me-2" onClick={() => this.handleClick(30)}>
                    1m
                  </Button>
                  <Button variant={darkMode ? "dark" : "dark"} className="me-2" onClick={() => this.handleClick(90)}>
                    3m
                  </Button>
                  <Button variant={darkMode ? "dark" : "dark"} className="me-2" id="oneyearmktbtn" onClick={() => this.handleClick(360)}>
                    1y
                  </Button>
                </div>
              </div>
              <div className="card-body pt-0">
                {loading ? (
                  <SkeletonTheme baseColor={darkMode ? '#313131' : '#ebebeb'} highlightColor={darkMode ? '#313131' : '#f5f5f5'}>
                    <Skeleton count={7} height={309 / 7} />
                  </SkeletonTheme>
                ) : (
                  <Chart
                    options={options}
                    series={series}
                    type="line"
                    height={309}
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
