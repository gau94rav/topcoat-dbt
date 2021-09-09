<template>
    <div class="password-change-container">
        <v-card
            class="modal-content"
            elevation="2"
        >
            <div class="modal-body">
                <div class="logo-container">
                    <img
                        :src="imgURL"
                        alt="logo"
                        class="main-logo"
                        :style="logoStyleObject"
                    />
                </div>
                <div class="modal-description pb-4">
                    <div class="modal-title">
                        Welcome to {{ frontEndTitle }}.
                    </div>
                    <div class="modal-text">
                        Please set your password to continue:
                    </div>
                </div>
                <div class="form-section">
                    <v-text-field
                        outlined
                        class="modal-input"
                        type="password"
                        v-model="password1"
                        placeholder="Enter password"
                    >
                    </v-text-field>
                    <v-text-field
                        outlined
                        class="modal-input"
                        type="password"
                        v-model="password2"
                        placeholder="Confirm"
                    >
                    </v-text-field>
                    <div class="error-message" v-if='passwordError'>
                        {{ passwordError }}
                    </div>
                </div>
            </div>
            <div class="spacer-div"></div>
            <div class="modal-foot d-flex justify-end">
                <v-btn
                    elevation="0"
                    color="#2a9d8f"
                    class="mr-6 mt-2"
                    :disabled='loading'
                    @click="submitPassword"
                >
                    <v-icon v-if='loading' class="spinner-loader">mdi-loading</v-icon>
                    <span>Submit</span>
                </v-btn>
            </div>
        </v-card>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    data: () => ({
        password1: '',
        password2: '',
        passwordError: '',
        matchedCase: ["[A-Z]", "[0-9]", "[a-z]"],
        loading: false,
    }),
    computed: {
        imgURL: function () {
            return static_url + "topcoat-light-logo.svg";
        },
        ...mapState("admin", []),
        appMode() {
            return app_mode;
        },
        frontEndTitle: function () {
            return front_end_title;
        },
        logoStyleObject() {
            return {
                paddingRight: this.appMode == 'sqlide' ? '55px': '0px',
                paddingLeft: this.appMode == 'sqlide' ? '10px': '0px',
            }
        }
    },
    methods: {
        submitPassword() {
            const validated = this.validate();
            if (validated) {
                this.loading = true;
                this.$store.dispatch('auth/setPassword', {
                    newpassword: this.password1,
                }).then(() => {
                    this.loading = false;
                    this.passwordError = null;
                    this.$emit('refresh');
                }).catch(error => {
                    this.loading = false;
                    this.passwordError = error.response.data.message;
                })
            }
        },
        validate() {
            const { password1, password2 } = this;
            this.passwordError = "";
            let validated = false;
            if (password1 !== password2) {
                this.passwordError = "Passwords do not match.";
            } else if (password1.length < 8) {
                this.passwordError = "Password must be at least 8 characters long.";
            } else if (!this.regexMatched(password1)) {
                this.passwordError = "Password must contain one uppercase, one lowercase, and one number.";
            } else {
                this.validated = true;
            }
            return validated;
        },
        regexMatched(password1) {
            var ctr = 0;
            for (var i = 0; i < this.matchedCase.length; i++) {
                if (new RegExp(this.matchedCase[i]).test(password1)) {
                ctr++;
                }
            }
            return ctr >= 3;
        }
    }
}
</script>

<style lang="less">
    .password-change-container {
        position: fixed;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.524);
        .modal-content {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            margin: auto;
            max-width: 520px;
            height: max-content;
            padding-bottom: 10px;
            .logo-container {
                padding: 30px 0;
                width: 100px;
                text-align: center;
                .main-logo {
                    max-height: 48px;
                    width: auto;
                }
            }
            .error-message {
                height: max-content;
                padding: 10px 15px !important;
            }
        }
        .v-btn {
            text-transform: none;
        }
    }
</style>