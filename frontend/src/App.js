import React from 'react';
import axios from 'axios';
import Header from './layout/header.js';
import MarketData from './analysisPage/marketData.js';
import HomePage from './home/homePage.js';
import Footer from './layout/footer.js';
import namesAndIds from './namesAndIds.js';
import Build from './buildPage/build.js';
import Cookies from 'js-cookie';
import { Theme, Container, Heading, Flex } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import PageTitle from './layout/PageTitle.js';
import './css/App.css';
import About from './about/about.js';
import weeb from './weeb.jpeg';
import ReactGA from "react-ga4";

const TRACKING_ID = process.env.NODE_ENV === "production" ? process.env.REACT_APP_TRACKING_ID : null;

class App extends React.Component {
    constructor(props) {
        super(props);
        const buildSettings = Cookies.get('buildSettings') ? JSON.parse(Cookies.get('buildSettings')) : {};
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
                primary: "rgba(29, 78, 216, 0.15)",
                secondary: "var(--color-background);"
            },
            subsystemsOrderType: buildSettings.subsystemsOrderType || 'sell',
            subsystemsLocation: buildSettings.subsystemsLocation || '10000002',
            materialsOrderType: buildSettings.materialsOrderType || 'buy',
            materialsLocation: buildSettings.materialsLocation || '10000002',
        };
        this.source = axios.CancelToken.source();
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    setMaterialsLocation = (location) => {
        this.setState({ materialsLocation: location }, () => {
            Cookies.set('materialsLocation', location);

            const buildSettings = Cookies.get('buildSettings');
            const parsed = buildSettings ? JSON.parse(buildSettings) : {};
            parsed.materialsLocation = location;
            Cookies.set('buildSettings', JSON.stringify(parsed), { expires: 365 * 100 });
        });
    }

    setMaterialsOrderType = (type) => {
        this.setState({ materialsOrderType: type }, () => {
            Cookies.set('materialsOrderType', type);

            const buildSettings = Cookies.get('buildSettings');
            const parsed = buildSettings ? JSON.parse(buildSettings) : {};
            parsed.materialsOrderType = type;
            Cookies.set('buildSettings', JSON.stringify(parsed), { expires: 365 * 100 });
        });
    }

    setSubsystemsLocation = (location) => {
        this.setState({ subsystemsLocation: location }, () => {
            const buildSettings = Cookies.get('buildSettings');
            const parsed = buildSettings ? JSON.parse(buildSettings) : {};
            parsed.subsystemsLocation = location;
            Cookies.set('buildSettings', JSON.stringify(parsed), { expires: 365 * 100 });
        });
    }

    setSubsystemsOrderType = (type) => {
        this.setState({ subsystemsOrderType: type }, () => {
            const buildSettings = Cookies.get('buildSettings');
            const parsed = buildSettings ? JSON.parse(buildSettings) : {};
            parsed.subsystemsOrderType = type;
            Cookies.set('buildSettings', JSON.stringify(parsed), { expires: 365 * 100 });
        });
    }

    toggleColorBlindMode = () => {
        this.setState({ colorBlindMode: !this.state.colorBlindMode });
        Cookies.set('colorBlind', !this.state.colorBlindMode);
    }

    toggleBackLight = () => {
        Cookies.set('backlight', !this.state.backlight);
        this.setState({ backlight: !this.state.backlight });
    }

    trackPageView = () => {
        ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    };

    componentDidMount() {
        if (TRACKING_ID) {
            ReactGA.initialize(TRACKING_ID);
            this.trackPageView();
        }

        window.addEventListener('mousemove', this.handleMouseMove);

        window.addEventListener("popstate", this.trackPageView);

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
        // window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener("popstate", this.trackPageView);
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
        const name = namesAndIds.find(x => x.id == this.state.id);
        const page = window.location.pathname;
        return (
            <Theme
                className="top_container"
                style={{ background: 'var(--color-background)' }}
                id="theme_element"
                scaling="90%"
                grayColor="mauve"
                accentColor="teal"
                panelBackground="translucent"
                appearance="dark"
            >
                <div
                    style={backlight ? { background: `radial-gradient(600px at ${cursorState.xPos}px ${cursorState.yPos}px, rgb(18, 39, 69), var(--color-background) 80%)` } : { background: 'var(--color-background)' }}
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
                        location={page}
                    />
                    {
                        page == "/" ? (
                            <Container size="4" mb="9" className="mobile_padding">
                                <PageTitle pageTitle="Suggested subsystems" />
                                <Heading weight="light" color="gray" mb="8" mt="-2" size="4">The most used subsystems ordered by price</Heading>
                                <HomePage profit={profit} darkMode={darkMode} colorBlindMode={colorBlindMode} />
                            </Container>
                        )
                            :
                            this.state.error ? (
                                <Container size="4" mb="9" className="mobile_padding">
                                    <PageTitle pageTitle="Page not found" />
                                    <Flex direction="column" mt="5" mb="5" width="100%">
                                        <img src={weeb} alt="weeb" />
                                    </Flex>
                                </Container>
                            )
                                :
                                page == "/build" || page == "/build/" ? (
                                    <Container size="4" mb="9" className="mobile_padding">
                                        <PageTitle pageTitle="Manufacturing tool" />
                                        <Heading weight="light" color="gray" mb="8" mt="-2" size="4">Build settings and material calculator</Heading>
                                        <Build
                                            colorBlindMode={colorBlindMode}
                                            materialsLocation={materialsLocation}
                                            materialsOrderType={materialsOrderType}
                                            subsystemsLocation={subsystemsLocation}
                                            subsystemsOrderType={subsystemsOrderType}
                                        />
                                    </Container>
                                )
                                    :
                                    page == "/about/" || page == "/about" ? (
                                        <Container size="4" mb="9" className="mobile_padding">
                                            <PageTitle pageTitle="What's this?" />
                                            <About
                                                colorBlindMode={colorBlindMode}
                                            />
                                        </Container>
                                    )
                                        :
                                        isValidUrl(window.location.pathname, namesAndIds) && name ? (
                                            <Container size="4" mb="9" className="mobile_padding interactive_chart_container">
                                                <PageTitle pageTitle="Interactive chart"></PageTitle>
                                                <Heading weight="light" color="gray" mb="6" mt="-2" size="4">{name.name}</Heading>
                                                <MarketData
                                                    name={name.name}
                                                    id={this.state.id}
                                                    darkMode={darkMode}
                                                    setMaterialsLocation={this.setMaterialsLocation}
                                                    setMaterialsOrderType={this.setMaterialsOrderType}
                                                    setSubsystemsLocation={this.setSubsystemsLocation}
                                                    setSubsystemsOrderType={this.setSubsystemsOrderType}
                                                    materialsLocation={materialsLocation}
                                                    materialsOrderType={materialsOrderType}
                                                    subsystemsLocation={subsystemsLocation}
                                                    subsystemsOrderType={subsystemsOrderType}
                                                    colorBlindMode={colorBlindMode}
                                                />
                                            </Container>
                                        ) :
                                            (
                                                <Container size="4" mb="9" className="mobile_padding">
                                                    <PageTitle pageTitle="Page not found" />
                                                    <Flex direction="column" mt="5" mb="5" width="100%">
                                                        <img src={weeb} alt="weeb" />
                                                    </Flex>
                                                </Container>
                                            )
                    }

                    <Footer />
                </div>
            </Theme>
        )
    }
}

export default App;