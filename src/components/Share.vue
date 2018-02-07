<template>
  <div id="world">

    <div class="columns">
      <div class="column">

        <div class="has-text-centered">
          <button class="button" v-for="p in pages" @click="pageSelected = p">{{p.name}}</button>
        </div>

        <div class="box" id="feed" style="margin-top:10px;">
          <article class="media">
            <!-- user photo -->
            <div class="media-left">
              <figure class="image is-64x64">
                <router-link :to="'/mysaduwa'">
                  <avatar :fullname="pageSelected.name" :color="postColor(pageSelected.color)" :size="60"></avatar>
                </router-link>
              </figure>
            </div>
            <!--  -->

            <div class="media-content">
              <div class="content post-content">
                <p>
                  <strong>{{pageSelected.name}}</strong>
                  <br>
                  <div class="field">
                    <div class="control">
                      <input class="input is-primary settings-input" style="width:100%; max-width:unset" type="text" placeholder="Title">
                    </div>
                  </div>
                  <div class="field">
                    <div class="control">
                      <textarea maxlength="10000" rows="15" class="textarea settings-input" v-model="postBody"></textarea>
                    </div>
                  </div>
                </p>
                
                <!-- dropzone -->
                <div>
                  <dropzone ref="dropzone" 
                    :maxFileSizeInMB="20" 

                    :useFontAwesome="true" 
                    :thumbnailWidth="100" 
                    :thumbnailHeight="100" 
                    :maxNumberOfFiles="6" 
                    id="myVueDropzone" 
                    v-on:vdropzone-removed-file="removeFile" 
                    v-on:vdropzone-file-added="fileAdded" 
                    v-on:vdropzone-queue-complete="uploadComplete" 
                    :preview-template="template" 
                    url="https://httpbin.org/post" 
                    v-on:vdropzone-success="showSuccess">
                    <!-- Optional parameters if any! -->
                    <input @change="onFileChange" type="hidden" name="token" value="">
                  </dropzone>
                </div>
                <!-- dropzone end -->
                <div style=" float:right; margin-top:10px;">

                  <span @click="uploadToS3" id="post-button" :disabled="uploadingFiles || (files.length == 0 && (postBody == '' || postBody.replace(/\s/g,'').length == 0))" class="button tag color-yellow button" :class="{'is-loading': posting}">
                    <strong>{{ postButtonText }}</strong>
                  </span>
                  

                </div>

              </div>
            </div>
          </article>
        </div>
      </div>
      <div class="column">
        <!-- <div class="field">
          <div class="control">
            <input v-model="src" class="input" type="text" placeholder="Text input">
          </div>
        </div> -->
        <div>
          <button class="button newsBtn" @click="src='http://www.nairaland.com/'">nairaland</button>
          <button class="button newsBtn" @click="src='http://www.pulse.ng/'">pulse</button>
          <button class="button newsBtn" @click="src='http://politicsngr.com/'">politicsngr</button>
          <!-- <button class="button newsBtn" @click="src='https://www.naij.com/'">naij</button> -->
          <button class="button newsBtn" @click="src='https://www.vanguardngr.com/'">vanguardngr</button>
          <button class="button newsBtn" @click="src='http://sunnewsonline.com/'">sunnewsonline</button>
          <button class="button newsBtn" @click="src='http://www.dailypost.ng/'">dailypost</button>
          <button class="button newsBtn" @click="src='https://guardian.ng/'">guardian</button>
          <button class="button newsBtn" @click="src='https://www.channelstv.com/'">channelstv</button>
          
          <button class="button newsBtn" @click="src='https://www.today.ng/'">today.ng</button>
          <button class="button newsBtn" @click="src='https://www.thisdaylive.com/'">thisdaylive</button>
          <button class="button newsBtn" @click="src='http://www.thenationonlineng.net/'">thenationonlineng</button>
          <button class="button newsBtn" @click="src='http://leadership.ng/'">leadership</button>
          <button class="button newsBtn" @click="src='https://www.pmnewsnigeria.com/'">pmnewsnigeria</button>
          <button class="button newsBtn" @click="src='https://www.dailytrust.com.ng/'">dailytrust</button>
          <button class="button newsBtn" @click="src='http://www.dailytimes.com.ng/'">dailytimes</button>
          <button class="button newsBtn" @click="src='http://www.independent.ng/'">independent</button>
          <button class="button newsBtn" @click="src='http://www.businessdayonline.com/'">businessdayonline</button>
          <button class="button newsBtn" @click="src='http://www.completesportsnigeria.com/'">completesportsnigeria</button>
          <button class="button newsBtn" @click="src='https://www.financialwatchngr.com/'">financialwatchngr</button>
          <button class="button newsBtn" @click="src='http://www.premiumtimesng.com/'">premiumtimesng</button>
          <button class="button newsBtn" @click="src='https://www.brandspurng.com/'">brandspurng</button>
          <button class="button newsBtn" @click="src='http://www.investorsking.com/'">investorsking</button>
          <button class="button newsBtn" @click="src='https://www.smeonline.biz/'">smeonline</button>
          <button class="button newsBtn" @click="src='http://www.nigerianwatch.com/'">nigerianwatch</button>


          <button class="button newsBtn" @click="src='http://www.tribuneonlineng.com/'">tribuneonlineng</button>
          <button class="button newsBtn" @click="src='http://www.businessinsider.com/'">businessinsider</button>
          <button class="button newsBtn" @click="src='http://punchng.com/'">punchng</button>
          
          <button class="button newsBtn" @click="getNewsUrl()">url</button>
        </div>
        <iframe id="newsFrame" :src="src" style="width:100%; height:100%; min-height:500px; margin-top:10px;"></iframe>
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

  import {api} from '../main.js';
  import Vue from 'vue';
  import Dropzone from 'vue2-dropzone';
  import VbSwitch from 'vue-bulma-switch';
  import 'buefy/lib/buefy.css';

  export default {
    components:{
      Dropzone,
      VbSwitch,
    },
    data() {
      return {

        userInfo: {},
        pages: {},
        pageSelected: {},
        src: 'http://www.nairaland.com/',

        files: [],
        mediaIds: [],
        tags: [],
        
        photos: false,
        uploadingFiles: false,
        posting: false,
        privacy: false,
        loadingModal: false,
        
        postBody: '',
        postButtonText: 'Post',
        
      };
    },

    created() {
      let vm = this;
      vm.loadingModal = true;
      // GET user info
      api.get('/users/'+localStorage.user_id, {})
      .then(function (response) { vm.userInfo = response.data;})

      //GET PAGES
      api.get('/pages').then(function (response) { 
        vm.pages = response.data 
        vm.pages = vm.pages.filter(function(pages){
          return pages.relationStatus == 8 || pages.relationStatus == 32
        })
        vm.pageSelected = vm.pages[0];
        vm.loadingModal = false;
      })
    },

    methods: {

      getNewsUrl: function(){
        console.log(document.getElementById('newsFrame').src);
      },

      uploadComplete: function(){ //Fired when queue has been completely processed/ uploaded.
        this.uploadingFiles = false;
        this.postButtonText = 'Post';
      },

      fileAdded: function(){ //File added to the dropzone.
        this.uploadingFiles = true;
        this.postButtonText = 'Loading';
      },

      'showSuccess': function (file) { //File successfully uploaded.
        this.files.push(file);
      },

      'removeFile': function (file) { //A file was removed from the dropzone.
        var vm = this;
        vm.files = _.remove(vm.files, function(n) {
          return n != file;
        });

      },

      'template':function() { //A custom preview template which will be passed as function
        return `
        <div class="dz-preview dz-file-preview">
          <div class="dz-image" style="width: 100px;height: 100px">
            <img data-dz-thumbnail /></div>
            <div class="dz-details">
            </div>
            <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
            <div class="dz-error-message"><span data-dz-errormessage></span></div>
            <div class="dz-success-mark"><i class="fa fa-check"></i></div>
            <div class="dz-error-mark"><i class="fa fa-close"></i></div>
          </div>
        `;
      },


      onFileChange(e) {
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length)
          return;
        this.files = files;
        //this.uploadToS3();
      },

      uploadToS3: function(){
        var vm = this;
        if(vm.files.length > 0 || (vm.postBody != '' && vm.postBody.replace(/\s/g,'').length > 0)){
          AWS.config.update({accessKeyId: 'AKIAJ37LZDAZQQWMWVKQ', secretAccessKey: 'uJZXPGPVHjyECnP9/agChEsXOKXUWqNXcY+dBx4d'});
          AWS.config.region = 'us-west-2';
          var bucket = new AWS.S3({ params: { Bucket: vm.temp } });
          vm.posting = true;
          for(var i = 0; i<vm.files.length; i++){
            var image = vm.files[i]
            var params = { Key: image.name, ContentType: image.type, Body: image, ServerSideEncryption: 'AES256' };
            var newMedia = {media:{name: image.uploadName, size: image.size, type: image.type}};
            bucket.putObject(params, function(err, data) {
              if(err) {
                // There Was An Error With Your S3 Config
                console.log(err.message);
                vm.busy = false;
                return false;
              }
            });
          }
          this.newMedia();
        }
      },

      newMedia: function(){
        var vm = this;
        var count = 0;
        if(vm.files.length == 0){
          vm.newPost();
        }else{
          for(var i = 0; i<vm.files.length; i++){
            api.post('/pages/'+vm.pageSelected.id+'/media', {
              "media":{
                "name": vm.files[i].name,
                "type": vm.files[i].type,
                "size": vm.files[i].size,
              }
            })
            .then(function (response) {
              vm.mediaIds.push(response.data.id)
              count++;
              if(count == vm.files.length){
                vm.newPost();
              }
            })
            .catch(function (error) {
              
            });
          }
        }
      },

      newPost: function(){
        let vm = this;
        vm.findHashtags(vm.postBody);
        var author = vm.pageSelected.id;

        api.post('/pages/'+vm.pageSelected.id+'/posts', {
          "post":{
            "body": vm.postBody,
            "privacy": "0",
            "media": vm.mediaIds,
            "tags": vm.tags,
            "author": author,
          }
        })
        .then(function (response) {
          ga('send', 'event', 'Action', 'Create post');
          vm.posting = false;
          vm.postBody = '';
          vm.photos = false;
          vm.files = [];
          vm.mediaIds = [];
          if(vm.$route.path.substring(0,6) == '/world'){
            vm.$router.push('/mySaduwa');
          }else{
            vm.$parent.addPost(response.data);
          }
          vm.$refs.dropzone.removeAllFiles();
        })
        .catch(function (error) {
          
        });
      },

      findHashtags: function(searchText) { //search hastags in post body
        let vm = this;
        vm.tags = [];
        var regexp = /\B\#\w\w+\b/g
        var result = searchText.match(regexp);
        if (result) {
            for(var i=0; i<result.length; i++){
              result[i] = result[i].replace('#','');
            }
            // vm.tags = result;
            vm.tags = Array.from(new Set(result));
        } else {
            return false;
        }
      },


    },

  }

</script>


