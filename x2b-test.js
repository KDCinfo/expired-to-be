import { Selector, ClientFunction } from 'testcafe';

/**
 *
 * UI AUTOMATION TESTS - EXPIRED TO BE
 *
 * TESTCAFE - https://devexpress.github.io/testcafe/
 *
 * RUNNING TESTS
 *
 *   1. Node server (npm start) should already be running
 *      in its own terminal window (e.g., on port :3000).
 *
 *   2. Uncomment the tests you'd like to run:
 *      (bottom of this file: SELECT YOUR TESTS)
 *
 *   3. Run CLI command:
 *      clear && testcafe 'chromium' x2b-test.js
 *
 * DEBUGGING
 *
 *   --> To pause for troubleshooting (optional prep for step 7b):
 *       In your test code, enter: await t.debug();
 *       (preferably after an informative console.log())
 *
 *   3. Run CLI command (run in lieu of #3 above):
 *      clear && testcafe 'chromium' x2b-test.js --inspect-brk
 *
 *   When using the `--inspect-brk` option, the terminal will
 *   pause for you to follow steps 4 through 6 (below):
 *
 *   4. Open: Chromium browser (Ubuntu x64)
 *   5. Open: chrome://inspect
 *   6. Click (link): Open dedicated DevTools for Node
 *
 *     ...in DevTools; under the "Sources" panel;
 *   7. Click (icon): "Resume script execution (F8)" ||>
 *     ...wait... (~10 seconds)
 *     ...browser starts...
 *
 *   --> Pause for troubleshooting (optional; from prep setp above):
 *     ...Once your `t.debug()` is encountered (here at step 7b):
 *   7b. Click (button): 'Resume' (at the bottom of the browser)
 *
 *     ...The script will continue to the end, then it will wait for you
 *     ...to close the open (Node) DevTools. While it's waiting, you
 *     ...should see all the console.log()s you've coded to output.
 *   8. Close the (Node) DevTools.
 */

let sharedLocalStorage = {},
    importText = '[';
// Import Text Mock Data
    importText += '{"id": 1, "title": "My 4th reminder.", "date": "2033-03-16", "leadTime": "weeks", "leadTimeVal": "1"},';
    importText += '{"id": 2, "title": "My 3rd reminder.", "date": "2033-03-24", "leadTime": "days", "leadTimeVal": "1"},';
    importText += '{"id": 3, "title": "My 2nd reminder.", "date": "2018-05-23", "leadTime": "weeks", "leadTimeVal": "1"},';
    importText += '{"id": 4, "title": "My 1st reminder.", "date": "2018-05-22", "leadTime": "days", "leadTimeVal": "1"}';
    importText += ']';

fixture `Running Tests on: Expired To Be`
  .page `https://localhost:3000`
    .beforeEach( async t => {
        await loadLocalStorageFromGlobalStorage(sharedLocalStorage);
    })
    .afterEach( async t => {
        sharedLocalStorage = await getActualLocalStorageStage();
    });

/*
 * LEAD TIMES
 *
 */
const testLeadTimes = () => {
    const leadNameSelect = Selector('.input-select-name');
    const leadNameOption = leadNameSelect.find('option');
    const leadNumInput = Selector('.input-select-num');

    test(`Lead Times`, async t => {
        await t
            .click(leadNameSelect)
            .click(leadNameOption.withAttribute('value', 'days'))
            .expect(leadNumInput.getAttribute('max')).eql('70');

        await t
            .click(leadNameSelect)
            .click(leadNameOption.withAttribute('value', 'weeks'))
            .expect(leadNumInput.getAttribute('max')).eql('10');

        await t
            .click(leadNameSelect)
            .click(leadNameOption.withAttribute('value', 'days'))
            .selectText(leadNumInput)
            .typeText(leadNumInput, '70')
            .click(leadNameSelect)
            .click(leadNameOption.withAttribute('value', 'weeks'))
            .expect(leadNumInput.value).eql('10');
    });
};

/*
 * IMPORTING
 *
 */
const testImport = () => {
    test(`Importing`, async t => {

        const buttonListOptionsI = Selector('.footer-menu-toggle-button');
        const divListOptionsI = Selector('.footer-menu-div');

        await t
            .click(buttonListOptionsI)
            .expect(divListOptionsI.exists).ok();

        const buttonExportAllI = Selector('#input-export-all');
        const buttonClearAllI = Selector('#input-clear-all');
        const buttonImportOpenI = Selector('#input-import-button');
        const linkFillImportI = Selector('#fillSampleJSON');
        const buttonImportI = Selector('#input-import-action');

        await t
            .expect(buttonExportAllI.getAttribute('visible')).notOk()
            .expect(buttonClearAllI.getAttribute('visible')).notOk();

        await t
            .click(buttonImportOpenI)
            .click(linkFillImportI)
            .click(buttonImportI);

        const divErrorImportI = Selector('#import-error');
        const expiresTableI = Selector('#expires-table');
        const expiresTableChildBodyI = Selector(expiresTableI.child('tbody'));

        await t
            .expect(expiresTableChildBodyI.childElementCount).eql(2)
            .expect(divErrorImportI.getAttribute('hasChildElements')).notOk();
    });
};

