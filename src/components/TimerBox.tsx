import * as React from 'react';

import { Row, Col } from 'react-bootstrap';

import { getStorageItem, setStorageItem } from '../utilities/alarm-functions';

import SettingsForm from './SettingsForm';
import SnoozeForm from './SnoozeForm';
import Timers from './Timers';
import TimerAlertPrompt from './TimerAlertPrompt';

/**
 * [TimerBox] Alarm API Usage Details:
 *
 * https://github.com/KDCinfo/expired-to-be/src
 *
 */

/**
 *
 * All [TypeScript Interfaces] are at the bottom of this file.
 *
 */

class TimerBox extends React.Component<TimerBoxProps, TimerBoxState> {
    constructor(props: TimerBoxProps) {
        super(props);

        const // timeToMidnight = new Date().setHours(24,0,0,0) - new Date().getTime(), // Milliseconds to midnight
              storedSnoozeTime = getStorageItem(localStorage, 'snoozeTime'),
              stateSnoozeTime = storedSnoozeTime ? parseInt(storedSnoozeTime, 10) : 60 * 24, // 60 min * 24 hr = 1 day
              storedShowSeconds = getStorageItem(localStorage, 'showSeconds'),
              stateShowSeconds = storedShowSeconds ? (storedShowSeconds.toLocaleLowerCase() === 'true') : false,
              storedTimerList = getStorageItem(localStorage, 'timerList'),
              stateTimerList = (storedTimerList) ? JSON.parse(storedTimerList) : [];

        this.state = {
            timerList: stateTimerList,  // A list of timers:
                                        //     { id: 0, title: '',
                                        //       presetTargetTime: 0, timeOfDay: '00:00', cycle: 0 }
            timeoutList: [],            // A list of active timers -- with Timeout ID: { id: 0, timer: 0 }
                                        // Also includes a list of 'display timers' (sibling setTimeouts).
            timeoutQueue: [],           // A list of completed timeouts going through the 'modal' process.
            timerDisplayList: [],       // 1-second timeouts that update set (stateless) <TimeDisplay />s.
            titleCount: 25,
            titleTemp: 'Watch my show!',
            countHours: 24,
            countMinutes: 60,
            stepCountMinutes: 5,
            snoozeTime: stateSnoozeTime,
            entryCycleList: ['daily', 'hourly', 'every minute'],
            showModal: false,
            modalTitle: '',
            modalTimerId: -1,
            showSeconds: stateShowSeconds,
            currentTimerId: 0,
            alarmMsg: 'An alarm has expired.',
            timeoutMax: 2073600000 // 2073600000 ms = 576 hours = 24 days (Tested with: 15 * 1000)
        };

        this.setSnooze = this.setSnooze.bind(this);
        this.setTimer = this.setTimer.bind(this);
        this.setTimerCallback = this.setTimerCallback.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.addRemoveTimeout = this.addRemoveTimeout.bind(this);
        this.toggleTimeout = this.toggleTimeout.bind(this);
        this.removeTimer = this.removeTimer.bind(this);
        this.getLastId = this.getLastId.bind(this);
        this.deleteTimeout = this.deleteTimeout.bind(this);
        this.createTimeout = this.createTimeout.bind(this);
        this.timerSnooze = this.timerSnooze.bind(this);
        this.timerReset = this.timerReset.bind(this);
        this.timerDisable = this.timerDisable.bind(this);
        this.showNotification = this.showNotification.bind(this);
        this.getTimeDiff = this.getTimeDiff.bind(this);
        this.getTimeDiffUpdate = this.getTimeDiffUpdate.bind(this);
        this.addToTimeoutQueue = this.addToTimeoutQueue.bind(this);
        this.removeFromTimeoutQueue = this.removeFromTimeoutQueue.bind(this);
        this.checkTimeoutQueue = this.checkTimeoutQueue.bind(this);
        this.setNotification = this.setNotification.bind(this);
        this.resetModal = this.resetModal.bind(this);
    }
    initializeState() {
        // Create new 'timeoutList' from stored 'timerList'
            // Go through each [timerList] entry and, if 'active', execute addRemoveTimeout(entryId, 'add')

        const storedTimerList = getStorageItem(localStorage, 'timerList'),
              stateTimerList = (storedTimerList) ? JSON.parse(storedTimerList) : [];

        // 'this.state.timeoutList' should already be empty [] ( per constructor's this.state = {} )
        // 'this.state.timeoutQueue' should already be empty [] ( per constructor's this.state = {} )

        if (stateTimerList.length > 0) {

            this.props.setAlarms(stateTimerList);

            stateTimerList.forEach( (elem: {id: number, active: boolean, timeOfDay?: string}) => {
                if (elem.active === true && elem.timeOfDay) {
                    window.setTimeout(                              // Was using `global.setTimeout` (for TS).
                        () => {                                     // Switched to `window.` for consistency.
                            this.addRemoveTimeout(elem.id, 'init'); // When these are not staggered, only one
                        },                                          // shows in the 'timerDisplay' code/layout.
                        0                                           // setTimeout({}, 0) fixes this by pushing
                    );                                              // each call to the end of the call stack.
                }
            });
        }
    }
    componentDidMount() {
        this.initializeState();
    }
    componentWillReceiveProps(nextProps: any) {

        if (nextProps.ourExpirationItems.length > 0) {

            if (nextProps.ourExpirationItems[0].expiredId !== this.state.currentTimerId) {
                const nPxId = nextProps.ourExpirationItems[0].expiredId;

                this.setState({ currentTimerId: nPxId }, () => {
                    this.handleAppUpdate();
                });
            }
        } else {
            this.setState({ currentTimerId: 0 });
        }
    }
    shouldComponentUpdate(nextProps: any, nextState: any) {

        if (nextProps.ourExpirationItems.length > 0) {

            return (
                this.state.currentTimerId === 0 || // this.state.currentTimerId === -1 ||
                this.state.currentTimerId !== nextProps.ourExpirationItems[0].expiredId
            );
        } else {

            return this.props !== nextProps ||
                   this.state.showModal !== nextState.showModal ||
                   this.state.timeoutList !== nextState.timeoutList;
        }
    }
    handleAppUpdate() {

        if (this.props.ourExpirationItems.length > 0) {

            const { whichEvent, expiredId } = this.props.ourExpirationItems[0];

            let useEvent = whichEvent,
                internalUseId = 0,
                internalTimerItem = this.state.timerList.find(
                    item => parseInt(item.title.substr(4), 10) === expiredId
                ),
                entryTitle = '',
                entryPresetTargetTime = 0,
                entryHours = 0,
                entryMinutes = 0,
                entryCycle = 0;

            if (internalTimerItem) {
                internalUseId = internalTimerItem.id;
            }

            if (useEvent === 'add') {
                // const { entryTitle, entryHours, entryMinutes, entryCycle } = this.props.ourExpirationItems[0];
                entryTitle = this.props.ourExpirationItems[0].entryTitle;
                entryPresetTargetTime = this.props.ourExpirationItems[0].entryPresetTargetTime;
                entryHours = this.props.ourExpirationItems[0].entryHours;
                entryMinutes = this.props.ourExpirationItems[0].entryMinutes;
                entryCycle = this.props.ourExpirationItems[0].entryCycle;
                if (internalTimerItem) {
                    useEvent = 'update';
                }
            }

            // console.log('[handleUpdate] printing... ', whichEvent, expiredId, this.props.ourExpirationItems);
            // items[] = { whichEvent: 'add|update|remove', expiredId: 0, [expiredWait: #days, expiredSnooze: 1] }
            //
            // [entryTitle] is The glue between your [App] and [TimerBox]. 3 char + hyphen + whole number
            //
                // whichEvent: "add"        // add|remove|update
                // expiredId: 2             // \/`^~---> Ties to [entryTitle]
                // entryTitle: "x2b-2"      // !!important
                // entryPresetTargetTime: 0 // target date in milliseconds
                // entryHours: 552          // [0|24|48|...] // 552 / 24 = 23 (days)
                // entryMinutes: 0
                // entryCycle: 0            // 0: daily // @TODO: allow to override snooze; off|on[daily|hourly]

            switch (useEvent) {
                case 'add':
                    this.setTimer( entryTitle, entryPresetTargetTime, entryHours, entryMinutes, entryCycle );
                    break;

                case 'update':
                    this.updateTimer(internalUseId,
                                     entryTitle,
                                     entryPresetTargetTime,
                                     entryHours,
                                     entryMinutes,
                                     entryCycle);
                    break;

                case 'remove':
                    this.removeTimer( internalUseId );
                    break;

                case 'clearall':
                    this.removeAllTimers();
                    break;

                default:
                    // console.log('handleUpdate: switch: default (purportedly not used)'); // Debugging is done in Dev.
            }
        }
    }

