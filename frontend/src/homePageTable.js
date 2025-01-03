import React from "react";
import { Table, Flex, Card, Heading, Link, Text, Button, DropdownMenu } from "@radix-ui/themes";
import { DoubleArrowUpIcon, DoubleArrowDownIcon, DotsHorizontalIcon, ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"

class HomePageTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            isLoaded: false,
            table: null,
            darkMode: false,
            colorBlindMode: this.props.colorBlindMode,
            sortConfig: { key: null, direction: 'ascending' },
            showOptionsDialog: false,
        }
        this.toggleMobileMarketMenu = this.toggleMobileMarketMenu.bind(this);
        this.renderArrow = this.renderArrow.bind(this);
        this.getClassName = this.getClassName.bind(this);
    }

    componentDidMount() {
        this.setState({ table: this.props.table });
        this.setState({ darkMode: this.props.darkMode });
    }

    componentDidUpdate(prevProps) {
        if (this.props.table !== prevProps.table) {
            this.setState({ table: this.props.table });
        }
        if (this.props.darkMode !== prevProps.darkMode) {
            this.setState({ darkMode: this.props.darkMode })
        }
        if (this.props.isLoaded !== prevProps.isLoaded) {
            this.setState({ isLoaded: this.props.isLoaded })
        }
        if (this.props.colorBlindMode !== prevProps.colorBlindMode) {
            this.setState({ colorBlindMode: this.props.colorBlindMode });
        }
    }

    renderArrow = (sortConfig, key) => {
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                return <ArrowDownIcon height="15px" width="15px" />
            } else {
                return <ArrowUpIcon height="15px" width="15px" />
            }
        } else {
            return null;
        }
    }

    handleSort = (key) => {
        let direction = 'descending';
        if (this.state.sortConfig.key === key && this.state.sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        this.setState({ sortConfig: { key, direction } });
    }

    sortData = (data) => {
        const { key, direction } = this.state.sortConfig;
        if (!key) return data;

        return [...data].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    toggleMobileMarketMenu = () => {
        this.setState({
            showOptionsDialog: !this.state.showOptionsDialog
        });
    }

    getClassName = (value, colorBlindMode) => {
        if (value >= 0 && !colorBlindMode) {
            return "success";
        }
        if (value < 0 && !colorBlindMode) {
            return "danger";
        }
        if (value >= 0 && colorBlindMode) {
            return "success colorBlind";
        }
        if (value < 0 && colorBlindMode) {
            return "danger colorBlind";
        }
    }

    render() {
        const { sortConfig, colorBlindMode } = this.state
        const { data, hub } = this.props;

        let rows = [];

        if (data) {
            rows = data.map((item) => {
                return {
                    type_id: item.type_id,
                    name: item.type_name,
                    buy: Number(item.buy),
                    sell: Number(item.sell),
                    volRatio: Number(item.volRatio),
                    sellVolume: Number(item.sellVolume),
                    buyVolume: Number(item.buyVolume),
                    losses: Number(item.losses),
                    sellPercentageChange: Number(item.sellPercentageChange).toFixed(1),
                    buyPercentageChange: Number(item.buyPercentageChange).toFixed(1),
                    sellVolumePercentageChange: Number(item.sellVolumePercentageChange).toFixed(1),
                    buyVolumePercentageChange: Number(item.buyVolumePercentageChange).toFixed(1),
                }
            })
        }

        rows = this.sortData(rows);

        const width = window.innerWidth;

        return (
            <Card style={{ width: "100%" }}>
                <Flex justify="between" align="center">
                    <Heading mb="4" mt="4" size="5" style={{ color: "#ffffffc4" }}>Suggested Subsystems</Heading>
                    {
                        width < 740
                            ? (
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                        <Button variant="outline">
                                            <DotsHorizontalIcon />
                                        </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content sideOffset={5} align="end">
                                        <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000002 })}>
                                            Jita
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000043 })}>
                                            Amarr
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000032 })}>
                                            Dodixie
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000042 })}>
                                            Hek
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000030 })}>
                                            Rens
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            )
                            : (
                                <Flex justify="between" gap="2" height="100%" align="center">
                                    <Button variant={hub.tradeHub == "10000002" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000002 })}>Jita</Button>
                                    <Button variant={hub.tradeHub == "10000043" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000043 })}>Amarr</Button>
                                    <Button variant={hub.tradeHub == "10000032" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000032 })}>Dodixie</Button>
                                    <Button variant={hub.tradeHub == "10000042" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000042 })}>Hek</Button>
                                    <Button variant={hub.tradeHub == "10000030" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000030 })}>Rens</Button>
                                </Flex>
                            )
                    }
                </Flex>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Item</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('name')}>Name {this.renderArrow(sortConfig, 'name')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('buy')}>Buy {this.renderArrow(sortConfig, 'buy')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('sell')}>Sell {this.renderArrow(sortConfig, 'sell')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('buyVolume')}>Buy Volume {this.renderArrow(sortConfig, 'buyVolume')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('sellVolume')}>Sell Volume {this.renderArrow(sortConfig, 'sellVolume')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('losses')}>Losses {this.renderArrow(sortConfig, 'losses')}</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows.map((row) => (
                            <Table.Row key={row.type_id}>
                                <Table.Cell>
                                    <Flex height="100%" align="center" >
                                        <img src={`https://images.evetech.net/types/${row.type_id}/icon`} alt="Item" style={{ width: "25px", height: "25px" }} />
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center" >
                                        <Link href={`/subsystem/${row.type_id}`} className="product_link">{row.name}</Link>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell >
                                    <Flex height="100%" gap="2" align="center" >
                                        <Flex direction="column" justify="center" width="fit-content" align="center" className={this.getClassName(row.buyPercentageChange, colorBlindMode)}>
                                            {row.buyPercentageChange >= 0 ? <DoubleArrowUpIcon height="15px" width="15px" /> : <DoubleArrowDownIcon height="15px" width="15px" />}
                                            <Text size="1">{row.buyPercentageChange}%</Text>
                                        </Flex>
                                        <Text>
                                            {Number(row.buy).toLocaleString()}
                                        </Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" gap="2" align="center" >
                                        <Flex direction="column" justify="center" width="fit-content" align="center" className={this.getClassName(row.sellPercentageChange, colorBlindMode)}>
                                            {row.sellPercentageChange >= 0 ? <DoubleArrowUpIcon height="15px" width="15px" /> : <DoubleArrowDownIcon height="15px" width="15px" />}
                                            <Text size="1">{row.sellPercentageChange}%</Text>
                                        </Flex>
                                        <Text>
                                            {Number(row.sell).toLocaleString()}
                                        </Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" gap="2" align="center" >
                                        <Flex direction="column" justify="center" width="fit-content" align="center" className={this.getClassName(row.buyVolumePercentageChange, colorBlindMode)}>
                                            {row.buyVolumePercentageChange >= 0 ? <DoubleArrowUpIcon height="15px" width="15px" /> : <DoubleArrowDownIcon height="15px" width="15px" />}
                                            <Text size="1">{row.buyVolumePercentageChange}%</Text>
                                        </Flex>
                                        <Text>
                                            {Number(row.buyVolume).toLocaleString()}
                                        </Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell >
                                    <Flex height="100%" gap="2" align="center" >
                                        <Flex direction="column" justify="center" width="fit-content" align="center" className={this.getClassName(row.sellVolumePercentageChange, colorBlindMode)}>
                                            {row.sellVolumePercentageChange >= 0 ? <DoubleArrowUpIcon height="15px" width="15px" /> : <DoubleArrowDownIcon height="15px" width="15px" />}
                                            <Text size="1">{row.sellVolumePercentageChange}%</Text>
                                        </Flex>
                                        <Text>
                                            {Number(row.sellVolume).toLocaleString()}
                                        </Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center" >
                                        <Text>{Number(row.losses).toLocaleString()}</Text>
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Card>
        );
    }
}

export default HomePageTable;
