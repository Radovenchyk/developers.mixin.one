export default {
    name: 'app-information',
    props: {
        active_app: {
            type: Object,
            default() {
                return {}
            }
        },
        is_new_app: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            can_save: false,
            new_app: true,
            icon_base64: '',
            app_name: ''
        }
    },
    watch: {
        active_app(val) {
            console.log(val)
            this.icon_base64 = '';
            this.app_name = val.name
        }
    },
    methods: {
        submit_to_database() {
            _submit_to_database.call(this)
        },
        getFile(event) {
            _render_file_to_base64.call(this, event.target.files[0])
        },
        check_is_finished() {
            if (this.app_name && this.active_app.home_uri && this.active_app.redirect_uri && this.active_app.description) {
                this.can_save = true;
            } else {
                this.can_save = false;
            }
        }
    },
    mounted() {
        this.app_name = this.active_app.name
        this.check_is_finished()
    },
}


function _render_file_to_base64(file) {
    let reader = new FileReader();
    reader.addEventListener('load', event => this.icon_base64 = event.target.result, false)
    reader.readAsDataURL(file);
}

let once_submit = false

function _submit_to_database() {
    if (once_submit) {
        this.$message.error(this.$t('message.'))
        return
    }
    let {app_id, capabilities, description, home_uri, name, redirect_uri} = this.active_app
    name = this.app_name
    let parmas = {capabilities, description, home_uri, name, redirect_uri}
    parmas.icon_base64 = this.icon_base64.substring(this.icon_base64.split('').findIndex(item => item === ',') + 1);
    once_submit = true;
    this.$emit('loading', true)
    this.apis.set_app(app_id, parmas).then(res => {
        if (res.type === 'app') {
            this.$message.success(this.$t('message.success.save'))
            this.$emit('add_new_app', res.app_id)
            this.$store.dispatch('init_app', true).then(_ => {
                this.$store.commit('change_state', {can_transition: true});
                this.$router.push('/')
            })
        }
    })
        .catch(err => {
            let error = err.response.data.error
            this.$message.error(`${this.$t('message.errors.' + error.code)} (${error.code})`)
        })
        .finally(_ => {
            once_submit = false;
            this.$emit('loading', false)
        })
}
