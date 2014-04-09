var port = Number(process.env.PORT || 5000);


var express = require('express');
var app = express();
 
var server=app.get('/', function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
}).configure(function() {
    app.use('/', express.static(__dirname + '/public/'));
}).listen(port);

var io = require('socket.io').listen(server);
//type 0 : connection
//status 0 : pending, 1: geting ready
//players status: 1 in game, 0 aviable
//Matches structure: {player1: socket, p1ready: 0/1, player2: socket, p2ready: 0/1, status: 0/1/2/3 - pending/prepareing/ingame/finished}
//Players structure: {name: ime, id: socket id, status: 0/1 - aviable/in game}

var players = [];//lista od soketi(online igraci)
var matches = [];//lista od natprevari

io.sockets.on('connection', function (socket) {
	
  socket.emit('connected', { type: 0, err: 0 });
  
  socket.on('register', function (data) {
	  console.log("READY");
	  players.push({socket:socket,name:data.name, status:0});
	  
	  console.log('Player ' + data.name + ' has connected.');
	  broadcast_list(players);
	  
	  
	  //...
  });//register - event
  
  /////////
  
  socket.on('match me', function(data){//ko ke sakat nekoj igrac da igrat so drug
	  console.log("MATCH ME");
	  for(var i = 0; i < players.length; i++){//start for
		  if(data.id == players[i].socket.id){//start if
			  matches.push({player1: players[i].socket, p1ready: 0,player2:socket, p2ready:0, status: 0});//mecuvaj baran so baratel
			  players[i].socket.emit('game request', {name: data.name, id: data.id});//prati mu na baraniot baranje za igra
		  }//end if
	  }//end for
  });//match me - event
  
  socket.on('accept', function(data){//ako baraniot prifatit za igra
	  console.log("ACCEPT");
	  var player2;
	  var match_index;
	  
	  console.log("BROJ NA NATPREVARI: " + matches.length);
	  for(var i = 0; i < matches.length; i++){
		  if(socket.id == matches[i].player1.id){
			  matches[i].status = 1;
			  player2 = matches[i].player2;
			  match_index = i;
			  break;
		  }
	  }
	  
	  if(data.accept == 1){
		  //socket.emit('matched', {player: players[i].name, status: 1});//ACCEPT
		  if(player2 != null){
			  player2.emit('matched', {player: data.name, status: 1});
		  
			  //napraj gi igracive so igret nedostapni za igra
			  for(var i = 0; i < players.length; i++){
				  if(players[i].socket.id == socket.id || players[i].socket.id == player2.id){
					  players[i].status = 1;//in game
				  }
			  }
			  
			  broadcast_list(players);
		  }//end if
	  }
	  else {
		  //socket.emit('matched', {player: players[i].name, status: 0});//DECLINE
		  player2.emit('matched', {player: data.name, status: 0});
		  matches.splice(match_index, 1);
		  
	  }
  });//accept - event
  
  
  socket.on('ready', function(data){
	  console.log("READY");
	  console.log("BROJ NA NATPREVARI ZA PREBARUVANJE: ", matches.length);
	  for(var i = 0; i < matches.length; i++){
		  console.log("SOCKET ID: ", matches[i].player1.id);
		  if(matches[i].player1.id == socket.id){
			  matches[i].p1ready = 1;
			  console.log("PLAYER 1 READY");
		  }
		  else if(matches[i].player2.id == socket.id){
			  matches[i].p2ready = 1;
			  console.log("PLAYER 2 READY");
		  }
		  if(matches[i].p1ready == 1 && matches[i].p2ready == 1){
			  console.log("dvajcata se spremni!!!!", matches[i])
			  
			  var rand = Math.random();
			  var turn1, turn2;
			  
			  if(rand < 0.5){
				  turn1 = 0;
				  turn2 = 1;
			  }
			  else{
				  turn1 = 1;
				  turn2 = 0;
			  }
			  matches[i].player1.emit('game begin', {turn: turn1});
			  matches[i].player2.emit('game begin', {turn: turn2});
			  matches[i].status = 2;//in game
			  
			 // break;
		  }
		  
	  }
  });
  
  //end - matchmakeing
  
  
  //eventi za ko ke se vo igra
  
  //event za napad
  socket.on('attack', function(data){
	  console.log("ATTACK");
	  var id = socket.id;
	  var match = findMatchById(socket.id);
	  if(match != null){
		  if(match.player1.id == id){
			  match.player2.emit('take attack', data);
		  }
		  if(match.player2.id == id){
			  match.player1.emit('take attack', data);
		  }
	  }
	  
  });//attack - event
  
  //se prakja feedback za dali e pogoden
  
  socket.on('send feedback', function(data){
	  console.log("SEND FEEDBACK");
	  var id = socket.id;
	  var match = findMatchById(id);
	  if(match != null){
		  if(match.player1.id == id){
			  match.player2.emit('attack feedback', data);
		  }
		  if(match.player2.id == id){
			  match.player1.emit('attack feedback', data);
		  }
	  }
  });//send attack feedback  - event
  
  //game finished
  socket.on('game end', function(){
	  console.log("GAME END");
	  
	  var id = socket.id;
	  var match = findMatchById(id);
	  if(match != null){
		  if(match.player1.id == id){
			  match.player2.emit('game end', {});
		  }
		  else if(match.player2.id == id){
			  match.player1.emit('game end', {});
		  }
	  }
	  removeMatch(id);
  });
  
  //end - eventi za ko ke se vo igra
  
  
  //CHAT
  socket.on('send message', function(data){
	  console.log("SEND MESSAGE");
	  var id = socket.id;
	  var match = findMatchById(id);
	  if(match != null){
		  if(match.player1.id == id){
			  match.player2.emit('receive message', data);
		  }
		  else if(match.player2.id == id){
			  match.player1.emit('receive message', data);
		  }
	  }
  });
  //end - CHAT
  /////////
  
  socket.on('disconnect', function(){//TODO: Ako se diskonektirat dur igret
	  console.log("DISCONNECT");
	  console.log('Player ' + this.id + ' Has Disconnected');
	  
	  //ako se diskonektirat dur igret
	  var match = findMatchById(this.id);
	  if(match != null){//ako e najden natprevar
		  if(match.player1.id != this.id){
			  match.player1.emit('opponent disconnected', {});
			  changePlayerStatus(match.player1.id, 0);//za da se dodajt vo lista na slobodni, prajme status sloboden
			  removeMatch(match.player1.id);
		  }
		  else if(match.player2.id != this.id){
			  match.player2.emit('opponent disconnected', {});
			  changePlayerStatus(match.player2.id, 0);
			  removeMatch(match.player2.id);
		  }
	  }
	  
	  var listPlayers = [];
	  for(var i = 0; i < players.length; i++){
		  if(this.id == players[i].socket.id){
			  players.splice(i, 1);
		  }
	  }
	  
	  broadcast_list(players);
	  
  });//disconnect - event
  
});

//prakja lista od dostapni igraci na site
function broadcast_list(players){
	var listPlayers = [];
	  for(var i = 0; i < players.length; i++){
		  if(players[i].status == 0)
			  listPlayers.push({name:players[i].name, id:players[i].socket.id});
	  }
	  io.sockets.emit('list players', {list:listPlayers});
}

function findMatchById(id){
	console.log("BROJ NA NATPREVARI VO FIND: ", matches.length);
	for(var i = 0; i < matches.length; i++){
		if(matches[i].player1.id == id || matches[i].player2.id == id){
			return matches[i];
		}
	}
	return null;
}

function changePlayerStatus(id, status){
	for(var i = 0; i < players.length; i++){
		if(players[i].socket.id == id){
			players[i].status = status;
		}
	}
}

function removeMatch(id){
	for(var i = 0; i < matches.length; i++){
		if(matches[i].player1.id == id || matches[i].player2.id == id){
			changePlayerStatus(matches[i].player1.id, 0);
			changePlayerStatus(matches[i].player2.id, 0);
			matches.splice(i, 1);
			break;
		}
	}
	//broadcast_list(players);
}


