import './App.css';
import React from 'react';
import axios from 'axios';
import Header from './header';
import MarketData from './marketData';
import HomePage from './homePage';
import Footer from './footer';
import ApexGraph from './marketGraph.js';
import namesAndIds from './namesAndIds.js';

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
            darkMode: false,
        };
        this.source = axios.CancelToken.source();
        this.toggleDarkMode = this.toggleDarkMode.bind(this);
    }

    toggleDarkMode = () => {
        this.setState({ darkMode: !this.state.darkMode });
    }

    componentDidMount() {
        this.source = axios.CancelToken.source();
        if(this.state.id !== window.location.pathname.split('/')[2]){
            this.setState({isLoaded: false})
        }
        const location = window.location.pathname
        if (location === "/") {
            axios.get(`/api/home`)
                .then(response => {
                    this.setState({ profit: response.data.profit })
                    this.setState({ jitaRank: response.data.recommendedRank.jitaRank })
                    this.setState({ amarrRank: response.data.recommendedRank.amarrRank })
                })
                .catch(err => {
                    console.log(err);
                })
                .then(() => {
                    this.setState({ isLoaded: true })
                })
        }
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
        console.log(this.state);
    }

    render() {
        const { darkMode, profit, jitaRank, amarrRank } = this.state;
        const isValidUrl = (url, array) => {
            console.log(url)
            const urlParts = url.split('/');
            const id = parseInt(urlParts[urlParts.length - 1], 10);
        
            return url.includes('/subsystem/') && array.some(item => item.id === id);
        };
        // console.log(this.state.id)
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
                <div className={darkMode ? "wrapper bg-dark text-white" : "wrapper"}>
                    <Header toggleTheme = {this.toggleDarkMode}/>
                    <div className={!darkMode ? "content-page" : "content-page bg-dark text-white"}>
                        <div className="content">
                            <div className="container">
                                <HomePage profit={profit} jitaRank={jitaRank} amarrRank={amarrRank} darkMode={darkMode}/>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }

        if (isValidUrl(window.location.pathname, namesAndIds)) {
            const name = namesAndIds.find(x => x.id == window.location.pathname.split('/')[2]);
            return (
                <div className= {darkMode ? "wrapper bg-dark text-white" : "wrapper"}>
                    <Header toggleTheme = {this.toggleDarkMode}/>
                    <div className={!darkMode ? "content-page" : "content-page bg-dark text-white"}>
                        <div className="content">
                            <div className="container">
                                <div className={!darkMode ? "row subsystem_title" : "row bg-dark text-white subsystem_title"}>
                                    <div className="col-12">
                                        <div className="page-title-box">
                                            <h1 className={!darkMode ? "page-title" : "page-title bg-dark text-white"}>
                                                {name.name}
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                                <MarketData
                                    id={this.state.id}
                                    darkMode={darkMode}
                                />
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default App;