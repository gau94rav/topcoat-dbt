const CODE_SUB_CONTEXTS = {
    sql: ['ref', 'attribute', 'filter', 'config', 'column', 'if', 'endif', 'else', 'elif', 'for', 'endfor'],
}

const LANG_THEMES = {
    sql: [
        { token: 'jinja.curly.brackets', foreground: 'dd7e6b' },
        { token: 'jinja.parenthesis', foreground: '3D95CE', fontStyle: 'bold' },
        { token: 'jinja.quoted.text', foreground: 'dd7e6b' },
        { token: 'jinja.key', foreground: '2a9d8f' },
    ],
};

const THEME_VARS = {
    sql: [
        ([/\(/, "jinja.parenthesis"]),
        ([/\)/, "jinja.parenthesis"]),
        ([/({{|}}|{%|%})/g, "jinja.curly.brackets"]),
        ([new RegExp("(--)".replace('--', CODE_SUB_CONTEXTS.sql.join('|')), "g"), "jinja.parenthesis"]),
        ([/\w*[a-z][=]/gi, "jinja.key"]),
        ([/(["'])(?:(?=(\\?))\2.)*?\1/mg, "jinja.quoted.text"]),
    ],
}

module.exports = { LANG_THEMES, THEME_VARS };
