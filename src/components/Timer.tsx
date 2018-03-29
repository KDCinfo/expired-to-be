import * as React from 'react';

import { Glyphicon } from 'react-bootstrap';

import TimeDisplay from './TimeDisplay';

interface EntryProps {
    id: number;
    title: string;
    timeOfDay: string;
    cycle: number;
    active: boolean;
}   // from TimerBox: interface TimerListInterface {}

interface TimeoutListState {
    id: number;
    timer: number;
}

interface TimerDisplayListState {
    id: number;
    destination: number;
}

interface TimerProps {
    entry: EntryProps;
    timeoutList: TimeoutListState[];                  // A list of active timers -- with Timeout ID: { id: 0, timer: 0 }
    timerDisplayList: TimerDisplayListState[];        // 1-second timeouts that update set (stateless) <TimeDisplay />s.
    entryCycleList: string[];                         // ['daily','hourly','every minute'],
    showSeconds: boolean;
    toggleTimeout: (timerId: number, onOff: string) => void;    // toggleTimeout(timerId: number, onOff: string) {
    removeTimer: (timerId: number) => void;                     // removeTimer(timerId: number) {
}

class Timer extends React.Component<TimerProps, {}> {
    constructor(props: TimerProps) {
        super(props);
        this.toggleTimeout = this.toggleTimeout.bind(this);
        this.removeTimer = this.removeTimer.bind(this);
        this.toggleTimeout = this.toggleTimeout.bind(this);
        this.removeTimer = this.removeTimer.bind(this);
    }
    toggleTimeout() {
        this.props.toggleTimeout(this.props.entry.id, this.props.entry.active ? 'off' : 'on');
    }
    removeTimer() {
        this.props.removeTimer(this.props.entry.id);
    }
    render() {
        // const { Glyphicon } = ReactBootstrap

        const timeoutEntry = this.props.timeoutList.find( (elem) => elem.id === this.props.entry.id),
              timerDisplayEntry = (timeoutEntry) ? this.props.timerDisplayList.find(
                  (elem: {id: number}) => elem.id === timeoutEntry.timer) : null,
              timeDisplay = (timerDisplayEntry) ? timerDisplayEntry.destination : 0;

        return (
            <tr>
                <td>{this.props.entry.title}</td>
                <td>{this.props.entry.timeOfDay}</td>
                <td className="hidden">{this.props.entryCycleList[this.props.entry.cycle]}</td>
                <td className="hidden text-center">
                    <input
                        onChange={this.toggleTimeout}
                        type="checkbox"
                        value={this.props.entry.id}
                        checked={this.props.entry.active}
                    />
                </td>
                <td className="text-center">
                    <TimeDisplay targetTime={timeDisplay} showSeconds={this.props.showSeconds} />
                </td>
                <td className="hidden">
                    <button
                        className="btn btn-xs"
                        onClick={this.removeTimer}
                    >
                        <Glyphicon glyph="remove" />
                    </button>
                </td>
            </tr>
        );
    }
}

export default Timer;