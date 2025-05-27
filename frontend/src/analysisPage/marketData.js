import React, { Component } from 'react';
import axios from 'axios';
import { Text, Table, Flex, IconButton, Card, HoverCard, Link, Heading, Select } from "@radix-ui/themes";
import Cookies from 'js-cookie';
import namesAndIds from '../namesAndIds';
import {
  InfoCircledIcon,
  DoubleArrowDownIcon,
  DoubleArrowUpIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import MarketDataTable from './marketDataTable';
import GraphCard from './graphCard';

class MarketData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buyVolume: null,
      sellVolume: null,
      maxBuy: null,
      minSell: null,
      profit: null,
      materialsCost: null,
      tradeVolume: null,
      lossesLastTwentyFourHours: null,
      tableArr: [],
      isLoading: true,
      settings: {},
      name: this.props.name,
      colorBlindMode: this.props.colorBlindMode,
    };

    this.renderIconButton = this.renderIconButton.bind(this);
    // this.renderChart = this.renderChart.bind(this);
    this.handleIconClick = this.handleIconClick.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.getLocationName = this.getLocationName.bind(this);
  }

  componentDidMount() {
    const { id } = this.props;
    const buildSettings = Cookies.get('buildSettings')
    const parsed = buildSettings ? JSON.parse(buildSettings) : {};
    const settings = {
      numSlots: parsed?.numSlots || '8',
      refinery: parsed?.refinery || 'Tatara',
      refineryTeRig: parsed?.refineryTeRig || 'None',
      refineryMeRig: parsed?.refineryMeRig || 'None',
      refinerySystem: parsed?.refinerySystem || 'wormhole',
      complex: parsed?.complex || 'Azbel',
      complexLargeRig: parsed?.complexLargeRig || 'T1',
      complexTeRig: parsed?.complexTeRig || 'None',
      complexMeRig: parsed?.complexMeRig || 'None',
      complexSystem: parsed?.complexSystem || 'wormhole',
      tataraRig: parsed?.tataraRig || 'T1',
      componentMaterialEfficiency: parsed?.componentMaterialEfficiency || 10,
      componentTimeEfficiency: parsed?.componentTimeEfficiency || 20,
      ancientRelic: parsed?.ancientRelic || 'Intact',
      decryptor: parsed?.decryptor || 'Optimized Attainment Decryptor',
      coreVolume: parsed?.coreVolume || 0,
      defensiveVolume: parsed?.defensiveVolume || 0,
      offensiveVolume: parsed?.offensiveVolume || 0,
      propulsionVolume: parsed?.propulsionVolume || 0,
      skillLevel: parsed?.skillLevel || 4,
      implant: parsed?.implant || '4%',
      buildCostIndex: parsed?.buildCostIndex || '0.14',
      reactionCostIndex: parsed?.reactionCostIndex || '0.14',
      reactionFacilityTax: parsed?.reactionFacilityTax || 0.25,
      complexFacilityTax: parsed?.complexFacilityTax || 0.25,
      system: parsed?.system || 'wormhole',
      materialsLocation: parsed?.materialsLocation || '10000002',
      materialsOrderType: parsed?.materialsOrderType || "buy",
      subsystemsLocation: parsed?.subsystemsLocation || '10000002',
      subsystemsOrderType: parsed?.subsystemsOrderType || "sell"
    };

    this.setState({ settings });

    const subsystemName = namesAndIds.find(
      (obj) => Number(obj.id) === Number(id)
    ).name;
    settings.name = subsystemName;
    settings.id = id;

    let type = "";
    if (subsystemName.includes("Core")) {
      type = "core";
    } else if (subsystemName.includes("Defensive")) {
      type = "defensive";
    } else if (subsystemName.includes("Propulsion")) {
      type = "propulsion";
    } else if (subsystemName.includes("Offensive")) {
      type = "offensive";
    }

    if (type === "core") {
      settings.coreVolume = 1;
    } else if (type === "defensive") {
      settings.defensiveVolume = 1;
    } else if (type === "offensive") {
      settings.offensiveVolume = 1;
    } else if (type === "propulsion") {
      settings.propulsionVolume = 1;
    }

    axios
      .post(`/api/subsystem/${id}`, settings)
      .then((response) => {
        const data = response.data;
        const convertDates = (arr) => arr.map((d) => String(d));

        this.setState({
          buyVolume: {
            name: data.buyVolume.title,
            value: data.buyVolume.currentValue,
            dates: convertDates(data.buyVolume.dates),
            dataValues: data.buyVolume.dataValues,
            percentageChange: data.buyVolume.thirtyDayMedianDelta,
            addToGraph: false,
          },
          sellVolume: {
            name: data.sellVolume.title,
            value: data.sellVolume.currentValue,
            dates: convertDates(data.sellVolume.dates),
            dataValues: data.sellVolume.dataValues,
            percentageChange: data.sellVolume.thirtyDayMedianDelta,
            addToGraph: false,
          },
          maxBuy: {
            name: data.maxBuy.title,
            value: data.maxBuy.currentValue,
            dates: convertDates(data.maxBuy.dates),
            dataValues: data.maxBuy.dataValues,
            percentageChange: data.maxBuy.thirtyDayMedianDelta,
            addToGraph: false,
          },
          minSell: {
            name: data.minSell.title,
            value: data.minSell.currentValue,
            dates: convertDates(data.minSell.dates),
            dataValues: data.minSell.dataValues,
            percentageChange: data.minSell.thirtyDayMedianDelta,
            addToGraph: false,
          },
          profit: {
            name: data.profit.title,
            value: data.profit.currentValue,
            dates: convertDates(data.profit.dates),
            dataValues: data.profit.dataValues,
            percentageChange: data.profit.thirtyDayMedianDelta,
            addToGraph: false,
            info: `Buying materials from ${settings.materialsOrderType} orders in ${this.getLocationName(settings.materialsLocation)} and selling subsystems to ${settings.subsystemsOrderType} orders in ${this.getLocationName(settings.subsystemsLocation)}.`,
          },
          materialsCost: {
            name: data.matCosts.title,
            value: data.matCosts.currentValue,
            dates: convertDates(data.matCosts.dates),
            dataValues: data.matCosts.dataValues,
            percentageChange: data.matCosts.thirtyDayMedianDelta,
            addToGraph: false,
            info: `Buying materials from ${settings.materialsOrderType} orders in ${this.getLocationName(settings.materialsLocation)} and selling subsystems to ${settings.subsystemsOrderType} orders in ${this.getLocationName(settings.subsystemsLocation)}.`,
          },
          tradeVolume: {
            name: data.tradeVolume.title,
            value: data.tradeVolume.currentValue,
            dates: convertDates(data.tradeVolume.dates),
            dataValues: data.tradeVolume.dataValues,
            percentageChange: data.tradeVolume.thirtyDayMedianDelta,
            addToGraph: false,
          },
          lossesLastTwentyFourHours: {
            name: data.lossesData.title,
            value: data.lossesData.currentValue,
            dates: convertDates(data.lossesData.dates),
            dataValues: data.lossesData.dataValues,
            percentageChange: data.lossesData.thirtyDayMedianDelta,
            addToGraph: false,
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching market data:", error);
      })
      .finally(() => {
        const arr = [];
        arr.push(this.state.minSell);
        arr.push(this.state.maxBuy);
        arr.push(this.state.materialsCost);
        arr.push(this.state.profit);
        arr.push(this.state.buyVolume);
        arr.push(this.state.sellVolume);
        arr.push(this.state.tradeVolume);
        arr.push(this.state.lossesLastTwentyFourHours);

        this.setState({
          tableArr: arr,
          isLoading: false,
        });
      });
  }

  getLocationName(location) {
    // Jita, Amarr, Rens, Hek, Dodixie
    //takes a region id and returns the name of the region
    if (location === "10000002") {
      return "Jita";
    } else if (location === "10000043") {
      return "Amarr";
    } else if (location === "10000030") {
      return "Rens";
    } else if (location === "10000042") {
      return "Hek";
    } else if (location === "10000032") {
      return "Dodixie";
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.name !== prevProps.name) {
      this.componentDidMount();
    }
    if (this.props.colorBlindMode !== prevProps.colorBlindMode) {
      this.setState({
        colorBlindMode: this.props.colorBlindMode
      });
    }
    if (this.props.backlight !== prevProps.backlight) {
      this.setState({
        backlight: this.props.backlight
      });
    }
    if (this.props.materialsLocation !== prevProps.materialsLocation) {
      this.setState({
        materialsLocation: this.props.materialsLocation
      });
    }
    if (this.props.materialsOrderType !== prevProps.materialsOrderType) {
      this.setState({
        materialsOrderType: this.props.materialsOrderType
      });
    }
    if (this.props.subsystemsLocation !== prevProps.subsystemsLocation) {
      this.setState({
        subsystemsLocation: this.props.subsystemsLocation
      });
    }
    if (this.props.subsystemsOrderType !== prevProps.subsystemsOrderType) {
      this.setState({
        subsystemsOrderType: this.props.subsystemsOrderType
      });
    }
  }

  handleIconClick(index) {
    this.setState((prevState) => {
      const updatedTableArr = prevState.tableArr.map((item, i) => {
        if (!item) return item;
        if (i === index) {
          return {
            ...item,
            addToGraph: !item.addToGraph,
          };
        }
        return item;
      });
      return { tableArr: updatedTableArr };
    });
  }

  renderIconButton(item, index) {
    const { addToGraph } = item;
    const variant = addToGraph ? "classic" : "outline";
    const Icon = addToGraph ? Cross2Icon : CheckIcon;

    return (
      <IconButton
        style={{ width: "100%" }}
        variant={variant}
        onClick={() => this.handleIconClick(index)}
      >
        <Icon />
      </IconButton>
    );
  }

  getClassName(value, colorBlindMode) {
    if (value >= 0 && !colorBlindMode) return "success";
    if (value < 0 && !colorBlindMode) return "danger";
    if (value >= 0 && colorBlindMode) return "success colorBlind";
    if (value < 0 && colorBlindMode) return "danger colorBlind";
  }

  render() {
    let { tableArr, colorBlindMode, name, isLoading } = this.state;
    const {
      materialsLocation, 
      setMaterialsLocation, 
      materialsOrderType,
      setMaterialsOrderType,
      subsystemsLocation, 
      setSubsystemsLocation,
      subsystemsOrderType,
      setSubsystemsOrderType
    } = this.props;

    return (
      <Flex id="detailed_analysis_page_main_container" direction="row" gap="4"
        // style={{ width: "100%", height: "472px" }}
      >
        <MarketDataTable 
          isLoading={isLoading}
          renderIconButton={this.renderIconButton} 
          tableArr={tableArr} 
          colorBlindMode={colorBlindMode} 
          getClassName={this.getClassName}
        />
        <GraphCard 
          name={name} 
          isLoading={isLoading}
          chartData={tableArr}

          materialsLocation={materialsLocation} 
          setMaterialsLocation={setMaterialsLocation} 
          materialsOrderType={materialsOrderType}
          setMaterialsOrderType={setMaterialsOrderType}

          subsystemsLocation={subsystemsLocation}
          setSubsystemsLocation={setSubsystemsLocation}
          subsystemsOrderType={subsystemsOrderType}
          setSubsystemsOrderType={setSubsystemsOrderType}
        />
      </Flex>
    );
  }
}

export default MarketData;