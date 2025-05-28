import { useEffect, useState } from "react"
import { Text, Table, Flex, IconButton, Card, HoverCard, Link, Heading, Select } from "@radix-ui/themes";
import {
    InfoCircledIcon,
    DoubleArrowDownIcon,
    DoubleArrowUpIcon,
    CheckIcon,
    Cross2Icon,
} from "@radix-ui/react-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

export default function MarketDataTable(props) {

    const [tableArr, setTableArr] = useState(props.tableArr)
    const [isLoading, setIsLoading] = useState(props.isLoading)

    useEffect(() => {
        setTableArr(props.tableArr)
    }, [props.tableArr])

    useEffect(() => {
        setIsLoading(props.isLoading)
    }, [props.isLoading])

    return (
        <Card className="market_data_table">
            {!isLoading ? <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell><Text size="3">Data</Text></Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell><Text size="3">Value</Text></Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell><Text size="3">Add to graph</Text></Table.ColumnHeaderCell>
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
                                                        <Text size="3">{item.name} </Text><InfoCircledIcon className="info_icon" height="12px" width="12px" />
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
                                            <Text size="3">{item.name}</Text>
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
                                            className={props.getClassName(
                                                item.percentageChange,
                                                props.colorBlindMode
                                            )}
                                        >
                                            {item.percentageChange >= 0 ? (
                                                <DoubleArrowUpIcon height="15px" width="15px" />
                                            ) : (
                                                <DoubleArrowDownIcon height="15px" width="15px" />
                                            )}
                                            <Text size="1">{item.percentageChange}%</Text>
                                        </Flex>
                                        <Text size="3">{Number(item.value).toLocaleString()}</Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center">
                                        {props.renderIconButton(item, index)}
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>
            : 
            <Flex style={{height: "451px", width: "384px"}} justify="center" align="center">
                <FontAwesomeIcon icon={faCircleNotch} spin size="xl" />
            </Flex>
            }
        </Card>
    )
}