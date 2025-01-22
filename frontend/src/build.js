import React from "react";
import axios from 'axios';
import Divider from '@mui/material/Divider';
import Cookies from 'js-cookie'
import 'react-loading-skeleton/dist/skeleton.css';
import { Section, Flex, Accordion, Link, Heading, Text, Table, IconButton, Container, Card, Box, Button, DropdownMenu } from "@radix-ui/themes";
import SettingsAccordion from "./settingsAccordion.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";


class Build extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numSlots: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.numSlots : 1,
            darkMode: this.props.darkMode || false,
            refinery: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.refinery : 'Tatara',
            materialsLocation: Cookies.get('materialsLocation') != null ? Cookies.get('materialsLocation') : "10000002",
            materialsOrderType: Cookies.get('materialsOrderType') != null ? Cookies.get('materialsOrderType') : "buy",
            refineryTeRig: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.refineryTeRig : 'None',
            refineryMeRig: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.refineryMeRig : 'None',
            refinerySystem: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.refinerySystem : 'wormhole',
            complex: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.complex : 'Azbel',
            complexLargeRig: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.complexLargeRig : 'None',
            complexTeRig: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.complexTeRig : 'None',
            complexMeRig: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.complexMeRig : 'None',
            complexSystem: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.complexSystem : 'wormhole',
            tataraRig: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.tataraRig : 'None',
            componentMaterialEfficiency: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.componentMaterialEfficiency : 0,
            componentTimeEfficiency: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.componentTimeEfficiency : 0,
            ancientRelic: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.ancientRelic : 'Intact',
            decryptor: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.decryptor : 'None',
            coreVolume: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.coreVolume : 1,
            defensiveVolume: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.defensiveVolume : 1,
            offensiveVolume: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.offensiveVolume : 1,
            propulsionVolume: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.propulsionVolume : 1,
            skillLevel: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.skillLevel : 1,
            implant: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.implant : 'None',
            buildingComponents: false,
            runningReactions: false,
            buildCostIndex: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.buildCostIndex : 0.14,
            reactionCostIndex: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.reactionCostIndex : 0.14,
            reactionFacilityTax: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.reactionFacilityTax : 1,
            complexFacilityTax: Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings'))?.complexFacilityTax : 1,
            buildResponseData: null,  // new state variable for response data
            loading: true,
        }
        this.renderMatsTable = this.renderMatsTable.bind(this);
    }

    componentDidMount() {
        // Load settings from the cookie if available
        const savedSettings = Cookies.get('buildSettings');
        if (savedSettings) {
            this.setState(JSON.parse(savedSettings), this.submitBuildData);
        } else {
            // If no saved settings, make initial call with default state
            this.submitBuildData();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // Save settings to a cookie whenever the state updates
        if (this.state !== prevState) {
            Cookies.set('buildSettings', JSON.stringify(this.state), { expires: 365 * 100 });
        }

        // Handle darkMode update based on props
        if (this.state.darkMode !== this.props.darkMode) {
            this.setState({ darkMode: this.props.darkMode });
        }
    }

    handleInputChange = (value, name) => {
        this.setState({ [name]: value }, this.submitBuildData);
    }    

    handleSliderChange = (val, state) => {
        this.setState({[state]: val[0]}, this.submitBuildData);
    }

    handleCheckboxChange = (e) => {
        this.setState({ [e.target.name]: e.target.checked }, this.submitBuildData);
    }

    submitBuildData = () => {
        this.setState({ loading: true });
        axios.post('/api/build', this.state)
            .then(response => {
                console.log(response.data);
                this.setState({ buildResponseData: response.data }, () => {
                    const buildSettings = Object.keys(this.state).reduce((acc, key) => {
                        if (typeof this.state[key] !== 'object') {
                            acc[key] = this.state[key];
                        }
                        return acc;
                    }, {});
                    Cookies.set('buildSettings', JSON.stringify(buildSettings), { expires: 365 * 100 });
                });
                this.setState({ loading: false });
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }

    renderBuildQuantities = () => {
        const { buildResponseData, darkMode, loading } = this.state;
        const numRuns = buildResponseData?.blueprints.numRuns;
        return (
            <Flex style={{ width: "60%" }} justify="center" align="center" direction="column">
                {
                    loading ? <FontAwesomeIcon icon={faCircleNotch} spin size="xl" /> : 
                    <Flex direction="row" style={{ width: "70%" }} justify="between" gap="4" mt="4" mb="4">
                        <Flex direction="column" gap="2" align="center">
                            <img style={{ height: "25px", width: "25px" }} className="counter_icon" src={`https://images.evetech.net/types/45589/icon?size=32`} alt="Defensive" />
                            <Text size="2" color="gray">{numRuns * this.state.defensiveVolume}</Text>
                        </Flex>
                        <Flex direction="column" gap="2" align="center">
                            <img style={{ height: "25px", width: "25px" }} className="counter_icon" src={`https://images.evetech.net/types/45626/icon?size=32`} alt="Core" />
                            <Text size="2" color="gray">{numRuns * this.state.coreVolume}</Text>
                        </Flex>
                        <Flex direction="column" gap="2" align="center">
                            <img style={{ height: "25px", width: "25px" }} className="counter_icon" src={`https://images.evetech.net/types/45621/icon?size=32`} alt="Propulsion" />
                            <Text size="2" color="gray">{numRuns * this.state.propulsionVolume}</Text>
                        </Flex>
                        <Flex direction="column" gap="2" align="center">
                            <img style={{ height: "25px", width: "25px" }} className="counter_icon" src={`https://images.evetech.net/types/45601/icon?size=32`} alt="Offensive" />
                            <Text size="2" color="gray">{numRuns * this.state.offensiveVolume}</Text>
                        </Flex>
                    </Flex>
                }
            </Flex>
        );
    }

    renderTableLoading = () => {
        return (
            <Flex direction="column" height="70vh" justify="center" align="center">
                <FontAwesomeIcon icon={faCircleNotch} spin size="xl" />
            </Flex>
        )
    }

    renderMatsTable = (filteredMaterials) => {
        return (
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Quantity</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Unit Price</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Line Total</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {filteredMaterials?.map((material, index) => (
                        <Table.Row key={index}>
                            <Table.Cell>
                                <img style={{ width: "25px", height: "25px" }} src={`https://image.eveonline.com/Type/${material.id}_32.png`} alt="Item" className="img-fluid" />
                            </Table.Cell>
                            <Table.Cell>
                                <Flex height="100%" align="center">
                                    <Text>{material.name}</Text>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell>
                                <Flex height="100%" align="center">
                                    <Text>{Number(material.quantity).toLocaleString()}</Text>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell>
                                <Flex height="100%" align="center">
                                    <Text>
                                        {Number(material.unitPrice).toLocaleString()}
                                    </Text>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell>
                                <Flex height="100%" align="center">
                                    <Text>
                                        {Math.round(material.lineTotal).toLocaleString()}
                                    </Text>
                                </Flex>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        )
    }

    renderRequiredMaterialsTable = () => {
        const width = window.innerWidth;
        const isNarrow = width < 1111;
        const { buildResponseData, darkMode, loading } = this.state;
        const filteredMaterials = buildResponseData?.requiredMaterialsForAll
            .filter(material => material.quantity !== 0 && material.name !== "None" && ![30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008].includes(material.id));
        const materialBuyCost = buildResponseData?.maxBuys != null ? buildResponseData?.maxBuys : 0;
        const industryTaxTotal = buildResponseData?.totalTax != null ? buildResponseData?.totalTax : 0;
        const totalBuildCost = materialBuyCost + industryTaxTotal;
        const size = "3";

        return (
            <Flex direction="column" class="container" style={{ width: "100%", maxHeight:"70vh", overflow:"scroll" }}>
                <Flex direction={isNarrow ? "column" : "row"} justify={"between"} align={"center"} style={{ width: "100%", paddingRight: "20px", paddingTop: "5px", paddingBottom: "5px" }}>
                    {this.renderBuildQuantities()}
                    <Flex direction="column" gap="2" pb="3" 
                        // style={{ width: "40%", alignSelf: "end" }}
                        style={{
                            width: isNarrow ? "100%" : "calc(100% / 3)",
                            alignSelf: "end",
                        }}
                    >
                        <Flex direction="row" gap="4" justify="between" style={{ width: "100%" }}>
                            <Text size={size} weight="bold">Materials:</Text>
                            <Text size={size}>{loading ? null : `${materialBuyCost.toLocaleString()} ISK`}</Text>                        
                        </Flex>
                        <Flex direction="row" gap="4" justify="between" style={{ width: "100%" }}>
                            <Text size={size} weight="bold">Industry taxes:</Text>
                            <Text size={size}>{loading ? null : `${industryTaxTotal.toLocaleString()} ISK`}</Text>
                        </Flex>
                        <Flex direction="row" gap="4" justify="between" style={{ width: "100%" }}>
                            <Text size={size} weight="bold">Total:</Text>
                            <Text size={size}>{loading ? null : `${totalBuildCost.toLocaleString()} ISK`}</Text>
                        </Flex>
                    </Flex>
                </Flex>
                <Divider />
                {loading ? <table>{this.renderTableLoading()}</table> : this.renderMatsTable(filteredMaterials)}
            </Flex>
        );
    }

    render() {
        const { darkMode, 
            refinery, teRig, meRig, system, tataraRig, complex, 
            complexTeRig, complexMeRig, complexSystem, complexLargeRig, 
            componentMaterialEfficiency, componentTimeEfficiency, 
            ancientRelic, decryptor, coreVolume, defensiveVolume, 
            offensiveVolume, propulsionVolume, numSlots, skillLevel, 
            implant, buildingComponents, runningReactions, 
            reactionCostIndex, buildCostIndex, 
            reactionFacilityTax, complexFacilityTax 
        } = this.state;

        // Check window width
        const width = window.innerWidth;
        const isNarrow = width < 1111;

        return (
            <Flex
                className="build_container"
                width="100%"
                // Choose column vs. row based on window width
                direction={isNarrow ? "column" : "row"}
                gap="4"
            >
                <Flex
                    className="settings_accordion"
                    // If column layout, each child is 100%.
                    // If row layout, keep original widths.
                    style={{
                        // width: isNarrow ? "100%" : "calc(100% / 3)",
                        height: "fit-content",
                    }}
                >
                    <SettingsAccordion
                        refinery={refinery}
                        teRig={teRig}
                        meRig={meRig}
                        system={system}
                        tataraRig={tataraRig}
                        complex={complex}
                        complexTeRig={complexTeRig}
                        complexMeRig={complexMeRig}
                        complexSystem={complexSystem}
                        complexLargeRig={complexLargeRig}
                        componentMaterialEfficiency={componentMaterialEfficiency}
                        componentTimeEfficiency={componentTimeEfficiency}
                        ancientRelic={ancientRelic}
                        decryptor={decryptor}
                        coreVolume={coreVolume}
                        defensiveVolume={defensiveVolume}
                        offensiveVolume={offensiveVolume}
                        propulsionVolume={propulsionVolume}
                        numSlots={numSlots}
                        skillLevel={skillLevel}
                        implant={implant}
                        buildingComponents={buildingComponents}
                        runningReactions={runningReactions}
                        reactionCostIndex={reactionCostIndex}
                        buildCostIndex={buildCostIndex}
                        reactionFacilityTax={reactionFacilityTax}
                        complexFacilityTax={complexFacilityTax}
                        handleInputChange={this.handleInputChange}
                        handleSliderChange={this.handleSliderChange}
                        handleCheckboxChange={this.handleCheckboxChange}
                    />
                </Flex>
                <Flex
                    className="required_materials"
                    style={{
                        // width: isNarrow ? "100%" : "calc(100% - (100% / 3))"
                    }}
                >
                    <Card style={{ width: "100%" }}>
                        {this.renderRequiredMaterialsTable()}
                    </Card>
                </Flex>
            </Flex>
        );
    }
}

export default Build;
