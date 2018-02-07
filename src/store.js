import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state: {
		fn: '',
		ln: '',
		us: '',
		pass: '',
		interests: [],
		interestsModal: false,
		searchString: '',
		refreshingToken: false,
		userProfileId: '',
		userIsPage: false,
		searchString: '',
	},

	getters: {
		searchString(state){
			return state.searchString;
		},
		interests(state){
			return state.interests;
		},
		refreshingToken(state){
			return state.refreshingToken;
		},
		userProfileId(state){
			return state.userProfileId;
		},
		userIsPage(state){
			return state.userIsPage;
		},
	},

	mutations: {
		setSearchString(state, s){
			state.searchString = s;
		},
		setUserProfileId(state, id){
			state.userProfileId = id;
		},

		setUserIsPage(state, isPage){
			state.userIsPage = isPage;
		},

		refreshToken(state, s){
			state.refreshingToken = s;
		},

		landingData(state, d){
			state.fn = d.firstName;
			state.ln = d.lastName;
			state.us = d.username;
			state.pass = d.password;
		},
		setInterestst(state, i){
			state.interests = i;
		},
		deleteInterestst(state, i){
			state.interests = state.interests.filter(function (item) {
              return item.id != i;
          });
		},
		toogleInterestsModal(state){
			state.interestsModal = !state.interestsModal;
		}
	}
})