<template>
  	<div>
		<MonacoEditor
			v-model="contents"
			:language="language"
			@change="onMonacoChange"
			@editorDidMount="editorDidMount"
			ref="monacoEditor"
			:style="{ height: editorHeight }"
			:options="{ ...ideOptions, readOnly }"
			id='monacoEditor'
		>
		</MonacoEditor>
		<span v-if='debugMode'>
			<div class="ml-2">Contexts: {{ contexts.join(' -> ') }}</div>
			<div class="ml-2">Active: {{ activeContext }}</div>
		</span>
		<popover
			:show="tooltipVisible"
			:left="clickX + 'px'"
			:top="(clickY - 30) + 'px'"
			v-if='activeContext.context'
		>
			<div class="popover-header d-flex justify-space-between pb-1">
				<div><b>{{$firstCapitalString(activeContext.context)}}</b>: {{ activeContext.text }}</div>
				<v-icon class="cursor-pointer" @click='tooltipVisible = false'>mdi-close</v-icon>
			</div>
			<div class="popover-body">
				<input
					class="base-input"
					v-model="filterOrAttributeOverride"
					@blur='tooltipVisible = false'
					@keyup="tooltipEdited"
				/>
			</div>
		</popover>
  	</div>
</template>

<script>
import { mapState } from "vuex";
import MonacoEditor from "vue-monaco";
import { CODE_COMPLETIONS, CODE_FUNCTIONS } from '../../assets/constants/languageOverrides';
import { BASE_LANGUAGE_KEYWORDS } from '../../assets/constants/languageBaseKeywords';
import { LANG_THEMES, THEME_VARS } from '../../assets/constants/languageThemes';
import { eventBus } from '../../main';
import Popover from '../common/Popover.vue';

import 'regenerator-runtime/runtime';

