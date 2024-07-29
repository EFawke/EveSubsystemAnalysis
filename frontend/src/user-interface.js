import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faSearch } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import SubsystemsTable from './subsystemsTable'

class Settings extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className='user_interface'>
                <button className={this.state.mode + " header_button"} onClick={this.handleClick}><FontAwesomeIcon className={this.state.mode} icon={faGear} /></button>
                <div className={this.state.hasBeenClicked + " selector_container " + this.state.mode}>
                    <h1 className='sub_list_header table_header'>Subsystems List</h1>
                    <SubsystemsTable mode={this.state.mode} />
                    <h1 className='table_header table_settings'>Settings</h1>
                    <div className="display_option">
                        <div className="setting_column">
                            <h2 className="setting_header">Use Case:</h2>
                            <h3 className="setting_description">(Used in tailoring your market analysis)</h3>
                            <div className="radio_div">
                                <label>
                                    <input
                                        type="radio"
                                        value="industrialist"
                                        checked={this.state.profession === 'industrialist'}
                                        onChange={this.changeProfession}
                                    />
                                    Industrialist
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="marketeer"
                                        checked={this.state.profession === 'marketeer'}
                                        onChange={this.changeProfession}
                                    />
                                    Marketeer
                                </label>
                            </div>
                        </div>
                        <div className="setting_column">
                            <h2 className="setting_header">Color Scheme:</h2>
                            <h3 className="setting_description">(Dark mode is recommended)</h3>
                            <div className="radio_div">
                                <label>
                                    <input
                                        type="radio"
                                        value="dark"
                                        checked={this.state.mode === 'dark'}
                                        onChange={this.changeMode}
                                    />
                                    Dark Mode
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="light"
                                        checked={this.state.mode === 'light'}
                                        onChange={this.changeMode}
                                    />
                                    Light Mode
                                </label>
                            </div>
                        </div>
                        <div className="setting_column">
                            <h2 className="setting_header">Market Hub:</h2>
                            <h3 className="setting_description">(Where you do most of your trading)</h3>
                            <div className="radio_div">
                                <label>
                                    <input
                                        type="radio"
                                        value="jita"
                                        checked={this.state.hub === 'jita'}
                                        onChange={this.changeHub}
                                    />
                                    Jita
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="amarr"
                                        checked={this.state.hub === 'amarr'}
                                        onChange={this.changeHub}
                                    />
                                    Amarr
                                </label>
                            </div>
                        </div>
                        <div className="setting_column">
                            <h2 className="setting_header">Data View:</h2>
                            <h3 className="setting_description">(Changes the graphs that are displayed)</h3>
                            <div className="radio_div">
                                <label>
                                    <input
                                        type="radio"
                                        value="demand"
                                        checked={this.state.view === 'demand'}
                                        onChange={this.changeView}
                                    />
                                    Number Destroyed
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="marketeer"
                                        checked={this.state.view === 'marketeer'}
                                        onChange={this.changeView}
                                    />
                                    Market Info
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Settings;
