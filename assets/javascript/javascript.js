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

function deleteStuff(){
	var ref = database.ref("sessions/" + currentSession.sessionKey + "/" + currentSession.iAm);
	ref.remove(function(error){
		var sessionRef = database.ref("sessions/" + currentSession.sessionKey);
		sessionRef.once("value", function(snapshot){
			var session = snapshot.val();
			if(!(session.player1) && !(session.player2)){
				sessionRef.remove(function(error){
					var chatRef = database.ref("chats/" + currentSession.sessionKey);
					chatRef.remove(function(error){
						currentSession.sessionName = null;
						currentSession.sessionKey = null;
						currentSession.player1 = null;
						currentSession.iAm = null;
						currentSession.player2 = null;
						hideGameRoom();
						showSessionsTableContainer();
						console.log("deleted entire session and chat");
						console.log(currentSession);
					});
				});
			} else {
				currentSession.sessionName = null;
				currentSession.sessionKey = null;
				currentSession.player1 = null;
				currentSession.iAm = null;
				currentSession.player2 = null;
				hideGameRoom();
				showSessionsTableContainer();
				console.log("deleted player from session");
				console.log(currentSession);
			}
		}, function(error){
			console.log("Error reading session " + currentSession.sessionKey + " during delete of player");
			console.log(error.code);
		});
	});
}

function buildChatMessage(userEmail, message){
	var p = (userEmail + ": " + message);
	return p;
}

function buildVictoryScreen(p1, p2, resultMessage){
	$("#resultContent").html("");
	var infoContainer = $("<div>");
	var player1Choice = $("<div>");
	player1Choice.text(p1.playerEmail + " chose " + p1.choice);
	var player2Choice = $("<div>");
	player2Choice.text(p2.playerEmail + " chose " + p2.choice)
	var victorDiv = $("<div>");
	victorDiv.text(resultMessage);
	infoContainer.append(player1Choice);
	infoContainer.append(player2Choice);
	infoContainer.append(victorDiv);
	$("#resultContent").html(infoContainer);
}

function compareChoices(currentSession,player1Choice, player2Choice){
	var winner = "";
	if(player1Choice === player2Choice){
		currentSession.player1.ties++;
		currentSession.player2.ties++;
		console.log("it was a tie game");
		winner = "Tie Game!";
	} else if((player1Choice === "rock" && player2Choice === "scissors") ||
		(player1Choice === "paper" && player2Choice === "rock") ||
		(player1Choice === "scissors" && player2Choice === "paper")){
		currentSession.player1.wins++;
		currentSession.player2.losses++;
		console.log("player 1 won");
		winner = currentSession.player1.playerEmail + " won!";
	} else {
		currentSession.player1.losses++;
		currentSession.player2.wins++;
		console.log("player 2 won");
		winner = currentSession.player1.playerEmail + " won!";
	}
	buildVictoryScreen(currentSession.player1, currentSession.player2, winner);
	currentSession.player1.choice = null;
	currentSession.player2.choice = null;
}

function buildChoice(choice){
	var playerChoice = $("<div>");
	playerChoice.addClass("myChoice");
	playerChoice.html(choice);
	playerChoice.attr("data-choice", choice.toLowerCase());
	return playerChoice;
}

function buildPlayerInformation(player){
	console.log("building player info:");
	var playerInfo = $("<div>");
	playerInfo.addClass("playerInformationContainer");
	if(player){
		playerInfo.append($("<div>").addClass("playerInfo").text("Wins: " + player.wins));
		playerInfo.append($("<div>").addClass("playerInfo").text("Losses: " + player.losses));
		playerInfo.append($("<div>").addClass("playerInfo").text("Ties: " + player.ties));
	} else {
		playerInfo.append($("<div>").addClass("playerInfo").text("Wins: " + 0));
		playerInfo.append($("<div>").addClass("playerInfo").text("Losses: " + 0));
		playerInfo.append($("<div>").addClass("playerInfo").text("Ties: " + 0));
	}
	return playerInfo;
}

function buildOtherChoiceSection(myMessage){
	var choiceContainer = $("<div>");
	choiceContainer.addClass("choicesContainer");
	var message = $("<div>");
	message.addClass("finalChoice");
	message.text(myMessage);
	choiceContainer.append(message);
	return choiceContainer;
}

function buildChoiceContainer(){
	var choiceContainer = $("<div>");
	choiceContainer.addClass("choicesContainer");
	choiceContainer.append(buildChoice("Rock"));
	choiceContainer.append(buildChoice("Paper"));
	choiceContainer.append(buildChoice("Scissors"));
	return choiceContainer;
}

