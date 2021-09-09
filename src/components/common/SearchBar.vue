<template>
    <div class="search-field my-1">
        <input ref='queryInput' type="text" placeholder="Search Files" v-model="fileQuery" @keyup='searchFiles' />
        <img :src="sideBarIcons.magnify" v-if='!fileQuery' />
        <v-icon @click='reset' class="cursor-pointer mt-1" v-else>mdi-close</v-icon>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    computed: {
        ...mapState('ide', [
            'searchQuery',
        ]),
        sideBarIcons: function () {
            return {
                magnify: static_url + "magnifying-glass-search.svg",
            };
        },
        fileQuery: {
            get() {
                return this.searchQuery;
            },
            set(query) {
                this.$store.dispatch('ide/searchQuery', query);
                return query;
            }
        }
    },
    methods: {
        searchFiles(e) {
            if (e.key === 'Escape') {
                this.$store.dispatch('ide/searchQuery', '');
                this.$emit('clear');
            }
            return this.$emit('query', this.fileQuery);
        },
        reset() {
            this.$store.dispatch('ide/searchQuery', '');
            return this.$emit('query', this.fileQuery);
        }
    },
}
</script>