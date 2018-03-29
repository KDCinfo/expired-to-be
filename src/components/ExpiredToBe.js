import React from 'react';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';

// // // // // // // // // //
// [FormDateContainer.js]
//
// import FormDateContainer from './FormDateContainer'

if(process.env.NODE_ENV !== 'production') {
    // console.clear()
}

class ExpiredToBe extends React.Component {
  state = {
    expiredToBe: '',
    ourDate: '2033-03-10'
  };

  componentDidMount = () => {
    this.getHTML();
  }

  getHTML = () => {
    async function fetchAsync(getUrl) {
      console.log('fetchAsync: ', getUrl);
      let response = await fetch(getUrl, { method: 'GET' });
      let data = await response.text();
      return data;
    }
    fetchAsync('extensions/chrome/popup.html').then( data => {
      const dataLeftIdx = data.indexOf('<body>') + 6,
            dataRightIdx = data.indexOf('<script') - 1,
            newData = data.substring(dataLeftIdx, dataRightIdx).trim();

      this.setState({ expiredToBe: newData }, () => {
        const testSetDate = window.setDate && window.setDate();
        console.log('testSetDate: ', testSetDate);
        this.setState({ ourDate: testSetDate });
      });

    }).catch( e => {
      console.log('catch(e) error below:');
      console.error(e);
    });
  }

  x2bInputSaveClick = (e) => {
    e.preventDefault();
    console.log('x2bInputSaveClick: ', e.target);
    // window.inputSaveClick(e);
  }

  x2bInputDateChange = (newDate) => {
    // e.preventDefault();
    console.log('x2bInputDateChange: ', newDate);
    // window.inputSaveClick(newDate);
  }

  x2bInputChangeLead = (e) => {
    const // selName = document.querySelector('.input-select-name'),
          selNum = document.querySelector('.input-select-num');

    // selName.addEventListener('change', (e) => {
      if (e.target.value === 'days') {
        selNum.setAttribute('max', window.maxDays);
      } else {
        selNum.setAttribute('max', window.maxWeeks);
        if (selNum.value > window.maxWeeks) {
          selNum.value = window.maxWeeks;
        }
      }
    // });
  }

  render() {

    // const overrideObj = {
    //         fid: 0,                   // The <FormDateContainer/> should be provided a Unique ID
    //         date: this.state.ourDate, // window.setDate() | '20170701' | thisYear + '-' + padMonth + '-' + padDay
    //         x2bChange: this.x2bInputDateChange
    //       };

    const parserOptions = {
      replace: (domNode) => {
        const thisAttribs = domNode.attribs;

        // if (domNode.name === 'div') {
        //   // console.log('domNode DIV'); // .input-save
        //   console.log(domNode);
        // }

        if (!thisAttribs) {
          return domNode;

        } else if (thisAttribs && thisAttribs.id &&
                   thisAttribs.id === 'container-app') {

          thisAttribs.class = 'web-app'; // <div id="container-app">
          return domNode;

        } else if (thisAttribs && thisAttribs.class &&
                   thisAttribs.class.indexOf('input-select-num') >= 0) {
          // <input class="input-select-num" type="number" min="1" max="10" value="1" size="3" required />

          return (
            <input className="input-select-num" type="number" min="1" max="10" defaultValue="1" size="3" required />
          );

        } else if (thisAttribs && thisAttribs.class &&
                   thisAttribs.class.indexOf('input-select-name') >= 0) {
          // <select class="input-select-name"></select>
          // [<option value="days">day(s) [1-70]</option>, <option value="weeks" selected>week(s) [1-10]</option>]

          return (
            <select className="input-select-name" onChange={this.x2bInputChangeLead}>
              { domToReact(domNode.children).map( elm => elm ) }
            </select>
          );

        } else if (thisAttribs && thisAttribs.class &&
                   thisAttribs.class.indexOf('input-save') >= 0) {

          // <button class="input-save meep" onclick="return x2bInputSaveClick(e)">Save</button>
          // <button style={{ fontSize: '42px' }}>
          return (
            <button className='input-save' onClick={this.x2bInputSaveClick}>Save</button>
          );

        // } else if (thisAttribs && thisAttribs.class &&
        //            thisAttribs.class.indexOf('input-date') >= 0 )
        // {
        //   console.log('We have a DATE!', domNode);
        //   // const newDom = <div id="domToReact">
        //   //     <div id="domToReact2">{ domToReact(domNode, ) }</div>
        //   //     <FormDateContainer formParams={overrideObj} />
        //   //   </div>;
        //   // console.log('domNode: ', domNode);
        //   // console.log('thisAttribs: ', thisAttribs);
        //   // domNode.attribs.onChange = this.x2bInputDateChange;
        //   // return domNode;
        //   return (
        //     <input
        //       type="date"
        //       className="input-date web-app"
        //       placeholder="yyyy-mm-dd"
        //       pattern="[2-9][0-9]{3}-[0-9]{2}-[0-9]{2}"
        //       onChange={this.x2bInputDateChange}
        //       required
        //     />
        //   );

        } else {
          return domNode;
        }
      }
    };

    return(
      <div>
        { Parser(this.state.expiredToBe, parserOptions) }
      </div>
    );
  }
}

export default ExpiredToBe;
