import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from 'react-bootstrap/Button';
import { faSun } from '@fortawesome/free-solid-svg-icons'
import { faHammer } from '@fortawesome/free-solid-svg-icons'
import FreeSolo from './searchbox.js';
import { Flex } from "antd";

class Header extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            search: ''
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ search: event.target.value });
    }

    render() {
        const search = this.state.search;

        return (
            <nav className="navbar sticky-top navbar-dark bg-dark">
                <div id = "header_main" className="container d-flex justify-content-between">
                    <a className="navbar-brand" href="/">Eve Subsystem Analysis <small className="text-muted">(2.0)</small></a>
                    <div className="d-flex align-items-center">
                        <a variant="dark" className="me-2 btn btn-dark" href = "/build/">
                            <FontAwesomeIcon icon={faHammer} />
                        </a>
                        <Button variant="dark" className="me-2" onClick={this.props.toggleTheme}>
                            <FontAwesomeIcon icon={faSun} onClick = {this.props.toggleTheme}/>
                        </Button>
                        <FreeSolo />
                    </div>
                </div>
            </nav>
        )
    }
}

export default Header;
