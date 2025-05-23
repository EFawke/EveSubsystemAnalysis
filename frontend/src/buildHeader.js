import React from "react";
import axios from 'axios';
import Divider from '@mui/material/Divider';
import Cookies from 'js-cookie'
import 'react-loading-skeleton/dist/skeleton.css';
import { Flex, Heading, Text, Table, Card, DataList } from "@radix-ui/themes";
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

    useEffect(() => {
        setDefensiveVolume(props.defensiveVolume)
        setCoreVolume(props.coreVolume)
        setPropulsionVolume(props.propulsionVolume)
        setOffensiveVolume(props.offensiveVolume)
        setNumRuns(props.numRuns)
    }, [props])

    return (
        <>
        <Heading mt="4" mb="4" size="4">Production overview and costs</Heading>
        <Card>
            <Flex direction="row" justify={"between"} align={"center"} style={{ width: "100%", paddingRight: "20px", paddingTop: "5px", paddingBottom: "5px" }}>
                <Flex style={{ width: "55%" }} justify="center" align="center" direction="column">
                    <Flex direction="row" style={{ width: "70%" }} justify="between" gap="4" mt="4" mb="4">
                        <Flex direction="column" gap="2" align="center">
                            <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/45589/icon`} alt="Defensive" />
                            <Text size="2" color="gray">{numRuns * defensiveVolume}</Text>
                        </Flex>
                        <Flex direction="column" gap="2" align="center">
                            <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/45626/icon`} alt="Core" />
                            <Text size="2" color="gray">{numRuns * coreVolume}</Text>
                        </Flex>
                        <Flex direction="column" gap="2" align="center">
                            <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/45621/icon`} alt="Propulsion" />
                            <Text size="2" color="gray">{numRuns * propulsionVolume}</Text>
                        </Flex>
                        <Flex direction="column" gap="2" align="center">
                            <img style={{ width: "28px", height: "28px" }} className="counter_icon" src={`https://images.evetech.net/types/45601/icon`} alt="Offensive" />
                            <Text size="2" color="gray">{numRuns * offensiveVolume}</Text>
                        </Flex>
                    </Flex>
                </Flex>
                <DataList.Root mb="0">
                    <DataList.Item align="center">
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
        </Card>
        </>
    )
};