var app = new Vue({
    el: '#app',
    data: {
        loading: true,
        members: [],
        member_states: [],
        filter: {
            state: "All",
            republican: "",
            democrat: "",
            independent: "",
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
            }
            let url = `https://api.propublica.org/congress/v1/113/${congress}/members.json`;
            console.log("TCL: getData -> url", url)

            this.members = await fetch(url, {
                method: "GET",
                headers: {
                    "X-API-Key": "T52gp8pFQzvOnof9mUsb0wOdHLARM6ZlEza0hTn2"
                }
            })
                .then(response => response.json())
                .then(data => data.results[0].members)

            console.log("TCL: getData -> this.members", this.members)
            this.loading = false;


            //TODO: Move this to computed
            for (const member of this.members) {
                this.member_states.push(member.state)
            }

            //??? -- why is this not updating?
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
        averageWith(array) {
            let sum = 0
            for (const i of array) {
                sum += i.votes_with_party_pct
            }
            if (sum === 0) {
                return '--'
            }
            return (sum / array.length).toFixed(2)
        },
        sortMembers(property, reverse = false) {
            let new_dataset = this.members.slice();
            function compare(a, b) {
                if (reverse === true) {
                    return b[`${property}`] - a[`${property}`];
                }
                return a[`${property}`] - b[`${property}`];
            }
            return new_dataset.sort(compare);
        },
        pct10(array, property) {
            let end = Math.floor((array.length / 100) * 10);
            while (array[end][property] === array[end + 1][property]) {
                end++
            }
            return end
        },
        updatePct10(obj, val){
            let array = this.sortMembers(val)
            let arrayR = this.sortMembers(val, true)
            this[obj].least = array.slice(0, this.pct10(array, val))
            this[obj].most = arrayR.slice(0, this.pct10(arrayR, val))

        }
    },
    computed: {
        uniqueStateList() {
            this.member_states = Array.from(new Set(this.member_states)).sort();
            return this.member_states.sort();
        },
        parties() {
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
        // member_states(){
        //     let array = [];
        //     for (const member of this.filteredMembers) {
        //         array.push(member.state)
        //     }
        //     return array
        // }
    }

})