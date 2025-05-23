import { useState, useEffect } from 'react';
import { Table, Flex, Card, Heading, Link, Text, Button, DropdownMenu, Tooltip, Badge } from "@radix-ui/themes";
import { DoubleArrowUpIcon, DoubleArrowDownIcon, DotsHorizontalIcon, ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"

export default function NumericTableCell(props) {
    const [value, setValue] = useState(() => {
        return props.checkInfinity(props.value);
    });
    const [percentage, setPercentage] = useState(props.percentage);
    const [tipMessage, setTipMessage] = useState(props.tipMessage);
    const [colorBlindMode, setColorBlindMode] = useState(props.colorBlindMode);

    useEffect(() => {
        setValue(() => {
            return props.checkInfinity(props.value);
        });
        setPercentage(props.percentage);
        setTipMessage(props.tipMessage);
        setColorBlindMode(props.colorBlindMode);
    }, [props.value, props.percentage, props.tipMessage, props.colorBlindMode]);

    return (
        <Flex height="100%" gap="2" align="center">
            {value == "No Data" ? null :
                <Tooltip content={tipMessage}>
                    <Flex direction="column" justify="center" width="fit-content" align="center" className={props.getClassName(percentage, colorBlindMode)}>
                        {percentage >= 0 ? <DoubleArrowUpIcon height="15px" width="15px" /> : <DoubleArrowDownIcon height="15px" width="15px" />}
                        <Text size="1">{percentage}%</Text>
                    </Flex>
                </Tooltip>
            }
            {
                value == "No Data" ?
                    <Badge variant="outline" color="orange" size="3">{value}</Badge> :
                    <Text size="3">
                        {Number(value).toLocaleString()}
                    </Text>
            }
        </Flex>
    )
}