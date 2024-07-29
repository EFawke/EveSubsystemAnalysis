import React from 'react';

class TitleCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: null,
            price: null,
            id: null,
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.setState({
                name: this.props.data.name,
                price: this.props.data.price,
                id: this.props.data.id,
            })
        }
    }
    render() {
        return (
            <div className="col-md-6 col-xl-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div>
                                    <h5 className="text-muted fw-normal mt-0 text-truncate" title="Campaign Sent">Loki Defensive - Covert Reconfiguration</h5>
                                    <h3 className="my-2 py-1">47.5M</h3>
                                    <p className="mb-0 text-muted">
                                        <span className="text-success me-2"><i className="mdi mdi-arrow-up-bold"></i> 3.27%</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            

        )
    }
}

export default TitleCard;