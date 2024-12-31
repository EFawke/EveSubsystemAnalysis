import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import axios from 'axios';
import Header from './header';
import MarketData from './marketData';
import HomePage from './homePage';
import Footer from './footer';
import namesAndIds from './namesAndIds.js';
import Build from './build.js';
import Cookies from 'js-cookie';
import { Theme, ThemePanel, Container, Heading, Button, Flex, Text, Box, HoverCard } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import PageTitle from './PageTitle';
import { useMouseMove, useValue } from "react-ui-animate";
import './App.css';
import About from './about.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            id: window.location.pathname.split('/')[2],
            isLoaded: false,
            pieChart: null,
            subsystem: null,
            marketData: null,
            costData: null,
            darkMode: true,
            colorBlindMode: Cookies.get('colorBlind') === 'true' ? true : false,
            cursorState: { xPos: 0, yPos: 0 },
            backlight: Cookies.get('backlight') === 'true' ? true : false,
            backgroundColors: {
                primary: "rgb(18 39 69)",
                // primary: "blue",
                secondary: "black"
            },
            // description: null,
            materialsLocation: Cookies.get('materialsLocation') != null ? Cookies.get('materialsLocation') : "10000002",
            materialsOrderType: Cookies.get('materialsOrderType') != null ? Cookies.get('materialsOrderType') : "buy",
            subsystemsLocation: Cookies.get('subsystemsLocation') != null ? Cookies.get('subsystemsLocation') : "10000002",
            subsystemsOrderType: Cookies.get('subsystemsOrderType') != null ? Cookies.get('subsystemsOrderType') : "sell",
        };
        this.source = axios.CancelToken.source();
        this.handleMouseMove = this.handleMouseMove.bind(this);
        // this.shakeThingsUp = this.shakeThingsUp.bind(this);
    }

    setMaterialsLocation = (location) => {
        this.setState({ materialsLocation: location });
        Cookies.set('materialsLocation', location);
    }

    setMaterialsOrderType = (orderType) => {
        this.setState({ materialsOrderType: orderType });
        Cookies.set('materialsOrderType', orderType);
    }

    setSubsystemsLocation = (location) => {
        this.setState({ subsystemsLocation: location });
        Cookies.set('subsystemsLocation', location);
    }

    setSubsystemsOrderType = (orderType) => {
        this.setState({ subsystemsOrderType: orderType });
        Cookies.set('subsystemsOrderType', orderType);
    }

    // shakeThingsUp = () => {
    //     const randomColor = () => Math.floor(Math.random() * 256);
    //     const randomRGB = rgb(${randomColor()}, ${randomColor()}, ${randomColor()});
    //     const randomRGB2 = rgb(${randomColor()}, ${randomColor()}, ${randomColor()});
    //     this.setState({ backgroundColors: { primary: randomRGB, secondary: randomRGB2 } });
    // }

    toggleColorBlindMode = () => {
        this.setState({ colorBlindMode: !this.state.colorBlindMode });
        Cookies.set('colorBlind', !this.state.colorBlindMode);
    }

    toggleBackLight = () => {
        Cookies.set('backlight', !this.state.backlight);
        this.setState({ backlight: !this.state.backlight });
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.handleMouseMove);

        this.source = axios.CancelToken.source();
        if (this.state.id !== window.location.pathname.split('/')[2]) {
            this.setState({ isLoaded: false })
        }
        const location = window.location.pathname;
        if (location.includes("/subsystem/")) {
            const itemId = location.split('/')[2];
            const item = namesAndIds.find(x => x.id == itemId);
            if (!item) {
                this.setState({ error: "404" });
            } else {
                this.setState({ id: item.id })
                this.setState({ subsystem: item.name })
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        // existing componentWillUnmount code...
    }

    handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        this.setState({
            cursorState: {
                xPos: clientX,
                yPos: clientY + window.scrollY,
            }
        });
    };

    render() {
        const { darkMode, profit, cursorState, backgroundColors, colorBlindMode, backlight, materialsLocation, materialsOrderType, subsystemsLocation, subsystemsOrderType } = this.state;
        const isValidUrl = (url, array) => {
            const urlParts = url.split('/');
            let id = parseInt(urlParts[urlParts.length - 1], 10);
            if (isNaN(id)) {
                id = parseInt(urlParts[urlParts.length - 2], 10);
            }
            return url.includes('/subsystem/') && array.some(item => item.id === id);
        };
        if (this.state.error) {
            return (
                <div className="wrapper">
                    <Header />
                    <div className="content-page">
                        <div className="content">
                            <div className="container">
                                <div className='row subsystem_title'>
                                    <div className="col-12">
                                        <div className="page-title-box" style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <h4 className="page-title">
                                                {this.state.error}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }
        if (window.location.pathname === "/") {
            return (
                <Theme
                    className="top_container"
                    style={backlight ? { backgroundImage: `radial-gradient(circle at ${cursorState.xPos}px ${cursorState.yPos}px, ${backgroundColors.primary} 0%, ${backgroundColors.secondary} 80%)` } : { backgroundColor: `${backgroundColors.secondary} 90%` }}
                    id="theme_element"
                    scaling="90%"
                    grayColor="mauve"
                    accentColor="teal"
                    panelBackground="translucent"
                    appearance="dark"
                >
                    <Header toggleBackLight={this.toggleBackLight}
                        toggleColorBlindMode={this.toggleColorBlindMode}
                        colorBlindMode={colorBlindMode}
                        backlight={backlight}
                        setMaterialsLocation={this.setMaterialsLocation}
                        setMaterialsOrderType={this.setMaterialsOrderType}
                        setSubsystemsLocation={this.setSubsystemsLocation}
                        setSubsystemsOrderType={this.setSubsystemsOrderType}
                        materialsLocation={materialsLocation}
                        materialsOrderType={materialsOrderType}
                        subsystemsLocation={subsystemsLocation}
                        subsystemsOrderType={subsystemsOrderType}
                    />
                    <Container size="4" mb="9" className="mobile_padding">
                        <PageTitle pageTitle="Dashboard" />
                        <HomePage profit={profit} darkMode={darkMode} colorBlindMode={colorBlindMode} />
                    </Container>
                    <Footer />
                    {/* <ThemePanel /> */}
                </Theme>
            )
        }
        if (window.location.pathname === "/build/" || window.location.pathname === "/build") {
            return (
                <Theme className="top_container" style={backlight ? { backgroundImage: `radial-gradient(circle at ${cursorState.xPos}px ${cursorState.yPos}px, ${backgroundColors.primary} 0%, ${backgroundColors.secondary} 80%)` } : { backgroundColor: `${backgroundColors.secondary} 90%` }} id="theme_element" scaling="90%" grayColor="mauve" accentColor="teal" panelBackground="translucent" appearance="dark">
                    <Header
                        toggleBackLight={this.toggleBackLight} toggleColorBlindMode={this.toggleColorBlindMode} colorBlindMode={colorBlindMode}
                        backlight={backlight}
                        setMaterialsLocation={this.setMaterialsLocation}
                        setMaterialsOrderType={this.setMaterialsOrderType}
                        setSubsystemsLocation={this.setSubsystemsLocation}
                        setSubsystemsOrderType={this.setSubsystemsOrderType}
                        materialsLocation={materialsLocation}
                        materialsOrderType={materialsOrderType}
                        subsystemsLocation={subsystemsLocation}
                        subsystemsOrderType={subsystemsOrderType}
                    />
                    <Container size="4" mb="9" className="mobile_padding">
                        <PageTitle pageTitle="Build tool" />
                        <Build
                            colorBlindMode={colorBlindMode}
                            materialsLocation={materialsLocation}
                            materialsOrderType={materialsOrderType}
                            subsystemsLocation={subsystemsLocation}
                            subsystemsOrderType={subsystemsOrderType}
                        />
                    </Container>
                    <Footer />
                    {/* <ThemePanel /> */}
                </Theme>
            )
        }
        if (isValidUrl(window.location.pathname, namesAndIds)) {
            const name = namesAndIds.find(x => x.id == this.state.id);
            return (
                <Theme
                    style={backlight ? { backgroundImage: `radial-gradient(circle at ${cursorState.xPos}px ${cursorState.yPos}px, ${backgroundColors.primary} 0%, ${backgroundColors.secondary} 80%)` } : { backgroundColor: `${backgroundColors.secondary} 90%` }}

                    id="theme_element"
                    className="top_container"
                    scaling="90%"
                    grayColor="mauve"
                    accentColor="teal"
                    panelBackground="translucent"
                    appearance="dark">
                    <Header
                        toggleBackLight={this.toggleBackLight}
                        toggleColorBlindMode={this.toggleColorBlindMode}
                        colorBlindMode={colorBlindMode}
                        backlight={backlight}
                        setMaterialsLocation={this.setMaterialsLocation}
                        setMaterialsOrderType={this.setMaterialsOrderType}
                        setSubsystemsLocation={this.setSubsystemsLocation}
                        setSubsystemsOrderType={this.setSubsystemsOrderType}
                        materialsLocation={materialsLocation}
                        materialsOrderType={materialsOrderType}
                        subsystemsLocation={subsystemsLocation}
                        subsystemsOrderType={subsystemsOrderType}
                    />
                    <Container size="4" mb="9" className="mobile_padding">
                        {/* <PageTitle pageTitle={name.name} /> */}
                        <PageTitle pageTitle="Interactive Chart"></PageTitle>
                        <Heading weight="light" color="gray" mb="7" mt="-5" size="4">{name.name}</Heading>
                        <MarketData
                            name={name.name}
                            id={this.state.id}
                            darkMode={darkMode}
                            materialsLocation={materialsLocation}
                            materialsOrderType={materialsOrderType}
                            subsystemsLocation={subsystemsLocation}
                            subsystemsOrderType={subsystemsOrderType}
                            colorBlindMode={colorBlindMode}
                        />
                    </Container>
                    <Footer />
                    {/* <ThemePanel /> */}
                </Theme>
            )
        }
        if (window.location.pathname === "/about/" || window.location.pathname === "/about") {
            return (
                <Theme className="top_container" style={backlight ? { backgroundImage: `radial-gradient(circle at ${cursorState.xPos}px ${cursorState.yPos}px, ${backgroundColors.primary} 0%, ${backgroundColors.secondary} 80%)` } : { backgroundColor: `${backgroundColors.secondary} 90%` }} id="theme_element" scaling="90%" grayColor="mauve" accentColor="teal" panelBackground="translucent" appearance="dark">
                    <Header
                        toggleBackLight={this.toggleBackLight} toggleColorBlindMode={this.toggleColorBlindMode} colorBlindMode={colorBlindMode}
                        backlight={backlight}
                        setMaterialsLocation={this.setMaterialsLocation}
                        setMaterialsOrderType={this.setMaterialsOrderType}
                        setSubsystemsLocation={this.setSubsystemsLocation}
                        setSubsystemsOrderType={this.setSubsystemsOrderType}
                        materialsLocation={materialsLocation}
                        materialsOrderType={materialsOrderType}
                        subsystemsLocation={subsystemsLocation}
                        subsystemsOrderType={subsystemsOrderType}
                    />
                    <Container size="4" mb="9" className="mobile_padding">
                        <PageTitle pageTitle="What's this?" />
                        <About
                            colorBlindMode={colorBlindMode}
                        />
                    </Container>
                    {/* <ThemePanel /> */}
                    <Footer />
                </Theme>
            )


        }
    }
}

export default App;