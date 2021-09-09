const CODE_COMPLETIONS = {
    sql: [
        {
            suggestion: {
                label: "jinja",
                insertText: "{{}}",
                kind: 'Function',
                insertTextRules: 'InsertAsSnippet',
                documentation: "jinja context allows additional functions"
            },
            items: [
                {
                    suggestion: {
                        label: "ref",
                        insertText: "ref('')",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "ref is used to reference sql files."
                    },
                    triggers: ["'"],
                    files: '/layers',
                },
                {
                    suggestion: {
                        label: "column",
                        insertText: "column()",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "Specify columns from sql query",
                    },
                    items: [
                        {
                            suggestion: {
                                label: "name",
                                insertText: "name='',",
                                kind: 'Variable',
                                insertTextRules: 'InsertAsSnippet',
                                documentation: "Specify name of the column."
                            },
                            triggers: ["'"],
                        },
                        {
                            suggestion: {
                                label: "value",
                                insertText: "value='',",
                                kind: 'Variable',
                                insertTextRules: 'InsertAsSnippet',
                                documentation: "Specify value of the column."
                            },
                            items: [],
                            triggers: [],
                        },
                        {
                            suggestion: {
                                label: "value_format",
                                insertText: "value_format='',",
                                kind: 'Variable',
                                insertTextRules: 'InsertAsSnippet',
                                documentation: "value_format is used to format the output of data."
                            },
                            items: [],
                            triggers: [],
                        }
                    ],
                    triggers: ['\n'],
                },
                {
                    suggestion: {
                        label: "attribute",
                        insertText: "attribute('')",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "attribute is used to dynamically change the value provided to sql query, provided value also gets added to url.",
                    },
                    items: [],
                    triggers: [],
                },
                {
                    suggestion: {
                        label: "filter",
                        insertText: "filter('')",
                        kind: 1,
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "Reference any sql file with filter."
                    },
                    items: [],
                    files: '/layers/filters',
                    triggers: ["'"],
                },
                {
                    suggestion: {
                        label: "config",
                        insertText: "config()",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "config block controls the base setting of sql file."
                    },
                    items: [
                        {
                            suggestion: {
                                label: "type",
                                insertText: "type='',",
                                kind: 'Variable',
                                insertTextRules: 'InsertAsSnippet',
                                documentation: "Specify type of visualisation, enter the file name of visualisation to use."
                            },
                            files: '/visualizations',
                            triggers: ["'"],
                        },
                    ],
                    triggers: ['\n'],
                },
                {
                    suggestion: {
                        label: "if",
                        insertText: "if",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "Conditonal function jinja"
                    },
                    triggers: [""],
                },
                {
                    suggestion: {
                        label: "endif",
                        insertText: "endif",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "Conditonal function jinja"
                    },
                    triggers: [""],
                },
                {
                    suggestion: {
                        label: "else",
                        insertText: "else",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "Conditonal function jinja"
                    },
                    triggers: [""],
                },
                {
                    suggestion: {
                        label: "elif",
                        insertText: "elif",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "Conditonal function jinja"
                    },
                    triggers: [""],
                },
                {
                    suggestion: {
                        label: "for",
                        insertText: "for",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "Looping function for jinja"
                    },
                    triggers: [""],
                },
                {
                    suggestion: {
                        label: "endfor",
                        insertText: "endfor",
                        kind: 'Function',
                        insertTextRules: 'InsertAsSnippet',
                        documentation: "Looping function for jinja"
                    },
                    triggers: [""],
                },
            ],
            triggers: ['{', '}'],
        },
    ],
    html: [
        {
            suggestion: {
                label: "html",
                insertText: "",
                kind: 'Snippet',
                insertTextRules: 'InsertAsSnippet',
                documentation: "Use the library and layer items to customize your page."
            },
            files: ['/layers', '/library'],
            triggers: ['<'],
        }
    ]
}

