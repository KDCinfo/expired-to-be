function setDate() {

function displayIt() { // [window|document].onload = function() {}

function addStorageListener() {
    chrome.storage.onChanged.addListener(function(changes, namespace) {
    showList()

const x2bStorage = (function() {
    get:
    set:
    which:

function storeStateLocal(thenFunc) {

async function getState() {

function updateNotifications(stat = '') {

function showList() {

function requestAlarm(itemId) {

function printListHead() {

function printList(item, configObj) {

function toggleActive(e) {

function passthruUpdateStorage(stateItem, stateItemIdx, itemActive, withTimer) {

function itemUpdate(e) {

function updateForm(itemId) {

function setItemEdit(itemId) {

function saveChanges() {

function getBetween(dateValueArr, delay) {

function getDelay(selectName, selectNum) {

function toggleMenu(which = 'toggle') {

function exportTimers() {

function clearTimers() {

function clearItem(itemId) { // deleteAlarm

function clearDOMList() {

function deleteTimer(timeId) {

function createTimer(timeId, delay) { // async / returns a Promise

function getNewId() {

function isEmpty(obj) {

function clearMessage() {

function message(msg, clearMsg, data) {

function testVal(val, valType, valLen) {

function isGood(objStr) {

function htmlEscape(str) {

function htmlUnescape(str){

const setStorageItem = (storage, key, value) => {

const getStorageItem = (storage, key) => {

