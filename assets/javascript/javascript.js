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
/**********************************************************************************************************
 End Initialize Firebase
**********************************************************************************************************/

// /**********************************************************************************************************
// Player Prototype
// **********************************************************************************************************/
// function Player(name,wins,losses,ties){
// 	this.name = name;
// 	this.wins = wins;
// 	this.losses = losses;
// 	this.ties = ties;
// }
// /**********************************************************************************************************
// End Player Prototype
// **********************************************************************************************************/

// /**********************************************************************************************************
// Game Prototype
// **********************************************************************************************************/
// function Game(player1,player2){
// 	this.player1 = player1;
// 	this.player2 = player2;
// }

// Game.prototype.compareChoices = function(player1Choice, player2Choice){
// 	if(player1Choice === player2Choice){
// 		this.player1.ties++;
// 		this.player2.ties++;
// 	} else if((player1Choice === "rock" && player2Choice === "scissors") ||
// 		(player1Choice === "paper" && player2Choice === "rock") ||
// 		(player1Choice === "scissors" && player2Choice === "paper")){
// 		this.player1.wins++;
// 		this.player2.losses++;
// 	} else {
// 		this.player1.losses++;
// 		this.player2.wins++;
// 	}
// }
// /*************************************************************************************************************
// End Game Prototype
// **************************************************************************************************************/

/**********************************************************************************************************
Current Session Object
**********************************************************************************************************/
var currentSession = {
	sessionName: null,
	sessionKey: null,
	player1: null,
	player2: null,
	iAm: null,
}
/**********************************************************************************************************
End Current Session Object
**********************************************************************************************************/

function compareChoices(currentSession,player1Choice, player2Choice){
	if(player1Choice === player2Choice){
		currentSession.player1.ties++;
		currentSession.player2.ties++;
	} else if((player1Choice === "rock" && player2Choice === "scissors") ||
		(player1Choice === "paper" && player2Choice === "rock") ||
		(player1Choice === "scissors" && player2Choice === "paper")){
		currentSession.player1.wins++;
		currentSession.player2.losses++;
		console.log("player 1 won");
	} else {
		currentSession.player1.losses++;
		currentSession.player2.wins++;
		console.log("player 2 won");
	}
	currentSession.player1.choice = null;
	currentSession.player2.choice = null;
}

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
	$("#sessionsTableBody").html("");
}

function hideSessionsTable(){
	$("#sessionsTableContainer").css("display","none");
}

function showSessionsTableContainer(){
	$("#sessionsTableContainer").css("display","block");
	buildSessionsTable();
}

function hideGameRoom(){
	$("#myGameRoom").css("display", "none");
}

function showGameRoom(){
	$("#myGameRoom").css("display", "block");
}

function updatePlayer1Info(player1){
	console.log("updating player 1 info");
}

function updatePlayer2Info(player2){
	console.log("updating player 2 info");
}

function enterGameRoom(key, iAmPlayer1){
	var sessionRef = "sessions/" + key;
	database.ref(sessionRef).once("value", function(snapshot){
		var session = snapshot.val();
		currentSession.sessionName = session.name;
		currentSession.sessionKey = key;
		currentSession.player1 = session.player1;
		currentSession.player2 = session.player2;
		if(iAmPlayer1){
			currentSession.iAm = "player1";
		} else {
			currentSession.iAm = "player2";
		}

		hideSessionsTable();

		$("#gameSessionName").text(session.name);
		
		$("#player1GameName").text(session.player1.playerEmail);

		$("#player2GameName").text(session.player2.playerEmail);

		$("#resultContent").text("Waiting for both players to choose");

		showGameRoom();
		
	}, function(error){
		console.log("There was an error while entering the game room");
		console.log(error.code);
		currentSession.sessionKey = null;
		currentSession.player1 = null;
		currentSession.player2 = null;
		currentSession.iAm = null;
		currentSession.sessionName = null;
	});
}

