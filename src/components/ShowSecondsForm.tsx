import * as React from 'react';

interface ShowSecondsFormState {
    showSeconds: boolean;
}

interface ShowSecondsFormProps {
    showSeconds: boolean;
    setShowSeconds: (showSeconds: boolean) => void; // setShowSeconds(showSeconds: boolean) {
}

class ShowSecondsForm extends React.Component<ShowSecondsFormProps, ShowSecondsFormState> {
    constructor(props: ShowSecondsFormProps) {
        super(props);
        this.state = {
            showSeconds: this.props.showSeconds
        };
        this.updateShowSeconds = this.updateShowSeconds.bind(this);
        this.setLocalShowSeconds = this.setLocalShowSeconds.bind(this);
    }
    setLocalShowSeconds(evt: React.SyntheticEvent<HTMLInputElement>) {
        this.setState({ showSeconds: evt.currentTarget.checked }, this.updateShowSeconds);
    }
    updateShowSeconds() {
        this.props.setShowSeconds(this.state.showSeconds);
    }
    render() {
        return (
            <input type="checkbox" onChange={this.setLocalShowSeconds} checked={this.state.showSeconds} />
        );
    }
}

export default ShowSecondsForm;