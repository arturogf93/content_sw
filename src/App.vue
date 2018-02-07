<template>
  <div :id="colorId" style="height: 100%;">
    
    

    <!-- mobile menu -->
    <nav v-if="navbarMobile" class="navbar is-hidden-tablet" style="bottom: 0;" :id="'pattern-'+patternId">
      <div class="navbar-item">
        <div id="bottom-nav">
          <router-link to="/world/news">
            <img src="/static/icons/feed.svg" class="no-background svg-img">
          </router-link>
          <router-link to="/chat">
            <img src="/static/icons/chat.svg" class="no-background svg-img">
            <avatar v-if="unread()" style="font-size:14px; padding:unset" class="tag" :fullname="unreadChats.toString()" :size="20"></avatar>
          </router-link>
          
          <a @click="getAllNotifications()">
            <img src="/static/icons/notification.svg" class="no-background svg-img">
            <avatar style="font-size:14px; padding:unset" class="tag" :fullname="notificationsData.unreadNumber.toString()" :size="20"></avatar>
          </a>

          <router-link to="/mysaduwa">
            <img src="/static/icons/profile.svg" class="no-background svg-img">   
          </router-link>

        </div>
      </div>
    </nav>

    <!-- mobile search bar -->
    <nav v-if="navbarMobile && searchMobile" class="navbar is-hidden-tablet" style="top: 50px;" :id="'pattern-'+patternId">
      <div class="navbar-item">
        <div id="bottom-nav">
          <div class="field navbar-item">
            <div class="control has-icons-right" style="width:100%">
              <input v-on:keyup="keymonitor" v-model="searchString" @focus="search = true" class="input" type="text" placeholder="Search">
              <span class="icon is-small is-right">
                <icon name="search"></icon>
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <!--  -->


    <!-- nav -->
    <nav class="navbar is-hidden-mobile" v-if="navbar" :id="'pattern-'+patternId">
      <div class="navbar-brand">
        <a class="navbar-item">
          <img class="navbar-img" src="/static/images/saduwa_logo.png" alt="saduwa">
        </a>
    
        <div @click="ham = !ham" class="navbar-burger burger" :class="{ 'is-active':!ham }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div id="navMenuExample" class="navbar-menu" :class="{ 'is-active':ham }">
        <div class="navbar-start">
          <div class="field navbar-item" id="search-nav">
            
          </div>
        </div>

        <div class="navbar-end">

          <span @click="ham = !ham" style="padding-top:9px;">
            <a @click="logout" class="navbar-item">
              Logout
            </a>
          </span>
        </div>
      </div>
    </nav>
    <!-- nav end -->
    
    <div @click="search = false" style="height: 100%; background-color:#f1f1f1">
      <transition name="component-fade" mode="out-in">
        <!-- components -->
        <router-view v-on:changeC="changeElementsColor" v-on:changeP="changeElementsPattern" :notificationsData="notificationsData" :loadingNotifications="loadingNotifications" :usersR="users" :postsR="posts" :search-string="searchString" :notifications="notifications" :loadingSearch="loadingSearch"></router-view>
        <!--  -->
      </transition>
    </div>


    <!-- NOTIFICATIONS MODAL -->
    <transition name="component-fade" mode="out-in">
      <div v-if="notificationsModal" class="modal" v-bind:class="{ 'is-active': notificationsModal }">
        <div @click="notificationsModal = false" class="modal-background"></div>
        <div class="modal-content" style="width: 440px;">

          <div class="box">
            <div class="has-text-centered">
              <strong class="section-title">Notifications</strong>
              <img src="/static/icons/close_modal.svg" class="cursor svg-img" style="float:right;" @click="notificationsModal = false">
            </div>
            <hr>
            
            <div v-if="loadingNotifications" class="has-text-centered"><circle-spin></circle-spin></div>
            
            <article class="media" v-for="notification in notifications">
              <div class="media-left">
                  <router-link :to="{ name: 'profile', params: { id: notification.sender.id, isPage: isPage(notification.sender.isPage) }}">
                    <img v-if="notification.sender.avatar" class="sender" :src="'data:image/png;base64, ' + notification.sender.avatar.thumbnail">
                    <avatar v-else :fullname="notification.sender.firstName" :color="postColor(notification.sender.color)" :size="32"></avatar>
                  </router-link>
              </div>
              <div class="media-content">
                <div class="content">
                    <div v-if="!notification.status" style="margin-right:0;"  class="circle"></div>
                    <strong class="cursor">{{ cap(notification.sender.firstName) + ' ' + cap(notification.sender.lastName)}}</strong>
                    
                    <span :class="{'cursor': notification.type > 4 || !notification.status }" @click="readNotification(notification)">{{ notification.body }}</span>
                    <br>
                    <small>{{ timeDifference(notification.createdAt)}}</small>
                    
                    <div v-if="notification.type == 1" @click="notificationsModal = true">
                      <span id="post-button" class="tag color-gray" :class="{'is-loading': reFriend && acceptNotiId == notification.id}" @click="rejectFriend(notification)" :disabled="acceptFriend">
                        <strong>Reject</strong>
                      </span>
                      <span id="post-button" class="tag button" :class="{'is-loading': acceptFriend && acceptNotiId == notification.id}" style="margin-right:10px;" @click="addFriend(notification)" :disabled="reFriend && acceptNotiId == notification.id">
                        <strong>Accept</strong>
                      </span>
                    </div>

                </div>
              </div>
            </article>

          </div>
        </div>
      </div>
    </transition>
    <!-- /NOTIFICATIONS MODAL END-->


    <!-- LOADING MODAL -->
    <div class="modal" :class="{'is-active': loadingModal}">
      <div class="modal-background loading-modal"></div>
      <div class="modal-content has-text-centered">
        <!-- Any other Bulma elements you want -->
        <circle-spin></circle-spin>
      </div>
    </div>
    <!-- /LOADING MODAL END -->

  </div>
