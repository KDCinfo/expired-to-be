import * as React from 'react';

import { Button, Modal } from 'react-bootstrap';

interface TimerListProps {
    id: number;
    title: string;
    presetTargetTime: number;
    timeOfDay: string;
    cycle: number;
    active: boolean;
}

interface ModalProps {
    timerList: TimerListProps[];
    snoozeTime: number; // stateSnoozeTime,
    entryCycleList: string[];
    show: boolean;
    modalTitle: string;
    modalTimerId: number;
    alarmMsg: string;
    timerSnooze: (entryId: number) => void;
    timerReset: (entryId: number) => void;
    timerDisable: (entryId: number) => void;
    resetModal: () => void;
}

class TimerAlertPrompt extends React.Component<ModalProps, {}> {

   // export default class TimerAlertPrompt extends React.Component {}
        // https://cdnjs.cloudflare.com/ajax/libs/react/15.5.4/react.min.js
        // https://cdnjs.cloudflare.com/ajax/libs/react/15.5.4/react-dom.min.js
        // https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.24.0/babel.min.js

        // https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.31.0/react-bootstrap.js
        // import { Modal, Button, Glyphicon } from 'react-bootstrap'

    constructor(props: ModalProps) {
        super(props);

        this.timerSnooze = this.timerSnooze.bind(this);
        this.timerReset = this.timerReset.bind(this);
        this.timerDisable = this.timerDisable.bind(this);
    }
    shouldComponentUpdate(nextProps: any, nextState: any) {
        return this.props !== nextProps;
    }
    timerSnooze() {
        this.props.timerSnooze(this.props.modalTimerId);

        // @TODO: Disable should delete alarm when it's tied to an Expiration item, and not a Timer.

    }
    timerReset() {
        this.props.timerReset(this.props.modalTimerId);
    }
    timerDisable() {
        this.props.timerDisable(this.props.modalTimerId);
    }
    render() {
        // const { show, user, hideDelete, userDelete } = this.props;
        // const Modal = ReactBootstrap.Modal
        // const Button = ReactBootstrap.Modal
        // const Glyphicon = ReactBootstrap.Modal
        // const { Modal, Button, Glyphicon } = 'react-bootstrap'
        // const { Modal, Button } = ReactBootstrap
        const { show, modalTitle } = this.props;

        // id, timeOfDay, cycleName

        let cycleName = '',
            timerEntryTime = '',
            isTimer = false,
            nowModalTitle = modalTitle;

        const timerEntry = this.props.timerList.find( (elem) => (elem.id === this.props.modalTimerId) );

        if (timerEntry) {
            timerEntryTime = timerEntry.timeOfDay;
            cycleName = this.props.entryCycleList[timerEntry.cycle];
            if (timerEntry.presetTargetTime === 0) {
                isTimer = true;
            } else {
                nowModalTitle = this.props.alarmMsg;
            }
        }

        const DivTitle = () => (
                <div className="modal-title">{nowModalTitle}</div>
              ),
              DivSubtitle = () => (
                <div className="modal-subtitle">[{timerEntryTime}]&nbsp;[{cycleName}]</div>
              ),
              ButtonSnooze = () => (
                <Button onClick={this.timerSnooze} bsStyle="warning">
                    Snooze <small><small>({this.props.snoozeTime} min)</small></small>
                </Button>
              ),
              ButtonDoneForNow = () => {
                return (
                    <Button onClick={this.timerReset} bsStyle="success">
                        Done <small><small>(for now)</small></small>
                    </Button>
                );
              },
              ButtonCloseModal = () => {
                return (
                    <Button onClick={this.props.resetModal} bsStyle="success">
                        Expiration Alert!
                    </Button>
                );
              },
              ButtonDisable = () => (
                <Button onClick={this.timerDisable} bsStyle="default">
                    Disable
                </Button>
              );

        const modalProps = {
            show: show,
            className: 'modal-alert',
            onHide: () => undefined,
        };
        return (
            <Modal {...modalProps}>
                <Modal.Body>
                    {isTimer ? (<ButtonSnooze />) : null}
                    {isTimer ? (<DivTitle />) : null}
                    {isTimer ? (<ButtonDoneForNow />) : null}
                    {isTimer ? null : (<ButtonCloseModal />)}
                    {isTimer ? (<DivSubtitle />) : null}
                    {isTimer ? (<ButtonDisable />) : null}
                </Modal.Body>
            </Modal>
        );
    }
}

export default TimerAlertPrompt;