import React from "react";
import 'react-loading-skeleton/dist/skeleton.css';
import { Flex, Text, Table, Heading, Card } from "@radix-ui/themes";
import { useState, useEffect } from "react";

export default function MatsTable(props) {
    const [filteredMaterials, setFilteredMaterials] = useState(props.filteredMaterials);

    useEffect(() => setFilteredMaterials(props.filteredMaterials), props)

    return (
        <>
            <Heading mt="4" mb="4" size="4">Itemised shopping list</Heading>
            <Card style={{ width: "100%" }}>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell><Text size="3">Name</Text></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell><Text size="3">Quantity</Text></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell><Text size="3">Unit Price</Text></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell><Text size="3">Line Total</Text></Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredMaterials?.map((material, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>
                                    <img style={{ width: "28px", height: "28px" }} src={`https://image.eveonline.com/Type/${material.id}_64.png`} alt="Item" className="img-fluid" />
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center">
                                        <Text size="3">{material.name}</Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center">
                                        <Text size="3">{Number(material.quantity).toLocaleString()}</Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center">
                                        <Text size="3">
                                            {Number(material.unitPrice).toLocaleString()}
                                        </Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center">
                                        <Text size="3">
                                            {Math.round(material.lineTotal).toLocaleString()}
                                        </Text>
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