var app = new Vue({
    el: '#app',
    data: {
        loading: true,
        members: [],
        member_states: [],
        filter: {
            state: "All",
            republican: false,
            democrat: false,
            independent: false,
        },
        loyal: {
            least: [],
            most: []
        },
        attendance: {
            least: [],
            most: []
        }
    },
    created() {
        this.getData()
    },
    methods: {
        async getData() {
            let pathName = window.location.pathname;
            let congress = '';
            if (pathName.includes('house')) {
                congress = 'house';
            } else {
                congress = 'senate';
            } //Changes the data API depending on page name
            let url = `https://api.propublica.org/congress/v1/113/${congress}/members.json`;
            console.log("TCL: getData -> url", url)

            this.members = await fetch(url, {
                method: "GET",
                headers: {
                    "X-API-Key": API_KEY
                }
            })
                .then(response => response.json())
                .then(data => data.results[0].members)

            console.log("TCL: getData -> this.members", this.members)
            this.loading = false;

            this.updatePct10('attendance', 'missed_votes_pct');
            this.updatePct10('loyal', 'votes_with_party_pct');
        },
        membersOf(party) {
            let memberArr = []
            for (const member of this.members) {
                if (member.party === party) {
                    memberArr.push(member)
                }
            }
            return memberArr
        },
        averageWith(array) { //Works out average of vote %
            let sum = 0
            for (const i of array) {
                sum += i.votes_with_party_pct
            }
            if (sum === 0) {
                return '--'
            }
            return (sum / array.length).toFixed(2)
        },
        sortMembers(property, reverse = false) { //Sorts via property (can also reverse the sort)
            let new_dataset = this.members.slice();
            function compare(a, b) {
                if (reverse === true) {
                    return b[`${property}`] - a[`${property}`];
                }
                return a[`${property}`] - b[`${property}`];
            }
            return new_dataset.sort(compare);
        },
        pct10(array, property) { //Finds 10% of array and adds to length if last has duplicates
            let end = Math.floor((array.length / 100) * 10);
            while (array[end][property] === array[end + 1][property]) {
                end++
            }
            return end
        },
        updatePct10(obj, val) { //takes the object parent and value to populate tables
            let array = this.sortMembers(val)
            let arrayR = this.sortMembers(val, true)
            this[obj].least = array.slice(0, this.pct10(array, val))
            this[obj].most = arrayR.slice(0, this.pct10(arrayR, val))
        },
        resetTable() { //Resets the main tables (data pages)
            this.filter.state = "All";
            this.filter.republican = false;
            this.filter.democrat = false;
            this.filter.independent = false;
        }
    },
    computed: {
        uniqueStateList() { //Removes duplicates
            uniqueList = Array.from(new Set(this.stateList)).sort(); //member_states
            // uniqueList = uniqueArray(this.stateList).sort(); //member_states
            return uniqueList;
        },
        parties() { //Creates list of checkbox selected parties
            let partyList = [];
            if (this.filter.republican) { partyList.push('R') };
            if (this.filter.democrat) { partyList.push('D') };
            if (this.filter.independent) { partyList.push('I') };
            return partyList
        },
        filteredMembers() {
            let array = [];
            for (const member of this.members) {
                if ((this.filter.state === 'All') || (this.filter.state === member.state)) {
                    if (this.parties.includes(member.party)) {
                        array.push(member)
                    } else if (this.parties.length === 0) {
                        array.push(member)
                    }
                }
            }
            return array
        },
        stateList() { //List of states, affected by checkbox filter
            let list = [];
            for (const member of this.members) {
                if (this.parties.includes(member.party) || this.parties.length === 0) {
                    list.push(member.state)
                }
            }
            return list
        },
        possibleParties() { //Finds possible parties with state selected
            let partyArr = [];
            for (const member of this.members) {
                if (this.filter.state === "All" || member.state === this.filter.state) { //this.parties.includes(member.party)
                    if (member.party === "R") {
                        partyArr.push("Republican");
                    } if (member.party === "D") {
                        partyArr.push("Democrat");
                    } if (member.party === "I") {
                        partyArr.push("Independent");
                    }
                }
            }
            partyArr = Array.from(new Set(partyArr)) // Remove dupes
            return partyArr;
        },
        notPossibleParties(){ //Uses possible parties to find the impossible 
            let parties = ['Republican', 'Democrat', 'Independent']
            parties = parties.filter(val => !(this.possibleParties.includes(val)))
            return parties
        },
        partyText() { //Produces text for UX note
            let pluralText = this.notPossibleParties.map(x => x += "s")
            return pluralText.join(' or ').toString();
        }
    }

})