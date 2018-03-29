Entry points

- Page load
- SettingsForm

setTimer()

    Index (nextIdx in setTimer()) - Pass it back to store with Expiration item

    initialState() {
        return {
            entryTitle: '',
            entryHours: 0,
            entryMinutes: 0,
            entryCycleSelect: 0, // [daily|hourly|every minute]
            active: false
    resetState() {

    updateEntry(evt: React.SyntheticEvent<HTMLSelectElement> | React.SyntheticEvent<HTMLInputElement>) {
        switch (targetName) {
            case 'entryTitle':
                this.setState({ entryTitle: newVal });
            case 'entryHours':
                this.setState({ entryHours: newVal });
            case 'entryMinutes':
                this.setState({ entryMinutes: newVal });
            case 'entryCycleSelect':
                this.setState({ entryCycleSelect: newVal });

    submitEntry(evt: React.SyntheticEvent<Form>) {
            this.props.setTimer(
                this.state.entryTitle,
                this.state.entryHours,
                this.state.entryMinutes,
                this.state.entryCycleSelect);
            // -- Reset local state
            this.resetState();

// ###
// ### popup.js
//

[541] function toggleActive(e) {
    if (stateItem.active === true) {
[A]   deleteTimer(thisId).then( (wasCleared) => {
        if (typeof(wasCleared) !== 'undefined') {
          message('Your alarm has been removed.', false); // , thisId
    } else { // active === false
      if (canBeActive) {
[B]     createTimer(thisId, newThen).then( (newAlarm) => {
          if (typeof(newAlarm) !== 'undefined') {
            message('An alarm was created for your item.', false); // , newAlarm.alarmId

[A] function deleteTimer(timeId) {
  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.alarms')) {
      chrome.alarms.clear("x2b-" + timeId, (wasCleared) => {
        if (wasCleared) { showList(); }
        resolve(wasCleared);
      });
    } else {
      // @TODO: Implement local alarms interface. (v1.5)
      resolve(undefined);

[B] function createTimer(timeId, delay) { // async / returns a Promise
  let alarmId = "x2b-" + timeId;
  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.runtime')) {
      try {
        chrome.runtime.sendMessage({ alarmId, delay }, (response) => {
          resolve(response);
      } catch(e) {
        // We're actually in Chrome, but we're not running the Chrome Extension.
        // So we should follow the approach for: localStorage and Notifications.
        // @TODO: Implement local alarms interface. (v1.5)
        resolve(undefined);
      }
    } else {
      // @TODO: Implement local alarms interface. (v1.5)
      resolve(undefined);

function saveChanges(itemToSave = {}, lastImport) {
  if (isActive) {
    createTimer(thisId, newThen).then( (newAlarm) => {
      if (!isImport) {
        if (typeof(newAlarm) !== 'undefined') {
          message(' An alarm was successfully created.', false);
        }
      }
    });
  } else {
    deleteTimer(thisId).then( (wasCleared) => {
      if (!isImport) {
        if (typeof(wasCleared) !== 'undefined') {
          message('Previous alarm has been removed.', false); // , thisId
        }
      }
    });
  }
  // Save item using the Chrome extension storage API.
  // updateStorageWithState(itemIdOrig); // Update '.sync' storage.
  if (lastImport) {
    x2bStorage.set(itemIdOrig, 'last');
  } else {
    x2bStorage.set(itemIdOrig);
  }



if (whichFunc === 'del') {
clearItem(itemId);
}
function clearItem(itemId) { // deleteAlarm                                     // CAN clearItem EXECUTE deleteTimer ???
  let storeId = "x2b-" + itemId,
  ourState = newState;
  if (isGood('chrome') && isGood('chrome.alarms') && isGood('chrome.storage')) {
    chrome.alarms.clear(storeId, (wasCleared) => {
      chrome.storage.sync.set({'expiresList': newState}, () => {
        showList();
  } else {
    if (isGood('window.localStorage')) {
      x2bStorage.set(-1);
    }
    // @TODO: Implement local alarms interface. (v1.5)
    showList();
  }

function toggleActive(e) {
      deleteTimer(thisId).then( (wasCleared) => {
        passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, false); // false = not creating a timer
          message('Your alarm has been removed.', false); // , thisId
function saveChanges()

function deleteTimer(timeId) {
  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.alarms')) {
      chrome.alarms.clear("x2b-" + timeId, (wasCleared) => {
        if (wasCleared) {
          showList();
        }
        resolve(wasCleared);
      });
    } else {

      // @TODO: Implement local alarms interface. (v1.5)

      resolve(undefined);
    }
  });


// ### TimerBox

class TimerBox extends React.Component<TimerBoxProps, TimerBoxState> {}

// - Page Load

componentDidMount() {}
    this.initializeState();
initializeState() {}

// - Toggle Timer


// - Delete Timer


// - Update Timer


// ###
// ###
// ###


class TimerBox extends React.Component<TimerBoxProps, TimerBoxState> {

    componentDidMount() {
        this.initializeState();

        > initializeState() {
            stateTimerList.forEach( (elem: {id: number, active: boolean}) => {
                if (elem.active === true) {
                    global.setTimeout( () => {                                     // WHen these are not staggered,
                            this.addRemoveTimeout(elem.id, 'add');  // only 1 shows in the 'timerDisplay' code/layout.

    setTimer( entryTitle: string, entryHours: number, entryMinutes: number, entryCycle: number ) {
        this.setState({ timerList }, () => {
            setStorageItem(localStorage, 'timerList', JSON.stringify(timerList));
            this.setTimerCallback();

            > setTimerCallback() {
                this.toggleTimeout(lastId, 'on'); // 'addRemoveTimeout' is called from 'toggleTimeout'

    getLastId() {
        return lastId;

    removeTimer(timerId: number) {
        this.setState({ timerList: newTimerList }, () => {
            setStorageItem(localStorage, 'timerList', JSON.stringify(newTimerList));

    addRemoveTimeout(timerId: number, whichTask: string) {
            this.deleteTimeout(entryId);        //                    setTimeout delay is...
            this.updateTimeout(entryId);        // no 2nd param       (...based on current time)
            this.updateTimeout(entryId, true);  // 2nd param = snooze (...set based on state.snoozeTime)
            this.createTimeout(entryId);        //                    (...set based on <form> submit values & cur time)

    deleteTimeout(entryId: number) {
        this.setState({timeoutList: newTimeoutList});
        this.setState({ timerDisplayList: newTimerDisplayList });

    createTimeout(entryId: number) {
        newTimeout = window.setTimeout(
                this.addToTimeoutQueue(entryId);
        this.setState({ timerDisplayList: newTimerDisplayList });
        this.setState({ timeoutList: newTimeoutList });

    addToTimeoutQueue(entryId: number) {
        tmpTimeoutQueue.push(entryId);
        this.setState({timeoutQueue: tmpTimeoutQueue}, this.checkTimeoutQueue);

    removeFromTimeoutQueue(entryId: number) {
        this.setState({timeoutQueue: tmpTimeoutQueue}, this.checkTimeoutQueue);

    checkTimeoutQueue() {
        if (tmpTimeoutQueue.length > 0) {
            this.setModal(tmpTimeoutQueue[0]);

    updateTimeout(entryId: number, isSnooze?: boolean) {
        newTimeout = window.setTimeout(
            () => { this.addToTimeoutQueue(entryId); },
            thisTimeoutWait

        newTimeoutList = newTimeoutList.map( (elem: {id: number, timer: number}, idx: number) => {
        this.setState({ timeoutList: newTimeoutList });

        newTimerDisplayList = newTimerDisplayList.map( (elem: {id: number, destination: number}) => {
        this.setState({ timerDisplayList: newTimerDisplayList });

    toggleTimeout(timerId: number, onOff: string) {
            this.addRemoveTimeout(timerId, 'add');
            this.addRemoveTimeout(timerId, 'remove');
            this.addRemoveTimeout(timerId, 'snooze');
            this.addRemoveTimeout(timerId, 'update');
        if (onOff !== 'update' && onOff !== 'snooze') {
                  newTimerList = this.state.timerList.map( (elem, idx: number) => {
                    if (elem.id === entryIdx) {
                        elem.active = (onOff === 'on') ? true : false;
            this.setState({ timerList: newTimerList }, () => {
                setStorageItem(localStorage, 'timerList', JSON.stringify(newTimerList));

    timerSnooze(entryId: number) {
        this.setState({ showModal: false }, () => { // This will turn off the modal,
            this.removeFromTimeoutQueue(entryId);   //  then remove the entry from the timeoutQueue.
            this.toggleTimeout(entryId, 'snooze');  //  then this will setup a new setTimeout, which, when done, will

    timerReset(entryId: number) {
        this.setState({ showModal: false }, () => { // This will turn off the modal,
            this.removeFromTimeoutQueue(entryId);   //  then remove the entry from the timeoutQueue.
            this.toggleTimeout(entryId, 'update');  //  then this will setup a new setTimeout, which, when done, will

    timerDisable(entryId: number) {
        this.setState({ showModal: false }, () => {
            this.toggleTimeout(entryId, 'off');
            this.removeFromTimeoutQueue(entryId);

    setModal(entryId: number) {
        this.setState(
            { modalTitle: timerEntry.title, modalTimerId: timerEntry.id },
            this.showModal

    showModal() {
        this.setState({ showModal: true });

    protected getTimeDiffUpdate(tHour: number, tMinute: number, timerCycle: number): number {
        return timeToSetAhead;

    protected getTimeDiff(tHour: number, tMinute: number, timerCycle: number) {
        return timeToSetAhead;
