import { mapState, mapGetters, mapMutations } from 'vuex';
import axios from 'axios';
import { eventBus } from '../../main';

const REFRESH_MINUTES=20
const TIMEOUT_MINUTES=1442 

export const authMixin = {
  data() {
    return {
      interval: null
    }
  },
  computed: {
    ...mapState('auth', [
      'client_id',
      'domain',
      'redirect_uri',
      'last_refresh'
    ])
  },
  beforeDestroy: function(){
    clearInterval(this.interval);
  },
  methods: {
    ...mapMutations('auth', [
        'setLastRefresh'
    ]),
    startAuthPoll() {
      this.interval = setInterval(function () {
        this.checkSessionInternal(false);
      }.bind(this), 1000*60*TIMEOUT_MINUTES); 
    },
    initAuth() {
      this.checkSessionInternal(true);
      this.startAuthPoll();
      return;
    },
    checkSessionInternal(refresh) {

      //console.log("checkSession")

      if (refresh) {
        const now = new Date(); 
        const secondsSinceEpoch = Math.round(now.getTime() / 1000);

        if (!this.last_refresh) {
          this.setLastRefresh(secondsSinceEpoch);
          return;
        } else if ((secondsSinceEpoch - this.last_refresh) / 60 < REFRESH_MINUTES ) {
          return;
        } else {
          this.setLastRefresh(secondsSinceEpoch);
        }
        console.log("Refeshing...")
        this.authRefresh = "/api/admin/refreshAuth?time=" + secondsSinceEpoch
      } else {
        axios.get('/api/admin/checkAuth')
        .then((response)  =>  {
          // Still authenticated
          console.log("Polling - still authenticated");
        }, (error)  =>  {
          console.log("Redirect to login (poll)");
          window.location.href = "/login/auth0?next=" + window.location.href;
        });
       }
      return;
    }
  }
}