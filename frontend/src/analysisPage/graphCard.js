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
        <Flex direction="column" style={{ width: "100%", flex: "2" }}>
            <Card height="100%" style={{ flex: "1" }}>
                <Flex height="100%" style={{ padding: "var(--space-3)" }}>
                    <InteractiveChart data={chartData} />
                </Flex>
            </Card>
        </Flex>
    )
}