const CODE_CONTEXTS_SYNTAX = {
    sql: [
        {
            key: 'jinja',
            open: '{{',
            close: '}}',
            label: 'jinja',
        },
        {
            key: 'jinja',
            open: '{%',
            close: '%}',
            label: 'jinja',
        },
        {
            key: "ref",
            open: "ref(",
            close: ')',
            label: 'ref',
        },
        {
            key: "type",
            open: "type='",
            close: "'",
            label: 'type',
        },
        {
            key: 'config',
            open: 'config(',
            close: ')',
            label: 'config',
        },
        {
            key: 'filter',
            open: "filter('",
            close: "')",
            label: 'filter',
        },
        {
            key: 'column',
            open: 'column(',
            close: ')',
            label: 'column',
        },
        {
            key: 'attribute',
            open: "attribute('",
            close: "')",
            label: 'attribute',
        },
        {
            key: 'name',
            open: "name='",
            close: "'",
            label: 'name',
        },
        {
            key: 'value_format',
            open: "value_format='",
            close: "'",
            label: 'value format',
        },
        {
            key: 'value',
            open: "value='",
            close: "'",
            label: 'value',
        },
    ],
}

const CODE_FUNCTIONS = {
    singleLineContexts: [],
    multiLineContexts: [],
    allContexts: [],
    detectContexts: (lines, position, indexOfAll, language) => {
        var start = performance.now();

        const line = lines[position.lineNumber - 1];
        const column = (position.column - 1);
        if (!CODE_CONTEXTS_SYNTAX[language]) return;
        const languageContexts = CODE_CONTEXTS_SYNTAX[language];
        if (!languageContexts) return;
        CODE_FUNCTIONS.singleLineContexts = [];
        CODE_FUNCTIONS.multiLineContexts = [];
        CODE_FUNCTIONS.allContexts = [];

        for (let context of languageContexts) {
            var openIndexes = indexOfAll(line, context.open).sort((a, b) => b - a);
            var closeIndexes = indexOfAll(line, context.close);
            var positionAheadOfStart = -1;
            var positionBehindEnd = -1;

            for (let i of openIndexes) {
                if (column > (i + (context.open.length - 1))) {
                    positionAheadOfStart = i;
                    break;
                }
            }
            
            closeIndexes = closeIndexes.map(num => {
                if (num > (positionAheadOfStart + (context.open.length - 1))) {
                    return num;
                }
            }).sort((a, b) => a - b).filter(r => r);

            positionBehindEnd = closeIndexes.length ? closeIndexes[0] : positionBehindEnd;
            
            const hasOpeningTagBreak = openIndexes.filter(a => a > positionAheadOfStart && a < positionBehindEnd).length;
            if (hasOpeningTagBreak) {
                positionAheadOfStart = -1;
            }
            let isSingleLine = positionAheadOfStart > -1 && column <= positionBehindEnd && positionBehindEnd;

            if (isSingleLine) {
                let text = line.slice((positionAheadOfStart + context.open.length), (positionBehindEnd));
                CODE_FUNCTIONS.singleLineContexts.push({
                    key: context.key,
                    start: positionAheadOfStart,    
                    end: positionBehindEnd,
                    text,
                    label: context.label,
                    column: { start: positionAheadOfStart, end: positionBehindEnd }
                });
            } else {
                CODE_FUNCTIONS.detectContextsMultiline(lines, position, context, indexOfAll);
            }
        }

        let activeContext = CODE_FUNCTIONS.getActiveContext(false) || CODE_FUNCTIONS.getActiveContext(true);
        activeContext = !activeContext ? { context: language, text: '', label: language } : activeContext;
        CODE_FUNCTIONS.sortContexts();
        let duration = performance.now() - start;
        if (duration > 5) {
            console.info({type: 'context_detector', time: `${duration} milliseconds`});
        }
        return {contexts: CODE_FUNCTIONS.allContexts, activeContext};
    },
    detectContextsMultiline(lines, position, context, indexOfAll) {
        const lineNumber = position.lineNumber - 1;
        const line = lines[lineNumber];
        const column = position.column - 1;

        let topPositions = {};
        let bottomPositions = {};

        for (let i = lineNumber; i >= 0; i--) {
            topPositions = CODE_FUNCTIONS.detectMultilineTop(i, context, line, lines, lineNumber, column, indexOfAll);
            if (topPositions !== 'continue') break;
        }
        for (let j = (lineNumber); j < lines.length; j++) {
            bottomPositions = CODE_FUNCTIONS.detectMultilineBottom(j, context, line, lines, lineNumber, column, indexOfAll);
            if (bottomPositions !== 'continue') break;
        }
        const passed = (topPositions.line > -1 && bottomPositions.line > -1) && (lineNumber >= topPositions.line && lineNumber <= bottomPositions.line);
        if (passed) {
            let text = [];
            for (let k = (topPositions.line + 1); k < bottomPositions.line; k++) {
                text.push(lines[k]);
            }

            CODE_FUNCTIONS.multiLineContexts.push({
                key: context.key,
                start: topPositions.line,
                end: bottomPositions.line,
                text: text.join(' '),
                label: context.label,
                column: { start: topPositions.column, end: bottomPositions.column }
            });
        }
        return passed;
    },
    detectMultilineTop(i, context, line, lines, lineNumber, column, indexOfAll) {
        let currentLine = lines[i];
        let position = { line: -1, column: -1 };

        if (currentLine.includes(context.open)) {
            position.line = i;
            if (i === lineNumber) {
                const openIndexes = indexOfAll(line, context.open).sort((a,b ) => b-a);
                const startColumn = openIndexes.length ? openIndexes[0] : -1;
                
                if (column <= (startColumn + context.open.length)) {
                    position.line = -1;
                }
            } else if (currentLine.includes(context.close)) {
                position.line = -1;
            } else {
                position.column = currentLine.indexOf(context.open);
            }
            return position;
        }
        if (currentLine.includes(context.close) && i !== lineNumber) return position;
        return 'continue';
    },
    detectMultilineBottom(j, context, line, lines, lineNumber, column, indexOfAll) {
        let currentLine = lines[j];
        let position = { line: -1, column: -1 };

        if (currentLine.includes(context.close)) {
            position.line = j;
            if (j === (lineNumber)) {
                const closeIndexes = indexOfAll(line, context.close).sort((a,b ) => a-b);
                const endColumn = closeIndexes.length ? closeIndexes[0] : -1;

                if (column > endColumn) {
                    position.line = -1;
                }
            } else {
                position.column = currentLine.indexOf(context.close);
            }
            return position;
        }
        if (currentLine.includes(context.open) && j !== lineNumber) return position;
        return 'continue';
    },
    getActiveContext(isMultiline) {
        let active = { key: '', text: '' };
        const data = isMultiline ? CODE_FUNCTIONS.multiLineContexts : CODE_FUNCTIONS.singleLineContexts;
        if (!data.length) return false;

        active = data.reduce((a, b) => {
            return a.column.start > b.column.start && a.column.end < b.column.end ? a : b;
        });

        if (!active.key) {
            return false;
        }
        return {context: active.key, text: active.text, label: active.label};
    },
    extractText(regex, string) {
        const extracted = string.match(regex);
        return extracted && extracted.length ? extracted[0].replace(/['"]+/g, '') : '';
    },
    sortContexts() {
        const multiLineContexts = CODE_FUNCTIONS.multiLineContexts;
        const singleLineContexts = CODE_FUNCTIONS.singleLineContexts;

        const sortedMultiline = multiLineContexts.sort((a, b) => a.column.start - b.column.start && b.column.end - a.column.end);
        const sortedSingleLine = singleLineContexts.sort((a, b) => a.column.start - b.column.start && b.column.end - a.column.end);
        CODE_FUNCTIONS.allContexts = [...sortedMultiline, ...sortedSingleLine].map(c => c.key);
    }
}

module.exports = {
    CODE_COMPLETIONS,
    CODE_FUNCTIONS,
}