import { useEffect, useState } from "react";
import { Flex, Heading, Text, Table, Card, Checkbox, Tooltip } from "@radix-ui/themes";

export default function ScheduleTable(props) {
    const [schedule, setSchedule] = useState(props.schedule);

    useEffect(() => {
        setSchedule(props.schedule);
    }, [props])

    return (
        <>
            <Heading mt="4" mb="4" size="4">Optimised reaction schedule</Heading>
            <Card style={{ width: "100%" }}>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell className="sticky_header_cell"></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className="sticky_header_cell"><Text size="3">Name</Text></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className="sticky_header_cell"><Text size="3">Runs</Text></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className="sticky_header_cell"><Text size="3">Completed</Text></Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {schedule?.map((material, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>
                                    <img style={{ width: "25px", height: "25px" }} src={`https://image.eveonline.com/Type/${material.id}_64.png`} alt="Item" className="img-fluid" />
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center">
                                        <Text size="3">{material.name}</Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center">
                                        <Text size="3">{Number(material.runs).toLocaleString()}</Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center">
                                        <Checkbox />
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Card>
        </>
    )
}