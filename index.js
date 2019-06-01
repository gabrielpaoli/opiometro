var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colors = require('colors/safe');
var five = require("johnny-five");  
var player = require('play-sound')(opts = {})

const express = require('express');

//routes
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));


//Create connection with Arduino Uno
var board = new five.Board();  
board.on("ready", function() {  
  console.log("Ready!");  
});  


var total = 0;
var num = 0;

io.on('connection', function(socket){

	//When user connect
  io.emit('user connect', 'usuario conectado');  	
  
  //default bar
  io.emit('bar down', total);

  //When user disconnect
  socket.on('disconnect', function(){
    io.emit('user disconnect', 'usuario desconectado');  	
  });
  
  //When user write message
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
	

  //When user click subir
  socket.on('bar up', function(msg){
  	if(total == 100){
  		return false;
  	}
    if(total == 70){
      player.play('alarm.mp3');
    }

    num = total + 5;
    total = num;
    io.emit('bar up', num);

		colorPin(total);

  });

  //When user click bajar
  socket.on('bar down', function(msg){
  	if(total == 0){
  		return false;
  	}
    num = total - 5;
    total = num;
    io.emit('bar down', num);

		colorPin(total);

  });


});

//Open port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});

//Set color pin per total break balls
function colorPin(total){
	var greenLed = new five.Led(12);  
	var yellowLed = new five.Led(8);  
	var redLed = new five.Led(4);  

  if(total == 70){
  }

  if(total <= 30){
		greenLed.on();  
  	yellowLed.off();
  	redLed.off();
  }else if(total > 30 && total <= 70){
  	yellowLed.on();
  	redLed.off();
		greenLed.off();   	
  }else{
		redLed.on();  
  	yellowLed.off();
  	greenLed.off();
  }

  if(total == 0){
		greenLed.off();  
  }
}

setInterval(function() {
  console.log('entre');
	if(total == 0){
		return false;
	}
	
  num = total - 5;
  total = num;

	io.emit('bar down', num);
	colorPin(total);

}, 25000 * 60);

