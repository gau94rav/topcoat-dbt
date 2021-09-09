const moment = require('moment');

const CONNECTION_COLUMNS = [
    {
        text: 'Name',
        value: 'name',
    },
    {
        text: 'Database',
        value: 'database',
    },
    {
        text: 'Type',
        value: 'type',
    },
    {
        text: 'Actions',
        value: 'actions',
    },
];

const CONNECTION_COLORS = {
    bigquery: '#6b7280',
    snowflake: '#2a9d8f',
    postgres: '#dd7e6b',
    looker_api: 'rgb(61, 149, 206)',
    sqlite3: '#b6d7a8',
    looker_embed: '#e9c46a',
    amazonRedShift: 'rgb(187, 187, 187)'
};

module.exports = {
    CONNECTION_COLUMNS,
    CONNECTION_COLORS,
};