    updateTimer(entryId: number,
                entryTitle: string,
                entryPresetTargetTime: number,
                entryHours: number,
                entryMinutes: number,
                entryCycle: number) {
        let newTimerList = this.state.timerList;

        const entryHoursPad = entryHours < 10 ? '0' + entryHours : entryHours,
              entryMinutesPad = entryMinutes < 10 ? '0' + entryMinutes : entryMinutes,
              newItem = {
                id: entryId,
                title: entryTitle,
                presetTargetTime: entryPresetTargetTime,
                timeOfDay: entryHoursPad + ':' + entryMinutesPad,
                cycle: entryCycle,
                active: true
              },
              internalTimerItemIdx = newTimerList.findIndex(
                item => item.id === entryId
              );

        newTimerList.splice(internalTimerItemIdx, 1, newItem);

        this.setState({ timerList: newTimerList }, () => {
            setStorageItem(localStorage, 'timerList', JSON.stringify(newTimerList));
            this.updateTimerCallback(entryId);
            this.props.setAlarms(this.state.timerList);
        });
    }
    setTimer(entryTitle: string,
             entryPresetTargetTime: number,
             entryHours: number,
             entryMinutes: number,
             entryCycle: number ) {

        const entryHoursPad = entryHours < 10 ? '0' + entryHours : entryHours,
              entryMinutesPad = entryMinutes < 10 ? '0' + entryMinutes : entryMinutes,
              lastIdx = this.getLastId(),
              nextId = this.state.timerList.length === 0 ? 0 : (lastIdx + 1),
              timerList = this.state.timerList.concat({
                  id: nextId,
                  title: entryTitle,
                  presetTargetTime: entryPresetTargetTime,
                  timeOfDay: entryHoursPad + ':' + entryMinutesPad,
                  cycle: entryCycle,
                  active: false
              });

        this.setState({ timerList }, () => {
            setStorageItem(localStorage, 'timerList', JSON.stringify(timerList));
            this.setTimerCallback();
            this.props.setAlarms(this.state.timerList);
        });
    }
    removeAllTimers() {

        let newTimerList = this.state.timerList.slice();

        newTimerList = newTimerList.filter( timerItem => {
            this.toggleTimeout(timerItem.id, 'off');
            return timerItem.title.substr(0, 4) !== 'x2b-';
        });
        console.log('removeAllTimers: ', newTimerList);

        this.setState({ timerList: newTimerList }, () => {

            setStorageItem(localStorage, 'timerList', JSON.stringify(newTimerList));

            this.props.setAlarms(this.state.timerList);
            this.props.refreshAlarms();
        });
    }
    removeTimer(timerId: number, refreshList?: boolean) {

        let newTimerList = this.state.timerList;

        const timerIdx = newTimerList.findIndex(item => item.id === timerId);

        if (timerIdx >= 0) {

            newTimerList.splice(timerIdx, 1);

            this.setState({ timerList: newTimerList }, () => {

                setStorageItem(localStorage, 'timerList', JSON.stringify(newTimerList));
                this.toggleTimeout(timerId, 'off');

                if (refreshList === true) {
                    this.props.setAlarms(this.state.timerList);
                    this.props.refreshAlarms();
                }
            });
        }
    }
    addRemoveTimeout(timerId: number, whichTask: string) {
        // This method has 2 entry points:
            // initializeState()  // ID is passed in (for each Timer item)
            // toggleTimeout()    // ID is passed in

        const entryId = timerId;

        if (whichTask === 'remove') {
            this.deleteTimeout(entryId);        //                    setTimeout delay is...

        } else if (whichTask === 'update') {
            this.updateTimeout(entryId);        // no 2nd param       (...based on current time)

        } else if (whichTask === 'snooze') {
            this.updateTimeout(entryId, true);  // 2nd param = snooze (...set based on state.snoozeTime)

        } else { // add | init
            this.createTimeout(entryId);        //                    (...set based on <form> submit values & cur time)
        }
    }
    deleteTimeout(entryId: number, clearall?: boolean) {
        // This method has 1 entry point:
            // addRemoveTimeout()

        let newTimeoutList = this.state.timeoutList.slice(),
            newTimerDisplayList = this.state.timerDisplayList,
            timeoutTimerId: number;

        // timeoutList[] will have 2 entries for each timeout
            // [
            //     {id: 0, timer: 15}, <-- Modal-prompt setTimeout ('pop-up alerts')
            //     {id: 0, timer: 24}, <-- Every-second setTimeout ('visual counter')
            //     {id: 1, timer: 32}, <-- Modal-prompt setTimeout
            //     {id: 1, timer: 45}  <-- Every-second setTimeout
            // ]

        newTimeoutList.forEach( (elem: {id: number, timer: number}, idx: number) => {
            if (elem.id === entryId) {
                timeoutTimerId = elem.timer;
                newTimeoutList.splice(idx, 1);
                window.clearTimeout(elem.timer);
            }
        });
        this.setState({timeoutList: newTimeoutList});

        // timerDisplayList[]
            // [
            //     {id: 24, destination: targetDateInMilliseconds}, <--
            //     {id: 45, destination: targetDateInMilliseconds}  <--
            // ]
                    // 'id' is this sibling timeout's Timer ID;
                    // 'destination' is current date/time plus timeDiff

        newTimerDisplayList.forEach( (elem: {id: number}, idx: number) => {
            if (elem.id === timeoutTimerId) {
                newTimerDisplayList.splice(idx, 1);
                window.clearTimeout(timeoutTimerId);
            }
        });
        this.setState({ timerDisplayList: newTimerDisplayList });
    }
    createTimeout(entryId: number) {
        // This method has 2 entry points:
            // addRemoveTimeout()
            // addToTimeoutQueue()

        const newTimerList = this.state.timerList,
              timerEntry = newTimerList.find(                     // To satisfy TS: An exclamation is added to .find()!
                (elem: {id: number}) => (elem.id === entryId) )!, // Method not called unless `timerList` is populated.
              timerPresetTargetTime = timerEntry.presetTargetTime,
              timerHour = parseInt(timerEntry.timeOfDay.split(':')[0], 10),
              timerMinute = parseInt(timerEntry.timeOfDay.split(':')[1], 10),
              timerCycle = timerEntry.cycle;

        let newTimeoutList = this.state.timeoutList,
            newTimerDisplayList = this.state.timerDisplayList,
            newTimeout,
            newTimeoutEntry,
            newTimerDisplayEntry,
            targetTime,
            thisTimeDiff = 0,
            thisTimeDiffMax = 0;

        // If `timerPresetTargetTime` is > 0, use that as your target instead.
        thisTimeDiff = (timerPresetTargetTime === 0) ?
                        this.getTimeDiff(timerHour, timerMinute, timerCycle) :
                        timerPresetTargetTime - Date.now();
                        // getTimeDiff: Returns milliseconds between [current time] & [current time + set time + cycle]

        // https://stackoverflow.com/questions/16314750 ...
            // ^-... /settimeout-fires-immediately-if-the-delay-more-than-2147483648-milliseconds
            // Per that page: The upper limit of setTimeout is 0x7FFFFFFF (or 2147483647 in decimal)
            // setTimeout has a 32-bit limit of:
            //     2147483647 ms = 596.52323528 h = 24.8333 days
            // 2073600000 ms = 576 hours = 24 days
        thisTimeDiffMax = (thisTimeDiff > this.state.timeoutMax) ? this.state.timeoutMax : thisTimeDiff;

        // `setTimeout` function will subtract current time from target time and use as ({setTimeout's}, wait) time.

        newTimeout = window.setTimeout(
            () => {
                // Add to timeoutQueue
                    // 1. Add to queue[] (array) when setTimeout time is up;
                    // 2. Remove from queue[] when closing modal;
                    // 3. Run queueCheck() to see if any others have entered since modal was up.
                this.addToTimeoutQueue(entryId);
            },
            thisTimeDiffMax
        );

        // this.state.timerDisplayList[]
            // [
            //     {id: 24, destination: now + timeDiff}, <-- 'destination' date/time minus current date/time
            //     {id: 45, destination: now + timeDiff}  <-- 'destination' date/time minus current date/time
            // ]

        targetTime = (Date.now() + thisTimeDiff);
        newTimerDisplayEntry = { id: newTimeout, destination: targetTime };
        newTimerDisplayList = newTimerDisplayList.concat(newTimerDisplayEntry);
        this.setState({ timerDisplayList: newTimerDisplayList });

        // timeoutList[] will have 2 entries for each timeout
            // [
            //     {id: 0, timer: 15}, <-- Modal-prompt setTimeout ('pop-up alerts')
            //     {id: 0, timer: 24}, <-- Every-second setTimeout ('visual counter')
            //     {id: 1, timer: 32}, <-- Modal-prompt setTimeout
            //     {id: 1, timer: 45}  <-- Every-second setTimeout
            // ]

        newTimeoutEntry = { id: entryId, timer: newTimeout };
        newTimeoutList = newTimeoutList.concat(newTimeoutEntry);
        this.setState({ timeoutList: newTimeoutList });
    }
    updateTimeout(entryId: number, isSnooze?: boolean) {
        // This method has 2 calls from 1 entry point:
            // addRemoveTimeout()

        let thisTimeDiffUpdate = 0,
            thisTimeoutWait = 0,
            thisTimeoutWaitMax = 0;

        const newTimerList = this.state.timerList,
              timerEntry = newTimerList.find(
                  (elem: {id: number}) => (elem.id === entryId)
              )!, // Per TS: Method not called unless `timerList` is populated
              timerPresetTargetTime = timerEntry.presetTargetTime,
              timerHour = parseInt(timerEntry.timeOfDay.split(':')[0], 10),
              timerMinute = parseInt(timerEntry.timeOfDay.split(':')[1], 10),
              timerCycle = timerEntry.cycle;

        // If `timerPresetTargetTime` is > 0, use that as your target instead.
        thisTimeDiffUpdate = (timerPresetTargetTime === 0) ?
                                this.getTimeDiff(timerHour, timerMinute, timerCycle) :
                                timerPresetTargetTime - Date.now();

        thisTimeoutWait =
            (isSnooze) ? (this.state.snoozeTime * 60 * 1000) :
            thisTimeDiffUpdate;

        // 2073600000 ms = 576 hours = 24 days
        thisTimeoutWaitMax = (thisTimeoutWait > this.state.timeoutMax) ? this.state.timeoutMax : thisTimeoutWait;

        let newTimeoutList = this.state.timeoutList,
            newTimeout: number,
            tmpTimerOldId: number;

        // Find existing timer and clear it.
        for (let i = 0; i < newTimeoutList.length; i++) {
            if (newTimeoutList[i].id === entryId) {
                tmpTimerOldId = newTimeoutList[i].timer;
                clearTimeout(tmpTimerOldId); // Must clear the timeout (cannot rely on it being overwritten.)
                break;
            }
        }

        newTimeout = window.setTimeout(
            () => { this.addToTimeoutQueue(entryId); },
            thisTimeoutWaitMax
        );

        // UPDATE TIMEOUT LIST

        // Update an Object's properties from within an Array
        newTimeoutList = newTimeoutList.map( (elem: {id: number, timer: number}, idx: number) => {
            if (elem.id === entryId) {
                elem.timer = newTimeout;
            }
            return elem;
        });
        this.setState({ timeoutList: newTimeoutList });

        let newTimerDisplayList = this.state.timerDisplayList,
            targetTime: number;

        // UPDATE VISUAL COUNTDOWN LIST

        targetTime = (Date.now() + thisTimeoutWait);

        newTimerDisplayList = newTimerDisplayList.map( (elem: {id: number, destination: number}) => {
            if (elem.id === tmpTimerOldId) {
                elem.id = newTimeout;
                elem.destination = targetTime;
            }
            return elem;
        });
        this.setState({ timerDisplayList: newTimerDisplayList });
    }
    addToTimeoutQueue(entryId: number) {

        // Check `entryId` to see if item still has more time remaining. If so, run another .setTimeout()
        // (This is done due to the setTimeout's 32-bit (e.g., 24 day) limit.)

        const timerEntry = this.state.timerList.find(
                  (elem: {id: number}) => (elem.id === entryId)
              )!,
              timerPresetTargetTime = timerEntry.presetTargetTime,
              timerHour = parseInt(timerEntry.timeOfDay.split(':')[0], 10),
              timerMinute = parseInt(timerEntry.timeOfDay.split(':')[1], 10),
              timerCycle = timerEntry.cycle;

        let thisTimeoutWait = 0,
            thisTimeoutWaitMax = 0;

        // If `timerPresetTargetTime` is > 0, use that as your target instead.
        thisTimeoutWait = (timerPresetTargetTime === 0) ?
                                this.getTimeDiff(timerHour, timerMinute, timerCycle) :
                                timerPresetTargetTime - Date.now();

        // 2073600000 ms = 576 hours = 24 days
        thisTimeoutWaitMax = (thisTimeoutWait > this.state.timeoutMax) ? this.state.timeoutMax : thisTimeoutWait;

        // console.log('addToTimeoutQueue: ', thisTimeoutWaitMax, timerEntry);
        // This console.log helped debug the last error:
            // Modal not immediately removing timeout, and 'existing expired timeouts' aren't coded for on page init.
            // Solution: Expire it (the timeOut in the Modal trigger) like the others!

        if (thisTimeoutWaitMax > 0) {

            // It would seem a 24-day `setTimeout()` expired. (This is setTimeout's max timeout period.)
            // We'll need to run a new setTimeout with a new wait time.

            this.createTimeout(entryId);
            // this.updateTimeout(entryId); // Timeout has expired and been removed; Nothing to update.

        } else {

            // Let it run its Notification routine to notify the user.

            let tmpTimeoutQueue = this.state.timeoutQueue;
            tmpTimeoutQueue.push(entryId);
            this.setState({timeoutQueue: tmpTimeoutQueue}, this.checkTimeoutQueue);
        }
    }
    removeFromTimeoutQueue(entryId: number) {
        let tmpTimeoutQueue = this.state.timeoutQueue;

        tmpTimeoutQueue.forEach( (elem: number, idx: number) => {
            if (elem === entryId) {
                tmpTimeoutQueue.splice(idx, 1);
            }
        });
        this.setState({timeoutQueue: tmpTimeoutQueue}, this.checkTimeoutQueue);
    }
    checkTimeoutQueue() {
        // get queue, get first[0] id in queue
        // set [state]modal contents (which will show modal with showModal: true)

        let tmpTimeoutQueue = this.state.timeoutQueue;

        if (tmpTimeoutQueue.length > 0) {
            this.setNotification(tmpTimeoutQueue[0]);
        }
    }
    setNotification(entryId: number) {
        const timerEntry = this.state.timerList.find(
                  (entry: {id: number}) => (entry.id === entryId)
              )!; // For TS: Method not called unless `timerList` is populated.

        if (timerEntry) {
            this.setState(
                {
                    modalTitle: timerEntry.title,
                    modalTimerId: timerEntry.id
                },
                () => this.showNotification(entryId)
            );
        }
    }
    protected getTimeDiffUpdate(tHour: number, tMinute: number, timerCycle: number): number {

        let tmpDate = new Date(),
            timerDate = tmpDate.getDate(),
            timerHour = tHour,
            timerMinute = tMinute,
            addDate = 0,
            addHours = 0,
            addMinutes = 0,
            nowDate,
            nowSetTime,
            futureSetTime,
            timeToSetAhead = 0;

        const currentMinutes = tmpDate.getMinutes();

        tmpDate.setMilliseconds(0);
        tmpDate.setSeconds(0);

            // 'cycle' === '0: daily'
            // 'cycle' === '1: hourly'
            // 'cycle' === '2: minute'

        if (timerCycle === 0) {
            // tmpDate.setDate(tmpDate.getDate() + 1)

            tmpDate.setMinutes(timerMinute, 0, 0);
            tmpDate.setHours(timerHour);

            if (timerDate === tmpDate.getDate()) {              // 15 = 15
                addDate = 1;
            } else {                                            // If not equal, just add a day to current day
                addDate = tmpDate.getDate() + 1;
            }

        } else if (timerCycle === 1) {
            // tmpDate.setHours(tmpDate.getHours() + 1)

            // tH   cH -- (tH: timeoutHour, cH: currentHour)
            // 18 < 00 -- addHours = 24 + (timerMHour - tmpDate.getMHours()) + 1
            // 18 = 01 -- addHours = 1
            // 18 > 00 -- addHours = (timerMHour - tmpDate.getMHours()) + 1

            tmpDate.setMinutes(timerMinute, 0, 0); // I believe this just zeros it out, and doesn't inc/dec hours.

            if (timerMinute <= currentMinutes) {

                // if (timerHour < tmpDate.getHours()) {                   // 18 < 21 | 1 < 2
                // } else if (timerHour === tmpDate.getHours()) {          // 18 = 18
                // } else if (timerHour > tmpDate.getHours()) {            // 18 > 15 | 2 > 1
                //     // addHours = (timerHour - tmpDate.getHours()) + 1
                // }
                addHours = 1;
            }

        } else if (timerCycle === 2) {
            // tmpDate.setMinutes(tmpDate.getMinutes() + 1)

            addMinutes = 1;
        }

        tmpDate.setMinutes(tmpDate.getMinutes() + addMinutes);
        tmpDate.setHours(tmpDate.getHours() + addHours);
        tmpDate.setDate(tmpDate.getDate() + addDate);

        futureSetTime = tmpDate.getTime();           // Future milliseconds

        nowDate = new Date();
        nowSetTime = nowDate.getTime();              // Current milliseconds

        timeToSetAhead = futureSetTime - nowSetTime;
            // Future milliseconds - now() milliseconds +> Target Hours +> Target Minutes

        return timeToSetAhead;
    }
    protected getTimeDiff(tHour: number, tMinute: number, timerCycle: number) {

        let timerHour = tHour,
            timerMinute = tMinute,
            tmpDate = new Date(),
            addMinutes = 0,
            addHours = 0,
            nowDate,
            nowSetTime,
            futureSetTime,
            timeToSetAhead = 0;

        const currentMinutes = tmpDate.getMinutes();

        tmpDate.setMilliseconds(0);
        tmpDate.setSeconds(0);

        // 'cycle' === '0: daily'
        // 'cycle' === '1: hourly'
        // 'cycle' === '2: minute'

        if (timerMinute < tmpDate.getMinutes()) {               // :30 < :45 | 19 < 20 | 59

            addMinutes = 60 + (timerMinute - tmpDate.getMinutes());

        } else if (timerMinute === tmpDate.getMinutes()) {      // :30 = :30

            if (timerCycle === 0 || timerCycle === 1) {
                addMinutes = 0;
            } else {
                addMinutes = 1;
            }

        } else if (timerMinute > tmpDate.getMinutes()) {        // :30 > :15

            addMinutes = (timerMinute - tmpDate.getMinutes());
        }

        tmpDate.setMinutes(tmpDate.getMinutes() + addMinutes);

        if (timerHour < tmpDate.getHours()) {                   // 18 < 21

            addHours = 24 + (timerHour - tmpDate.getHours());

        } else if (timerHour === tmpDate.getHours()) {          // 18 = 18 | 3 = (2 + 1)

            // console.log('[...]', timerMinute, '<=', tmpDate.getMinutes(), '<=', currentMinutes)
            // ^---< was having trouble per testing note 3 lines down : Determined bad comparison

            //                         tT      cT
            // 31 "<=" 32 "|" 1  ===  3:31 <= 2:32  ===

            if (timerMinute === currentMinutes) {
                // Changed from [tmpDate.getMinutes()] to [currentMinutes]
                    // Due to test: (current time) 03:52 ==> (target time) 03:53
                    // 1 minute ahead resulted in (+1 hour +1 minute) ahead

                if (timerCycle === 0) {
                    addHours = 24;
                } else if (timerCycle === 1) {
                    addHours = 0;
                } else {
                    addHours = 0;
                }
            } else {
                addHours = 0;
            }

        } else if (timerHour > tmpDate.getHours()) {            // 18 > 15

            addHours = (timerHour - tmpDate.getHours());
        }

        addHours += timerHour;

        tmpDate.setHours(tmpDate.getHours() + addHours);

        futureSetTime = tmpDate.getTime();                      // Future milliseconds

        nowDate = new Date();

            // nowDate.setMilliseconds(0)
                // Don't need to zero this out.

            // nowDate.setSeconds(0)
                // Don't zero
                // Use current seconds to allow for 'same-minute' execution
                // I.e., if timer is set within the current minute,
                    // but current time is 30 seconds before the target 'timerMinute',
                    // it'll wait that first 30 seconds... not a minute and 30 seconds.

        nowSetTime = nowDate.getTime();              // Current milliseconds

        timeToSetAhead = futureSetTime - nowSetTime;
            // Future milliseconds - now() milliseconds +> Target Hours +> Target Minutes

            // [getTimeDiff] AAA double-check with ZZZ (below) 24 0 0 0
            // [getTimeDiff] tmpDate PRE seconds set           Wed Jul 12 2017 00:24:54 GMT-0700 (Pacific Daylight Time)
            // [getTimeDiff] tmpDate POST seconds set          Wed Jul 12 2017 00:24:00 GMT-0700 (Pacific Daylight Time)
            // [getTimeDiff] addMinutes                    36  Wed Jul 12 2017 01:00:00 GMT-0700 (Pacific Daylight Time)
            // [getTimeDiff] addHours                      23  Thu Jul 13 2017 00:00:00 GMT-0700 (Pacific Daylight Time)
            // [getTimeDiff] ZZZ Double check same as AAA      24 0 0 0
            // [tmpDate]                                       Thu Jul 13 2017 00:00:00 GMT-0700 (Pacific Daylight Time)
            // [nowDate]                                       Wed Jul 12 2017 00:24:54 GMT-0700 (Pacific Daylight Time)
            // [nowSetTime]                                    1499844294219
            // [futureSetTime]                                 1499929200000
            // [timeToSetAhead]                                84905781

        return timeToSetAhead;
    }
    toggleTimeout(timerId: number, onOff: string) {
        // This method has 4 entry points:
            // setTimerCallback()       // ID is highest
            // <Timer /> checkbox       // ID is passed in
            // <TimerBox /> alert Modal // ID from Modal: (timerReset && timerSnooze) (callbacks)

        if (onOff === 'on') {                           // <Form /> Add -> setTimer() -> setTimerCallback()
            this.addRemoveTimeout(timerId, 'add');
        } else if (onOff === 'off') {                   // timerList[] -> <Timer /> -> checkbox
            this.addRemoveTimeout(timerId, 'remove');
        } else if (onOff === 'snooze') {                // <Modal /> -> Snooze
            this.addRemoveTimeout(timerId, 'snooze');
        } else {                                        // <Modal /> -> Done (for now)
            this.addRemoveTimeout(timerId, 'update');
        }

        // Update Global Timer List - Set timer on/off (active/non-active)
            // Timer checkbox display (in Timer Listing)
            //
        if (onOff !== 'update' && onOff !== 'snooze') {
            // Added this condition because don't think we need to run this entire section of code if it's an 'update'
            // ('active' state should already be 'true' -- Just need to update the timer's new Timout ID)

            const newTimerList = this.state.timerList.map( (elem, idx: number) => {
                    if (elem.id === timerId) {
                        elem.active = (onOff === 'on') ? true : false;
                        // elem.active = (onOff === 'on' || onOff === 'update') ? true : false
                    }
                    return elem;
                  });

            this.setState({ timerList: newTimerList }, () => {
                setStorageItem(localStorage, 'timerList', JSON.stringify(newTimerList));
                this.props.setAlarms(this.state.timerList);
            });
        }
    }
    timerSnooze(entryId: number) {
        //
        this.setState({ showModal: false }, () => { // This will turn off the modal,
            this.removeFromTimeoutQueue(entryId);   //  then remove the entry from the timeoutQueue.
            this.toggleTimeout(entryId, 'snooze');  //  then this will setup a new setTimeout, which, when done, will
                                                    //  add this entry back into the timeoutQueue

                                                    // This should be run after the removal of the entry from the
                                                    // timeoutQueue (else it'll remove this entry).

                                                    // This should not pose an issue unless the setTimeout execution is
                                                    // less than the few milliseconds it takes for the
                                                    // 'removeFromTimeoutQueue()' method above to remove it
                                                    // from the queue first.
        });
    }
    timerReset(entryId?: number) {
        //
        const thisEntryId = entryId || this.state.modalTimerId;

        this.setState({ showModal: false }, () => {     // This will turn off the modal,
            this.removeFromTimeoutQueue(thisEntryId);   // then remove the entry from the timeoutQueue.

            let thisElem = this.state.timerList.find(elem => elem.id === thisEntryId)!;

            if (thisElem.presetTargetTime === 0) {  // For Timer items (no preset time)

                this.toggleTimeout(thisEntryId, 'update');  // this will setup a new setTimeout, which, when done,
                                                            // will add this entry back into the timeoutQueue

                                                    // This should be run after the removal of the entry from the
                                                    // timeoutQueue (else it'll remove this entry).

                                                    // This should not pose an issue unless the setTimeout execution is
                                                    // less than the few milliseconds it takes for the
                                                    // 'removeFromTimeoutQueue()' method above to remove it
                                                    // from the queue first.
            } else {

                this.removeTimer(thisEntryId, true);
            }
        });
    }
    timerDisable(entryId: number) {
        // This was refactored at some point.
        // Should be able to point the JSX callbacks to `timerReset` directly.
        this.timerReset(entryId);
    }
    setSnooze(snoozeTime: number) {
        //
        this.setState(
            { snoozeTime: snoozeTime },
            () => {
                setStorageItem(localStorage, 'snoozeTime', snoozeTime.toString());
            }
        );
    }
    showNotification(entryId: number) {

        // When 'Expired To Be' is used as a Chrome extension, it uses the `chrome.alarms` API.

        // Notification Options
        // [ ] alerts
        // [ ] notifications
        // [ ] modals (passive)
        // [ ] none
        // all include:
            // change tab: title
            // change tab: icon

        this.props.updatePassiveNotification();

        if (this.props.prefs.prefNotification === 'modals') {
            this.timerReset(entryId);

            // @TOCHECK: This "could" throw an error. [Follow-up: It did.]
            // Could not get `timerReset` to work with 'alerts' and 'notifications'
            // when setting `timerReset` inside their callbacks (as 'modals' does).
            // A check for 'active -but- expired' timeouts isn't done on page init.
            this.setState({ showModal: true });

        } else if (this.props.prefs.prefNotification === 'alerts') {
            this.timerReset(entryId);

            setTimeout(
                () => {
                    alert(this.state.alarmMsg);
                },
                100);

        } else if (this.props.prefs.prefNotification === 'notifications') {
            this.timerReset(entryId);

            // Resetting timer first, so no use for a callback (below). Tried setting
            // `timerReset` inside the callback, but it didn't like it much (although
            // it could have been due to @DEBUG `getBetween` being manually set to 1).
            this.props.triggerAlarm(entryId);
            // @MOVED: Catch Resolve and Reject

            // this.props.triggerAlarm(entryId).then( result => {
            //     console.log('triggerAlarm: ', result);
            //     // @TOMAYBE: Only reset if "OK" was clicked (not the 'X')
            // });

        } else {
            // None
            this.timerReset(entryId);
        }
    }
    resetModal() {
        this.setState({ showModal: false });
    }
    render() {
        const SettingsFormProps = {
                titleCount: this.state.titleCount,
                titleTemp: this.state.titleTemp,
                countHours: this.state.countHours,
                countMinutes: this.state.countMinutes,
                stepCountMinutes: this.state.stepCountMinutes,
                entryCycleList: this.state.entryCycleList,
                setTimer: this.setTimer,
              },
              sClass1 = `field-col settings-form-col `,
              sClass2 = `${this.props.prefs.allowTimers === false && 'hidden'}`,
              sClass = sClass1 + sClass2;

        if (this.props.prefs.showPanel === true) {
            return (
                <div>
                    <main className="content">{this.props.children}
                        <Row className={'show-grid'}>
                            <Col
                                xs={12}
                                sm={5}
                                md={5}
                                className={sClass}
                            >
                                <SettingsForm {...SettingsFormProps} />
                            </Col>
                            <Col
                                xsOffset={1}
                                xs={10}
                                smOffset={0}
                                sm={7}
                                md={7}
                                className={`field-col timer-list`}
                                // className={`field-col timer-list ${this.state.timerList.length === 0 && 'hidden'}`}
                            >
                                <Timers
                                    removeTimer={this.removeTimer}
                                    toggleTimeout={this.toggleTimeout}
                                    timerList={this.state.timerList}
                                    timeoutList={this.state.timeoutList}
                                    timerDisplayList={this.state.timerDisplayList}
                                    entryCycleList={this.state.entryCycleList}
                                    showSeconds={this.state.showSeconds}
                                />
                            </Col>
                        </Row>
                        <ul className={sClass}>
                            <li className="padTopLi2">
                                <span className="timer-options">[Setting]</span>&nbsp;
                                Snooze delay time (in minutes; for future snoozes):&nbsp;
                                <SnoozeForm snoozeTime={this.state.snoozeTime} setSnooze={this.setSnooze} />
                            </li>
                            <li className="padTopLi">
                                When a timer is created, the timer will be initially set to
                                the next available time from when the time is set based on the 'cycle' selection.
                            </li>
                        </ul>
                        <TimerAlertPrompt
                            show={this.state.showModal}
                            timerList={this.state.timerList}
                            entryCycleList={this.state.entryCycleList}
                            modalTimerId={this.state.modalTimerId}
                            modalTitle={this.state.modalTitle}
                            timerReset={this.timerReset}
                            timerDisable={this.timerDisable}
                            timerSnooze={this.timerSnooze}
                            snoozeTime={this.state.snoozeTime}
                            alarmMsg={this.state.alarmMsg}
                            resetModal={this.resetModal}
                            // hideDelete={false}
                            // userDelete={this.userDelete}
                        />
                    </main>
                </div>
            );
        } else {
            return (
                <div>
                    <TimerAlertPrompt
                        show={this.state.showModal}
                        timerList={this.state.timerList}
                        entryCycleList={this.state.entryCycleList}
                        modalTimerId={this.state.modalTimerId}
                        modalTitle={this.state.modalTitle}
                        timerReset={this.timerReset}
                        timerDisable={this.timerDisable}
                        timerSnooze={this.timerSnooze}
                        snoozeTime={this.state.snoozeTime}
                        alarmMsg={this.state.alarmMsg}
                        resetModal={this.resetModal}
                        // hideDelete={false}
                        // userDelete={this.userDelete}
                    />
                </div>
            );
        }
    }
    private getLastId() {
        const lastId = this.state.timerList.reduce(
            (agg: number, curObj: {id: number}) => (curObj.id > agg) ? curObj.id : agg, 0 );

        return lastId;
    }
    private setTimerCallback() {
        const lastId = this.getLastId();
        this.toggleTimeout(lastId, 'on'); // 'addRemoveTimeout' is called from 'toggleTimeout'
    }
    private updateTimerCallback(entryId: number) {
        this.toggleTimeout(entryId, 'update'); // 'addRemoveTimeout' is called from 'toggleTimeout'
    }
}

