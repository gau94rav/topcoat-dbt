<template>
  	<div class="d-flex editor-tabs-container">
		<v-tabs show-arrows class="editor-tabs" v-model="selected">
			<v-tabs-slider></v-tabs-slider>
			<v-tab :id='tab.key' v-for="tab in tabs" :key="tab.key" class="outline d-flex justify-space-between" :href="'#tab-' + tab.key" :title='tab.key.substring(2)' @contextmenu='handleRightClick'>
				<div class="label">{{ tab.title }}</div>
				<v-icon class="close-icon" @click="removeTab(tab)">mdi-close</v-icon>
			</v-tab>
		</v-tabs>
		<div class="errors-tabs d-flex align-center px-1 justify-end">
			<div class="error-text d-flex cursor-pointer" @click='toggleSection'>
				<!-- Mobile Error Notification -->
				<div class="error-icon-container-mobile mb-1">
				<v-tooltip bottom>
					<template v-slot:activator="{ on, attrs }">
						<div
							class="file-name"
							v-bind="attrs"
							v-on="on"
						>
							<v-icon v-if='building' class="spinner-loader error-icon pr-1">mdi-loading</v-icon>
							<v-icon v-else class="error-icon pr-1" :color="errors ? '#e76f51' : '#18a476'">
								mdi-{{ errors ? 'alert-circle' : 'check-circle' }}
							</v-icon>
						</div>
					</template>
					<span v-if='!building'>
						<span v-if='errors'>Errors({{ errors ? errors : 0 }})</span>
						<span v-else>No Errors</span>
					</span>
					<span v-else>Building...</span>
				</v-tooltip>
				</div>
				<!-- Mobile Error Notification -->

				<!-- Desktop Error Notification -->
				<div class="error-icon-container mb-1">
					<v-icon v-if='building' class="spinner-loader error-icon pr-1">mdi-loading</v-icon>
					<v-icon v-else class="error-icon pr-1" :color="errors ? '#e76f51' : '#18a476'">
						mdi-{{ errors ? 'alert-circle' : 'check-circle' }}
					</v-icon>
					<span class="error-trigger-text" v-if='!building'>
						<span class="error-text-container d-ruby" v-if='errors'>Errors ({{ errors ? errors : 0 }})</span>
						<span class="success-text d-ruby" v-else>No Errors</span>
					</span>
				</div>
				<!-- Desktop Error Notification -->
			</div>
			<v-tooltip bottom>
				<template v-slot:activator="{ on, attrs }">
					<v-icon
						v-bind="attrs"
						v-on="on"
						class="help-button"
						:class='{"highlight-bounce": hasActiveContext}'
						color="#2a9d8f"
						@click='toggleQuickHelp'
					>
						mdi-help-circle
					</v-icon>
				</template>
				<span>Quick Help</span>
			</v-tooltip>
			<div
				:class="{'highlighted-btn': !sqlArea }"
				class="errors-trigger py-1 px-2 cursor-pointer"
				@click="toggleSqlSection"
				v-if="isSqlFile"
			>
				<img v-if='sqlArea' :src="icons.terminal" />
				<img v-else :src="icons.terminal_white" />
			</div>
			<v-tooltip :left='sqlArea' :bottom='!sqlArea'>
				<template v-slot:activator="{ on, attrs }">
					<v-btn
						elevation="0"
						color="#2a9d8f"
						class="commit-button"
						:disabled='commitLoading'
						@click='$emit("handleCommitClick", changeCount)'
						v-bind="attrs"
						v-on="on"
					>
						<span class="desktop-element pr-2">{{ buttonLabel }}</span>
						<img v-if='!commitLoading && !branchLoading' :src="icons.git" />
						<v-icon class="spinner-loader" v-else>mdi-loading</v-icon>
					</v-btn>
				</template>
				<span>
					<div>
						<span class="mobile-element">{{ buttonLabel }}</span>
						<span v-if="buttonLabel == 'Commit Changes' && !conflicts.length">{{ changeCount || 0 }} File{{ changeCount > 1 ? 's' : '' }}</span>
						<span v-if="buttonLabel == 'Commit Changes' && conflicts.length">
							{{ conflicts.length }} merge conflict{{ conflicts.length > 1 ? 's' : ''}}
						</span>
						<span v-if="buttonLabel == 'Pull Remote'">
							{{ commits_behind }} commit{{ commits_behind > 1 ? 's' : ''}} behind master
						</span>
						<span v-if="buttonLabel == 'Push to Production' || buttonLabel == 'Merge to Master'">
							{{ commits_ahead }} commit{{ commits_ahead > 1 ? 's' : ''}} ahead of master
						</span>
						<span v-if="buttonLabel === 'No Changes'">Nothing to commit</span>
					</div>
				</span>
			</v-tooltip>
		</div>
		<confirm-modal
			v-if='showConfirm'
			:message='confirmMessage'
			:show='showConfirm'
			@close='showConfirm = false'
			@confirm='processRemove(currentTab)'
		/>
		<context-menu
			:position='contextMenuPosition'
			:options='contextMenuItems'
			:show='showContextMenu'
			@close='showContextMenu = false'
			@selected='handleMenuAction'
		/>
  	</div>
