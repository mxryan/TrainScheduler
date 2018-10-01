

var config = {
  apiKey: "AIzaSyBHEnOjnYiv106sjjSehe-o_Svh-1DyS8E",
  authDomain: "classapp-2a7b3.firebaseapp.com",
  databaseURL: "https://classapp-2a7b3.firebaseio.com",
  projectId: "classapp-2a7b3",
  storageBucket: "classapp-2a7b3.appspot.com",
  messagingSenderId: "751336947333"
};
firebase.initializeApp(config);
var db = firebase.database();
var clock = document.querySelector("#clock");
var timeInSecs;


// utility functions*********************************

function isTime(string) {
  var pieces = string.split(":");
  if (pieces.length != 2) return false;
  var h = parseInt(pieces[0]);
  var m = parseInt(pieces[1]);
  if (h < 24 && m < 60) return true;
  return false;
}

function HHMMToSeconds(string) {
  // combine with isTime?
  var pieces = string.split(":");
  var h = parseInt(pieces[0]);
  var m = parseInt(pieces[1]);
  return h * 3600 + m * 60;
}

function secondsToMinutes(secs) {
  return Math.round(secs/60);
}

function secondsToHHMM(secs) {
  
  var m = Math.round(secs / 60);
  var h = Math.floor(m / 60);
  m = m % 60;
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  return h + ":" + m;
}


//main functions*********************************************

function getNextArrival(curTime, firstTrain, interval) {
  //rewrite this with a formula
  var i = 0;
  while(firstTrain + interval * i < curTime){
    i++
  }
  var next = firstTrain + interval * i;
  return next;
}

function displayClockAndSetTime(){
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  
  timeInSecs = h * 3600 + m * 60 + s;
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;
  clock.textContent = h + ':' + m + ':' + s;
  setTimeout(displayClockAndSetTime, 1000);
}


function setUpSubmitListener() {
  //rewrite to check all fields contain valid inputs
  var train = document.querySelector("#train");
  var destination = document.querySelector("#destination");
  var firstTrainTime = document.querySelector("#first-train-time");
  var frequency = document.querySelector("#frequency");
  var subBtn = document.querySelector("#subBtn");
  subBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!(train.value && destination.value &&
        isTime(firstTrainTime.value )&& frequency.value)) {
      return false;
    }
    var t = train.value, d = destination.value,
      ftt = firstTrainTime.value, f = frequency.value;
    db.ref("/trains").push({
      train: t, destination: d, firstTime: ftt, frequency: f
    });
  })
}



function setUpDbListener() {
  // this is painful to read
  var trainDisplay = document.querySelector("tbody");
  db.ref("/trains").on("child_added", (s)=>{
    console.log(s.val());
    
    var trainData = s.val();
    var newRow = document.createElement("tr");
    var thTrain = document.createElement("th");
    var tdDest = document.createElement("td");
    var tdFreq = document.createElement("td");
    var tdNext = document.createElement("td");
    var tdMinRemaining = document.createElement("td");
    thTrain.textContent = trainData.train;
    thTrain.scope = "row";
    tdDest.textContent = trainData.destination;
    tdFreq.textContent = trainData.frequency;
    var tonas = getNextArrival( // time of next arrival in seconds
      timeInSecs, 
      HHMMToSeconds(trainData.firstTime),
      trainData.frequency * 60
    );
    tdNext.textContent = secondsToHHMM(tonas);
    tdMinRemaining.textContent =  Math.round((tonas - timeInSecs) / 60);
    newRow.appendChild(thTrain);
    newRow.appendChild(tdDest);
    newRow.appendChild(tdFreq);
    newRow.appendChild(tdNext);
    newRow.appendChild(tdMinRemaining);
    trainDisplay.appendChild(newRow);
  })
}
console.log(secondsToHHMM(getNextArrival(12000, 2000, 1500)));
displayClockAndSetTime();
setUpSubmitListener();
setUpDbListener();