function buildPlayerBoxBody(boxBody, player, amPlayer, message){
	boxBody.html("");
	if(player){
		if(amPlayer){
			boxBody.append(buildChoiceContainer());
		} else {
			boxBody.append(buildOtherChoiceSection(message));
		}
		boxBody.append(buildPlayerInformation(player));
	}
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
	console.log("building sessions table")
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

function updatePlayer1Info(){
	console.log("updating player 1 info");
	var player1 = currentSession.player1;
	if(player1){
		$("#player1GameName").text(player1.playerEmail);
		if(currentSession.iAm === "player1"){
			buildPlayerBoxBody($("#player1BoxBody"),player1,true, "");
		} else {
			if(player1.choice){
				buildPlayerBoxBody($("#player2BoxBody"),player1,false, player1.playerEmail + " has chosen");
			} else{
				buildPlayerBoxBody($("#player1BoxBody"),player1,false, "Choosing Move");
			}
		}
	} else {
		$("#player1GameName").text("Awaiting Player");
		$("#player1BoxBody").html("");
	}
}

function updatePlayer2Info(){
	console.log("updating player 2 info");
	var player2 = currentSession.player2;
	if(player2){
		$("#player2GameName").text(player2.playerEmail);
		if(currentSession.iAm === "player2"){
			buildPlayerBoxBody($("#player2BoxBody"),player2,true, "");
		} else {
			if(player2.choice){
				buildPlayerBoxBody($("#player2BoxBody"),player2,false, player2.playerEmail + " has chosen");
			} else {
				buildPlayerBoxBody($("#player2BoxBody"),player2,false, "Choosing Move");
			}
		}
	} else {
		$("#player2GameName").text("Awaiting Player");
		$("#player2BoxBody").html("");
	}
}

function buildMessageHistory(){
	console.log("building message history");
	var myHistory = document.getElementById("messageHistoryBox");
	database.ref("chats/" + currentSession.sessionKey).once("value", function(snap){
		$(myHistory).html("");
		for(myKey in snap.val()){
			var p = $("<p>");
			p.text(snap.val()[myKey].message);
			$(myHistory).append(p);
		}
		myHistory.scrollTop = myHistory.scrollHeight;
	}, function(error){
		console.log("There was an error reading chat history");
		console.log(error.code);
	});
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
		updatePlayer1Info();
		updatePlayer2Info();

		hideSessionsTable();
		$("#gameSessionName").text(currentSession.sessionName);		
		$("#resultContent").text("");
		buildMessageHistory();
		showGameRoom();
		
	}, function(error){
		console.log("There was an error while entering the game room");
		console.log(error.code);
		deleteStuff();
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
		updatePlayer1Info();
		updatePlayer2Info();
		$("#gameSessionName").text(currentSession.sessionName);
		$("#resultContent").text("");
		buildMessageHistory();
		showGameRoom();

	}, function(error){
		console.log("There was an error while creating a new session and joining the game room");
		console.log(error.code);
		deleteStuff();
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
				buildSessionsTable();
				alert("You cannot join " + snapshot.val().name + ". There are already two players in the game room.");
			}
		}, function(error){
			console.log("Error while clicking session row");
			console.log(error.code);
		});
	});

	$(document).on("click", "#thisCloseButton", function(){
		deleteStuff();
		buildSessionsTable();
	});

	$(document).on("click", ".myChoice", function(){
		if(currentSession.player1 && currentSession.player2){
			if(!currentSession[currentSession.iAm].choice){
				var thisChoice = $(this).data("choice");
				console.log("you chose: " + thisChoice);
				currentSession[currentSession.iAm].choice = thisChoice;
				var identity = currentSession.iAm; 
				database.ref("sessions/" + currentSession.sessionKey + "/" + identity).set(currentSession[currentSession.iAm]);
			}
		}
	});

	database.ref("sessions").on("child_changed", function(snapshot){
		if(snapshot.key === currentSession.sessionKey){
			var session = snapshot.val();
			if(currentSession.sessionKey){
				currentSession.player1 = session.player1;
				updatePlayer1Info();
				currentSession.player2 = session.player2
				updatePlayer2Info();
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
		}
	}, function(error){
		console.log("error while listening on session: " + currentSession.sessionKey);
		console.log(error.code);
	});

	$(document).on("click", "#messageSendButton", function(event){
		event.preventDefault();
		var value = $("#messageTextInput").val().trim();
		var p = buildChatMessage(authorization.currentUser.email,value);
		if(currentSession.sessionKey){
			var ref = database.ref("chats/" + currentSession.sessionKey);
			ref.push({
				message: p,
			});
		}
	});

	$("#refreshSessionsTableButton").on("click", function(){
		buildSessionsTable();
	});

	database.ref("chats/").on("child_added", function(snap){
		console.log("chat key");
		console.log(snap.key);
		if(snap.key === currentSession.sessionKey){
			var chat = snap.val();
			console.log(chat);
			buildMessageHistory();
		}
	}, function(error){
		console.log("Error while listening to chats");
		console.log(error.code);
	});
});