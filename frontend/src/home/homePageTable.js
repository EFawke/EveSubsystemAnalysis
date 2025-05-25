import React from "react";
import { Table, Flex, Card, Heading, Link, Text, Button, DropdownMenu, Tooltip } from "@radix-ui/themes";
import { DoubleArrowUpIcon, DoubleArrowDownIcon, DotsHorizontalIcon, ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons"
import NumericTableCell from "./numericTableCell";

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

    checkInfinity(value) {
        if (value === Infinity || value === -Infinity || value === "Infinity" || value === "-Infinity") {
            return "No Data";
        }
        return value;
    }

    render() {
        const { sortConfig, colorBlindMode } = this.state
        const { data, hub } = this.props;

        let rows = [];

        if (data) {
            rows = data.map((item) => {
                return {
                    type_id: item.type_id,
                    name: item.item_name,
                    buy: Number(item.max_buy),
                    sell: Number(item.min_sell),
                    sellVolume: Number(item.sell_volume),
                    buyVolume: Number(item.buy_volume),
                    losses: Number(item.losses),
                    lossesPercent: Number(item.losses_percent),
                    sellPercentageChange: Number(item.min_sell_percent),
                    buyPercentageChange: Number(item.max_buy_percent),
                    sellVolumePercentageChange: Number(item.sell_volume_percent),
                    buyVolumePercentageChange: Number(item.buy_volume_percent),
                }
            })
        }

        rows = this.sortData(rows);

        const width = window.innerWidth;

        return (
            <Card style={{ width: "100%" }}>
                <Flex justify="between" align="center">
                    <Heading mb="4" mt="4" size="5" weight="medium">{" "}</Heading>
                    <Flex className="mobile_home_navi">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <Button variant="outline">
                                    <DotsHorizontalIcon />
                                </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content sideOffset={5} align="end">
                                <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000002 })}>
                                    <Text size="3">Jita</Text>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000043 })}>
                                    <Text size="3">Amarr</Text>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000032 })}>
                                    <Text size="3">Dodixie</Text>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000042 })}>
                                    <Text size="3">Hek</Text>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onClick={() => this.props.refreshData({ tradeHub: 10000030 })}>
                                    <Text size="3">Rens</Text>
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </Flex>
                    <Flex className="desktop_home_navi" justify="between" gap="2" mb="4" mt="4" mr="4" height="100%" align="center">
                        <Button variant={hub.tradeHub == "10000002" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000002 })}><Text size="3">Jita</Text></Button>
                        <Button variant={hub.tradeHub == "10000043" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000043 })}><Text size="3">Amarr</Text></Button>
                        <Button variant={hub.tradeHub == "10000032" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000032 })}><Text size="3">Dodixie</Text></Button>
                        <Button variant={hub.tradeHub == "10000042" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000042 })}><Text size="3">Hek</Text></Button>
                        <Button variant={hub.tradeHub == "10000030" ? "solid" : "outline"} onClick={() => this.props.refreshData({ tradeHub: 10000030 })}><Text size="3">Rens</Text></Button>
                    </Flex>
                </Flex>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell><Text size="3">Item</Text></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('name')} style={{ whiteSpace: 'nowrap' }}><Text size="3">Name</Text>{this.renderArrow(sortConfig, 'name')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('buy')} style={{ whiteSpace: 'nowrap' }}><Text size="3">Buy Price</Text>{this.renderArrow(sortConfig, 'buy')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('sell')} style={{ whiteSpace: 'nowrap' }}><Text size="3">Sell Price</Text>{this.renderArrow(sortConfig, 'sell')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('buyVolume')} style={{ whiteSpace: 'nowrap' }}><Text size="3">Buy Volume</Text>{this.renderArrow(sortConfig, 'buyVolume')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('sellVolume')} style={{ whiteSpace: 'nowrap' }}><Text size="3">Sell Volume</Text>{this.renderArrow(sortConfig, 'sellVolume')}</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell onClick={() => this.handleSort('losses')} style={{ whiteSpace: 'nowrap' }}><Tooltip content="Number of subsystems destroyed this week"><Text size="3">Recent Losses</Text></Tooltip>{this.renderArrow(sortConfig, 'losses')}</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows.map((row) => (
                            <Table.Row key={row.type_id}>
                                <Table.Cell>
                                    <Flex height="100%" align="center" >
                                        <img src={`https://images.evetech.net/types/${row.type_id}/icon`} alt="Item" style={{ width: "28px", height: "28px" }} />
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex height="100%" align="center" >
                                        <Link size="3" href={`/subsystem/${row.type_id}`} className="product_link">{row.name}</Link>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell >
                                    <NumericTableCell value={row.buy} percentage={row.buyPercentageChange} tipMessage="30 day median delta" colorBlindMode={colorBlindMode} getClassName={this.getClassName} checkInfinity={this.checkInfinity} />
                                </Table.Cell>
                                <Table.Cell>
                                    <NumericTableCell value={row.sell} percentage={row.sellPercentageChange} tipMessage="30 day median delta" colorBlindMode={colorBlindMode} getClassName={this.getClassName} checkInfinity={this.checkInfinity} />
                                </Table.Cell>
                                <Table.Cell>
                                    <NumericTableCell value={row.buyVolume} percentage={row.buyVolumePercentageChange} tipMessage="30 day median delta" colorBlindMode={colorBlindMode} getClassName={this.getClassName} checkInfinity={this.checkInfinity} />
                                </Table.Cell>
                                <Table.Cell >
                                    <NumericTableCell value={row.sellVolume} percentage={row.sellVolumePercentageChange} tipMessage="30 day median delta" colorBlindMode={colorBlindMode} getClassName={this.getClassName} checkInfinity={this.checkInfinity} />
                                </Table.Cell>
                                <Table.Cell>
                                    <NumericTableCell value={row.losses} percentage={row.lossesPercent} tipMessage="Percentage change from last week" colorBlindMode={colorBlindMode} getClassName={this.getClassName} checkInfinity={this.checkInfinity} />
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
