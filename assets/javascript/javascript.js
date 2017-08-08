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

function buildSessionsTableRow(name, player1, player2){
	var tr = $("<tr>");
	tr.attr("data-session-name", name);
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

function buildSessionsTableHeader(){
	var tr = $("<tr>");
	var sessionNameTh = $("<th>");
	sessionNameTh.text("Session Name");
	var player1Th = $("<th>");
	player1Th.text("Player 1");
	var player2Th = $("<th>");
	player2Th.text("Player 2");
	tr.append(sessionNameTh);
	tr.append(player1Th);
	tr.append(player2Th);
	return tr;
}


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
		authorization.signInWithEmailAndPassword(email, password).catch(function(error){
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("Error Code: " + error.code);
			console.log("Error Message: " + error.message);
		});
	});

	$("#logOutButton").on("click", function(){
		authorization.signOut();
	});

	$("#newSessionButton").on("click", function(){
		var sessionName = $("#sessionNameInput").val().trim();
		if(sessionName){
			database.ref("sessions/").once("value", function(snapshot){
				if(!snapshot.hasChild(sessionName)){
					var sessionRef = "sessions/" + sessionName;
					var session = database.ref(sessionRef);
					var player1 = database.ref(sessionRef).child("player1");
					var user = authorization.currentUser;
					var email = user.email;
					player1.set({
						playerEmail: email,
						choice: null,
						wins: 0,
						losses: 0,
						ties: 0,
					});
				} else {
					alert("The session name " + "\"" + sessionName + "\"" + " already exists");
				}
			}), function(errorObject){
				console.log("The read failed: " + errorObject.code);
			}
		}
	});

	$(document).on("click", ".sessionRow", function(){
		var sessionName = $(this).data("session-name");
		var sessionRef = "sessions/" + sessionName;
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
			} else if(!snapshot.hasChild("player2")){
				var player2 = database.ref(sessionRef).child("player2");
				player2.set({
					playerEmail: email,
					choice: null,
					wins: 0,
					losses: 0,
					ties: 0,
				});
			} else {
				alert("You cannot join " + sessionName + ". There are already two players in it.");
			}
		});
	});

	database.ref("sessions").on("value", function(snapshot) {
      console.log(snapshot.val());//console log object (the value of the snapshot)
      var sessionsTable = $("#sessionsTable");
      sessionsTable.html("");
      sessionsTable.append(buildSessionsTableHeader());
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
      	sessionsTable.append(buildSessionsTableRow(key,player1,player2));
      }
    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

	authorization.onAuthStateChanged(function(myUser){
		if(myUser){
			console.log(myUser);
		} else {
			console.log("not logged in");
		}
	});
});