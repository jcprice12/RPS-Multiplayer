/***********************************************************************************************************
 Initialize Firebase
***********************************************************************************************************/
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
/***********************************************************************************************************
 End Initialize Firebase
***********************************************************************************************************/

function buildSessionsTableRow(key, name, player1, player2){
	var tr = $("<tr>");
	tr.attr("data-session-name", name);
	tr.attr("data-session-key", key);
	tr.addClass("sessionRow")
  	var sessionNameTd = $("<td>");
  	sessionNameTd.text(name);
  	var player1Td = $("<td>");
  	player1Td.text(player1);
  	var player2Td = $("<td>");
  	player2Td.text(player2);
  	tr.append(sessionNameTd);
  	tr.append(player1Td);
  	tr.append(player2Td);
  	return tr;
}

//read the data and build table from it
function buildSessionsTable(){
	console.log("building sessions table...")
	database.ref("sessions").once("value", function(snapshot) {
      destroySessionsTableBody();
      for(key in snapshot.val()){
      	var player1;
      	var player2;
      	if(snapshot.val()[key].player1){
      		player1 = snapshot.val()[key].player1.playerEmail;
      	} else {
      		player1 = "";
      	}
      	if(snapshot.val()[key].player2){
      		player2 = snapshot.val()[key].player2.playerEmail;
      	} else {
      		player2 = "";
      	}
      	$("#sessionsTableBody").append(buildSessionsTableRow(key, snapshot.val()[key].name,player1,player2));
      }
    }, function(errorObject) {
      console.log("Sessions read failed: " + errorObject.code);
    });
}

function destroySessionsTableBody(){
	console.log("destroying sessions table");
	$("#sessionsTableBody").html("");
}

function leaveGameRoom(){
	console.log("leaving game room");
	buildSessionsTable();
}

function buildGameRoom(){
	console.log("building game room");
}


$(document).ready(function(){
	$("#signUpButton").on("click", function(){
		const email = $("#emailInput").val();
		const password = $("#passwordInput").val();
		authorization.createUserWithEmailAndPassword(email, password).catch(function(error) {
			console.log("Could not sign up: " + error.code);
		});
	});

	$("#loginButton").on("click", function(){
		const email = $("#emailInput").val();
		const password = $("#passwordInput").val();
		authorization.signInWithEmailAndPassword(email, password).catch(function(error){
			console.log("Could not log in: " + error.code);
		});
	});

	$("#logOutButton").on("click", function(){
		authorization.signOut();
	});

	$("#newSessionButton").on("click", function(){
		var sessionName = $("#sessionNameInput").val().trim();
		if(sessionName){
			var sessionsRef = database.ref("sessions");
			var newSession = sessionsRef.push({
				name: sessionName,
				player1 : {
					playerEmail: authorization.currentUser.email,
					choice: null,
					wins: 0,
					losses: 0,
					ties: 0,
				},
			});
			buildSessionsTable();
		}
	});

	$(document).on("click", ".sessionRow", function(){
		var key = $(this).data("session-key");
		var sessionRef = "sessions/" + key;
		database.ref(sessionRef).once("value", function(snapshot){
			var user = authorization.currentUser;
			var email = user.email;
			if(!snapshot.hasChild("player1")){
				var player1 = database.ref(sessionRef).child("player1");
				player1.set({
					playerEmail: email,
					choice: null,
					wins: 0,
					losses: 0,
					ties: 0,
				});
				buildGameRoom();
			} else if(!snapshot.hasChild("player2")){
				var player2 = database.ref(sessionRef).child("player2");
				player2.set({
					playerEmail: email,
					choice: null,
					wins: 0,
					losses: 0,
					ties: 0,
				});
				buildGameRoom();
			} else {
				alert("You cannot join " + snapshot.val().name + ". There are already two players in it.");
			}
			buildSessionsTable();
		});
	});

	authorization.onAuthStateChanged(function(myUser){
		if(myUser){
			console.log("user " + myUser.email + " has loggeed in");
			buildSessionsTable();
		} else {
			console.log("a user is not logged in");
			destroySessionsTableBody();
		}
	});
});