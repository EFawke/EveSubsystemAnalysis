import React from "react";
import axios from 'axios';
import Divider from '@mui/material/Divider';
import Cookies from 'js-cookie';

class Build extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numSlots: 1,
            darkMode: this.props.darkMode || false,
            refinery: 'Tatara',  // default refinery
            refineryTeRig: 'None',
            refineryMeRig: 'None',
            refinerySystem: 'wormhole',
            complex: 'Azbel',  // default complex
            complexLargeRig: 'None', // Only for Azbel
            complexTeRig: 'None',    // Only for Raitaru
            complexMeRig: 'None',    // Only for Raitaru
            complexSystem: 'wormhole',
            tataraRig: 'None',
            componentMaterialEfficiency: 0,
            componentTimeEfficiency: 0,
            ancientRelic: 'Intact',
            decryptor: 'None',
            coreVolume: 1,
            defensiveVolume: 1,
            offensiveVolume: 1,
            propulsionVolume: 1,
            numSlots: 1,
            skillLevel: 1,
            implant: 'None',
            buildingComponents: false,
            runningReactions: false,
            buildCostIndex: 0.14,
            reactionCostIndex: 0.14,
            reactionFacilityTax: 1,
            complexFacilityTax: 1,
            buildResponseData: null,  // new state variable for response data
        };
    }

    componentDidMount() {
        // Load settings from the cookie if available
        const savedSettings = Cookies.get('buildSettings');
        if (savedSettings) {
            this.setState(JSON.parse(savedSettings), this.submitBuildData);
        } else {
            // If no saved settings, make initial call with default state
            this.submitBuildData();
        }
    }


    componentDidUpdate(prevProps, prevState) {
        // Save settings to a cookie whenever the state updates
        if (this.state !== prevState) {
            Cookies.set('buildSettings', JSON.stringify(this.state));
        }

        // Handle darkMode update based on props
        if (this.state.darkMode !== this.props.darkMode) {
            this.setState({ darkMode: this.props.darkMode });
        }
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.submitBuildData);
    }

    handleSliderChange = (e) => {
        this.setState({ [e.target.name]: parseInt(e.target.value, 10) }, this.submitBuildData);
    }

    handleCheckboxChange = (e) => {
        this.setState({ [e.target.name]: e.target.checked }, this.submitBuildData);
    }

    submitBuildData = () => {
        axios.post('/api/build', this.state)
            .then(response => {
                console.log('Data sent successfully:', response.data);
                // Store the response data in state
                this.setState({ buildResponseData: response.data }, () => {
                    // Save updated state to the cookie
                    console.log("Setting cookie");
                    console.log(this.state);
                    const buildSettings = Object.keys(this.state).reduce((acc, key) => {
                        if (typeof this.state[key] !== 'object') {
                            acc[key] = this.state[key];
                        }
                        return acc;
                    }, {});

                    Cookies.set('buildSettings', JSON.stringify(buildSettings));
                    console.log("Cookie value after setting:", Cookies.get('buildSettings'));
                });
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }



    renderRequiredMaterialsTable = () => {
        const { buildResponseData, darkMode } = this.state;

        if (!buildResponseData || !buildResponseData.requiredMaterialsForAll) return null;

        // Filter out components with quantity 0, name "None," or specified component IDs
        const filteredMaterials = buildResponseData.requiredMaterialsForAll
            .filter(material => material.quantity !== 0 && material.name !== "None" && ![30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008].includes(material.id));

        // Set default values for maxBuys and totalTax, handling null or undefined cases
        const materialBuyCost = buildResponseData.maxBuys != null ? buildResponseData.maxBuys : 0;
        const industryTaxTotal = buildResponseData.totalTax != null ? buildResponseData.totalTax : 0;
        const totalBuildCost = materialBuyCost + industryTaxTotal;

        return (
            <div>
                {/* Summary Figures */}
                <div className="container my-4">
                    <div className="row text-center g-3">
                        <div className="col-md-4">
                            <h5 className="fw-bold">Material Buy Cost</h5>
                            <p className="fs-5">{materialBuyCost.toLocaleString()} ISK</p>
                        </div>
                        <div className="col-md-4">
                            <h5 className="fw-bold">Industry Tax Total</h5>
                            <p className="fs-5">{industryTaxTotal.toLocaleString()} ISK</p>
                        </div>
                        <div className="col-md-4">
                            <h5 className="fw-bold">Total Build Cost</h5>
                            <p className="fs-5">{totalBuildCost.toLocaleString()} ISK</p>
                        </div>
                    </div>
                </div>

                {/* Required Materials Table */}
                <table className={`table ${darkMode ? "table-dark" : "table"}`}>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMaterials.map((material, index) => (
                            <tr key={index}>
                                <td><img src={`https://image.eveonline.com/Type/${material.id}_32.png`} alt="Item" className="img-fluid" /></td>
                                <td>{material.name}</td>
                                <td>{material.quantity}</td>
                                <td>{material.unitPrice} ISK</td>
                                <td>{Math.round(material.lineTotal)} ISK</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }


    render() {
        const { darkMode, refinery, teRig, meRig, system, tataraRig, complex, complexTeRig, complexMeRig, complexSystem, complexLargeRig, componentMaterialEfficiency, componentTimeEfficiency, ancientRelic, decryptor, coreVolume, defensiveVolume, offensiveVolume, propulsionVolume, numSlots, skillLevel, implant, buildingComponents, runningReactions, reactionCostIndex, buildCostIndex, reactionFacilityTax, complexFacilityTax } = this.state;

        return (
            <div>
                <div className={!darkMode ? "row" : "row bg-dark text-white"}>
                    <div className="col-12">
                        <div className="page-title-box">
                            <h1 id="build-title" className={!darkMode ? "page-title" : "page-title bg-dark text-white"}>Build Tool</h1>
                        </div>
                    </div>
                </div>
                <div className={!darkMode ? "row" : "row bg-dark text-white"}>
                    <div className={` ${!darkMode ? "" : "bg-dark text-white"}`}>
                        <div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div className={!darkMode ? "accordion" : "accordion bg-dark text-white"} id="settings_accordion">
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" id="accordion-header-refinery">
                                                <button className={!darkMode ? "accordion-button" : "accordion-button bg-dark text-white"} type="button" data-bs-toggle="collapse" data-bs-target="#refineryCollapse" aria-expanded="true" aria-controls="refineryCollapse">
                                                    Refinery
                                                </button>
                                            </h5>
                                            <div id="refineryCollapse" className="accordion-collapse collapse" aria-labelledby="accordion-header-refinery" data-bs-parent="#settings_accordion">
                                                <div className={!darkMode ? "accordion-body" : "accordion-body bg-dark text-white"}>
                                                    <div className="mb-3">
                                                        <label htmlFor="refineryDropdown" className="form-label">Refinery</label>
                                                        <select id="refineryDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="refinery" value={refinery} onChange={this.handleInputChange}>
                                                            <option value="Tatara">Tatara</option>
                                                            <option value="Athanor">Athanor</option>
                                                        </select>
                                                    </div>
                                                    {refinery === "Tatara" && (
                                                        <div className="mb-3">
                                                            <label htmlFor="tataraRigDropdown" className="form-label">Rig</label>
                                                            <select id="tataraRigDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="tataraRig" value={tataraRig} onChange={this.handleInputChange}>
                                                                <option value="None">None</option>
                                                                <option value="T1">T1</option>
                                                                <option value="T2">T2</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    {refinery === "Athanor" && (
                                                        <>
                                                            <div className="mb-3">
                                                                <label htmlFor="teRigDropdown" className="form-label">T.E. Rig</label>
                                                                <select id="teRigDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="teRig" value={teRig} onChange={this.handleInputChange}>
                                                                    <option value="None">None</option>
                                                                    <option value="T1">T1</option>
                                                                    <option value="T2">T2</option>
                                                                </select>
                                                            </div>
                                                            <div className="mb-3">
                                                                <label htmlFor="meRigDropdown" className="form-label">M.E. Rig</label>
                                                                <select id="meRigDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="meRig" value={meRig} onChange={this.handleInputChange}>
                                                                    <option value="None">None</option>
                                                                    <option value="T1">T1</option>
                                                                    <option value="T2">T2</option>
                                                                </select>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="mb-3">
                                                        <label htmlFor="systemDropdown" className="form-label">System Type</label>
                                                        <select id="systemDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="system" value={system} onChange={this.handleInputChange}>
                                                            <option value="lowsec">lowsec</option>
                                                            <option value="nullsec">nullsec</option>
                                                            <option value="wormhole">wormhole</option>
                                                        </select>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="reactionCostIndexInput" className="form-label">Reaction System Cost Index</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="reactionCostIndexInput" name="reactionCostIndex" value={reactionCostIndex} onChange={this.handleInputChange} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="reactionFacilityTaxInput" className="form-label">Facility Tax</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="reactionFacilityTaxInput" name="reactionFacilityTax" min={0} value={reactionFacilityTax} onChange={this.handleInputChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" id="accordion-header-complex">
                                                <button className={!darkMode ? "accordion-button" : "accordion-button bg-dark text-white"} type="button" data-bs-toggle="collapse" data-bs-target="#complexCollapse" aria-expanded="true" aria-controls="complexCollapse">
                                                    Manufacturing Complex
                                                </button>
                                            </h5>
                                            <div id="complexCollapse" className="accordion-collapse collapse" aria-labelledby="accordion-header-complex" data-bs-parent="#settings_accordion">
                                                <div className={!darkMode ? "accordion-body" : "accordion-body bg-dark text-white"}>
                                                    <div className="mb-3">
                                                        <label htmlFor="complexDropdown" className="form-label">Manufacturing Complex</label>
                                                        <select id="complexDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="complex" value={complex} onChange={this.handleInputChange}>
                                                            <option value="Azbel">Azbel</option>
                                                            <option value="Raitaru">Raitaru</option>
                                                        </select>
                                                    </div>
                                                    {complex === "Azbel" && (
                                                        <div className="mb-3">
                                                            <label htmlFor="complexLargeRigDropdown" className="form-label">Rig</label>
                                                            <select id="complexLargeRigDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="complexLargeRig" value={complexLargeRig} onChange={this.handleInputChange}>
                                                                <option value="None">None</option>
                                                                <option value="T1">T1</option>
                                                                <option value="T2">T2</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    {complex === "Raitaru" && (
                                                        <>
                                                            <div className="mb-3">
                                                                <label htmlFor="complexTeRigDropdown" className="form-label">T.E. Rig</label>
                                                                <select id="complexTeRigDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="complexTeRig" value={complexTeRig} onChange={this.handleInputChange}>
                                                                    <option value="None">None</option>
                                                                    <option value="T1">T1</option>
                                                                    <option value="T2">T2</option>
                                                                </select>
                                                            </div>
                                                            <div className="mb-3">
                                                                <label htmlFor="complexMeRigDropdown" className="form-label">M.E. Rig</label>
                                                                <select id="complexMeRigDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="complexMeRig" value={complexMeRig} onChange={this.handleInputChange}>
                                                                    <option value="None">None</option>
                                                                    <option value="T1">T1</option>
                                                                    <option value="T2">T2</option>
                                                                </select>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="mb-3">
                                                        <label htmlFor="complexSystemDropdown" className="form-label">System Type</label>
                                                        <select id="complexSystemDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="complexSystem" value={complexSystem} onChange={this.handleInputChange}>
                                                            <option value="highsec">highsec</option>
                                                            <option value="lowsec">lowsec</option>
                                                            <option value="nullsec">nullsec</option>
                                                            <option value="wormhole">wormhole</option>
                                                        </select>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="buildCostIndexInput" className="form-label">Manufacturing System Cost Index</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="buildCostIndexInput" name="buildCostIndex" value={buildCostIndex} onChange={this.handleInputChange} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="complexFacilityTaxInput" className="form-label">Facility Tax</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="complexFacilityTaxInput" name="complexFacilityTax" value={complexFacilityTax} onChange={this.handleInputChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" id="accordion-header-blueprints">
                                                <button className={!darkMode ? "accordion-button" : "accordion-button bg-dark text-white"} type="button" data-bs-toggle="collapse" data-bs-target="#blueprintsCollapse" aria-expanded="true" aria-controls="blueprintsCollapse">
                                                    Blueprints
                                                </button>
                                            </h5>
                                            <div id="blueprintsCollapse" className="accordion-collapse collapse" aria-labelledby="accordion-header-blueprints" data-bs-parent="#settings_accordion">
                                                <div className={!darkMode ? "accordion-body" : "accordion-body bg-dark text-white"}>
                                                    <div className="mb-3">
                                                        <label htmlFor="componentMaterialEfficiency" className="form-label">Component Material Efficiency</label>
                                                        <input type="range" className="form-range" id="componentMaterialEfficiency" name="componentMaterialEfficiency" min="0" max="10" value={componentMaterialEfficiency} onChange={this.handleSliderChange} />
                                                        <span>{componentMaterialEfficiency}</span>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="componentTimeEfficiency" className="form-label">Component Time Efficiency</label>
                                                        <input type="range" className="form-range" id="componentTimeEfficiency" name="componentTimeEfficiency" min="0" max="20" value={componentTimeEfficiency} onChange={this.handleSliderChange} />
                                                        <span>{componentTimeEfficiency}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" id="accordion-header-invention">
                                                <button className={!darkMode ? "accordion-button" : "accordion-button bg-dark text-white"} type="button" data-bs-toggle="collapse" data-bs-target="#inventionCollapse" aria-expanded="true" aria-controls="inventionCollapse">
                                                    Invention
                                                </button>
                                            </h5>
                                            <div id="inventionCollapse" className="accordion-collapse collapse" aria-labelledby="accordion-header-invention" data-bs-parent="#settings_accordion">
                                                <div className={!darkMode ? "accordion-body" : "accordion-body bg-dark text-white"}>
                                                    <div className="mb-3">
                                                        <label htmlFor="ancientRelicDropdown" className="form-label">Ancient Relic</label>
                                                        <select id="ancientRelicDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="ancientRelic" value={ancientRelic} onChange={this.handleInputChange}>
                                                            <option value="Intact">Intact</option>
                                                            <option value="Malfunctioning">Malfunctioning</option>
                                                            <option value="Wrecked">Wrecked</option>
                                                        </select>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="decryptorDropdown" className="form-label">Decryptor</label>
                                                        <select id="decryptorDropdown" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-select"} name="decryptor" value={decryptor} onChange={this.handleInputChange}>
                                                            <option value="None">None</option>
                                                            <option value="Accelerant Decryptor">Accelerant Decryptor</option>
                                                            <option value="Attainment Decryptor">Attainment Decryptor</option>
                                                            <option value="Augmentation Decryptor">Augmentation Decryptor</option>
                                                            <option value="Optimized Attainment Decryptor">Optimized Attainment Decryptor</option>
                                                            <option value="Optimized Augmentation Decryptor">Optimized Augmentation Decryptor</option>
                                                            <option value="Parity Decryptor">Parity Decryptor</option>
                                                            <option value="Process Decryptor">Process Decryptor</option>
                                                            <option value="Symmetry Decryptor">Symmetry Decryptor</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" id="accordion-header-build">
                                                <button className={!darkMode ? "accordion-button" : "accordion-button bg-dark text-white"} type="button" data-bs-toggle="collapse" data-bs-target="#buildCollapse" aria-expanded="true" aria-controls="buildCollapse">
                                                    Build Volume
                                                </button>
                                            </h5>
                                            <div id="buildCollapse" className="accordion-collapse collapse" aria-labelledby="accordion-header-build" data-bs-parent="#settings_accordion">
                                                <div className={!darkMode ? "accordion-body" : "accordion-body bg-dark text-white"}>
                                                    <div className="mb-3">
                                                        <label htmlFor="coreVolumeInput" className="form-label">Core</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="coreVolumeInput" name="coreVolume" value={coreVolume} onChange={this.handleInputChange} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="defensiveVolumeInput" className="form-label">Defensive</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="defensiveVolumeInput" name="defensiveVolume" value={defensiveVolume} onChange={this.handleInputChange} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="offensiveVolumeInput" className="form-label">Offensive</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="offensiveVolumeInput" name="offensiveVolume" value={offensiveVolume} onChange={this.handleInputChange} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="propulsionVolumeInput" className="form-label">Propulsion</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="propulsionVolumeInput" name="propulsionVolume" value={propulsionVolume} onChange={this.handleInputChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" id="accordion-header-character">
                                                <button className={!darkMode ? "accordion-button" : "accordion-button bg-dark text-white"} type="button" data-bs-toggle="collapse" data-bs-target="#characterCollapse" aria-expanded="true" aria-controls="characterCollapse">
                                                    Character
                                                </button>
                                            </h5>
                                            <div id="characterCollapse" className="accordion-collapse collapse" aria-labelledby="accordion-header-character" data-bs-parent="#settings_accordion">
                                                <div className={!darkMode ? "accordion-body" : "accordion-body bg-dark text-white"}>
                                                    <div className="mb-3">
                                                        <label htmlFor="numSlots" className="form-label">Reaction Slots</label>
                                                        <input type="number" className={darkMode ? "form-control bg-dark text-light border-secondary" : "form-control"} id="numSlots" name="numSlots" value={numSlots} onChange={this.handleInputChange} min="1" />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="skillLevel" className="form-label">Skill Level</label>
                                                        <input type="range" className="form-range" id="skillLevel" name="skillLevel" min="1" max="5" value={skillLevel} onChange={this.handleSliderChange} />
                                                        <span>{skillLevel}</span>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="implant" className="form-label">Implant</label>
                                                        <select id="implant" className={darkMode ? "form-select bg-dark text-light border-secondary" : "form-select"} name="implant" value={implant} onChange={this.handleInputChange}>
                                                            <option value="None">None</option>
                                                            <option value="1%">1%</option>
                                                            <option value="2%">2%</option>
                                                            <option value="4%">4%</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    {/* {this.renderSummaryFigures()} */}

                                    <div className={`card ${!darkMode ? "" : "bg-dark text-white"}`}>
                                        <div className="card-body">
                                            {this.renderRequiredMaterialsTable()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Build;