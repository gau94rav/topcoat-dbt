<template>
    <div class="quick-help-section outline">
        <div class="quick-help-head">
            Quick Help
        </div>
        <div class="quick-help-body">
            <div class="active-context d-flex px-5 mt-5 align-center" v-if='contextData.context'>
                <div class="context-description" v-html='hightlightDescriptionTitle'></div>
            </div>
            <div class="context-items-section px-5 mt-5">
                <div class="context-name" v-if='contextData && contextData.label'>
                    {{ quickHelpLables[contextData.label] || contextData.label }}
                </div>
                <div class="context-items ml-3" v-html="highlightItemLabel">
                    
                </div>
            </div>
        </div>
        <div class="quick-help-foot"></div>
    </div>
</template>

<style lang="less">
    .quick-help-section {
        position: relative;
        font-family: "Montserrat-Regular";
        overflow: auto;
        background: #fff;
        .quick-help-head {
            position: sticky;
            top: 0;
            margin: auto;
            font-family: "Montserrat-Medium";
            width: 100%;
            color: #2a9d8f !important;
            font-size: 12px;
            border-bottom: 1px solid #2a9d8f;
            text-align: center;
            padding: 15px;
            z-index: 20;
            background: #fff;
        }
        .quick-help-body {
            background: #fff;
            .active-context,
            .no-context-text {
                font-size: 12px;
            }
            .active-context {
                .context-name {
                    color: #2a9d8f;
                    font-family: "Montserrat-Medium";
                    background: rgba(42, 157, 143, 0.08);
                    border-radius: 3px;
                }
            }
            .context-items-section {
                .context-name {
                    color: #2a9d8f;
                    font-family: "Montserrat-Medium";
                    font-size: 14px;
                }
                .context-item {
                    font-size: 12px;
                }
            }
        }
        .highlighted-text {
            color: #2a9d8f;
            font-family: "Montserrat-Medium";
        }
        .highlighted-label {
            color: rgb(61, 149, 206);
        }
    }
    @media (max-width: 1024px) {
        .quick-help-section {
            width: 100% !important;
            position: absolute !important;
        }
    }
</style>

<script>
import { mapState } from 'vuex';
import { QUICK_HELP_LABELS } from '../../assets/constants/labels';

export default {
    props: ['showSection'],
    data: () => ({
        quickHelpLables: QUICK_HELP_LABELS,
        highlightedText: '',
    }),
    computed: {
        ...mapState('ide', [
            'ideContext',
            'selectedIndex',
            'openFiles',
            'contextItems',
        ]),
        contextData() {
            return this.ideContext;
        },
        contextDynamicData() {
            const { context } = this.contextData;
            return this.contextItems[context] || {};
        },
        currentLanguage() {
            const file = this.openFiles[this.selectedIndex];
            return file ? this.$getLanguage(file.key) : '';
        },
        highlightItemLabel() {
            let html = '';
            let highlighted = '';
            for (let item of (this.contextDynamicData.items || [])) {

                const string = item.label;
                const { text } = this.contextData;
                const parentElement = "<div class='context-item'>[REPLACE]</div>"

                let childElement = '';
                if (text && string && text === string && highlighted !== string) {

                    highlighted = string;
                    childElement = string.replaceAll(string, `<div title='${item.documentation}' class="highlighted-label">${string} </div>`);
                    parentElement = parentElement.replace('[REPLACE]', childElement);

                } else if (/\|\/[a-z].*\|/gi.test(item)) {

                    const extracted = item.match(/\|\/(.*?)\|/);
                    if (extracted.length && extracted.length > 1) {
                        const name = this.quickHelpLables[extracted[1]] || this.$firstCapitalString(extracted[1]);
                        childElement = `<div class="context-name" style="position: relative; right: 12px; padding-top: 10px;">${name} </div>`;
                        parentElement = parentElement.replace('[REPLACE]', childElement);
                    }

                } else {

                    childElement = `<div title='${item.documentation}'>${string}</div>`;
                    parentElement = parentElement.replace('[REPLACE]', childElement);

                }

                html += parentElement;
            }
            return html;
        },
        hightlightDescriptionTitle() {
            const { context } = this.contextData;
            const string = this.contextDynamicData.description || '';
            if (string && context) {
                return string.replaceAll(context + " ", `<span class="highlighted-text">${context} </span>`);
            }
            return string;
        }
    },
}
</script>