function createGameRoom(key){

	var sessionRef = "sessions/" + key;
	database.ref(sessionRef).once("value", function(snapshot){
		var session = snapshot.val();
		console.log(session);
		currentSession.sessionName = session.name;
		currentSession.sessionKey = key;
		currentSession.player1 = session.player1;
		currentSession.player2 = null;
		currentSession.iAm = "player1";
		hideSessionsTable();
		$("#gameSessionName").text(session.name);
		$("#player1GameName").text(session.player1.playerEmail);
		//initialize wins, losses, and ties as well
		$("#player2GameName").text("Awaiting Player");
		//initialize wins, losess, and ties as well

		$("#resultContent").text("Waiting for both players to choose");

		showGameRoom();

	}, function(error){
		console.log("There was an error while creating a new session and joing the game room");
		console.log(error.code);
		currentSession.sessionKey = null;
		currentSession.player1 = null;
		currentSession.player2 = null;
		currentSession.iAm = null;
		currentSession.sessionName = null;
	});
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

	authorization.onAuthStateChanged(function(myUser){
		if(myUser){
			console.log("user " + myUser.email + " has logged in");
			buildSessionsTable();
		} else {
			console.log("a user is not logged in");
			destroySessionsTableBody();
		}
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
			//buildSessionsTable();
			createGameRoom(newSession.key);
		}
	});

	$(document).on("click", ".sessionRow", function(){
		var key = $(this).data("session-key");
		var sessionRef = "sessions/" + key;
		database.ref(sessionRef).once("value", function(snapshot){
			var user = authorization.currentUser;
			var email = user.email;
			if(!snapshot.hasChild("player1")){
				if(snapshot.val().player2.playerEmail !== email){
					var player1 = database.ref(sessionRef).child("player1");
					player1.set({
						playerEmail: email,
						choice: null,
						wins: 0,
						losses: 0,
						ties: 0,
					});
					enterGameRoom(key,true);
				}
			} else if(!snapshot.hasChild("player2")){
				if(snapshot.val().player1.playerEmail !== email){
					var player2 = database.ref(sessionRef).child("player2");
					player2.set({
						playerEmail: email,
						choice: null,
						wins: 0,
						losses: 0,
						ties: 0,
					});
					enterGameRoom(key,false);
				}
			} else {
				alert("You cannot join " + snapshot.val().name + ". There are already two players in the game room.");
			}
			//buildSessionsTable();
		}, function(error){
			console.log("Error while clicking session row");
			console.log(error.code);
		});
	});

	$(document).on("click", "#thisCloseButton", function(){
		var ref = database.ref("sessions/" + currentSession.sessionKey + "/" + currentSession.iAm);
		ref.remove(function(error){
			var sessionRef = database.ref("sessions/" + currentSession.sessionKey);
			sessionRef.once("value", function(snapshot){
				var session = snapshot.val();
				if(!(session.player1) && !(session.player2)){
					sessionRef.remove(function(error){
						currentSession.sessionKey = null;
						currentSession.player1 = null;
						currentSession.iAm = null;
						currentSession.player2 = null;
						hideGameRoom();
						showSessionsTableContainer();
					});
				} else {
					currentSession.sessionKey = null;
					currentSession.player1 = null;
					currentSession.iAm = null;
					currentSession.player2 = null;
					hideGameRoom();
					showSessionsTableContainer();
				}
			}, function(error){
				console.log("Error reading session " + currentSession.sessionKey + " during delete of player");
				console.log(error.code);
			});
		});
	});

	$(document).on("click", ".choiceDiv", function(){
		//console.log(currentSession[currentSession.iAm].choice);
		if(!currentSession[currentSession.iAm].choice){
			var thisChoice = $(this).data("choice");
			console.log("you chose: " + thisChoice);
			currentSession[currentSession.iAm].choice = thisChoice;
			var identity = currentSession.iAm; 
			database.ref("sessions/" + currentSession.sessionKey + "/" + identity).set(currentSession[currentSession.iAm]);
		}
	});

	database.ref("sessions").on("child_changed", function(snapshot){
		console.log(snapshot.val());
		var session = snapshot.val();
		if(currentSession.sessionKey){
			if(session.player1){
				currentSession.player1 = session.player1;
				updatePlayer1Info(session.player1);
			}
			if(session.player2){
				currentSession.player2 = session.player2
				updatePlayer2Info(session.player2);
			}
			if(session.player1 && session.player2){
				if(session.player1.choice && session.player2.choice){
					compareChoices(currentSession, session.player1.choice, session.player2.choice);
					database.ref("sessions/" + currentSession.sessionKey).set({
						name: currentSession.sessionName,
						player1: currentSession.player1,
						player2: currentSession.player2,
					});
				} else {
					console.log("waiting for both users to choose still");
				}
			}
		}
	}, function(error){
		console.log("error while listening on session: " + currentSession.sessionKey);
		console.log(error.code);
	});
});