/*
 * CLEAR ALL
 *
 */
const testClearAll = () => {
    test(`Clear All`, async t => {

        const buttonListOptionsC = Selector('.footer-menu-toggle-button');

        await t
            .click(buttonListOptionsC);

        const buttonImportOpenI = Selector('#input-import-button');
        const linkFillImportI = Selector('#fillSampleJSON');
        const buttonImportI = Selector('#input-import-action');

        await t
            .click(buttonImportOpenI)
            .click(linkFillImportI)
            .click(buttonImportI);

        const progressBar = Selector('#import-progress');
        await endProgressBarWatcher(progressBar); // wait for the spinner to disappear // ClientFunction
        // Ref: https://testcafe-discuss.devexpress.com/t/wait-till-element-doesnt-exist-or-disappear-from-dom/222/2

        await t
            .expect(progressBar.getStyleProperty('opacity')).eql('0');
            // .expect(progressBar.exists).notOk();

        await t
            .click(buttonListOptionsC);

        const divListOptionsC = await Selector('.footer-menu-div');

        await t
            .expect(divListOptionsC.exists).ok();
            // .expect(divListOptionsC.getAttribute('visible')).ok()

        const buttonExportAllC = Selector('#input-export-all');
        const buttonClearAllC = Selector('#input-clear-all');

        await t
            .expect(buttonExportAllC.exists).ok()
            .expect(buttonClearAllC.exists).ok();

        await t
            .setNativeDialogHandler(() => true)
            .click(buttonClearAllC);

        const divErrorImportC = Selector('#import-error');
        const expiresTableC = Selector('#expires-table');

        await t
            .expect(expiresTableC.getAttribute('hasChildElements')).notOk()
            .expect(divErrorImportC.getAttribute('hasChildElements')).notOk();
    });
};

const testSort = () => {
    test(`Sorting; 3 columns; ASC and DESC`, async t => {

        const buttonListOptionsC = Selector('.footer-menu-toggle-button');

        // Run import
        await t
            .click(buttonListOptionsC);

        const buttonImportOpenI = Selector('#input-import-button');
        const importTextarea = Selector('#input-import');
        const buttonImportI = Selector('#input-import-action');

        await t
            .click(buttonImportOpenI);

        await t
            .typeText(importTextarea, importText, { replace: true, paste: true })
            .click(buttonImportI);

        const progressBar = Selector('#import-progress');
        await endProgressBarWatcher(progressBar);

        await t
            .expect(progressBar.getStyleProperty('opacity')).eql('0');

        const arrowUps = Selector('a.arrow-up'),
              arrowDowns = Selector('a.arrow-down');

        // Sort by Each Sort Arrow (6 in all)

        // Column 1 - Title

            // Column 1 Note: Tests will always be run on the React SPA version, so:
                // an [id] will always precede `title`.               // [1] My 4th reminder.Expired!
                // the string '.Expired!' will always follow `title`. // [4] My 1st reminder.Expired!

            let column = 0;
            await t
                .click(arrowDowns.nth(0));
            await t
                .expect(arrowDowns.nth(0).hasClass('active'));
            // DESC
            let item1 = Selector('#expires-table tr:nth-child(1) td'), // 1st item in list
                item2 = Selector('#expires-table tr:nth-child(4) td'), // 4th item in list
                item1text = await item1.nth(column).textContent,
                item2text = await item2.nth(column).textContent;
            item1text = item1text.substr(item1text.indexOf(']') + 2, item1text.length - 12);
            item2text = item2text.substr(item2text.indexOf(']') + 2, item2text.length - 12);
            await t
                .expect(item1text).gte(item2text);

            await t
                .click(arrowUps.nth(0));
            await t
                .expect(arrowUps.nth(0).hasClass('active'));
            // ASC
                item1 = Selector('#expires-table tr:nth-child(1) td'), // 1st item in list
                item2 = Selector('#expires-table tr:nth-child(4) td'), // 4th item in list
                item1text = await item1.nth(column).textContent,
                item2text = await item2.nth(column).textContent;
            item1text = item1text.substr(item1text.indexOf(']') + 2, item1text.length - 12);
            item2text = item2text.substr(item2text.indexOf(']') + 2, item2text.length - 12);
            await t
                .expect(item2text).gte(item1text);

        // Column 2 - Date

            column = 1;
            await t
                .click(arrowDowns.nth(1));
            await t
                .expect(arrowDowns.nth(1).hasClass('active'));
            // DESC
                item1 = Selector('#expires-table tr:nth-child(1) td'), // 1st item in list
                item2 = Selector('#expires-table tr:nth-child(4) td'), // 4th item in list
                item1text = await item1.nth(column).textContent,
                item2text = await item2.nth(column).textContent;
            await t
                .expect(item1text).gte(item2text);

            await t
                .click(arrowUps.nth(1));
            await t
                .expect(arrowUps.nth(1).hasClass('active'));
            // ASC
                item1 = Selector('#expires-table tr:nth-child(1) td'), // 1st item in list
                item2 = Selector('#expires-table tr:nth-child(4) td'), // 4th item in list
                item1text = await item1.nth(column).textContent,
                item2text = await item2.nth(column).textContent;
            await t
                .expect(item2text).gte(item1text);

        // Column 5 - Days Left

            column = 4;
            await t
                .click(arrowDowns.nth(2));
            await t
                .expect(arrowDowns.nth(2).hasClass('active'));
            // DESC
                item1 = Selector('#expires-table tr:nth-child(1) td'), // 1st item in list
                item2 = Selector('#expires-table tr:nth-child(4) td'), // 4th item in list
                item1text = await item1.nth(column).textContent,
                item2text = await item2.nth(column).textContent;
            await t
                .expect(item1text).gte(item2text);

            await t
                .click(arrowUps.nth(2));
            await t
                .expect(arrowUps.nth(2).hasClass('active'));
            // ASC
                item1 = Selector('#expires-table tr:nth-child(1) td'), // 1st item in list
                item2 = Selector('#expires-table tr:nth-child(4) td'), // 4th item in list
                item1text = await item1.nth(column).textContent,
                item2text = await item2.nth(column).textContent;
            await t
                .expect(item2text).gte(item1text);

        // await t.debug();
        // await t.wait(5000);
    });
};

