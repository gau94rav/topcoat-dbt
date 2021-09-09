<template>
  <div>
    <codemirror :id="paneId"
      v-model="contents"
      :options="cmOptions"
      :style="{
        minHeight: '160px',
        height: sqlSection ? getSqlHeight() : 'calc(100vh - 190px) !important',
      }"
      @ready="onCmReady"
    ></codemirror>
    <popover
      :show="tooltipVisible"
      :left="clickX + 'px'"
      :top="(clickY - 30) + 'px'"
    >
      <div class="popover-header d-flex justify-space-between pb-1">
        <div><b>{{tooltipType}}</b>: {{ tooltipFilterOrAttributeName }}</div>
        <v-icon class="cursor-pointer" @click='tooltipVisible = false'>mdi-close</v-icon>
      </div>
      <div class="popover-body">
        <input
          class="base-input"
          :placeholder="tooltipDefault"
          v-model="filterOrAttributeOverride"
          @keyup='ifEnterPressed'
          @blur="inputBlur"
        />
      </div>
    </popover>
  </div>
</template>

<script>

import { mapState } from 'vuex';
import CodeMirror from 'codemirror';
import '../../codemirror/mode/sql/sql';
import '../../codemirror/show-hint';
import '../../codemirror/sql-hint';
import '../../codemirror/sql-helpers.js';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/theme/base16-light.css';
import Popover from '../common/Popover';
import { SQL_JINJA_LABELS } from '../../assets/constants/labels';

import { eventBus } from '../../main';

