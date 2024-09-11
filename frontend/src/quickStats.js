import React from "react";

class QuickStats extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            isLoaded: false,
            table: null,
            darkMode: false,
        };
    }

    componentDidMount() {
        this.setState({ data: this.props.data });
        this.setState({ table: this.props.table });
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.setState({ data: this.props.data });
        }
        if (this.props.table !== prevProps.table) {
            this.setState({ table: this.props.table });
        }
        if (this.props.darkMode !== prevProps.darkMode) {
            this.setState({ darkMode: this.props.darkMode })
        }
        if (this.props.isLoaded !== prevProps.isLoaded) {
            this.setState({ isLoaded: this.props.isLoaded })
        }
    }

    render() {
        const { data, isLoaded, table, darkMode } = this.state
        return (
            <div>
                <h2>Stats</h2>
                <p>Quick Stats will go here</p>
            </div>
        )
    }
}

export default QuickStats;