<template>
    <v-layout class="popup-container flex-row-reverse" @mouseleave="popup = false">
        <v-btn
            class="confirm-btn"
            ref='confirmBtn'
            :class="customClass"
            :elevation="0"
            @click="showPopup"
            :color='color'
            :width='width'
            v-if='type != "span"'
            :disabled='disabled'
        >
            <span class="trigger-text">{{ title || 'Click Me' }}</span>
            <v-icon
                v-if='icon'
                class="git-icon"
                :class='{"spinner-loader": loading}'
            >
                {{ !loading ? icon : 'mdi-loading' }}
            </v-icon>
        </v-btn>
        <span
            v-else
            class="confirm-btn"
            ref='confirmBtn'
            :style='{ width }'
            :class="customClass"
            @click="showPopup"
        >
            <span :class="{'disabled-item': disabled}" v-if='!loading' class="trigger-text">{{ title || 'Click' }}</span>
            <v-icon v-else class='spinner-loader relative-center d-flex'>
                mdi-loading
            </v-icon>
        </span>
        
        <v-card
            :style='{ top, left }'
            v-if='popup'
            class="popup-item d-flex"
            :elevation="1"
        >
            <div class="popup-message align-center">
                {{ message || 'Confirm?'}}
            </div>
            <div class="popup-actions pl-4 d-flex align-center">
                <v-btn
                    color="#2a9d8f"
                    @click="confirm"
                >
                    <v-icon>mdi-check</v-icon>
                </v-btn>
                <v-btn
                    class="ml-2"
                    color="rgb(231, 111, 81)"
                    @click="popup = false"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </v-card>
    </v-layout>
</template>

<script>
export default {
    props: [
        'message',
        'title',
        'customClass',
        'color',
        'icon',
        'type',
        'loading',
        'disabled',
        'width',
    ],
    data: () => ({
        top: '',
        left: '',
        popup: false,
    }),
    methods: {
        showPopup(e) {
            if (this.$props.disabled) return false;
            this.top = `${e.clientY}px`;
            this.popup = true;
            this.$nextTick(() => {
                // To keep div inside screen
                const popupElement = document.querySelector('.popupCard');
                if (popupElement) {
                    const width = popupElement.clientWidth;
                    const screenSize = window.innerWidth;
                    this.left = (screenSize - (width + 30)) + 'px';
                }
            })
        },
        confirm() {
            this.$emit('confirm');
            this.popup = false;
        }
    }
}
</script>

<style lang="less">
    .popup-container {
        position: relative !important;
        width: max-content;
        height: max-content;
        flex: inherit !important;
        .popup-item {
            position: fixed;
            padding: 10px 15px;
            width: max-content;
            .popup-message {
                font-size: 12px;
                display: flex;
            }
        }
    }
    @media (max-width: 960px) {
        .popup-message {
            display: none !important;
        }
    }
</style>