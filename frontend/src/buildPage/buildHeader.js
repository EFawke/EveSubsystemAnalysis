import React from "react";
import axios from 'axios';
import Divider from '@mui/material/Divider';
import Cookies from 'js-cookie'
import 'react-loading-skeleton/dist/skeleton.css';
import { Flex, Heading, Text, Table, Card, DataList, Tooltip, HoverCard } from "@radix-ui/themes";
import SettingsAccordion from "./settingsAccordion.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

export default function BuildHeader(props) {
    const [defensiveVolume, setDefensiveVolume] = useState(props.defensiveVolume);
    const [coreVolume, setCoreVolume] = useState(props.coreVolume);
    const [propulsionVolume, setPropulsionVolume] = useState(props.propulsionVolume);
    const [offensiveVolume, setOffensiveVolume] = useState(props.offensiveVolume);
    const [numRuns, setNumRuns] = useState(props.numRuns)
    const [components, setComponents] = useState(props.components || []);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setDefensiveVolume(props.defensiveVolume)
        setCoreVolume(props.coreVolume)
        setPropulsionVolume(props.propulsionVolume)
        setOffensiveVolume(props.offensiveVolume)
        setNumRuns(props.numRuns)
        setComponents(props.components)
        setLoading(props.loading)
    }, [props])

    return (
        <>
            <Heading mt="4" mb="4" size="4">Production overview and costs</Heading>
            <Card style={{ width: "100%" }}>
                {/* {
                    loading ? (

                        <Flex direction="row" justify="center" align="center" style={{ width: "100%", height: "104px" }}>
                            <FontAwesomeIcon icon={faCircleNotch} spin size="xl" />
                        </Flex>

                    ) : ( */}
                        <>
                            <HoverCard.Root>
                                <HoverCard.Trigger>
                                    <Flex className="build_header_mobile_container" justify={"between"} align={"center"} style={{ width: "100%", paddingRight: "20px", paddingTop: "5px", paddingBottom: "5px" }}>
                                        <Flex justify="center" align="center" direction="column" gap="2" className="subs_build_container">
                                            <Flex align="center" direction="row" justify="start" gap="4" mt="4" mb="4">
                                                <Tooltip content={"Defensive"}>
                                                    <Flex direction="column" gap="2" align="center">
                                                        <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/45589/icon`} alt="Defensive" />
                                                        <Text size="2" color="gray">{numRuns * defensiveVolume}</Text>
                                                    </Flex>
                                                </Tooltip>
                                                <Tooltip content={"Core"}>
                                                    <Flex direction="column" gap="2" align="center">
                                                        <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/45626/icon`} alt="Core" />
                                                        <Text size="2" color="gray">{numRuns * coreVolume}</Text>
                                                    </Flex>
                                                </Tooltip>
                                                <Tooltip content={"Propulsion"}>
                                                    <Flex direction="column" gap="2" align="center">
                                                        <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/45621/icon`} alt="Propulsion" />
                                                        <Text size="2" color="gray">{numRuns * propulsionVolume}</Text>
                                                    </Flex>
                                                </Tooltip>
                                                <Tooltip content={"Offensive"}>
                                                    <Flex direction="column" gap="2" align="center">
                                                        <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/45601/icon`} alt="Offensive" />
                                                        <Text size="2" color="gray">{numRuns * offensiveVolume}</Text>
                                                    </Flex>
                                                </Tooltip>
                                            </Flex>
                                        </Flex>
                                        <DataList.Root mb="0">
                                            <DataList.Item align="start">
                                                <DataList.Label>
                                                    <Text size="3">
                                                        Materials:
                                                    </Text>
                                                </DataList.Label>
                                                <DataList.Value>
                                                    <Text size="3">
                                                        {`${props.materialBuyCost.toLocaleString()} ISK`}
                                                    </Text>
                                                </DataList.Value>
                                            </DataList.Item>
                                            <DataList.Item>
                                                <DataList.Label>
                                                    <Text size="3">
                                                        Industry taxes:
                                                    </Text>
                                                </DataList.Label>
                                                <DataList.Value>
                                                    <Text size="3">
                                                        {`${props.industryTaxTotal.toLocaleString()} ISK`}
                                                    </Text>
                                                </DataList.Value>
                                            </DataList.Item>
                                            <DataList.Item>
                                                <DataList.Label>
                                                    <Text size="3">
                                                        Total:
                                                    </Text>
                                                </DataList.Label>
                                                <DataList.Value>
                                                    <Text size="3">
                                                        {`${props.totalBuildCost.toLocaleString()} ISK`}
                                                    </Text>
                                                </DataList.Value>
                                            </DataList.Item>
                                        </DataList.Root>
                                    </Flex>
                                </HoverCard.Trigger>
                                <HoverCard.Content>
                                    <Heading size="3" mb="2" className="component_header">Components</Heading>
                                    <Flex align="start" direction="row" justify="between" gap="4" className="components_container">
                                        {components?.map((component, index) => (
                                            <Flex pr="2" pl="2" key={index} direction="column" gap="2" align="center" justify="between" className="component_container">
                                                <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/${component.id}/icon`} alt={component.name} />
                                                <Text size="2" color="gray">{component.name}</Text>
                                                <Text size="2" color="gray">{`${component.quantity} units`}</Text>
                                            </Flex>
                                        ))}
                                    </Flex>
                                </HoverCard.Content>
                            </HoverCard.Root>
                        </>
                    {/* )
                } */}
            </Card>

        </>
    )
};