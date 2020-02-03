//GLOBAL VARIABLES
let stateList = document.querySelector('#state-option');
let checkboxes = document.querySelectorAll('input[type=checkbox]');

//ASYNC ---
let members = [];
const getData = async () => {

    let pathName = window.location.pathname;
    let congress = '';
    if (pathName.includes('house')) {
        congress = 'house';
    } else {
        congress = 'senate';
    }
    let url = `https://api.propublica.org/congress/v1/113/${congress}/members.json`;

    members = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": "T52gp8pFQzvOnof9mUsb0wOdHLARM6ZlEza0hTn2"
        }
    })
        .then(response => response.json())
        .then(data => data.results[0].members)

    stateList.addEventListener('change', updateTable);

    for (const checkbox of checkboxes) {
        checkbox.addEventListener('change', updateTable);
    }

    updateTable();
    loaderToggle();

}
window.onload = () => { //Runs on load to start Async
    getData();
};

//FUNCTIONS ++++++++++++

//LOADER
function loaderToggle(){
    let loader = document.getElementById('loader');
    loader.classList.toggle('hidden');
}
// HELPER FUNCTIONS --- 
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
//TABLE GENERATORS 
function updateTable() {
    let filterState = stateList.value; //Filterstate 

    let filterPartyArr = [];
    for (const check of checkboxes) {
        if (check.checked) {
            filterPartyArr.push(check.value);
        }
    }
    let tableTag = document.getElementById("table-data"); //The Table
    tableTag.innerHTML = '';
    let inclusionList = [
        "first_name",
        "middle_name",
        "last_name",
        "party",
        "state",
        "seniority",
        "votes_with_party_pct"
    ];
    generateTableBody(tableTag, members, inclusionList, filterPartyArr, filterState);
    generateTableHead(tableTag, members[0], inclusionList);
}
function generateTableHead(table, data_set, inclusions) {
    //takes data keys, targets html table and populates a header
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key in data_set) {
        if (inclusions.includes(key) === true) {
            if (key == "first_name") {
                key = "Full Name";
            } else if (key == "middle_name" || key == "last_name") {
                continue;
            }
            key = key.capitalize().replace(/_/g, " ").replace('pct ', '%');
            let th = document.createElement("th");
            let thText = key.replace('pct', '%');
            let text = document.createTextNode(thText);
            th.appendChild(text);
            row.appendChild(th);
        }
    }
}

function generateTableBody(table, data, inclusions, filters = [], stateFilter) {
    let states = []; //To be filled per iteration and then popped
    let possibleParties = []; //Array of parties of members displayed 
    for (let element of data) { //element == member
        if ((element.state === stateFilter) || (stateFilter === 'All')) {
            possibleParties.push(element.party);
            //pop array with possible parties with current statefilter
        }
        if ((filters.includes(element.party)) || (filters.length === 0)) {
            //checks when checkboxes and allows them to pop (if none then all)
            states.push(element.state); //builds states array
            if ((element.state === stateFilter) || (stateFilter === 'All')) {
                //checks selected state -> pops that, if 'all' then pops all
                let row = table.insertRow();
                let fullName = `${element.first_name} ${element.middle_name || ''} ${element.last_name}`
                for (let key in element) {
                    if (inclusions.includes(key)) {
                        if (!key.includes("name")) {
                            let cell = row.insertCell();
                            let text = document.createTextNode(element[key] !== null ? element[key] : " ");
                            cell.appendChild(text);
                        } else if (key === "first_name") {
                            let cell = row.insertCell();
                            let text = `<a href="${element.url}">${fullName}</a>`
                            cell.innerHTML = text;
                        }
                    }
                }
            }
        }
    }
    disableCheck(possibleParties);
    popStateList(states);
}
//CHECKBOX FUNCTIONS
function disableCheck(arr) { //disables the invalid parties with current filter
    const rCheck = document.getElementById('republican-check');
    const dCheck = document.getElementById('democrat-check');
    const iCheck = document.getElementById('independent-check');
    for (const checkbox of checkboxes) {
        checkbox.disabled = false;
    }
    let parties = [];
    if (!(arr.includes('R'))) {
        rCheck.disabled = true;
        parties.push('Reublicans');
    } if (!(arr.includes('D'))) {
        dCheck.disabled = true;
        parties.push('Democrats');
    } if (!(arr.includes('I'))) {
        iCheck.disabled = true;
        parties.push('Independents');
    }
    disabledMsg(parties);
}

function disabledMsg(parties) {
    let checkDiv = document.querySelector('.filters-container');
    let newDiv = document.querySelector('.disable-msg');
    if (newDiv) {
        newDiv.parentNode.removeChild(newDiv);
    }
    if (parties.length > 0) {
        let partyText = parties.join(' or ').toString();
        let htmlText = `
        <div class="disable-msg alert alert-info d-flex justify-content-between" role="alert"">
            Note: There are no members of the ${partyText} in the selected state.
            <input id="reset_state_btn" class="btn btn-primary" type="reset" value="Reset">
        </div>`
        checkDiv.insertAdjacentHTML('afterend', htmlText);
        document.getElementById('reset_state_btn').addEventListener('click', resetTable)
    }
}
function resetTable() {
    let opts = stateList.querySelectorAll('option');
    let val = 'All';
    for (let i = 0; i < opts.length; i++) { //Sets statelist back to all
        const opt = opts[i];
        if (opt.value == val) {
            stateList.selectedIndex = i;
            break;
        }
    }
    for (const checkbox of checkboxes) { //Clears checkboxes
        checkbox.checked = false;
    }
    updateTable();
}
//SELECT LIST FUNCTION
function popStateList(arr) { //Prototype
    arr = Array.from(new Set(arr)); //Removes duplicates
    arr.sort(); //Organises alphabetically
    let currentOpt = stateList.querySelector('option:checked');
    stateList.innerHTML = ''; //Clears options
    arr.unshift('All');//Adds all to options
    for (let i = 0; i < arr.length; i++) { //Inserts HTML
        const state = arr[i];
        let htmlStr = `<option value="${state}">${state}</option>`
        stateList.insertAdjacentHTML('beforeend', htmlStr);
        if (state == currentOpt.value) { //Sets option index to the one selected
            stateList.selectedIndex = i;
        }
    }
}



