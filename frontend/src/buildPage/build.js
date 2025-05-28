import React from "react";
import axios from 'axios';
import Divider from '@mui/material/Divider';
import Cookies from 'js-cookie'
import 'react-loading-skeleton/dist/skeleton.css';
import { Flex, Heading, Text, Table, Card, Checkbox } from "@radix-ui/themes";
import SettingsAccordion from "./settingsAccordion.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import BuildHeader from "./buildHeader.js"
import MatsTable from "./matsTable.js";
import ScheduleTable from "./scheduleTable.js";
import PageTitle from "../layout/PageTitle.js"

class Build extends React.Component {
    constructor(props) {
        super(props);
    
        const savedSettings = Cookies.get('buildSettings');
        let parsed = {};
        try {
            parsed = savedSettings ? JSON.parse(savedSettings) : {};
        } catch (e) {
            console.error("Invalid buildSettings cookie, resetting...");
            Cookies.remove('buildSettings');
        }
    
        this.state = {
            numSlots: parsed.numSlots || 1,
            darkMode: props.darkMode || false,
            refinery: parsed.refinery || 'Tatara',
            materialsLocation: props.materialsLocation || "10000002",
            materialsOrderType: props.materialsOrderType || "buy",
            refineryTeRig: parsed.refineryTeRig || 'None',
            refineryMeRig: parsed.refineryMeRig || 'None',
            refinerySystem: parsed.refinerySystem || 'wormhole',
            complex: parsed.complex || 'Azbel',
            complexLargeRig: parsed.complexLargeRig || 'None',
            complexTeRig: parsed.complexTeRig || 'None',
            complexMeRig: parsed.complexMeRig || 'None',
            complexSystem: parsed.complexSystem || 'wormhole',
            tataraRig: parsed.tataraRig || 'None',
            componentMaterialEfficiency: parsed.componentMaterialEfficiency || 10,
            componentTimeEfficiency: parsed.componentTimeEfficiency || 20,
            ancientRelic: parsed.ancientRelic || 'Intact',
            decryptor: parsed.decryptor || 'None',
            coreVolume: parsed.coreVolume || 1,
            defensiveVolume: parsed.defensiveVolume || 1,
            offensiveVolume: parsed.offensiveVolume || 1,
            propulsionVolume: parsed.propulsionVolume || 1,
            skillLevel: parsed.skillLevel || 1,
            implant: parsed.implant || 'None',
            buildingComponents: false,
            runningReactions: false,
            buildCostIndex: parsed.buildCostIndex || 0.14,
            reactionCostIndex: parsed.reactionCostIndex || 0.14,
            reactionFacilityTax: parsed.reactionFacilityTax || 1,
            complexFacilityTax: parsed.complexFacilityTax || 1,
            buildResponseData: null,
            loading: true,
        };
    
        this.renderMatsTable = this.renderMatsTable.bind(this);
    }
    

    componentDidMount() {
        // Load settings from the cookie if available
        const savedSettings = Cookies.get('buildSettings');
        // console.log(JSON.parse(savedSettings));
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
        this.setState({ [state]: val[0] }, this.submitBuildData);
    }

    handleCheckboxChange = (e) => {
        this.setState({ [e.target.name]: e.target.checked }, this.submitBuildData);
    }

    controller = null; // Class property to track the current request

    submitBuildData = () => {
        if (this.controller) {
            this.controller.abort();
        }
        this.controller = new AbortController();
        this.setState({ loading: true });
        console.log(this.state)
        axios.post('/api/build', this.state, {
            signal: this.controller.signal
        })
            .then(response => {
                console.log('Data sent successfully:', response.data);
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
                if (axios.isCancel(error) || error.name === 'CanceledError') {
                    console.log('Previous request canceled');
                } else {
                    console.error('Error sending data:', error);
                }
                this.setState({ loading: false });
            });
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
        const { buildResponseData, darkMode, loading, coreVolume, defensiveVolume, offensiveVolume, propulsionVolume } = this.state;
        const filteredMaterials = buildResponseData?.requiredMaterialsForAll
            .filter(material => material.quantity !== 0 && material.name !== "None" && ![30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008].includes(material.id));
        let components = buildResponseData?.requiredMaterialsForAll
        .filter(material => [30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008].includes(material.id));
        components?.sort((a, b) => a.quantity - b.quantity);
        const materialBuyCost = buildResponseData?.maxBuys != null ? buildResponseData?.maxBuys : 0;
        const industryTaxTotal = buildResponseData?.totalTax != null ? buildResponseData?.totalTax : 0;
        const totalBuildCost = materialBuyCost + industryTaxTotal;
        const size = "3";
        const numRuns = buildResponseData?.blueprints.numRuns;

        const schedule = buildResponseData?.schedule != null ? buildResponseData.schedule : null;

        console.log(buildResponseData);

        return (
            <Flex direction="column" gap="4" class="container" style={{ width: "100%"}}>
                {loading ? 
                <>
                <Heading mt="4" mb="4" size="4">Production overview and costs</Heading>
                <Card style={{ width: "100%" }}>
                <Flex direction="row" justify="center" align="center" style={{ width: "100%", height: "104px" }}>
                            <FontAwesomeIcon icon={faCircleNotch} spin size="xl" />
                        </Flex>
                        </Card>
                        </>
                        : <BuildHeader
                        numRuns={numRuns}
                        coreVolume={coreVolume}
                        defensiveVolume={defensiveVolume}
                        offensiveVolume={offensiveVolume}
                        propulsionVolume={propulsionVolume}
                        materialBuyCost={materialBuyCost}
                        industryTaxTotal={industryTaxTotal}
                        totalBuildCost={totalBuildCost}
                        components={components}
                        loading={loading}
                    />
                        }
                
                {/* <Divider /> */}

                {loading ? <table>{this.renderTableLoading()}</table> : <MatsTable filteredMaterials={filteredMaterials} />}
                {loading ? null : <ScheduleTable schedule={schedule} />}
            </Flex>
        );
    }

    render() {
        const {
            refinery, teRig, meRig, system, tataraRig, complex,
            complexTeRig, complexMeRig, complexSystem, complexLargeRig,
            componentMaterialEfficiency, componentTimeEfficiency,
            ancientRelic, decryptor, coreVolume, defensiveVolume,
            offensiveVolume, propulsionVolume, numSlots, skillLevel,
            implant, buildingComponents, runningReactions,
            reactionCostIndex, buildCostIndex,
            reactionFacilityTax, complexFacilityTax, loading
        } = this.state;

        return (
            <Flex className="build_container" width="100%" gap="4">
                <Flex direction="column" className="settings_accordion" style={{ height: "fit-content" }}>
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
                <Flex className="required_materials" 
                    // mt="9" 
                    // pt="9"
                >
                    {/* {!loading && this.renderRequiredMaterialsTable()} */}
                    {this.renderRequiredMaterialsTable()}
                </Flex>
            </Flex>
        );
    }
}

export default Build;
