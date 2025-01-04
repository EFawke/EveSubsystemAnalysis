import React, { Component } from 'react';
import axios from 'axios';
import { Text, Table, Flex, IconButton, Card, HoverCard, Box, Link, Heading, Select } from "@radix-ui/themes";
import Cookies from 'js-cookie';
import namesAndIds from './namesAndIds';
import {
  InfoCircledIcon,
  DoubleArrowDownIcon,
  DoubleArrowUpIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import InteractiveChart from './interactiveChart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

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

    // Bind methods
    this.renderIconButton = this.renderIconButton.bind(this);
    this.renderChart = this.renderChart.bind(this);
    this.handleIconClick = this.handleIconClick.bind(this);
    this.getClassName = this.getClassName.bind(this);
    this.getLocationName = this.getLocationName.bind(this);
  }

  componentDidMount() {
    const { id } = this.props;
    const settings = {
      numSlots: Cookies.get('numSlots') || '8',
      refinery: Cookies.get('refinery') || 'Tatara',
      refineryTeRig: Cookies.get('refineryTeRig') || 'None',
      refineryMeRig: Cookies.get('refineryMeRig') || 'None',
      refinerySystem: Cookies.get('refinerySystem') || 'wormhole',
      complex: Cookies.get('complex') || 'Azbel',
      complexLargeRig: Cookies.get('complexLargeRig') || 'T1',
      complexTeRig: Cookies.get('complexTeRig') || 'None',
      complexMeRig: Cookies.get('complexMeRig') || 'None',
      complexSystem: Cookies.get('complexSystem') || 'wormhole',
      tataraRig: Cookies.get('tataraRig') || 'T1',
      componentMaterialEfficiency: Cookies.get('componentMaterialEfficiency') || 10,
      componentTimeEfficiency: Cookies.get('componentTimeEfficiency') || 20,
      ancientRelic: Cookies.get('ancientRelic') || 'Intact',
      decryptor: Cookies.get('decryptor') || 'Optimized Attainment Decryptor',
      coreVolume: Cookies.get('coreVolume') || 0,
      defensiveVolume: Cookies.get('defensiveVolume') || 0,
      offensiveVolume: Cookies.get('offensiveVolume') || 0,
      propulsionVolume: Cookies.get('propulsionVolume') || 0,
      skillLevel: Cookies.get('skillLevel') || 4,
      implant: Cookies.get('implant') || '4%',
      buildCostIndex: Cookies.get('buildCostIndex') || '0.14',
      reactionCostIndex: Cookies.get('reactionCostIndex') || '0.14',
      reactionFacilityTax: Cookies.get('reactionFacilityTax') || 0.25,
      complexFacilityTax: Cookies.get('complexFacilityTax') || 0.25,
      system: Cookies.get('system') || 'wormhole',
      materialsLocation:
        Cookies.get('materialsLocation') != null
          ? Cookies.get('materialsLocation')
          : "10000002",
      materialsOrderType:
        Cookies.get('materialsOrderType') != null
          ? Cookies.get('materialsOrderType')
          : "buy",
      subsystemsLocation:
        Cookies.get('subsystemsLocation') != null
          ? Cookies.get('subsystemsLocation')
          : "10000002",
      subsystemsOrderType:
        Cookies.get('subsystemsOrderType') != null
          ? Cookies.get('subsystemsOrderType')
          : "sell",
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
            info: `Buying materials from ${this.props.materialsOrderType} orders in ${this.getLocationName(this.props.materialsLocation)} and selling subsystems to ${this.props.subsystemsOrderType} orders in ${this.getLocationName(this.props.subsystemsLocation)}.`,
          },
          materialsCost: {
            name: data.matCosts.title,
            value: data.matCosts.currentValue,
            dates: convertDates(data.matCosts.dates),
            dataValues: data.matCosts.dataValues,
            percentageChange: data.matCosts.thirtyDayMedianDelta,
            addToGraph: false,
            info: `Buying materials from ${this.props.materialsOrderType} orders in ${this.getLocationName(this.props.materialsLocation)} and selling subsystems to ${this.props.subsystemsOrderType} orders in ${this.getLocationName(this.props.subsystemsLocation)}.`,
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

  renderChart() {
    const { tableArr } = this.state;
    const chartData = tableArr.filter((row) => row && row.addToGraph);

    if (chartData.length === 0) {
      return (
        <Card height="100%" style={{ width: "100%", flex: "2" }}>
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Text>No data selected.</Text>
          </Flex>
        </Card>
      );
    }

    return (
      <Card height="100%" style={{ width: "100%", flex: "2" }}>
        <Flex justify="start" align="start" direction="column" style={{ height: "100%" }}>
          {/* <Flex direction="column" align="start"> */}
          <HoverCard.Root>
            <HoverCard.Trigger>
              <Table.Root>
                <Table.ColumnHeaderCell>
                  {/* {this.state.name} */}
                  <Text weight="bold" size="3">
                    {this.state.name}
                  </Text>
                </Table.ColumnHeaderCell>
              </Table.Root>
            </HoverCard.Trigger>
            <HoverCard.Content maxWidth="300px">
              <Flex gap="4" direction={"column"} justify={"start"}>
                <Heading size="3" weight="bold">Market Settings</Heading>
                <Flex gap="4" align="center" justify="start">
                  <Text size="2" style={{ color: "var(--accent-a11)" }}>Materials</Text>
                  <Select.Root defaultValue={this.props.materialsLocation} onValueChange={this.props.setMaterialsLocation}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Group>
                        <Select.Label size="2">Trade hub</Select.Label>
                        <Select.Item value="10000002">Jita</Select.Item>
                        <Select.Item value="10000043">Amarr</Select.Item>
                        <Select.Item value="10000030">Rens</Select.Item>
                        <Select.Item value="10000042">Hek</Select.Item>
                        <Select.Item value="10000032">Dodixie</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                  <Select.Root defaultValue={this.props.materialsOrderType} onValueChange={this.props.setMaterialsOrderType}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Group>
                        <Select.Label size="2">Order Type</Select.Label>
                        <Select.Item value="buy">Buy</Select.Item>
                        <Select.Item value="sell">Sell</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Flex>
                <Flex gap="4" align="center" justify="start">
                  <Text size="2" style={{ color: "var(--accent-a11)" }}>Subsystems</Text>
                  <Select.Root defaultValue={this.props.subsystemsLocation} onValueChange={this.props.setSubsystemsLocation}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Group>
                        <Select.Label size="2">Trade hub</Select.Label>
                        <Select.Item size="2" value="10000002">Jita</Select.Item>
                        <Select.Item size="2" value="10000043">Amarr</Select.Item>
                        <Select.Item size="2" value="10000030">Rens</Select.Item>
                        <Select.Item size="2" value="10000042">Hek</Select.Item>
                        <Select.Item size="2" value="10000032">Dodixie</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                  <Select.Root defaultValue={this.props.subsystemsOrderType} onValueChange={this.props.setSubsystemsOrderType}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Group>
                        <Select.Label size="2">Order Type</Select.Label>
                        <Select.Item size="2" value="buy">Buy</Select.Item>
                        <Select.Item size="2" value="sell">Sell</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            </HoverCard.Content>
          </HoverCard.Root>
          {/* </Flex> */}
          <InteractiveChart
            data={chartData}
          />
        </Flex>
      </Card>
    );
  }

  render() {
    const { tableArr, isLoading, colorBlindMode } = this.state;

    console.log(tableArr);

    if (isLoading) {
      return (
        <Flex
          id="detailed_analysis_page_main_container"
          style={{ width: "100%" }}
          direction="row"
          gap="4"
        >
          <Card className="market_data_table" style={{ width: "100%", flex: "1" }}>
            <Flex justify="center" align="center" style={{ height: "65vh" }}>
              <FontAwesomeIcon icon={faCircleNotch} spin size="xl" />
            </Flex>
          </Card>
          <Card height="100%" style={{ width: "100%", flex: "2" }}>
            <Flex justify="center" align="center" style={{ height: "100%" }}>
              <FontAwesomeIcon icon={faCircleNotch} spin size="xl" />
            </Flex>
          </Card>
        </Flex>
      );
    }

    return (
      <Flex
        id="detailed_analysis_page_main_container"
        style={{ width: "100%" }}
        direction="row"
        gap="4"
      >
        <Card className="market_data_table">
          <Flex>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Data</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Add to graph</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tableArr.map((item, index) => {
                  if (!item) return null;
                  return (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <Flex height="100%" align="center">
                          {item.info ? (
                            <HoverCard.Root>
                              <HoverCard.Trigger>
                                <Flex justify="start" align="center" gap="1">
                                  <Text>{item.name} </Text><InfoCircledIcon className="info_icon" height="10px" width="10px" />
                                </Flex>
                              </HoverCard.Trigger>
                              <HoverCard.Content maxWidth="300px">
                                <Flex gap="1" direction={"column"} justify={"start"}>
                                  <Heading size="3" mb="2">
                                    {item.name}
                                  </Heading>
                                  <Text as="div" size="2" color="gray" mb="2">
                                    {item.info}
                                  </Text>
                                  <Text size="2">
                                    Material costs based on your{" "}
                                    <Link size="2" href="/build" target="_blank">
                                      build
                                    </Link>{" "}
                                    settings.
                                  </Text>
                                </Flex>
                              </HoverCard.Content>
                            </HoverCard.Root>
                          ) : (
                            <Text>{item.name}</Text>
                          )}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="2" align="center">
                          <Flex
                            direction="column"
                            justify="center"
                            width="fit-content"
                            align="center"
                            className={this.getClassName(
                              item.percentageChange,
                              colorBlindMode
                            )}
                          >
                            {item.percentageChange >= 0 ? (
                              <DoubleArrowUpIcon height="15px" width="15px" />
                            ) : (
                              <DoubleArrowDownIcon height="15px" width="15px" />
                            )}
                            <Text size="1">{item.percentageChange}%</Text>
                          </Flex>
                          <Text>{Number(item.value).toLocaleString()}</Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex height="100%" align="center">
                          {this.renderIconButton(item, index)}
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Flex>
        </Card>
        {this.renderChart()}
      </Flex>
    );
  }
}

export default MarketData;
