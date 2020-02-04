var app = new Vue({
    el: '#app',
    data: {
        loading: true,
        members: [],
        member_states: [],
        filter: {
            state: "All",
            party: []
        },
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
            let states = [];
            for (const member of this.members) {
                this.member_states.push(member.state)
            }
        }
        
    },
    computed: {
        noDuplicate() {
           this.member_states = Array.from(new Set(this.member_states)).sort();
           return this.member_states.sort();
        }
    },
})