/*
 * INTERFACES
 */
interface TimerListState {
    id: number;
    title: string;
    presetTargetTime: number;
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

interface TimerBoxState {
    timerList: TimerListState[];               // A list of timers:
                                               //     { id: 0, title: '', presetTargetTime: 0,
                                               //       timeOfDay: '00:00', cycle: 0 }
    timeoutList: TimeoutListState[];           // A list of active timers -- with Timeout ID: { id: 0, timer: 0 }
                                               // timeoutList[] will have 2 entries for each timeout
                                               // [
                                               //     {id: 0, timer: 15}, <-- Modal-prompt setTimeout ('pop-up alerts')
                                               //     {id: 0, timer: 24}, <-- Every-second setTimeout ('visual counter')
                                               //     {id: 1, timer: 32}, <-- Modal-prompt setTimeout
                                               //     {id: 1, timer: 45}  <-- Every-second setTimeout
                                               // ]
    timeoutQueue: number[];                    // A list of completed timeouts going through the 'modal' process.
    timerDisplayList: TimerDisplayListState[]; // 1-second timeouts that update set (stateless) <TimeDisplay />s.
                                               // timerDisplayList[]
                                               // --> 'id' is this sibling timeout's Timer ID;
                                               //     'destination' is current date/time plus timeDiff
                                               // [
                                               //     {id: 24, destination: targetDateInMilliseconds},
                                               //     {id: 45, destination: targetDateInMilliseconds}
                                               // ]
    titleCount: number;                         // 20,
    titleTemp: string;                          // 'Watch my show!',
    countHours: number;                         // 24,
    countMinutes: number;                       // 60,
    stepCountMinutes: number;                   // 5,
    snoozeTime: number;                         // stateSnoozeTime,
    entryCycleList: string[];                   // ['daily','hourly','every minute'],
    showModal: boolean;                         // false,
    modalTitle: string;                         // '',
    modalTimerId: number;                       // '',
    showSeconds: boolean;                       // stateShowSeconds,
    currentTimerId: number;
    alarmMsg: string;                           // Default message for alarms.
    timeoutMax: number;                         // 24 days is setTimeout's 32-bit max.
}

interface TimerBoxProps {
    ourExpirationItems: ExpirationItems[];
    setAlarms: (stateTimerList: TimerListState[]) => void;
    refreshAlarms: () => void;
    prefs: Prefs;
    triggerAlarm: (timerId: number) => void;    // Promise<string>;
    updatePassiveNotification: () => void;      // Update browser tab icon and title.
    // resetPassiveNotification: () => void;    // Reset browser tab icon and title.
}

interface ExpirationItems {
    whichEvent: string;   // "add"
    expiredId: number;    // 2
    entryTitle: string;   // "x2b-2"
    entryPresetTargetTime: number; // 0 || milliseconds to target date's midnight.
    entryHours: number;   // 552   // [0|24|48|...] // 552 / 24 = 23 (days)
    entryMinutes: number; // 0
    entryCycle: number;   // 0     // 0: daily // @TODO: allow to override snooze; off|on[daily|hourly]
}

interface Prefs {
    showPanel: boolean;
    allowTimers: boolean;
    prefNotification: string; // 'modals', 'alerts', 'notifications', 'none'
}

export default TimerBox;