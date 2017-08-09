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
	sessionKey: null,
	currentPlayer: null,
	otherPlayer: null,
}
/**********************************************************************************************************
End Current Session Object
**********************************************************************************************************/

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

function enterGameRoom(key, amPlayer1){
	var sessionRef = "sessions/" + key;
	database.ref(sessionRef).once("value", function(snapshot){
		currentSession.sessionKey = key;
		hideSessionsTable();
		var session = snapshot.val();
		$("#gameSessionName").text(session.name);
		var currentPlayer;
		var otherPlayer;
		if(amPlayer1){
			currentPlayer = session.player1;
			otherPlayer = session.player2;
			currentSession.currentPlayer = session.player1;
			currentSession.otherPlayer = session.player2;
			$("#currentPlayer").attr("data-current-player", "player1");
			$("#otherPlayer").attr("data-other-player", "player2");
		} else {
			currentPlayer = session.player2;
			otherPlayer = session.player1;
			currentSession.currentPlayer = session.player2;
			currentSession.otherPlayer = session.player1;
			$("#currentPlayer").attr("data-current-player", "player2");
			$("#otherPlayer").attr("data-other-player", "player1");
		}
		console.log(currentPlayer);
		
		$("#player1GameName").text(currentPlayer.playerEmail);

		$("#player2GameName").text(otherPlayer.playerEmail);

		$("#resultContent").text("Waiting for both players to choose");

		$("#myGameRoom").css("display","block");
	}, function(error){
		console.log("There was an error while entering the game room");
		console.log(error.code);
		currentSession.sessionKey = null;
	});
}

function createGameRoom(key){

	var sessionRef = "sessions/" + key;
	database.ref(sessionRef).once("value", function(snapshot){
		currentSession.sessionKey = key;
		hideSessionsTable();
		console.log("hello");
		var session = snapshot.val();
		console.log(session);
		$("#gameSessionName").text(session.name);

		var player1 = session.player1;
		var player2 = session.player2;

		if(player1) {
			$("#player1GameName").text(player1.playerEmail);
			$("#currentPlayer").attr("data-current-player", "player1");
			currentSession.currentPlayer = player1;
		}
		else {
			$("#player1GameName").text("Awaiting Player");
			$("#currentPlayer").attr("data-current-player", "player2");
			currentSession.currentPlayer = player2;
		}

		if(player2) {
			$("#player2GameName").text(player2.playerEmail);
			$("#otherPlayer").attr("data-other-player", "player2");
			currentSession.otherPlayer = player2;
		} else {
			$("#player2GameName").text("Awaiting Player");
			$("#currentPlayer").attr("data-other-player", "player1");
			currentSession.otherPlayer = player1;
		}


		$("#resultContent").text("Waiting for both players to choose");

		$("#myGameRoom").css("display","block");
	}, function(error){
		console.log("There was an error while creating a new session and joing the game room");
		console.log(error.code);
		currentSession.sessionKey = null;
	});
}

// function leaveGameRoom(){
// 	console.log("leaving game room");
// 	buildSessionsTable();
// }

// function buildChat(){
// 	var gameRoomChat = $("<div>");
// 	gameRoomChat.addClass("gameRoomChat col-xs-12");
// 	var chatHeader = $("<div>");
// 	chatHeader.addClass("boxHeader");
// 	var chatHeading = $("<h3>");
// 	chatHeading.html("Chat");
// 	chatHeader.append(chatHeading);
// 	var messageHistory = $("<div>");
// 	messageHistory.addClass("messageHistory");
// 	gameRoomChat.append(chatHeader);
// 	gameRoomChat.append(messageHistory);
// 	var messageFormContainer = $("<form>");
// 	messageFormContainer.addClass("messageFormContainer");
// 	var messageTextInput = $("<input>");
// 	messageTextInput.addClass("messageInput");
// 	messageTextInput.attr("type","text");
// 	messageTextInput.attr("id","messageTextInput");
// 	messageTextInput.attr("placeholder", "Message");
// 	var messageSendButton = $("<input>");
// 	messageSendButton.addClass("messageInput");
// 	messageSendButton.attr("id", "messageSendButton");
// 	messageSendButton.attr("type", "submit");
// 	messageSendButton.attr("value", "Submit");
// 	messageFormContainer.append(messageTextInput);
// 	messageFormContainer.append(messageSendButton);
// 	gameRoomChat.append(messageFormContainer);
// 	return gameRoomChat;
// }

// function buildGameRoomHeader(roomName){
// 	var gameRoomHeader = $("<div>");
// 	gameRoomHeader.addClass("gameRoomHeader");
// 	var gameRoomName = $("<h2>");
// 	gameRoomName.html(roomName);
// 	var closeButton = $("<div>");
// 	closeButton.addClass("closeButton");
// 	closeButton.html("X");
// 	gameRoomHeader.append(gameRoomName);
// 	gameRoomHeader.append(closeButton);
// 	return gameRoomHeader;
// }

