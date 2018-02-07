// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import axios from 'axios';
import App from './App';
import VueRouter from 'vue-Router';
import VueLocalStorage from 'vue-localstorage';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';
import VueSweetAlert from 'vue-sweetalert';
import Avatar from 'vue-avatar-component';
import CircleSpin from 'vue-loading-spinner/src/components/Circle';
import VueProgressiveImage from 'vue-progressive-image'
import VueLazyload from 'vue-lazyload'


//Components
import Login from './components/Login.vue';
import Share from './components/Share.vue';

import auth from './auth';
import './assets/css/style.css'

import {store} from './store.js';



var vueSmoothScroll = require('vue-smoothscroll');
require('vue2-animate/dist/vue2-animate.min.css');
Vue.use(vueSmoothScroll);

Vue.use(VueSweetAlert);
Vue.use(VueLocalStorage);
Vue.use(VueProgressiveImage);
Vue.use(VueLazyload, {
  error: '/static/images/error_placeholder.jpg',
  attempt: 1
})

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.component('icon', Icon);
Vue.component('avatar', Avatar);
Vue.component('circle-spin', CircleSpin);

var AWS = require('aws-sdk');

//We create the router instance here.
const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/content' },
    { path: '/content', name: 'content', component: Share, beforeEnter: requireAuth },
    { path: '/login', name:'login', component: Login },
  ]
});

function requireAuth (to, from, next) {
  if (!auth.loggedIn()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

export var api = axios.create({
  baseURL: 'https://api.saduwa.com',
  headers: {
    Authorization: 'Bearer '+localStorage.access_token,
  }
});

export var oauth = axios.create({
  baseURL: 'https://oauth.saduwa.com',
  headers: {
    Authorization: 'Bearer '+localStorage.access_token,
  }
});

api.interceptors.response.use(function (config) {
    // Do something with response data
    return config;
  }, function (error) {
    // Do something with response error
    console.log(error);
    if(error.response.status == 401){
      // console.log(store.getters.refreshingToken);
      refreshToken();
    }else{
      // localStorage.token = '';
    }
    return Promise.reject(error);
  });


function refreshToken(){
  // console.log("refreshing token");
  if(!store.getters.refreshingToken){
    store.commit('refreshToken', true);
    oauth.get('/token', {
      params: {
        refresh_token: localStorage.refresh_token,
        grant_type: 'refresh_token',
        client_id: '2_app3tbbgovtwg44kcc44w44c0k4o4oc0ssow800o00ssw880g4',
      }
    })
    .then(function (response) {
      localStorage.access_token = response.data.access_token;
      localStorage.refresh_token = response.data.refresh_token;
      localStorage.user_id = response.data.user_id;
      // router.push('/world');
      store.commit('refreshToken', false);
      location.reload();
    })
    .catch(function (error) {
        Vue.localStorage.remove('access_token');
        location.reload();
        //router.push('/login');
    });
  }

}

Vue.mixin({
  data() {
    return{
      mixin: 'global',
      profileUrl: 'https://s3-us-west-2.amazonaws.com/media.saduwa.com/public/users/',
      temp: 'media.saduwa.com/temp',
      userFirstName: localStorage.firstName,
      userLastName: localStorage.lastName,
      USER_INFO: '',
    }
  },
  methods: {
    getImgType: function(type){
        if(type == null){
          return 'jpg';
        }else{
          return type.substring(type.indexOf('.')+1)
        }
        
      },
      
    postColor: function(color){
      switch(color){
        case 'tomato':
          return '#d32f2f';
        case 'carrot':
          return '#ff7043';
        case 'barcelona':
          return '#1565c0';
        case 'lemon':
          return '#F3C244';
        case 'aloe':
          return '#48A155';
        default:
          return '#48A155';
      }
    },

    timeDifference: function(previous) {
      if(previous == "now"){
        return "now"
      }
      var current = new Date();
      previous = new Date(previous.replace(/-/g,'/').replace(/T/,' ').replace(/\+/,' +'));
      var msPerMinute = 60 * 1000;
      var msPerHour = msPerMinute * 60;
      var msPerDay = msPerHour * 24;
      var msPerMonth = msPerDay * 30;
      var msPerYear = msPerDay * 365;
      
      var elapsed = current - previous;
      
      if (elapsed < msPerMinute) {
           return Math.round(elapsed/1000) + ' seconds ago';   
      }
      
      else if (elapsed < msPerHour) {
           return Math.round(elapsed/msPerMinute) + ' minutes ago';   
      }
      
      else if (elapsed < msPerDay ) {
           return Math.round(elapsed/msPerHour ) + ' hours ago';   
      }

      else if (elapsed < msPerMonth) {
           return + Math.round(elapsed/msPerDay) + ' days ago';   
      }
      
      else if (elapsed < msPerYear) {
           return + Math.round(elapsed/msPerMonth) + ' months ago';   
      }
      
      else {
           return + Math.round(elapsed/msPerYear ) + ' years ago';   
      }

    },
  }
})

new Vue({
  el: '#app',
  store: store,
  router,
  template: '<App/>',
  components: { App, Avatar },
  created() {
  },
})