</template>

<script>
import Vue from 'vue';
import { focus } from 'vue-focus';
import {api} from './main.js';
import axios from 'axios';
import _ from 'lodash';
import Avatar from 'vue-avatar-component';
import CircleSpin from 'vue-loading-spinner/src/components/Circle';

export default {
  name: 'app',
  components: {
    Avatar,
    CircleSpin,
  },
  data () {
    return {
      searchString: '',
      answer: '',
      userInfo: {'avatar': ''},
      
      posts: [],
      users: [],
      notificationsData: {"unreadNumber": "0"},
      notifications: [],
      
      search: false,
      navbar: true,
      navbarMobile: true,
      ham: false,
      
      notificationsModal: false,
      loadingNotifications: false,
      searchMobile: false,
      loadingModal: false,
      interestsModal: false,
      loadingUserInfo: false,

      acceptFriend: false,
      reFriend: false, //reject friend
      readNotificationPost: false,
      notiPost: {},
      loadingSearch: false,
      
      userId: localStorage.user_id,
      colorId: localStorage.user_color,
      patternId: localStorage.user_pattern,
      username: localStorage.username,
      
      unreadChats: 0,
    };
  },
  watch: {

    notificationsModal: function(){
      this.scrollBody(this.notificationsModal)
    },

    '$route': function(){
      let vm = this;
      vm.notificationsModal=false;
      vm.searchMobile = false;
      vm.getNotifications();
      if(this.$route.name != 'search'){
        this.searchString = '';
      }

      if(localStorage.access_token == null  || vm.$route.path == '/landing' || vm.$route.path == '/login' || vm.$route.path == '/register'){ // if not logged in
        vm.navbar = false;
        vm.navbarMobile = false;
      }else{
        vm.navbar = true;
        vm.navbarMobile = true;
      }
      if(this.$route.name == 'chat'){
        vm.navbarMobile = false;
      }else{
        vm.navbarMobile = true;
      }
    
    if(vm.$route.name != 'login' || vm.$route.name != 'register'){ //get chat unread count
      axios({
        method: 'post',
        url: 'https://apps.applozic.com/rest/ws/register/client',
        data:{
          "userId":localStorage.user_id,
          "password":localStorage.user_id,
          "deviceType":"1",
          "applicationId":"399d2b9b11c154f98564812905289df85",
        }
      })
      .then(function (response) {
        vm.unreadChats = response.data.totalUnreadCount;
        localStorage.deviceKey = response.data.deviceKey;
      })
      .catch(function (error) {
        
      });
    }

    },

    '$route.params': function(){
      this.search = false;
    },
    
    // whenever searchString changes, this function will run
    searchString: function (newQuestion) {
      this.answer = ''
      this.getAnswer()
    }
  },

  created(){
    var vm = this;

    if(localStorage.access_token == null || vm.$route.path == '/landing' || vm.$route.path == '/login' || vm.$route.path == '/register'){ // if not logged in
      vm.navbar = false;
      vm.navbarMobile = false;
    }else{
      vm.navbar = true;
      vm.navbarMobile = true;
    }

    if(this.$route.name == 'chat'){
      vm.navbarMobile = false;
    }
    
    if(localStorage.access_token != null){
      
      // GET user info
      vm.loadingUserInfo = true;
      api.get('/users/'+localStorage.user_id, {
        params: {
        }
      })
      .then(function (response) {
        vm.loadingUserInfo = false;
        localStorage.user_color = response.data.color;
        localStorage.user_pattern = response.data.pattern;
        localStorage.userInfo = JSON.stringify(response.data);
        vm.colorId = response.data.color;
        vm.patternId = response.data.pattern;
        vm.userInfo = response.data;
      })

      // GET notifications
      vm.getNotifications();

       //GET USER INTERESTS
        vm.loadingInterests = true;
        api.get('/users/'+localStorage.user_id+'/interests', { params: { limit: 30 } })
        .then(function (response) {
          // vm.loadingInterests = false;
          // vm.$store.interests = response.data;
          vm.$store.commit('setInterestst', response.data);
        })

      ga('set', 'userId', localStorage.user_id); // Set the user ID using signed-in user_id.

    }
  },

  methods: {

    isPage: function(p){
      if(p.toString() == 'true'){
          return 'page';
      }
      return 'user';
    },

    scrollBody(m){
      var root = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
      if(m){
        root.setAttribute( 'class', 'no-scroll' );
      }else{
        root.classList.remove("no-scroll");
      }
    },

    testapi: function(){
      // console.log('expired token set');
      // api.defaults.headers['Authorization'] = 'Bearer YjUzYTFkNDg2YmUwMzllMzk0Yjg4ZTI0NDQ1MmE2MzA0MGU5YzdjN2U4ZGEwYjA5NDFhZWQ1NDc5ZDNhY2I0OQ';
      // localStorage.access_token = 'YjUzYTFkNDg2YmUwMzllMzk0Yjg4ZTI0NDQ1MmE2MzA0MGU5YzdjN2U4ZGEwYjA5NDFhZWQ1NDc5ZDNhY2I0OQ';
      //this.$store.commit('setUserIsPage', true);
    },

    searchM(){
      this.searchMobile = !this.searchMobile;
    },

    cap: function(i){
      return _.capitalize(i);
    },

    getNotifications: function(){
      let vm = this;
      vm.loadingNotifications = true;
      api.get('/users/'+localStorage.user_id+'/notifications', {
        params: {
          limit: 30,
        }
      })
      .then(function (response) {
        vm.loadingNotifications=false;
        // order notifications by date
        vm.notifications = response.data.notifications.sort(function(a, b) {
            a = a.createdAt.replace(/-/g, "/").substring(0,19).replace('T', ' ');
            b = b.createdAt.replace(/-/g, "/").substring(0,19).replace('T', ' ');
            a = new Date(a);
            b = new Date(b);
            return a>b ? -1 : a<b ? 1 : 0;
        });
        vm.notificationsData = response.data;
      })
      .catch(function (error) {
        vm.loadingNotifications=false;
      });
    },

    // show notification modal
    getAllNotifications: function(){
      this.notificationsModal = true;
    },

    // get notification post
    readNotification: function(notification){
      let vm = this;

      //UNDEFINED                 = 0;
      //FRIENDSHIP_REQUEST        = 1;
      //FRIENDSHIP_CONFIRMATION   = 2;
      //REPORT_RECEIVED           = 3;
      //REPORT_ANSWER             = 4;
      //LIKE                      = 5;
      //POST_CREATION             = 6;
      //COMMENT_CREATION          = 7;
      //STATUS_UNREAD             = false;
      //STATUS_READ               = true;

      if((notification.type <= 4) && notification.status){
        return;
      }

      if((notification.type <= 4) && !notification.status){
        vm.notificationStatus(notification);
        notification.status = true;
        vm.notificationsData.unreadNumber--;
      
      }else{
        vm.loadingModal = true;
        console.log(vm.loadingModal);
        api.get('/users/'+notification.relatedEntity.wallId+'/posts/'+notification.relatedEntity.postId, {})
        .then(function (response) {
          vm.notiPost = response.data;
          vm.readNotificationPost = true;
          vm.loadingModal = false;
          vm.getPostComments(vm.notiPost);
          
          if(!notification.status){
            vm.notificationsData.unreadNumber--;
          }

          vm.notificationStatus(notification); //patch notification
          notification.status = true;
          
        })
      }
    },

    getPostComments: function(post){
      let vm = this;
      var url = '/users/';
      if(post.author.isPage.toString() == "true"){ url = '/pages/' }

      api.get(url+post.wallUser.id+'/posts/'+post.id+'/comments', {
        params: {
          limit: 5,
          offset: vm.offsetComments,
        }
      })
      .then(function (response) {
        vm.comment_list = vm.comment_list.concat(response.data.comments);
        vm.offsetComments += response.data.comments.length;
        if(response.data.comments.length < 5){
          vm.loadMoreComments = false;
        }
      })
    },

    notificationStatus: function(notification){
      api({
        method: 'patch',
        url: '/users/'+localStorage.user_id+'/notifications',
        data: [{'op':'read', 'path':'/', 'value':[notification.id]}]
      })
    },

    addFriend: function(notification){
      let vm = this;
      vm.acceptFriend = true;
      vm.acceptNotiId = notification.id;
      api({
        method: 'link',
        url: '/users/'+localStorage.user_id,
        headers: {'LINK': '/users/'+notification.sender.id}
      })
      .then(function (response) {
        notification.body = 'Request accepted';
        notification.type = -1;
        vm.acceptFriend = false;
      })
    },

    rejectFriend: function(notification){
      let vm = this;
      vm.acceptNotiId = notification.id;
      vm.$swal({
        title: 'Are you sure?',
        text: "",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#939393',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        confirmButtonClass: 'btn-success',
        cancelButtonClass: 'btn-danger',
        buttonsStyling: true
      }).then(function () {
        vm.reFriend = true;
          api({
            method: 'unlink',
            url: '/users/'+localStorage.user_id,
            headers: {'UNLINK': '/users/'+notification.sender.id}
          })
          .then(function (response) {
            notification.body = 'Request rejected';
            notification.type = 0;
            vm.reFriend = true;
            // notification.body = 'Request removed'
          })
      })
    },

    unread: function(){
      if(this.$route.name != 'chat'){return true}
      return false;
    },

    getUserInfo: function(){
      let vm = this;
      api.get('/users/'+localStorage.user_id, {
        params: {
        }
      })
      .then(function (response) {
        vm.userInfo = response.data;
        localStorage.userInfo = JSON.stringify(response.data);
        localStorage.firstName = response.data.firstName;
        localStorage.lastName = response.data.lastName;
        vm.colorId = response.data.color;
        vm.patternId = response.data.pattern;
      })
      .catch(function (error) {
        
      });
    },

    keymonitor: function(event) {
      if(event.key == "Enter" && this.searchString != '' && !this.loadingSearch && (this.users.length > 0 || this.posts.length > 0 )){
        this.$router.push('/search');
        this.search = false;
        this.ham = false;
      }
    },

    changeElementsColor: function(a){
      this.colorId = a;
    },

    changeElementsPattern: function(a){
      this.patternId = a;
    },

    logout: function(){
      $applozic.fn.applozic('logout');
      Vue.localStorage.remove('access_token');
      Vue.localStorage.remove('refresh_token');
      Vue.localStorage.remove('user_id');
      Vue.localStorage.remove('firstName');
      Vue.localStorage.remove('lastName');
      Vue.localStorage.remove('userInfo');
      location.reload();
      // this.$router.push('/login');
    },
    
    truncateText: function(text){
      return _.truncate(text, {
        'length': 32,
        'separator': ' '
      });
    },

    // _.debounce is a function provided by lodash to limit how
    // often a particularly expensive operation can be run.
    // In this case, we want to limit how often we access
    // api, waiting until the user has completely
    // finished typing before making the get request. To learn
    // more about the _.debounce function (and its cousin
    // _.throttle), visit: https://lodash.com/docs#debounce
    getAnswer: _.debounce(
      function () {
        var vm = this
        vm.users = [];
        vm.posts = [];
        if (vm.searchString == '') {
          return
        }
        vm.answer = 'Searching...'
        vm.loadingSearch = true;
        api.get('/search', {
            params: {
              q: vm.searchString,
            }
          })
          .then(function (response) {
            vm.answer = _.capitalize(response.data.answer)
            if(response.data.posts.length > 0){
              vm.posts = response.data.posts[0].posts;
            }
            vm.posts = vm.posts.splice(0,3);
            vm.users = response.data.users;
            vm.users = vm.users.splice(0,3);
            vm.loadingSearch = false;
          })
          .catch(function (error) {
            vm.answer = 'Error! Could not reach the API. ' + error
          })
      },
      // This is the number of milliseconds we wait for the
      // user to stop typing.
      500
    )
  },
}

document.addEventListener('DOMContentLoaded', function () {

  // Get all "navbar-burger" elements
  var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Check if there are any nav burgers
  if ($navbarBurgers.length > 0) {

    // Add a click event on each of them
    $navbarBurgers.forEach(function ($el) {
      $el.addEventListener('click', () => {

        // Get the target from the "data-target" attribute
        var target = $el.dataset.target;
        var $target = document.getElementById(target);

        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        $el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

      });
    });
  }

});


</script>

<!-- <style src="./assets/css/style.css"></style> -->
<!-- <style src="./assets/css/bulma.css"></style> -->
