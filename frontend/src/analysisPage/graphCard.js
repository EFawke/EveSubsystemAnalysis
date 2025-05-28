import { useEffect, useState } from "react"
import { Text, Table, Flex, IconButton, Card, HoverCard, Link, Heading, Select } from "@radix-ui/themes";
import InteractiveChart from './interactiveChart';


export default function GraphCard(props) {
    
    const [chartData, setChartData] = useState(props.chartData);

    useEffect(() => {
        const chartData = props.chartData.filter(item => item.addToGraph === true)
        setChartData(chartData);
    }, [props.chartData])


    return (
        <Flex direction="column" style={{ width: "100%", flex: "2", paddingTop: "var(--space-3)" }}>
            <HoverCard.Root>
                <HoverCard.Trigger>
                    <Table.Root>
                        <Table.ColumnHeaderCell style={{ boxShadow: "none", paddingTop: "var(--space-3)" }}>
                            <Text weight="bold" size="3">
                                {props.name}
                            </Text>
                        </Table.ColumnHeaderCell>
                    </Table.Root>
                </HoverCard.Trigger>
                <HoverCard.Content maxWidth="300px">
                    <Flex gap="4" direction={"column"} justify={"start"}>
                        <Heading size="3" weight="bold">Market Settings</Heading>
                        <Flex gap="4" align="center" justify="start">
                            <Text size="2" style={{ color: "var(--accent-a11)" }}>Materials</Text>
                            <Select.Root defaultValue={props.materialsLocation} onValueChange={props.setMaterialsLocation}>
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
                            <Select.Root defaultValue={props.materialsOrderType} onValueChange={props.setMaterialsOrderType}>
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
                            <Select.Root defaultValue={props.subsystemsLocation} onValueChange={props.setSubsystemsLocation}>
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
                            <Select.Root defaultValue={props.subsystemsOrderType} onValueChange={props.setSubsystemsOrderType}>
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
            <Card height="100%" style={{ flex: "1", marginTop: "var(--space-3)" }}>
                <Flex height="100%" style={{ padding: "var(--space-3)" }}>
                    <InteractiveChart data={chartData} />
                </Flex>
            </Card>
        </Flex>
    )
}