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
        // this.renderScheduleChart = this.renderScheduleChart.bind(this);
    }

    componentDidMount() {
        // Load settings from the cookie if available
        // const savedSettings = Cookies.get('buildSettings');
        // if (savedSettings) {
        //     this.setState(JSON.parse(savedSettings), this.submitBuildData);
        // } else {
            // If no saved settings, make initial call with default state
            this.submitBuildData();
        // }
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

    submitBuildData = () => {
        this.setState({ loading: true });
        axios.post('/api/build', this.state)
            .then(response => {
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

    // renderScheduleChart = (schedule) => {
    //     return (
    //         <>
    //             <Heading mt="4" mb="4" size="3">Reaction schedule</Heading>
    //             <Table.Root>
    //                 <Table.Header>
    //                     <Table.Row>
    //                         <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
    //                         <Table.ColumnHeaderCell><Text size="3">Name</Text></Table.ColumnHeaderCell>
    //                         <Table.ColumnHeaderCell><Text size="3">Runs</Text></Table.ColumnHeaderCell>
    //                         <Table.ColumnHeaderCell><Text size="3">Completed</Text></Table.ColumnHeaderCell>
    //                     </Table.Row>
    //                 </Table.Header>
    //                 <Table.Body>
    //                     {schedule?.map((material, index) => (
    //                         <Table.Row key={index}>
    //                             <Table.Cell>
    //                                 <img style={{ width: "25px", height: "25px" }} src={`https://image.eveonline.com/Type/${material.id}_64.png`} alt="Item" className="img-fluid" />
    //                             </Table.Cell>
    //                             <Table.Cell>
    //                                 <Flex height="100%" align="center">
    //                                     <Text size="3">{material.name}</Text>
    //                                 </Flex>
    //                             </Table.Cell>
    //                             <Table.Cell>
    //                                 <Flex height="100%" align="center">
    //                                     <Text size="3">{Number(material.runs).toLocaleString()}</Text>
    //                                 </Flex>
    //                             </Table.Cell>
    //                             <Table.Cell>
    //                                 <Flex height="100%" align="center">
    //                                     <Checkbox />
    //                                 </Flex>
    //                             </Table.Cell>
    //                         </Table.Row>
    //                     ))}
    //                 </Table.Body>
    //             </Table.Root>
    //         </>
    //     )
    // }

    renderRequiredMaterialsTable = () => {
        const width = window.innerWidth;
        const isNarrow = width < 1111;
        const { buildResponseData, darkMode, loading, coreVolume, defensiveVolume, offensiveVolume, propulsionVolume } = this.state;
        const filteredMaterials = buildResponseData?.requiredMaterialsForAll
            .filter(material => material.quantity !== 0 && material.name !== "None" && ![30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008].includes(material.id));
        const materialBuyCost = buildResponseData?.maxBuys != null ? buildResponseData?.maxBuys : 0;
        const industryTaxTotal = buildResponseData?.totalTax != null ? buildResponseData?.totalTax : 0;
        const totalBuildCost = materialBuyCost + industryTaxTotal;
        const size = "3";
        const numRuns = buildResponseData?.blueprints.numRuns;

        const schedule = buildResponseData?.schedule != null ? buildResponseData.schedule : null;

        return (
            <Flex direction="column" gap="4" class="container" style={{ width: "100%", overflowY: "scroll" }}>
                <BuildHeader
                    numRuns={numRuns}
                    coreVolume={coreVolume}
                    defensiveVolume={defensiveVolume}
                    offensiveVolume={offensiveVolume}
                    propulsionVolume={propulsionVolume}
                    materialBuyCost={materialBuyCost}
                    industryTaxTotal={industryTaxTotal}
                    totalBuildCost={totalBuildCost}
                />
                {/* <Divider /> */}

                {loading ? <table>{this.renderTableLoading()}</table> : <MatsTable filteredMaterials={filteredMaterials} />}
                {loading ? null : <ScheduleTable schedule={schedule} />}
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
            <Flex className="build_container" width="100%" direction={isNarrow ? "column" : "row"} gap="4">
                <Flex direction="column" className="settings_accordion" style={{ height: "fit-content" }}>
                    {/* <PageTitle pageTitle="Manufacturing tool" /> */}
                    {/* <Heading weight="light" color="gray" mb="7" mt="-6" size="4">Build settings and material calculator</Heading> */}
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
                    {this.renderRequiredMaterialsTable()}
                </Flex>
            </Flex>
        );
    }
}

export default Build;
