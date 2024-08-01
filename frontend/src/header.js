import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { faSun } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { faHammer } from '@fortawesome/free-solid-svg-icons'
import SearchDropDown from './searchDropDown.js';
import FreeSolo from './searchbox.js';
// import TextField from '@mui/material/TextField';
// import Stack from '@mui/material/Stack';
// import Autocomplete from '@mui/material/Autocomplete';


class Header extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            search: ''
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        console.log(event.target.value);
        this.setState({ search: event.target.value });
    }

    render() {
        const search = this.state.search;

        return (
            <nav className="navbar sticky-top navbar-dark bg-dark bg-body-tertiary">
                <div className="container d-flex justify-content-between">
                    <a className="navbar-brand" href="/">Eve Subsystem Analysis <small className="text-muted">(2.0)</small></a>
                    <div className="d-flex align-items-center">
                        <a variant="dark" className="me-2 btn btn-dark" href = "/build/">
                            <FontAwesomeIcon icon={faHammer} />
                        </a>
                        <Button variant="dark" className="me-2" onClick={this.props.toggleTheme}>
                            <FontAwesomeIcon icon={faSun} onClick = {this.props.toggleTheme}/>
                        </Button>
                        {/* <Button variant="dark" className="me-2">
                            <FontAwesomeIcon icon={faGear} />
                        </Button> */}
                        <FreeSolo />
                        {/* <form className="d-flex" role="search">
                            <div className="search-container position-relative">
                                <input className="form-control" type="search" placeholder="Search" aria-label="Search" onChange={this.handleChange} />
                                <FontAwesomeIcon icon={faSearch} className="search-icon position-absolute" />
                                { !search ? null : <SearchDropDown search = {search} /> }
                            </div>
                        </form> */}
                    </div>
                </div>
            </nav>
        )
    }
}

export default Header;


// import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSearch, faSun, faGear, faHammer } from '@fortawesome/free-solid-svg-icons';
// import Button from 'react-bootstrap/Button';
// import SearchDropDown from './searchDropDown.js';

// class Header extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             search: ''
//         };
//         this.handleChange = this.handleChange.bind(this);
//     }

//     handleChange(event) {
//         this.setState({ search: event.target.value });
//     }

//     render() {
//         const search = this.state.search;

//         return (
//             <nav className="navbar sticky-top navbar-dark bg-dark bg-body-tertiary">
//                 <div className="container d-flex justify-content-between">
//                     <a className="navbar-brand" href="/">Eve Subsystem Analysis</a>
//                     <div className="d-flex align-items-center">
//                         <Button variant="dark" className="me-2" onClick={this.props.toggleTheme}>
//                             <FontAwesomeIcon icon={faHammer} />
//                         </Button>
//                         <Button variant="dark" className="me-2" onClick={this.props.toggleTheme}>
//                             <FontAwesomeIcon icon={faSun} />
//                         </Button>
//                         <Button variant="dark" className="me-2" onClick={this.props.toggleTheme}>
//                             <FontAwesomeIcon icon={faGear} />
//                         </Button>
//                         <form className="d-flex" role="search">
//                             <div className="search-container position-relative">
//                                 <input
//                                     className="form-control"
//                                     type="search"
//                                     placeholder="Search"
//                                     aria-label="Search"
//                                     onChange={this.handleChange}
//                                     onKeyDown={this.handleKeyDown}
//                                 />
//                                 <FontAwesomeIcon icon={faSearch} className="search-icon position-absolute" />
//                                 {search && <SearchDropDown search={search} />}
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </nav>
//         );
//     }
// }

// export default Header;
