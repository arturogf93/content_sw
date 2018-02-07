<template>
  <div id="login">
    <div id="login-div">
      <div id="login-wrapper" style="">
        <div class="box login-box">
          <div class="columns">
            
            <div class="column is-5 login-left is-hidden-mobile">
              <br>
              <strong class="is-size-3-desktop is-size-4-touch">Welcome to Saduwa!</strong>
              <br><br>
              <p class="is-size-3-desktop is-size-4-touch">Share moments with friends and connect with the world</p>
              <strong>Don't have an account? Don't worry!</strong>
              <br><br>
              <div class="field" style="display: inline-block">
                  <p class="control">
                    <button @click="register" class="button" style="background-color:#ECC247 !important; border-color: #ECC247;">
                      Register now
                    </button>
                  </p>
                </div>

            </div>

            <div class="column is-7 login-right">
              <article class="media">
                <div class="media-content">
                  <div class="content" style="">

                  <div class="has-text-centered">
                    <img src="/static/images/saduwa_logo_colored.png" alt="saduwa">
                  </div>
                    
                 <div class="field">
                  <label class="label">Username </label>
                  <div class="control has-icons-left has-icons-right">
                    <input v-on:keyup="keymonitor" v-model="username" class="input is-success" type="email" placeholder="Username">
                    <span class="icon is-small is-left">
                      <i class="fa fa-user"></i>
                    </span>
                    <span class="icon is-small is-right">
                      <i class="fa fa-check"></i>
                    </span>
                  </div>
                </div>

                <div class="field" style="margin-bottom:48px;">
                  <label class="label">Password</label>
                    <p class="control has-icons-left">
                    <input v-on:keyup="keymonitor" v-model="password" class="input" type="password" placeholder="Password">
                    <span class="icon is-small is-left">
                      <i class="fa fa-lock"></i>
                    </span>
                  </p>
                </div>

                <p class="cursor" @click="forgotPassword">Forgot password? we can help.</p>
                <div class="field" style="margin-top:20px;">
                  <p class="control">
                    <button @click="login" class="button" style="background-color:#ECC247 !important; border-color: #ECC247;">
                      Login
                    </button>
                  </p>
                </div>

                <div v-if="error" class="notification is-danger">
                    {{errorText}}
                </div>

                  </div>
                </div>
              </article>
            </div>

            <div class="column is-5 login-left is-hidden-tablet">
              <br>
              <strong class="is-size-3-desktop is-size-4-touch">Welcome to Saduwa!</strong>
              <br><br>
              <p class="is-size-3-desktop is-size-4-touch">Share moments with friends and connect with the world</p>
              <strong>Don't have an account? Don't worry!</strong>
              <br><br>
              <div class="field" style="display: inline-block">
                  <p class="control">
                    <button @click="register" class="button" style="background-color:#ECC247 !important; border-color: #ECC247;">
                      Register now
                    </button>
                  </p>
                </div>

            </div>

          </div>
			  

			 </div>
	  	</div>
	  </div>

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
import axios from 'axios'
import {api} from '../main.js'
import {oauth} from '../main.js'
import Vue from 'vue';
import auth from '../auth'

export default {
  data () {
    return {
      username: '',
      password: '',
      error: false,
      errorText: '',
      loadingModal: false,
    };
  },

  created(){
    this.username = localStorage.username;
    // Vue.localStorage.remove('access_token');
    if(localStorage.access_token != null){
      this.$router.push('content');
    }
  },
  methods: {

    forgotPassword: function(){
      let vm = this;
      vm.$swal({
        title: 'Please enter your email',
        input: 'email',
        confirmButtonColor: '#ECC247',
        cancelButtonColor: '#939393',
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: function (email) {
          return new Promise(function (resolve, reject) {
            axios.get('https://api.saduwa.com/users/newpassword', {
              params: {
               u: email,
              }
            })
            .then(function (response) {
              resolve()
            })
            .catch(function (error) {
               console.log(error);
               reject('Email not found')
            });
          })
        },
        allowOutsideClick: true
      }).then(function (email) {
        vm.$swal({
          type: 'success',
          text: 'We just sent you an email with your new password',
        })
      })
    },

    keymonitor: function(event) {
      if(event.key == "Enter"){
        this.login();
      }
    },


    register: function(){
      this.$router.push('register');
    },

  	login: function(){
  		var vm = this;
      $applozic.fn.applozic("reInitialize");
      vm.loadingModal = true;
  		oauth.get('/token', {
          params: {
           username: vm.username,
           password: vm.password,
           grant_type: 'password',
           client_id: '2_app3tbbgovtwg44kcc44w44c0k4o4oc0ssow800o00ssw880g4',
          }
        })
        .then(function (response) {
          localStorage.access_token = response.data.access_token;
          localStorage.refresh_token = response.data.refresh_token;
          localStorage.user_id = response.data.user_id;
          ga('set', 'userId', response.data.user_id); // Set the user ID using signed-in user_id.
          api.defaults.headers['Authorization'] = 'Bearer '+response.data.access_token;
          vm.userDetails();
          vm.$parent.getUserInfo();
          vm.$router.push('content');
          vm.loadingModal = false;
        })
        .catch(function (error) {
           //console.log(error);
           vm.loadingModal = false;
           vm.$swal(
            {title:'Check your username and password', 
            type:'error',
            allowEnterKey: false,
          });
        });
  	},

  	userDetails: function() {
  		let vm = this;
        
    	api.get('https://api.saduwa.com/users/'+localStorage.user_id, {
          params: {
          }
        })
        .then(function (response) {
          localStorage.username = response.data.username;
          localStorage.firstName = response.data.firstName;
          localStorage.lastName = response.data.lastName;
          localStorage.user_color = response.data.color;
          localStorage.user_pattern = response.data.pattern;
          localStorage.userInfo = JSON.stringify(response.data);
        })
        .catch(function (error) {
           console.log(error);
        });
    }

  }
}
</script>