</template>

<style lang="less">
.editor-tabs-container {
	.editor-tabs {
		width: 67% !important;
		height: 42px;
	}
	.errors-tabs {
		gap: 15px;
		width: 40%;
		.error-text {
			font-size: 13px;
			font-family: "Montserrat-Regular";
			.success-text {
				color: #18a476;
			}
		}
		.error-trigger-text {
			font-size: 12px;
		}
		.error-icon {
			width: 15px;
			height: 15px;
			font-size: 18px !important;
			bottom: 1px;
		}
		.error-text-container {
			position: relative;
		}
		.errors-trigger {
			transition: 0.3s;
			border-radius: 3px;
			height: 37px !important;
			bottom: 2px;
			position: relative;
			width: 37px;
			img {
				height: 18px;
				margin-bottom: 1px;
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				margin: auto;
			}
			&:hover {
				background: #eaecf5;
			}
		}
		.highlighted-btn {
			background: #2a9d8f;
			i {
				color: #fff;
			}
		}
		.help-button {
			text-transform: none;
			font-family: "Montserrat-Regular";
			position: relative;
			bottom: 2px;
			border-radius: 50% !important;
			font-size: 18px;
			cursor: pointer;
		}
		.commit-button {
			font-size: 12px;
			height: 37px !important;
			font-family: "Montserrat-Regular";
			text-transform: none;
			position: relative;
			bottom: 2px;
			border-radius: 3px !important;
			.v-btn__content {
				span {
					padding-bottom: 1px;
				}
			}
			i {
				font-size: 16px;
			}
			img {
				height: 18px;
			}
		}
	}

  	.v-tab {
		background: #eff2f7;
		font-family: "Roboto-Regular";
		color: #1f2937;
		font-size: 14px;
		text-transform: none;
		height: 42px;
		padding: 0px !important;
		padding-right: 0.5em !important;
  	}
	.v-slide-group__prev,
	.v-slide-group__next {
		height: 42px;
		i {
			color: #6b7280;
			font-size: 35px;
			font-weight: 400;
		}
		border: 1px solid #d1d5db;
		border-bottom: none;
  	}
	.label {
		font-size: 12px;
		padding: 0 1em;
	}
	.close-icon {
		font-size: 16px !important;
		padding: 0 0.5em;
		width: 10px;
	}
  	.v-tab--active {
		background: #ffffff !important;
		border-top: 2px solid #2a9d8f !important;
		border-bottom: none !important;
		color: #6b7280 !important;
		.label {
		color: #2a9d8f !important;
		}
		.close-icon {
			i {
				color: #1f2937 !important;
			}
			&:active {
				background: none !important;
			}
		}
  	}
  	.v-tabs-slider-wrapper {
		display: none;
  	}
  	.error-icon-container-mobile {
		display: none;
  	}
}

@media (max-width: 1110px) {
	.commit-button {
		min-width: 20px !important;
		padding: 0 10px !important;
	}
}

@media (max-width: 1350px) {
	.error-icon-container {
		display: none;
	}
	.error-icon-container-mobile {
		display: block !important;
	}
}
</style>

<script>
import "../../../assets/terminal.svg";
import "../../../assets/terminal-white.svg";
import "../../../assets/git.svg";
import { mapState } from 'vuex';
import ConfirmModal from '../../common/ConfirmModal';
import ContextMenu from '../../common/ContextMenu';
import { EditorTabsMenu } from '../../../assets/constants/menus';