export default {
  	name: "DevelopMonacoPane",
  	components: { MonacoEditor, Popover },
  	data: () => ({
		updateScroll: 0,
		contexts: [],
		currentPosition: {},
		tooltipVisible: false,
		clickX: '',
		clickY: '',
		debugMode: false,
		editor: null,
		isSqlFile: false,
		ideOptions: {
			minimap: {
				enabled: false,
			},
		},
		initialized: false,
	}),
	mounted() {
		this.$nextTick(() => {
			this.adjustPosition();
			this.isSqlFile = this.language === 'sql';
		});
		this.activeContext = {
			context: this.language,
			text: '',
		};
		this.restoreQueryParam();
	},
	destroyed() {
		eventBus.$off('fileSaved');
		eventBus.$off('cm_add_text');
	},
  	methods: {
		catchSavedFileEvent() {
			eventBus.$on('fileSaved', (index) => {
				this.$nextTick(() => {
					this.disposeInstances();
					if (this.index !== index) return;
					this.handleCompletions();
				})
			})
		},
		catchAddRefEvent() {
			eventBus.$on('cm_add_text', (text, cm) => {
				const monaco = this.$refs.monacoEditor;
				const editor = monaco ? monaco.getEditor() : null;
				if (editor) {
					editor.trigger('keyword', 'type', {text});
				}
			});
		},
		onMonacoChange() {
			this.$store.dispatch("ide/openFileAtrribute", {
				key: this.selectedFileKey,
				attribute: "changes",
				value: true,
			});
		},
		handleContext() {
			const editor = this.$refs.monacoEditor.getEditor();
			const model  = editor.getModel();

			editor.onDidChangeCursorPosition((e) => {
				const lines = model.getLinesContent();
				this.currentPosition = e.position;
				const contextsData = CODE_FUNCTIONS.detectContexts(lines, e.position, this.$indexOfAll, this.language);
				if (!contextsData) return;
				this.contexts = contextsData.contexts;
				this.activeContext = contextsData.activeContext || { context: this.language, text: '' };
			})
		},
		editorDidMount(editor) {
			document.getElementById('monacoEditor').removeEventListener('click', this.editorClicked);
			document.getElementById('monacoEditor').addEventListener('click', this.editorClicked);

			this.catchAddRefEvent();
			this.catchSavedFileEvent();

			this.editor = editor;
			window.onresize = function (){
				editor.layout();
			};

			editor.onDidScrollChange((e) => {
				if (!this.initialized) return false;
				if (!this.openFiles[this.index]) return false;
				if (this.updateScroll) {
					editor.setScrollPosition({ scrollTop: this.updateScroll });
				}
				this.$store.dispatch("ide/addScrollPosition", {
					position: this.updateScroll || e.scrollTop,
					index: this.index,
				});

				setTimeout(() => {
					this.updateScroll = 0;
				}, 100);
			});
		},
		initOverrides() {
			this.handleContext();
			this.applyCustomTheme();
			this.handleCompletions();
		},
		initEditor() {
			this.disposeInstances();
			this.$nextTick(() => {
				this.initOverrides();
				this.resizeEditor(500);
				this.adjustPosition();
			})
			this.restoreQueryParam();
			this.activeContext = {
				context: this.language,
				text: '',
			};
			const file = this.openFiles[this.selectedIndex];
			this.isSqlFile = file && this.language === 'sql';
		},
		adjustPosition() {
			const position = this.editorScrollPosition[this.selectedIndex];
			this.updateScroll = position || 1;
			const editor = this.$refs.monacoEditor.getEditor();
			if (editor) {
				editor.setScrollPosition({ scrollTop: this.updateScroll });
			}
		},
		handleCompletions() {
			const editorInstance = this.$refs.monacoEditor;
			if (!editorInstance || editorInstance === 'undefined') return;
			const monaco = editorInstance.monaco;
			const baseLanguageKeywords = BASE_LANGUAGE_KEYWORDS[this.language] || [];
			const customLanguageKeywords = CODE_COMPLETIONS[this.language] || [];
			const languageData = [...customLanguageKeywords, ...baseLanguageKeywords];
			const parentContexts = languageData.map(l => l.suggestion.label);

			if (languageData) {
				const recursive = async (data) => {
					for (let contextData of data) {
						let items = [];
						if (parentContexts.indexOf(contextData.suggestion.label) > -1) {
							this.registerCompletions(contextData.suggestion, {}, monaco);
						}
						if (contextData.files) {
							const fileData = typeof contextData.files === 'string' ? [contextData.files] : contextData.files;
							for (let name of fileData) {
								let files = this.$extractKeysByType(this.all_files, name, true);
								let suggestionItems = this.$convertToSuggestionsArray(files, monaco.languages.CompletionItemKind.File, monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, '');
								if (typeof contextData.files !== 'string' && suggestionItems.length) {
									suggestionItems.unshift(`|${name}|`);
								}
								items = [...items, ...suggestionItems];
							}
						}
						if (contextData.items) {
							const staticItems = contextData.items.map(i => i.suggestion);
							if (staticItems.length) {
								items = [...items, ...staticItems];
							}
						}
						this.$store.dispatch('ide/handleContextItems', {
							context: contextData.suggestion,
							items: items || [],
						});
						this.registerCompletions(items, contextData, monaco);
						if (contextData.items && contextData.items.length) {
							recursive(contextData.items);
						}
					}
				}
				recursive(languageData);
			}
		},
		registerCompletions(items, contextData, mainMonaco) {

			const language = this.language;
			const reqSubContext = contextData.suggestion ? contextData.suggestion.label : this.language;
			const triggers = contextData.triggers || [];
			
			items = items && !isNaN(items.length) ? items : [items];
			items = items.map(item => {
				let data = {...item};
				data.kind = isNaN(item.kind) ? monaco.languages.CompletionItemKind[item.kind] : item.kind;
				data.insertTextRules = isNaN(item.insertTextRules) ? monaco.languages.CompletionItemInsertTextRule[item.insertTextRules] : item.insertTextRules;
				return data;
			}).filter(t => t.label);

			const instance = mainMonaco.languages.registerCompletionItemProvider(language, {
				triggerCharacters: JSON.parse(JSON.stringify(triggers || [])),
				provideCompletionItems: () => {
					if (this.activeContext && this.activeContext.context === reqSubContext) {
						// Monaco Editor Bug: only works like this, else only shows 1 hint/line
						return { suggestions: JSON.parse(JSON.stringify(items)) }
					}
					return { suggestions: [] }
				},
			});
			this.$store.dispatch('ide/handleIdeOverrideInstances', instance);
		},
		applyCustomTheme() {
			const editorLanguages = this.$refs.monacoEditor.monaco.languages.getLanguages();
			editorLanguages.forEach((i) => {
				if (this.language === i.id) {
					i.loader().then(response => {
						if (LANG_THEMES[this.language]) {
							try {
								const currentTheme = this.$refs.monacoEditor.getEditor()._themeService.getTheme().themeData;
								monaco.editor.defineTheme(`${this.language}-theme-override`, {
									...currentTheme,
									rules: [
										...currentTheme.rules,
										...LANG_THEMES[this.language]
									]
								});		
								monaco.editor.setTheme(`${this.language}-theme-override`);
								const oldObj = response.language.tokenizer.root;
								response.language.tokenizer.root = THEME_VARS[this.language];
								response.language.tokenizer.root = [...response.language.tokenizer.root, ...oldObj];
							} catch (error) {
								console.log('applyCustomTheme', error);
							}
						}
					});
				}
			});
		},
		resizeEditor(timeout = 50) {
			if (this.editor) {
				setTimeout(() => {
					this.editor.layout();
				}, timeout);
			}
		},
		disposeInstances() {
			const instances = this.ideOverrideInstances;
			for (let instance of instances) {
				instance.dispose();
			}
			this.$store.dispatch('ide/handleIdeOverrideInstances', false);
		},
		editorClicked(e) {
			this.showValuePopover(e);
		},
		showValuePopover(e) {
			const { context, text } = this.activeContext;
			this.tooltipVisible = false;
			if (context === 'filter' || context === 'attribute') {
				if (text) {
					this.clickX = e.clientX;
            		this.clickY = e.clientY;
					this.tooltipVisible = true;
				}
			}
		},
		tooltipEdited(e) {
			if (e.key === 'Enter') {
				this.tooltipVisible = false;
			}
		},
		restoreQueryParam() {
			const file = this.openFiles[this.index];
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
									this.activeContext = {context: param.split('_')[0], text: key}
									this.tooltipFilterOrAttributeName = key;
									this.filterOrAttributeOverride = value;
									this.updateQueryParam(file, { filter: key, value });
									this.$addQueryToUrl(param, value);
									this.activeContext = {};
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
			if (this.activeContext.context == 'filter' || this.activeContext.context == 'attribute') {
				payload = {
					index: this.index,
					filter: this.activeContext.text,
					value: value
				}
			}
			this.$store.dispatch(`ide/${this.activeContext.context}Override`, payload);
			return payload;
		},
		handleQueryOperations(payload) {
			const file = this.openFiles[this.index];
			if (!payload.value) {
				const type = this.activeContext.context.toLowerCase();
				this.updateQueryParam(file, payload);
				return this.$removeQueryFromUrl(`${type}_${payload.filter}`);
			}
			const type = this.activeContext.context.toLowerCase();
			this.$addQueryToUrl(`${type}_${payload.filter}`, payload.value);
			this.updateQueryParam(file, payload);
		},
		updateQueryParam(file, payload) {
			const prevQueryParams = this.queryParam[file.key] || null;
			this.$store.dispatch('ide/addQueryParam', {
				key: file.key,
				data: { ...prevQueryParams, [`${this.activeContext.context.toLowerCase()}_${payload.filter}`]: payload.value }
			});
		},
		async getFileContents(key) {
			try {
				const response = await this.$store.dispatch('ide/getFileContentsAwait', {
					file_name: `/${key.substring(2)}`,
				});
				return response.contents;
			} catch (e) {
				console.log(e);
				return '';
			}
		},
	},
	computed: {
		...mapState("ide", [
			"openFiles",
			"selectedFileKey",
			"selectedIndex", // Note: Should be used in functions where index() is not available
			"editorScrollPosition",
			"file_tree",
			"sqlSection",
			"containerSizes",
			"file",
			"ideOverrideInstances",
			"queryParam",
			"ideContext",
			"all_files",
		]),
		contents: {
			get() {
				const file = this.openFiles[this.index];
				return file ? file.contents : '';
			},
			set(value) {
				this.$store.dispatch("ide/storeFileData", {
					index: this.index,
					contents: value,
				});
			},
		},
		filterOrAttributeOverride: {
			get() {
				if (this.activeContext.context == 'filter') {
					return this.openFiles[this.index].filter_overrides[this.tooltipFilterOrAttributeName];
				} else if (this.activeContext.context == 'attribute') {
					return this.openFiles[this.index].attribute_overrides[this.tooltipFilterOrAttributeName];
				}
			},
			set(value) {
				let payload = this.setFilterOrAttributeOverride(value);
				this.handleQueryOperations(payload);
			}
		},
		activeContext: {
			get() {
				return this.ideContext;
			},
			set(obj) {
				this.$store.dispatch('ide/handleIdeContext', obj);
			}
		},
		index() {
			this.initialized = false;
			this.$nextTick(() => {
				this.initEditor();
				this.initialized = true;
			})
			return this.selectedIndex;
		},
		editorHeight() {
			const { sqlSectionActive, isSqlFile } = this;
			const editorSizes = this.editorSizes;
			let height = 'calc(100vh - 188px)';
			if (sqlSectionActive && isSqlFile) {
				height = editorSizes.textEditorHeight;
				try {
					const parseHeight = height.includes("calc")
					? height.replace("-495px", "-550px")
					: height.replace("px", "") - 55 + "px";
					return parseHeight;
				} catch (error) {
					console.error(error);
				}
			}
			const monaco = this.$refs.monacoEditor;
			if (monaco) {
				const editor = monaco.getEditor();
				editor.layout();
			}
			return height;
		},
		editorSizes() {
			this.resizeEditor(100);
			return this.containerSizes;
		},
		sqlSectionActive() {
			this.resizeEditor(100);
			return this.sqlSection;
		},
		language() {
			const file = this.openFiles[this.selectedIndex];
			if (file) {
				return this.$getLanguage(file.key);
			}
			return '';
		},
		readOnly() {
			const file = this.openFiles[this.selectedIndex];
            if (file) {
                const key = file.key || '';
                if (key.includes('dbt_gen') || key.includes('modules')) return true;
            }
            return false;
		},
	},
	watch: {
		file_tree() {
			this.disposeInstances();
			this.handleCompletions();
		},
	},
};
</script>