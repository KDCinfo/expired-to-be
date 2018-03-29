/*
    React Component > Form > Input Field > Type: Date

        - An HTML5 native Date input field with non-native fallback support as outlined in the MDN documentation

    Expected data input:

        this.props.entryId                   // [int] >= 0 | Used for: IDs - field-date- field-inputYear- field-inputMonth- field-inputDay-
        this.props.showNativeDate            // [bool] true|false | Used for: Show native date input (t) or individual y/m/d selectors (f)
        this.props.handleChangeDate(newDate) // yyyymmdd | A callback function that should handle the (newDate); API, local / session, etc.
        this.props.fullDateYearLeft          // yyyy-mm-dd        | Format used to populate the native date input field
        this.props.yearSelect                // yyyy              | Non-native fallback support - Year field
        this.props.monthSelect               // 01 (0-padded)     | Non-native fallback support - Month field
        this.props.daySelect                 // 01 (0-padded)     | Non-native fallback support - Day field
        this.props.days                      // [<option>1</option><option>2</option>,...] | An array whose length is based on year & month.
        this.props.isDateRequired            // [bool] true|false |

        Resources:

        months                               // ['Jan','Feb',...] | Allows for parental 'day' field manipulation.

    Usage:

        <DateInput
            entryId={entryEdit.fid}
            showNativeDate={this.state.showNativeDate}
            handleChangeDate={this.handleChangeDate.bind(this)}
            date={entryEdit.date}
            days={populateDays(entryEdit.date)}
            daySelect={entryEdit.date.substr(6, 2)}
            monthSelect={entryEdit.date.substr(4, 2)}
            yearSelect={entryEdit.date.substr(0, 4)}
            fullDateYearLeft={entryEdit.date.substr(0, 4) + '-' + entryEdit.date.substr(4, 2) + '-' + entryEdit.date.substr(6, 2)}
            isDateRequired={this.state.fieldRequired['date']}
            isDateDisabled={!isEdit}
        />

    Compiler:

        - Keith D Commiskey (2017-06)

        This code is hosted and run on GitHub via Travis CI.

        - GitHub Source (Code) -- https://github.com/KDCinfo/react-form-input-date-native
        - GitHub Pages (Demo) -- https://KDCinfo.github.io/react-form-input-date-native/
        - Travis CI (Prod Build) -- https://travis-ci.org/KDCinfo/react-form-input-date-native
*/

import React from "react"
import PropTypes from 'prop-types'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'

import { months } from '../util/form-functions'