export default {
    name: "DevelopCodemirrorPane",
    components : { CodeMirror, Popover },
    props: {
      index: Number,
      readOnly: {
        type: Boolean,
        default: false
      },
      console: Boolean
    },
    data () {
      return {
        paneId: this.readOnly ? 'cmReadOnlyPane': 'cmPane',
        initialized: false,
        cm: null,
        clickX: null,
        clickY: null,
        tooltipType: null,
        tooltipFilterOrAttributeName: null,
        tooltipDefault: null,
        tooltipDefaultObj: null,
        tooltipVisible: false,
        jinjaLabels: SQL_JINJA_LABELS,
      }
    },
    mounted() {

      if (this.readOnly) return;
      this.restoreQueryParam();

      if (this.cm) {
        this.cm.clearHistory();
      }

      eventBus.$on('cm_add_text', (text, cm) => {
        if (this.index != this.selectedIndex) return;
        var doc = this.cm.getDoc();
        var cursor = this.cm.getCursor();
        doc.replaceRange(text, cursor);
        this.cm.focus();

        var payload = {
          key: this.selectedFileKey,
          attribute: 'changes',
          value: true
        }
        this.$store.dispatch('ide/openFileAtrribute', payload);
      });
    },
  	methods: {
      ifEnterPressed(e) {
        if (e.key === 'Enter') {
          this.tooltipVisible = false;
        }
      },
      inputBlur() {
        this.tooltipVisible = false;
      },
      onCmReady(cm) {

        if (this.readOnly) return;
        this.cm = cm;
        cm.on('keypress', (cm, event) => {
            cm.showHint({ completeSingle: false });
            this.tooltipVisible = false;
        });
        cm.on('dragstart', (cm, event) => {
            this.tooltipVisible = false;
        });
        cm.on('mousedown', (cm, event) => {
            this.clickX = event.x;
            this.clickY = event.y;
            var coords = {
              left: event.x,
              top: event.y
            }

            var token = cm.getTokenAt(cm.coordsChar(coords))

            if (token.type == 'jinja') {
              
                if (token.string.includes('filter(')) {
                  if (token.string[0] == "'") token.string = token.string.substring(1,token.string.length-2);
                  const matches = token.string.match(/'([^']+)'/)
                    if (matches) {
                    this.tooltipFilterOrAttributeName = matches[1];
                    this.tooltipType = 'Filter';
                    this.tooltipDefault = this.tooltipDefaultObj.filters[this.tooltipFilterOrAttributeName];
                    this.tooltipVisible = true;
                  }
      
                } else if (token.string.includes('attribute(')) {
                  if (token.string[0] == "'") token.string = token.string.substring(1,token.string.length-2);
                  const matches = token.string.match(/'([^']+)'/)
                  if (matches) {
                    this.tooltipFilterOrAttributeName = matches[1];
                    this.tooltipType = 'Attribute';

                    this.tooltipDefault = this.tooltipDefaultObj.attributes[this.tooltipFilterOrAttributeName];
                    this.tooltipVisible = true;
                  }
                } else {
                  this.tooltipVisible = false;
                }

            } else {
              this.tooltipVisible = false;
            }
            this.cm = cm;
            cm.focus();
        });
        cm.on('keyup', (cm, event) => {
            if (!this.selectedFileKey.includes('dbt_gen')) {
              var payload = {
                key: this.selectedFileKey,
                attribute: 'changes',
                value: true
              }
              this.$store.dispatch('ide/openFileAtrribute', payload);
            }
        });
        cm.on('focus', (cm, event) => {
            this.$store.dispatch('ide/filterAttributeDefaults')
            .then((response)  =>  {
                this.tooltipDefaultObj = response.data;
            }, (error)  =>  {
                console.error(error);
            })
        });
      },
      getSqlHeight() {
        const height = this.containerSizes.textEditorHeight;
        try {
          const parseHeight = height.includes('calc') ? height.replace('-495px', '-550px') : (height.replace("px", "") - 55 ) + "px";
          return parseHeight;
        } catch (error) {
          console.error(error);
        }
        return height;
      },
      handleQueryOperations(payload) {
        const file = this.openFiles[this.selectedIndex];

        if (!payload.value) {
          const type = this.tooltipType.toLowerCase();
          this.updateQueryParam(file, payload);
          console.log('reached');
          return this.$removeQueryFromUrl(`${type}_${payload.filter}`);
        }
        const type = this.tooltipType.toLowerCase();
        this.$addQueryToUrl(`${type}_${payload.filter}`, payload.value);
        this.updateQueryParam(file, payload);
      },
      updateQueryParam(file, payload) {
        const prevQueryParams = this.queryParam[file.key] || null;

        this.$store.dispatch('ide/addQueryParam', {
          key: file.key,
          data: { ...prevQueryParams, [`${this.tooltipType.toLowerCase()}_${payload.filter}`]: payload.value }
        });
      },
      restoreQueryParam() {
        const file = this.openFiles[this.selectedIndex];
        if (file) {
          const queryParam = this.queryParam[file.key];
          const allKeys = queryParam ? Object.keys(queryParam) : [];
          if (queryParam && allKeys.length) {
            this.$removeQueryFromUrl();
            for (let key of allKeys) {
              this.$addQueryToUrl(key, queryParam[key]);
            }
          } else {
            if (!this.urlRestored) {
              const urlParams = this.$route.query;
              if (urlParams) {
                const params = urlParams ? Object.keys(urlParams) : [];
                for (let param of params) {
                  const key = param.includes('_') ? param.split('_').slice(1).join('_') : null;
                  const value = urlParams[param];
                  if (key && value) {
                    this.tooltipType = this.jinjaLabels[param.split('_')[0]];
                    this.tooltipFilterOrAttributeName = key;
                    this.filterOrAttributeOverride = value;
                    this.updateQueryParam(file, { filter: key, value });
                    this.$addQueryToUrl(param, value);
                  }
                }
                this.$store.dispatch('ide/urlRestoredToggle', true);
              }
            }
            this.tooltipType = '';
          }
        }
      },
      setFilterOrAttributeOverride(value) {
        let payload = {};
        if (this.tooltipType == 'Filter') {
          payload = {
            index: this.index,
            filter: this.tooltipFilterOrAttributeName,
            value: value
          }
          this.$store.dispatch('ide/filterOverride', payload);
        } else if (this.tooltipType == 'Attribute') {
          payload = {
            index: this.index,
            filter: this.tooltipFilterOrAttributeName,
            value: value
          }
          this.$store.dispatch('ide/attributeOverride', payload);
        }
        return payload;
      }
  	},
    computed: {
      ...mapState('ide', [
          'openFiles',
          'selectedFileKey',
          'selectedIndex',
          'containerSizes',
          'sqlSection',
          'queryParam',
          'urlRestored',
        ]),
      codemirror: function() {
        return this.$refs['myCm' + this.index].codemirror
      },
      cmOptions() {
        if (this.readOnly) return { name: 'text/x-sql' , readOnly: true, theme: 'default', lineNumbers: true, lineWrapping: true, line: true, autofocus: true }; 
        else return { name: 'text/x-sql', theme: 'default', lineNumbers: true, lineWrapping: true, line: true, autofocus: true } 
      },
      filterOrAttributeOverride: {
        get() {
          if (this.tooltipType == 'Filter') {
            return this.openFiles[this.index].filter_overrides[this.tooltipFilterOrAttributeName];
          } else if (this.tooltipType == 'Attribute') {
            return this.openFiles[this.index].attribute_overrides[this.tooltipFilterOrAttributeName];
          }
        },
        set(value) {
          let payload = this.setFilterOrAttributeOverride(value);
          this.handleQueryOperations(payload);
        }
      },
      contents: {
        get () {
          const file = this.openFiles[this.index];
          return file ? file.contents : '';
        },
        set (value) {
          var payload = {
            index: this.index,
            contents: value
          }
          this.$store.dispatch('ide/storeFileData', payload);
        }
      }
    },
    watch: {
      selectedIndex() {
        this.restoreQueryParam();
      }
    }
}
</script>

<style lang='less'>
.CodeMirror-linenumber {
  color: #56788F;
}
.CodeMirror-linenumbers {
  background: white;
}
.CodeMirror-linenumber {
  background: white;
}
.cm-jinja {
  color: #DB7C26;
}
.popover-header {
  font-size: 12px;
  font-family: 'Montserrat-Regular';
  color: rgb(25, 25, 25);
  .v-icon {
    font-size: 16px !important;
  }
}
#cmPane .CodeMirror {
  min-height: 100px;
  /* margin-bottom: -45px; */
  /* height: calc(100vh - 50vh - 150px); */
}
#cmReadOnlyPane .CodeMirror {
  /* height: calc(100vh - 185px); */
}
#cmTooltipPane .CodeMirror {
  /* width: 480px; */
  height: auto; 
}
</style>
