/* globals localStorage */
import {api} from './main'
export default {
  login (email, pass, cb) {
    
  },

  
  loggedIn () {
    return !!localStorage.access_token
  },

  onChange () {}
}

// function loginRequest (email, pass, cb) {
//   setTimeout(() => {
//     api.get('http://api.dev.saduwa.com/token', {
//           params: {
//            username: email,
//            password: pass,
//            grant_type: 'password',
//            client_id: '2_app3tbbgovtwg44kcc44w44c0k4o4oc0ssow800o00ssw880g4',
//           }
//         })
//         .then(function (response) {
//           localStorage.access_token = response.data.access_token;
//           localStorage.refresh_token = response.data.refresh_token;
//           localStorage.user_id = response.data.user_id;
//           userDetails();
//           cb({
//             authenticated: true,
//           })
//         })
//         .catch(function (error) {
//            console.log(error);
//            cb({ authenticated: false })
//         });
//   }, 0)
// }

// function userDetails (email, pass, cb) {
//     api.get('http://api.dev.saduwa.com/users/'+localStorage.user_id, {
//           params: {
//           }
//         })
//         .then(function (response) {
//           localStorage.username = response.data.username;
//           localStorage.firstName = response.data.firstName;
//           localStorage.lastName = response.data.lastName;
//           localStorage.user_color = response.data.color;
//           cb({
//             authenticated: true,
//           })
//         })
//         .catch(function (error) {
//            console.log(error);
//            cb({ authenticated: false })
//         });
// }
