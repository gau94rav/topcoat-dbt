<template>
    <div class="uploader-container">
        <div class="uploader-content">
            <form @change="handleUpload">
                <input
                    ref='uploadInput'
                    type='file'
                    v-if='type === "file"'
                />
                <input
                    ref='uploadInput'
                    type='file'
                    v-else
                    webkitdirectory
                    directory
                />
            </form>
        </div>
        <div class="upload-progress d-flex" v-if='currentFile'>
            <v-icon class="spinner-loader">mdi-loading</v-icon>
            <span class="px-3 uploader-message">Uploading '{{ currentFile.name }}'.</span>
        </div>
    </div>
</template>

<script>

export default {
    props: ['location', 'type'],
    data: () => ({
        currentIndex: 0,
        files: [],
        fullDirectory: '',
        currentFile: '',
    }),
    computed: {
        headers() {
            return {
                'Content-Type': 'multipart/form-data',
                'authorization': 'authorization-text',
                'X-CSRFTOKEN': this.getCSRFToken(),
            }
        }
    },
    mounted() {
        this.clearData();
        this.$refs.uploadInput.click();
    },
    methods: {
        handleUpload(event) {
            const type = this.type;

            return type === 'file' ?
                this.uploadFile(event.target.files[0]) :
                this.uploadDirectory(event.target.files);
        },
        uploadFile(file, location = null) {
            const { type, name } = file;
            const fileData = new Blob([file], {type});
            const formData = new FormData();
            location = location ? location : this.location;
            const isLayers = location.includes('layers') || location.includes('layers/');
            if (isLayers && this.$getLanguage(name) !== 'sql') {
                return this.error(`Failed to upload '${name}' to /${location}`, true);
            }
            formData.append(location, fileData, name);
            this.currentFile = file;
            this.$store.dispatch('ide/upload', {
                data: formData,
                headers: this.headers
            }).then(() => this.success(name))
            .catch(error => this.error(error));
        },
        uploadDirectory(files) {
            const fullDirectory = files[0].webkitRelativePath;
            const directory = fullDirectory.split('/')[0];
            const location = this.location;

            this.files = files;
            this.fullDirectory = `${location}/${directory}`;
            this.currentIndex = 0;

            this.uploadFile(this.files[this.currentIndex], this.fullDirectory);
        },
        isQueued() {
            this.currentFile = null;
            this.currentIndex += 1;
            if (this.type === 'directory') {
                const currentFile = this.files[this.currentIndex];
                if (currentFile) {
                    return this.uploadFile(currentFile, this.fullDirectory);
                }
            }
            this.$alert({
                message: 'Upload Completed',
                type: 'success',
            });
            this.$store.dispatch('ide/getBranchStatus', 'ide');
            return this.clearData();
        },
        success() {
            this.$store.dispatch('ide/getFileList');
            if (this.type !== 'directory') {
                this.$store.dispatch('ide/getBranchStatus', 'ide');
            }
            this.isQueued();
        },
        error(error, isText = false) {
            const message = isText ? error : error.response.data.message;
            if (message) {
                this.$alert({ message, type: 'error' });
            }
            this.isQueued();
        },
        validate(name, location) {
            if (location.includes('layers')) {
                const condition = this.$getLanguage(name) === 'sql' || this.$getLanguage(name) === 'json';
                if (!condition) {
                    this.$alert({
                        message: 'Invalid file extension for a layer',
                        type: 'error',
                    });
                    return false;
                }
            }
            return true;
        },
        getCSRFToken() {
            var name = "csrftoken=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },
        clearData() {
            this.files = [];
            this.fullDirectory = '';
            this.currentIndex = 0;
        }
    },
}
</script>

<style lang="less">
    .uploader-container {
        .uploader-content {
            position: fixed;
            z-index: -3;
            opacity: 0;
        }
        .upload-progress {
            position: absolute;
            left: 0;
            right: 0;
            margin: auto;
            z-index: 8100;
            text-align: center;
            border-radius: 3px;
            width: max-content;
            padding: 5px 15px;
            font-size: 16px;
            transition: 0.5s;
            top: 80px;
            animation-name: topAppear;
            animation-duration: 0.5s;
            animation-iteration-count: 1;
            background: #2196f3;
            font-family: "Montserrat-Regular";
            color: #fff;
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(0, 0, 0, 0.14),
            0 0 0 0 rgba(0, 0, 0, 0.12);
            .v-icon {
                color: #fff;
            }
            .uploader-message {
                position: relative;
                top: 1px;
            }
        }
    }
</style>