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