/**
 *
 * UTILITY FUNCTIONS
 *
 */

const endProgressBarWatcher = ClientFunction( (checkElement) => {
    const loopTime = 200; // 10 seconds

    let loopCount = 0;

    return new Promise((resolve, reject) => {
        var interval = setInterval(() => {
            // if (document.querySelector('#import-progress-bar'))
            if (loopCount < loopTime && checkElement.exists && checkElement.visible) {
                loopCount++;
                return;
            }
            clearInterval(interval);
            if (loopCount >= loopTime) {
                console.log('ERROR: loopCount >= loopTime');
                // reject();
                resolve();
            } else {
                setTimeout( () => {
                    resolve();
                }, 3000);
                // ^ @TODO: Bump this workaround up to 5000 if need be: Would love to fix.
            }
        }, 100);
    });
});

const loadLocalStorageFromGlobalStorage = ClientFunction((storage) => {
    Object.keys(storage).forEach(key => {
        window.localStorage.setItem(key, storage[key])
    });
});

const getActualLocalStorageStage = ClientFunction(() => {
    var storage = { };
    Object.keys(localStorage).forEach(key => {
        var value = localStorage.getItem(key);
        if(value && value.indexOf('bla') > -1)
            storage[key] = localStorage.getItem(key);
    });
    return storage;
});

/**
 * Notes:
 *
    43s - 4 tests; 1 assert ea; 'chromium'; 1st test = console.log()
    35s - 3 tests; 1 assert ea; 'chromium'; removed 1st test
    28s - 3 tests; 1 assert ea; 'chromium:headless'
    14s - 1 test; 3 assertions; 'chromium:headless'

    https://devexpress.github.io/testcafe/documentation/test-api/waiting-for-page-elements-to-appear.html
    https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors/functional-style-selectors.html

    The `beforeEach` and `afterEach`, and their respective function,
        `loadLocalStorageFromGlobalStorage` and `getActualLocalStorageStage`
        are thanks to:
            LocalStorage disappears after each test (0.19-alpha) #2142
            https://github.com/DevExpress/testcafe/issues/2142#issuecomment-367618275
*/

/**
 *
 * SELECT YOUR TESTS (uncomment each to be run)
 *
 */

testLeadTimes();
// testImport(); // Redundant to `testClearAll` and `testSort`.
testClearAll();
testSort();

/**
 *
 * ^^^ HAVE FUN !!!
 *
 */
