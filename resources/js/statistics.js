//GLOBAL VARIABLES
var statistics = {
    n_democrats: 0,
    n_republicans: 0,
    n_independents: 0,
    avg_vote_with_democrats: 0,
    avg_vote_with_republicans: 0,
    avg_vote_with_independents: 0,
}
var party_members = {
    democrats: [],
    republicans: [],
    independents: []
}
// let page = document.querySelector('body div').getAttribute('data-page-type');


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

    updateStatistics();
    popluateGlance();
    if (pathName.includes('attendance')) {
        popEngageTbls('.tbl-bot-attend tbody', '.tbl-top-attend tbody');
    } else if (pathName.includes('loyalty')) {
        popLoyalTbls('.tbl-bot-loyal tbody', '.tbl-top-loyal tbody');
    }
    loaderToggle();
}

window.onload = () => { //Runs on load to start Async
    getData();
};
function loaderToggle() {
    let loader = document.getElementById('loader');
    loader.classList.toggle('hidden');
}

function generatePartyList() {//populates obj with array of party members
    for (const member of members) {
        switch (member.party) {
            case "D":
                party_members.democrats.push(member);
                continue;
            case "R":
                party_members.republicans.push(member);
                continue;
            case "I":
                party_members.independents.push(member);
                continue;
            default:
                break;
        }
    }
}

function averageVotesWith(party) {//Adds votes w/ party and divides by party total
    let partyMembers = party_members[party];
    let sumOf = 0;
    for (const member of partyMembers) {
        sumOf += member.votes_with_party_pct;
    }
    if (sumOf === 0) {
        return '--';
    }
    let result = (sumOf / partyMembers.length).toFixed(2);
    return result;
}


function updateStatistics() { // Updates the stats so the other functions can run
    generatePartyList();
    let parties = ['republicans', 'democrats', 'independents'];
    for (const party of parties) { //DRY
        statistics[`avg_vote_with_${party}`] = averageVotesWith(`${party}`);
        statistics[`n_${party}`] = party_members[`${party}`].length;
    }
}

function sortMembers(property, reverse = false) { // Sorts the members list by given property
    let new_dataset = members.slice();
    function compare(a, b) {
        if (reverse === true) {
            return b[`${property}`] - a[`${property}`];
        }
        return a[`${property}`] - b[`${property}`];
    }
    return new_dataset.sort(compare);
}




// --- TABLES
function popluateTable(table, row, col, input) { //Table populating helper
    let tableRow = table.getElementsByTagName('tr')[row];
    let tableCol = tableRow.getElementsByTagName('td')[col];
    tableCol.innerHTML = input;
}
function popluateGlance() { // Populates the at a glance tables
    let theTable = document.querySelector('.tbl-glance');
    let repCol = 1, voteCol = 2, partyRow = 1;
    let parties = ['republicans', 'democrats', 'independents'];
    for (const party of parties) {
        popluateTable(theTable, partyRow, repCol, statistics[`n_${party}`]);
        popluateTable(theTable, partyRow, voteCol, statistics[`avg_vote_with_${party}`]);
        partyRow++;
    }
}

function insertRows10pct(table, array, prop2, prop3) { // refactored from populateEngageTbls
    let tableTarget = document.querySelector(table);
    let pct10 = Math.floor((array.length / 100) * 10);
    while (array[pct10][prop3] === array[pct10 + 1][prop3]) {
        pct10++
    }
    for (let i = pct10; i > 0; i--) {
        const member = array[i];
        let fullName = `${member.first_name} ${member.middle_name || ''} ${member.last_name}`
        let hmtlString = `<tr><td>${fullName}</td><td>${member[prop2]}</td><td>${member[prop3]}</td></tr>`
        tableTarget.insertAdjacentHTML('afterbegin', hmtlString);
    }
}
function popEngageTbls(table1, table2) { //Needs to be on specific page?
    insertRows10pct(table1, sortMembers('missed_votes_pct', true), 'missed_votes', 'missed_votes_pct');
    insertRows10pct(table2, sortMembers('missed_votes_pct'), 'missed_votes', 'missed_votes_pct');
}
function popLoyalTbls(table1, table2) {
    insertRows10pct(table1, sortMembers('votes_with_party_pct'), 'total_votes', 'votes_with_party_pct');
    insertRows10pct(table2, sortMembers('votes_with_party_pct', true), 'total_votes', 'votes_with_party_pct');

}