class DateInput extends React.Component {
    constructor(props) {
        super(props)

        const thisDate = new Date(),
              years = Array.from(Array(thisDate.getFullYear()-2000+11), (e,i)=>i+(2000))

        this.state = {
            years: years,
            nativePickerDisplay: 'none',
            fallbackPickerDisplay: 'none',
            fallbackLabelDisplay: 'none',
            fallbackRequired: false
        }
    }
    componentWillMount() {
        // console.log('componentWillMount [this.state] and [this.props]')
        // console.log(this.state)
        // console.log(this.props)

        if (this.props.showNativeDate) {
            // Show the native date picker (keep fallback date entries hidden)
            this.setState({nativePickerDisplay: 'block'})

        } else {
            // Show the fallback date entries (keep native date picker hidden)
            this.setState({fallbackPickerDisplay: 'inline-block'})
            this.setState({fallbackLabelDisplay: 'inline-block'})
            this.setState({fallbackRequired: true})
        }
    }
    handleChangeYearSelect(e) {
        const newDate = e.target.value + this.props.monthSelect + this.props.daySelect

        this.props.handleChangeDate(newDate)
    }
    handleChangeMonthSelect(e) {
        const newMonth = ('0' + (e.target.selectedIndex + 1)).slice(-2),
              newDate = this.props.yearSelect + newMonth + this.props.daySelect

        this.props.handleChangeDate(newDate)
    }
    handleChangeDaySelect(e) {
        const newDay = ('0' + e.target.value).slice(-2),
              newDate = this.props.yearSelect + this.props.monthSelect + newDay

        this.props.handleChangeDate(newDate)
    }
    handleChangeDateNative(e) {
        // Native date input value is: 2017-12-31 // Storing without '-'
        this.props.handleChangeDate(e.target.value.replace(/-/gi, ''))
    }
    render() {
        // The native input 'date' value is always formatted [yyyy-mm-dd]
        // <input className="hide" name="date-old" onChange={this.props.handleChange} value={this.props.date} type="date" title="yyyy-mm-dd" placeholder="yyyy-mm-dd" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" />
        return (
            <div>
                <div style={{display: this.state.nativePickerDisplay}} className="nativeDatePicker">
                    <FormGroup controlId={'field-date-' + this.props.entryId}>
                        <ControlLabel srOnly={this.props.isDateDisabled} bsClass="field-label"><span>Date:</span></ControlLabel>
                        <FormControl
                            disabled={this.props.isDateDisabled}
                            required={this.props.isDateRequired}
                            type="date"
                            placeholder="Date"
                            name="inputDate"
                            onChange={this.handleChangeDateNative.bind(this)}
                            value={this.props.fullDateYearLeft}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </div>
                <p style={{display: this.state.fallbackLabelDisplay}} className="fallbackLabel hide">Enter Date:</p>
                <div style={{display: this.state.fallbackPickerDisplay}} className="fallbackDatePicker">
                    <FormGroup>
                        <ControlLabel srOnly={this.props.isDateDisabled} htmlFor={"field-inputYear-" + this.props.entryId}><span>Year</span></ControlLabel>
                        <FormControl
                            disabled={this.props.isDateDisabled}
                            required={this.state.fallbackRequired && this.props.isDateRequired}
                            componentClass="select"
                            placeholder="Year"
                            id={"field-inputYear-" + this.props.entryId}
                            name="inputYear"
                            onChange={this.handleChangeYearSelect.bind(this)}
                            value={parseFloat(this.props.yearSelect)}
                        >
                            { this.state.years.map( (day, idx) => <option key={idx}>{day}</option> ) }
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel srOnly={this.props.isDateDisabled} htmlFor={"field-inputMonth-" + this.props.entryId}><span>Month</span></ControlLabel>
                        <FormControl
                            disabled={this.props.isDateDisabled}
                            required={this.state.fallbackRequired && this.props.isDateRequired}
                            componentClass="select"
                            placeholder="Year"
                            id={"field-inputMonth-" + this.props.entryId}
                            name="inputMonth"
                            onChange={this.handleChangeMonthSelect.bind(this)}
                            value={months[parseFloat(this.props.monthSelect)-1]}
                        >
                            { months.map( (month, idx) => <option key={idx}>{month}</option> ) }
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel srOnly={this.props.isDateDisabled} htmlFor={"field-inputDay-" + this.props.entryId}><span>Day</span></ControlLabel>
                        <FormControl
                            disabled={this.props.isDateDisabled}
                            required={this.state.fallbackRequired && this.props.isDateRequired}
                            componentClass="select"
                            placeholder="Year"
                            id={"field-inputDay-" + this.props.entryId}
                            name="inputDay"
                            onChange={this.handleChangeDaySelect.bind(this)}
                            value={parseFloat(this.props.daySelect)}
                        >
                            { this.props.days.map( (day, idx) => <option key={idx}>{day}</option> ) }
                        </FormControl>
                    </FormGroup>
                </div>
            </div>
        )
    }
}

if(process.env.NODE_ENV !== 'production') {
    DateInput.propTypes = {

        entryId : PropTypes.number.isRequired,
        // [int] >= 0 | Used for: IDs - field-date- field-inputYear- field-inputMonth- field-inputDay-

        handleChangeDate : PropTypes.func,
        // yyyymmdd | A callback function that should handle the (newDate); API, local / session, etc.

        showNativeDate : PropTypes.bool.isRequired,
        // [bool] true|false | Used for: Show native date input (t) or individual y/m/d selectors (f)

        fullDateYearLeft : PropTypes.string.isRequired,
        // yyyy-mm-dd        | Format used to populate the native date input field

        yearSelect : PropTypes.string.isRequired,
        // yyyy              | Non-native fallback support - Year field

        monthSelect : PropTypes.string.isRequired,
        // 01 (0-padded)     | Non-native fallback support - Month field

        daySelect : PropTypes.string.isRequired,
        // 01 (0-padded)     | Non-native fallback support - Day field

        days : PropTypes.array.isRequired,
        // [<option>1</option><option>2</option>,...] | An array whose length is based on year & month.

        isDateRequired : PropTypes.bool.isRequired,
        // [bool] true|false |

        isDateDisabled : PropTypes.bool.isRequired
        // [bool] true|false |
    }
}
/*
    // PropTypes.string.isRequired
    // PropTypes.array
    // PropTypes.object
    // PropTypes.number
    // PropTypes.func
    // PropTypes.bool

    this.props.entryId                   // [int] >= 0 | Used for: IDs - field-date- field-inputYear- field-inputMonth- field-inputDay-
    this.props.showNativeDate            // [bool] true|false | Used for: Show native date input (t) or individual y/m/d selectors (f)
    this.props.handleChangeDate(newDate) // yyyymmdd | A callback function that should handle the (newDate); API, local / session, etc.
    this.props.fullDateYearLeft          // yyyy-mm-dd        | Format used to populate the native date input field
    this.props.yearSelect                // yyyy              | Non-native fallback support - Year field
    this.props.monthSelect               // 01 (0-padded)     | Non-native fallback support - Month field
    this.props.daySelect                 // 01 (0-padded)     | Non-native fallback support - Day field
    this.props.days                      // [<option>1</option><option>2</option>,...] | An array whose length is based on year & month.
    this.props.isDateRequired            // [bool] true|false |
    this.props.isDateDisabled
*/

export default DateInput