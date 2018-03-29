/*
    React Component > Form > Container

        - Parent container for: [Form > Input > Type: Date]
        - (native Date input field with non-native fallback)

    Simplified Overview:

        Native:
            <input type="date" />

        Non-Native Fallback:
            <select name="year" />
            <select name="month" />
            <select name="day" />

    Project Dependencies:

        {   "dependencies": {
                "prop-types": "^15.5.10",
                "react": "^15.6.1",
                "react-bootstrap": "^0.31.0",
                "react-dom": "^15.6.1"
            }
        }

    Integration / Implementation:

        - Pass in to this Component via a Prop:
            `formParams` = { fid: 0, date: '20170701' }

        - For updating the form's state (onSubmit):
            Search this file for: CUSTOM

    Compiler:

        - Keith D Commiskey (2017-06)

        This code is hosted and run on GitHub via Travis CI.

        - GitHub Source (Code) -- https://github.com/KDCinfo/react-form-input-date-native
        - GitHub Pages (Demo) -- https://KDCinfo.github.io/react-form-input-date-native/
        - Travis CI (Prod Build) -- https://travis-ci.org/KDCinfo/react-form-input-date-native
*/

import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button } from 'react-bootstrap'

import DateInput from './FormDate'

import { populateDays } from '../util/form-functions'

class FormDateContainer extends React.Component {
    constructor(props) {
        super(props)

        // Test whether a native date input falls back to a text input (i.e., native date input is not supported)
        //
            let testType = document.createElement('input'),
                showNativeDate
            testType.type = 'date'
            showNativeDate = testType.type === 'text' ? false : true

        this.state = {
            showNativeDate: showNativeDate,
            formState: this.initialFormData(),   // Updated on input field changes
            sourceState: this.initialFormData(), // Is only updated on form submit
            fieldRequired: {
                date: true
            },
            idValid: null,
            idError: '',
            dateValid: null,
            dateError: ''
        }

        // Bind component methods
        //
            this.validateForm = this.validateForm.bind(this)
            this.clearForm = this.clearForm.bind(this)
            this.resetState = this.resetState.bind(this)
    }
    initialFormData() {
        const newDate = new Date()
        return {
            "fid": 0,
            "date": (newDate.getFullYear()) + ('0' + (newDate.getMonth()+1)).slice(-2) + ('0' + newDate.getDate()).slice(-2),
        }
    }
    componentDidMount() {
        // Overwrite `sourceState` (initialFormData)
        // If object is passed in as a prop

        this.resetState()
    }
    resetState() {
        const testProps = this.props.formParams,        // 'formParams' Expects Object with a 'date' key
                                                        // { fid: [0], date: 'yyyymmdd' }
              propsHasDate = typeof(testProps) !== 'undefined' && typeof(testProps.date) !== 'undefined',
              thisProps = propsHasDate ? testProps : this.state.sourceState,
              mergedFormData = Object.assign({}, {...this.state.sourceState}, {...thisProps})

        this.setState({
            'sourceState': mergedFormData,
            'formState': mergedFormData
        })
    }
    clearForm() {
        // Only reset 'formState';
        // 'sourceState' is only changed (updated) on form submit

        this.setState({ formState: this.state.sourceState })
    }
    handleChangeDate(newDate) {
        this.handleChange('date', newDate)
    }
    handleChange = (field, data) => {
        const oldFormData = this.state.formState,
              newFormData = {...oldFormData, [field]: data};
        this.setState({ 'formState': newFormData }, () => {
            if (this.validateForm( newFormData )) {
                this.handleSubmit();
            }
        });
    }
    handleSubmit(e) {
        if (e) {
            e.preventDefault()
        }

        const thisEntry = this.state.formState

        // Validate Form
        if (this.validateForm( thisEntry )) {

            // CUSTOM:

            // This is where you would pass this form's data [this.state.formData] to a prop's callback function
                // e.g., this.props.processFormData(this.state.formState)
                // Or call a Redux action to update the core Redux state
            // Instead, for this standalone purpose, we'll just update our fake 'sourceState'
            this.setState({sourceState: thisEntry}, () => {

                console.log('[UPDATE submitted] 0: ', thisEntry);

                console.log('[UPDATE submitted] 1: ', this.state.formState);
                console.log('[UPDATE submitted] 2: ', this.state.sourceState);

                this.props.formParams.x2bChange(this.state.formState);

            })

        } else {
            console.log('Errors were found -> Error states have been set (which should toggle individual field error visibility)')
        }
    }
    validateForm(form) {

        const errors = {},
              formatDateStripped = /^\d{8}$/

        for (let [key, val] of Object.entries( form )) {
            switch (key) {
                case 'fid':
                    // console.log('fid', val, typeof(val))

                    if (typeof(val) !== 'number' || (typeof(val) === 'number' && val < 0)) {
                        errors[key] = '[' + key + '] should be a Whole Number'
                        this.setState({ idValid: 'error' })
                        this.setState({ idError: errors[key] })
                    }
                    break

                case 'date':
                    // console.log('date', val, typeof(val))

                    if (typeof(val) !== 'string' || val.length !== 8 || !val.match(formatDateStripped)) {
                        errors[key] = 'The [' + key + '] field should be an 8-digit number representing yyyymmdd'
                        this.setState({ dateValid: 'error' })
                        this.setState({ dateError: errors[key] })
                    } else {
                        // This could be validated further where:
                            // yyyy should be a number between 1900 and 9999
                            // mm   should be a 2-digit string (number) and should represent a float from 1-12
                            // dd   should be a 2-digit string (number) and should represent a float from 1-31
                    }
                    break

                default:
                    break
            }
        }

        if (Object.keys(errors).length > 0) {
            return false
        } else {
            return true
        }
    }
    render() {

        const // { id, date } = this.props
              // { id, date } = this.state.sourceState,
              formId = this.state.formState.fid,
              propsObj = {
                'data-id': formId,
                required: true
              },
        isEdit = true,
        entryEdit = this.state.formState

        return (
            <div data-id={'form-' + entryEdit.fid}>
                <Row className="show-grid">
                    <Col className="field-col" xs={12}>
                        <DateInput
                            {...propsObj}
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
                        <Button className="btn btn-default" onClick={this.clearForm}>reset</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

if(process.env.NODE_ENV !== 'production') {
    FormDateContainer.propTypes = {

        formParams : PropTypes.object.isRequired
        // Object with a 'date' key: { fid: 0, date: 'yyyymmdd' }

    }
}

export default FormDateContainer