import React from 'react';
import { Flex, Link, Heading, Text, IconButton, Container, Separator, Switch, Select, Tooltip } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons";
import SearchBox from './searchbox.js';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSidebarOpen: false,
            colorBlindMode: this.props.colorBlindMode,
            backlight: this.props.backlight,
            materialsLocation: this.props.materialsLocation,
            materialsOrderType: this.props.materialsOrderType,
            subsystemsLocation: this.props.subsystemsLocation,
            subsystemsOrderType: this.props.subsystemsOrderType,
        };

        this.headerIconRef = React.createRef();
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.closeSidebar = this.closeSidebar.bind(this);
    }

    toggleSidebar() {
        this.setState((prevState) => ({
            isSidebarOpen: !prevState.isSidebarOpen
        }));
    }

    closeSidebar() {
        this.setState({ isSidebarOpen: false });
    }

    componentDidUpdate(prevProps) {
        if (this.props.colorBlindMode !== prevProps.colorBlindMode) {
            this.setState({
                colorBlindMode: this.props.colorBlindMode
            });
        }
        if (this.props.backlight !== prevProps.backlight) {
            this.setState({
                backlight: this.props.backlight
            });
        }
        if (this.props.materialsLocation !== prevProps.materialsLocation) {
            this.setState({
                materialsLocation: this.props.materialsLocation
            });
        }
        if (this.props.materialsOrderType !== prevProps.materialsOrderType) {
            this.setState({
                materialsOrderType: this.props.materialsOrderType
            });
        }
        if (this.props.subsystemsLocation !== prevProps.subsystemsLocation) {
            this.setState({
                subsystemsLocation: this.props.subsystemsLocation
            });
        }
        if (this.props.subsystemsOrderType !== prevProps.subsystemsOrderType) {
            this.setState({
                subsystemsOrderType: this.props.subsystemsOrderType
            });
        }
    }

    renderSidebar() {
        let iconTop = 0;
        let iconPosition = { top: 0, left: window.innerWidth };
        if (this.headerIconRef.current) {
            iconPosition = this.headerIconRef.current.getBoundingClientRect();
            iconTop = this.headerIconRef.current.offsetTop;
        }

        const sidebarWidth = window.innerWidth < 1111 ? window.innerWidth : window.innerWidth - iconPosition.left + 20;

        return (
            <>
                <Flex
                    className={`sidebar ${this.state.isSidebarOpen ? 'open' : 'close'}`}
                    direction="column"
                    gap="4"
                    align="start"
                    style={{
                        opacity: "95%",
                        zIndex: 10,
                        width: `${sidebarWidth}px`,
                        height: "100%",
                        backgroundColor: "var(--mauve-2)",
                        paddingLeft: "25px",
                        paddingRight: "25px",
                        position: "fixed",
                        top: 0,
                        right: 0,
                        transition: "transform 0.2s ease-in-out"
                    }}
                >
                    <IconButton
                        className="icon"
                        align="center"
                        variant="ghost"
                        onClick={this.toggleSidebar}
                        style={{
                            marginTop: `${iconTop}px`,
                            marginBottom: "20px",
                        }}
                    >
                        <GearIcon width="20" height="20" />
                    </IconButton>
                    <Text size="4" weight="bold" style={{ textDecoration: "underline" }}>Navigation</Text>
                    <Link href="/"><Text size="3">Home</Text></Link>
                    <Link href="/build"><Text size="3">Build</Text></Link>
                    <Link href="/about"><Text size="3">About</Text></Link>
                    <Separator my="3" size="4" />
                    <Text size="4" weight="bold" style={{ textDecoration: "underline" }}>Appearance</Text>
                    <Flex gap="4" align="center" justify="center">
                        <Tooltip content="If you struggle with greens and reds">
                            <Text size="3" style={{ color: "var(--accent-a11)" }}>Color blind mode</Text>
                        </Tooltip>
                        <Switch onCheckedChange={this.props.toggleColorBlindMode} checked={this.state.colorBlindMode} />
                    </Flex>
                    <Flex gap="4" align="center" justify="center">
                        <Text size="3" style={{ color: "var(--accent-a11)" }}>Toggle backlight</Text>
                        <Switch onCheckedChange={this.props.toggleBackLight} checked={this.state.backlight} />
                    </Flex>
                    <Separator my="3" size="4" />
                    <Text size="4" weight="bold" style={{ textDecoration: "underline" }}>Market</Text>
                    <Flex gap="4" align="center" justify="center">
                        <Text style={{ color: "var(--accent-a11)" }}>Materials</Text>
                        <Select.Root defaultValue={this.state.materialsLocation} onValueChange={this.props.setMaterialsLocation}>
                            <Select.Trigger />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Trade hub</Select.Label>
                                    <Select.Item value="10000002">Jita</Select.Item>
                                    <Select.Item value="10000043">Amarr</Select.Item>
                                    <Select.Item value="10000030">Rens</Select.Item>
                                    <Select.Item value="10000042">Hek</Select.Item>
                                    <Select.Item value="10000032">Dodixie</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                        <Select.Root defaultValue={this.state.materialsOrderType} onValueChange={this.props.setMaterialsOrderType}>
                            <Select.Trigger />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Order Type</Select.Label>
                                    <Select.Item value="buy">Buy</Select.Item>
                                    <Select.Item value="sell">Sell</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    </Flex>
                    <Flex gap="4" align="center" justify="center">
                        <Text style={{ color: "var(--accent-a11)" }}>Subsystems</Text>
                        <Select.Root defaultValue={this.state.subsystemsLocation} onValueChange={this.props.setSubsystemsLocation}>
                            <Select.Trigger />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Trade hub</Select.Label>
                                    <Select.Item value="10000002">Jita</Select.Item>
                                    <Select.Item value="10000043">Amarr</Select.Item>
                                    <Select.Item value="10000030">Rens</Select.Item>
                                    <Select.Item value="10000042">Hek</Select.Item>
                                    <Select.Item value="10000032">Dodixie</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                        <Select.Root defaultValue={this.state.subsystemsOrderType} onValueChange={this.props.setSubsystemsOrderType}>
                            <Select.Trigger />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Order Type</Select.Label>
                                    <Select.Item value="buy">Buy</Select.Item>
                                    <Select.Item value="sell">Sell</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    </Flex>
                </Flex>

                {/* Overlay */}
                {this.state.isSidebarOpen && (
                    <div
                        id="sidebar-overlay"
                        onClick={this.closeSidebar}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay
                            zIndex: 5,
                        }}
                    ></div>
                )}
            </>
        );
    }

    render() {
        console.log(this.props)
        return (
            <>
                {this.renderSidebar()}
                <Container className="mobile_padding" size="4" style={{ background: "var(--gray-a2)", borderRadius: "var(--radius-3)", position: "relative", zIndex: 1 }}>
                    <Flex mt="4" mb="4" width="100%" justify="between" align="center">
                        <Flex gap="1" align="start" direction="column">
                            <Link href="/" style={{ textDecoration: "none" }}>
                                <Flex gap="1" align="center">
                                    <Heading mb="0">Eve Subsystem Analysis</Heading>
                                    <Heading style={{ color: "white" }} mb="0">(2.1)</Heading>
                                </Flex>
                            </Link>
                            <Text size="2" style={{ color: "var(--gray-9)" }}>
                                Video game widget production optimizer.
                            </Text>
                        </Flex>
                        <Flex gap="4" align="center" direction="row" justify={"end"}>
                            <IconButton
                                ref={this.headerIconRef}
                                id="header_icon"
                                className="icon"
                                align="center"
                                variant="ghost"
                                onClick={this.toggleSidebar}
                            >
                                <GearIcon width="20" height="20" />
                            </IconButton>
                            <SearchBox />
                        </Flex>
                    </Flex>
                </Container>
            </>
        );
    }
}

export default Header;
