// Initialize Firebase
var config = {
	apiKey: "AIzaSyCt-XPcbfE1R6eChVyXWvO-kV0IYS6eiCY",
	authDomain: "rockpaperscissors-73d01.firebaseapp.com",
	databaseURL: "https://rockpaperscissors-73d01.firebaseio.com",
	projectId: "rockpaperscissors-73d01",
	storageBucket: "rockpaperscissors-73d01.appspot.com",
	messagingSenderId: "580909160554"
};
firebase.initializeApp(config);

var database = firebase.database();
var authorization = firebase.auth();


$(document).ready(function(){
	$("#signUpButton").on("click", function(){
		const email = $("#emailInput").val();
		const password = $("#passwordInput").val();
		authorization.createUserWithEmailAndPassword(email, password).catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("Error Code: " + error.code);
			console.log("Error Message: " + error.message);
		});
	});

	$("#loginButton").on("click", function(){
		const email = $("#emailInput").val();
		const password = $("#passwordInput").val();
		firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error){
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("Error Code: " + error.code);
			console.log("Error Message: " + error.message);
		});
	});

	$("#logOutButton").on("click", function(){
		authorization.signOut();
	});

	authorization.onAuthStateChanged(function(myUser){
		if(myUser){
			console.log(myUser);
		} else {
			console.log("not logged in");
		}
	})
});