// function buildChoice(choice){
// 	var playerChoice = $("<div>");
// 	playerChoice.addClass("choiceDiv");
// 	playerChoice.html(choice);
// 	playerChoice.attr("data-choice", choice.toLowerCase());
// 	return playerChoice;
// }

// function buildPlayerCard(player){
// 	var playerCard = $("<div>");
// 	playerCard.addClass("box playerBox col-xs-12 col-sm-12 col-md-4");
// 	var playerCardHeader = $("<div>");
// 	playerCardHeader.addClass("boxHeader");
// 	var playerName = $("<h3>");
// 	if(player){
// 		playerName.html(player.playerEmail);
// 	} else {
// 		playerName.html("Awaiting Player");
// 	}
// 	playerCardHeader.append(playerName);
// 	var playerCardBody = $("<div>");
// 	playerCardBody.addClass("boxBody");
// 	playerCardBody.append(buildChoice("Rock"));
// 	playerCardBody.append(buildChoice("Paper"));
// 	playerCardBody.append(buildChoice("Scissors"));
// 	playerCard.append(playerCardHeader);
// 	playerCard.append(playerCardBody);
// 	return playerCard;
// }

// function buildGameResult(){
// 	var gameResult = $("<div>");
// 	gameResult.addClass("box resultBox col-xs-12 col-sm-12 col-md-4");
// 	var resultHeader = $("<div>");
// 	resultHeader.addClass("boxHeader");
// 	var resultHeading = $("<h3>");
// 	resultHeading.html("Result");
// 	resultHeader.append(resultHeading);
// 	var resultBody = $("<div>");
// 	resultBody.addClass("boxBody");
// 	var resultDiv = $("<div>");
// 	resultDiv.addClass("resultDiv");
// 	resultBody.append(resultDiv);
// 	gameResult.append(resultHeader);
// 	gameResult.append(resultBody);
// 	return gameResult;
// }

// function buildGameRoomBody(player1, player2){
// 	var gameRoomBody = $("<div>");
// 	gameRoomBody.addClass("gameRoomBody");
// 	var firstRow = $("<div>");
// 	firstRow.addClass("row container-fluid");
// 	var secondRow = $("<div>");
// 	secondRow.addClass("row container-fluid");
// 	firstRow.append(buildPlayerCard(player1));
// 	firstRow.append(buildGameResult());
// 	firstRow.append(buildPlayerCard(player2));
// 	secondRow.append(buildChat());
// 	gameRoomBody.append(firstRow);
// 	gameRoomBody.append(secondRow);
// 	return gameRoomBody;
// }

// function buildGameRoom(key){
// 	console.log("building game room");
// 	var gameRoom = $("<div>");
// 	gameRoom.html("");
// 	database.ref("sessions/" + key).once("value",function(snap){
// 		console.log(snap.val());
// 		gameRoom.addClass("gameRoom");
// 		gameRoom.append(buildGameRoomHeader(snap.val().name));
// 		gameRoom.append(buildGameRoomBody(snap.val().player1,null));
// 	}, function(error){
// 		console.log("Error while clicking session row");
// 		console.log(error.code);
// 	});
// 	return gameRoom;
// }

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
			buildSessionsTable();
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
				var player1 = database.ref(sessionRef).child("player1");
				player1.set({
					playerEmail: email,
					choice: null,
					wins: 0,
					losses: 0,
					ties: 0,
				});
				enterGameRoom(key,true);
			} else if(!snapshot.hasChild("player2")){
				var player2 = database.ref(sessionRef).child("player2");
				player2.set({
					playerEmail: email,
					choice: null,
					wins: 0,
					losses: 0,
					ties: 0,
				});
				enterGameRoom(key,false);
			} else {
				alert("You cannot join " + snapshot.val().name + ". There are already two players in the game room.");
			}
			buildSessionsTable();
		}, function(error){
			console.log("Error while clicking session row");
			console.log(error.code);
		});
	});

	$(document).on("click", "#thisCloseButton", function(){
		hideGameRoom();
		showSessionsTableContainer();
	});

	$(document).on("click", ".myChoiceDiv", function(){
		var thisChoice = $(this).data("choice");
		console.log("you chose: " + thisChoice);
		currentSession.currentPlayer.choice = thisChoice;
		database.ref("sessions/" + currentSession.sessionKey + "/" + $("#currentPlayer").data("current-player")).set(currentPlayer);
	});

	database.ref("sessions/" + currentSession.sessionKey).on("value", function(){
		$()
	}, function(error){
		console.log("error while listening on session: " + currentSession.sessionKey);
		console.log(error.code);
	});
});