export default {
	data: () => ({
		showConfirm: false,
		confirmMessage: '',
		currentTab: {},
		showContextMenu: false,
		contextMenuItems: EditorTabsMenu,
		contextMenuPosition: {x: 0, y: 0},
	}),
	components: {
		ConfirmModal,
		ContextMenu,
	},
  	methods: {
		toggleSection() {
			this.show = !this.show;
			if (this.show) {
				this.$store.dispatch('ide/handleQuickHelp', false);
			}
		},
		removeTab(tab) {
			this.currentTab = tab;
			const filesWithChanges = this.openFiles.map((file) => {
				return file.changes ? file.key : -1;
			})
			const hasChanges = filesWithChanges.indexOf(tab.key) > -1;
			if (hasChanges) {
				this.confirmMessage = `Close '${tab.title || "File"}' without saving changes?`;
				return this.showConfirm = true;
			}
			this.processRemove(tab);
		},
		processRemove(tab) {
			const file = this.$objExtract(this.openFiles, 'key', tab.key, 'children');
			const currentFile = this.openFiles[this.selectedIndex];
			if (file && file.key) {
				this.$store.dispatch('ide/addQueryParam', {
					key: file.key,
					data: {},
				});
			}
			this.$store.dispatch('ide/removeFileFromList', tab.key);
			if (currentFile && currentFile.key !== file.key) {
				return false;
			}
			this.$resetUrl('develop');
		},
		toggleQuickHelp() {
			this.$store.dispatch('ide/handleQuickHelp', !this.quickHelp);
			if (this.quickHelp) {
        		this.$store.dispatch('ide/toggleErrorSection', false);
			}
			this.$store.dispatch('ide/addContainerSize', {
				container: 'lastChangedElement',
				size: !this.quickHelp ? '' : 'quickHelp',
			});
		},
		handleRightClick(e) {
			e.preventDefault();
			this.contextMenuPosition.x = e.clientX;
      		this.contextMenuPosition.y = e.clientY;
			this.showContextMenu = true;
		},
		handleMenuAction(action) {
			this.showContextMenu = false;
			switch (action) {
				case 'close-saved-tabs':
					const tabsWithoutChanges = this.openFiles.filter(file => !file.changes);
					for (let tab of tabsWithoutChanges) {
						this.removeTab(tab);
					}
					break;
			}
		},
		toggleSqlSection() {
			this.sqlArea = !this.sqlArea;
		},
  	},
  	computed: {
		...mapState('ide', [
			'modified',
			'added',
			'conflicts',
			'renamed',
			'deleted',
			'selectedIndex',
			'openFiles',
			'commits_behind',
			'commits_ahead',
			'branchLoading',
			'buildErrors',
			'openedTabs',
			'selectedTab',
			'building',
			'quickHelp',
			'ideContext',
			'buildErrorsSection',
			'sqlSection',
			'commitLoading',
		]),
		...mapState('git', [
			'app_mode'
		]),
		sqlArea: {
			get() {
				return this.sqlSection;
			},
			set(toggle) {
				this.$store.dispatch('ide/toggleSqlSection', toggle);
				return toggle;
			}
		},
		selected: {
			get() {
				return this.selectedTab;
			},
			set(selected) {
				if (typeof selected === 'undefined') return '';
				const key = selected.replace('tab-', '');
				const file = this.openFiles.filter(f => f.key === key)[0];
				if (file) {
					this.$store.dispatch('ide/loadFile', {
						file,
						instance: this,
					})
				}
				this.$nextTick(() => {
					this.$addKeyToUrl(key);
				})
				this.$store.dispatch('ide/selectedTab', selected);
				return selected;
			}
		},
		tabs() {
			return this.openedTabs;
		},
		isSqlFile() {
			const file = this.openFiles[this.selectedIndex];
			return file && this.$getLanguage(file.key) === 'sql';
		},
		changeCount() {
			return this.modified.length + this.added.length + this.deleted.length + this.conflicts.length + this.renamed.length;
		},
		buttonLabel() {
			if (this.changeCount > 0) return "Commit Changes"
			else if (this.commits_behind) return "Pull Remote";
			else if (this.commits_ahead && this.app_mode == 'wld') return "Push to Production";
			else if (this.commits_ahead && this.app_mode == 'sqlide') return "Merge to Master";
			else return "No Changes";
		},
		errors() {
			return Object.keys(this.buildErrors).length;
		},
		icons: () => {
			return {
				terminal: static_url + "terminal.svg",
				terminal_white: static_url + "terminal-white.svg",
				git: static_url + "git.svg",
			};
		},
		show: {
			get() {
				return this.buildErrorsSection;
			},
			set(toggle) {
				this.$store.dispatch('ide/toggleErrorSection', toggle);
			}
		},
		hasActiveContext() {
			const file = this.openFiles[this.selectedIndex];
			if (file) {
				const language = this.$getLanguage(file.key);
				return this.ideContext && this.ideContext.context !== language || this.ideContext && this.ideContext.context === 'html' //Note: html condition is temporary;
			}
			return false;
		}
  	},
};
</script>