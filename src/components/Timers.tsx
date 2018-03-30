import * as React from 'react';

import { Table } from 'react-bootstrap';

import Timer from './Timer';

interface TimerListState {
    id: number;
    title: string;
    timeOfDay: string;
    cycle: number;
    active: boolean;
}

interface TimeoutListState {
    id: number;
    timer: number;
}

interface TimerDisplayListState {
    id: number;
    destination: number;
}

interface TimersProps {
    removeTimer: (timerId: number) => void;                  // removeTimer(timerId: number) {
    toggleTimeout: (timerId: number, onOff: string) => void; // toggleTimeout(timerId: number, onOff: string) {
    timerList: TimerListState[];
    timeoutList: TimeoutListState[];
    timerDisplayList: TimerDisplayListState[];
    entryCycleList: string[];
    showSeconds: boolean;
}

interface TimersState {
    showAppLinks: string;
}

class Timers extends React.Component<TimersProps, TimersState> {
    constructor(props: TimersProps) {
        super(props);
        this.state = {
            showAppLinks: ''
        };
        this.toggleOurApps = this.toggleOurApps.bind(this);
    }
    toggleOurApps() {
        let newShowStat = (this.state.showAppLinks.length === 0) ? ' showdown' : '';
        this.setState({ showAppLinks: newShowStat });
    }
    render() {
        return (
            <div className="timers-div">
                <Table responsive={true}>
                    <thead>
                        <tr>
                            <th>Internal Alarm ID <sup className="ourAppsTrigger" onClick={this.toggleOurApps}>?</sup>
                                <div className={'ourAppsDisplay' + this.state.showAppLinks}>
                                    <div>
                                        <span>
                                            <a
                                                href="https://KDCinfo.github.io/expired-to-be/"
                                                onClick={(e) => { e.preventDefault(); return false; }}
                                            >Expired To Be
                                            </a> (Alarms)
                                        </span><br/>
                                        <span>
                                            <a
                                                href="https://kdcinfo.github.io/done-for-now/"
                                                target="kdcNewWindow"
                                            >Done (for now)
                                            </a> (Timers)
                                        </span>
                                    </div>
                                </div>
                            </th>
                            <th>Notify Time</th>
                            <th className="hidden">Cycle</th>
                            <th className="hidden">On/Off</th>
                            <th className="text-center">Hrs:Mins Left</th>
                            <th className="hidden">Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.timerList.map( (entry, idx: number) =>
                            <Timer
                                key={idx}
                                entry={entry}
                                timeoutList={this.props.timeoutList}
                                timerDisplayList={this.props.timerDisplayList}
                                entryCycleList={this.props.entryCycleList}
                                toggleTimeout={this.props.toggleTimeout}
                                removeTimer={this.props.removeTimer}
                                showSeconds={this.props.showSeconds}
                            />
                        )}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default Timers;