const SECRET_KEY_LABELS = {
    looker_api: 'Looker API Key',
    looker_embed: 'Looker Embed Key',
    chartio: 'Chartio Embed Key',
    kibana: 'Kibana Embed Key',
    metabase: 'Metabase Embed Key',
    snowflake: 'Snowflake Password',
    postgres: 'Postgres Password',
    elasticsearch: 'Elasticsearch Key',
    bigquery: 'BigQuery Service Account Key File Contents',
}

const EXTENSIONS_LABELS = {
    html: 'html',
    json: 'json',
    wld: 'json',
    css: 'css',
    py: 'pyton',
    sql: 'sql',
    yml: 'yaml',
}

const SQL_JINJA_LABELS = {
    filter: 'Filter',
    attribute: 'Attribute'
}

const QUICK_HELP_LABELS = {
    library: 'Library Components',
}

const CONNECTION_LABELS = {
    snowflake: 'Snowflake',
    bigquery: 'Google BigQuery',
    postgres: 'PostgreSQL',
    looker_api: 'Looker',
    amazonRedShift: 'Amazon Redshift',
    sqlite3: 'SQLite'
}

module.exports = {
    SECRET_KEY_LABELS,
    EXTENSIONS_LABELS,
    SQL_JINJA_LABELS,
    QUICK_HELP_LABELS,
    CONNECTION_LABELS,
}