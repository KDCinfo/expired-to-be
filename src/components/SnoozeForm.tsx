import * as React from 'react';

interface SnoozeFormState {
    snoozeTime: number;
}

interface SnoozeFormProps {
    snoozeTime: number;
    setSnooze: (snoozeTime: number) => void;
}

class SnoozeForm extends React.Component<SnoozeFormProps, SnoozeFormState> {
    constructor(props: SnoozeFormProps) {
        super(props);
        this.state = {
            snoozeTime: this.props.snoozeTime
        };
        this.updateSnooze = this.updateSnooze.bind(this);
        this.setLocalSnooze = this.setLocalSnooze.bind(this);
    }
    setLocalSnooze(evt: React.SyntheticEvent<HTMLSelectElement>) {
        this.setState({ snoozeTime: parseInt(evt.currentTarget.value, 10) }, this.updateSnooze);
    }
    updateSnooze() {
        this.props.setSnooze(this.state.snoozeTime);
    }
    render() {
        return (
            <select onChange={this.setLocalSnooze} value={this.state.snoozeTime}>
                { Array.from(Array(15), (e, i) => (i + 1)).map((entry, idx) => {
                    return (
                        <option key={idx}>{entry}</option>
                    );
                }) }
            </select>
        );
    }
}

export default SnoozeForm;