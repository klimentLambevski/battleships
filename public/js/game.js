var game={
	socket:null,
	globals:{
		uri:"ws:localhost:5000",
		port:1337,
		name:'Player',
		t:null,
		opponent:{},
		turn:false
	},
	init:function(name){
		game.globals.name=name;
		game.socket=io.connect(game.globals.uri);
		game.socket.on("connected", game.socketConnected);
		game.socket.on("message",game.messageRecived);
		game.socket.on("list players",game.getList);
		game.socket.on("matched",game.matched);
		game.socket.on("game request",game.gameRequest);
		game.socket.on("game begin",game.beginGame);
		game.socket.on("attack feedback",game.attackFeedback);
		game.socket.on("take attack",game.takeattack);
		game.socket.on("receive message",game.reciveMessage);
		game.socket.on("opponnet disconected",game.disconnect);
		game.socket.on("game end",game.getGameEnd);
	},
	socketConnected:function(data){
		console.log('CONNECTED');
		console.log(data);
		if(data.err==0)
			game.socket.emit('register',{name:game.globals.name});
	},
	//lista od online igraci
	getList:function(data){
		console.log('LIST OF PLAYERS');
		console.log(data);
		$(".login_container").slideUp();
		$(".player_list_container").delay(500).slideDown();
		$('.list-players').html('');
		for(var i = 0; i < data.list.length; i++){
			$('.list-players').append('<div class="item" id="'+data.list[i].id+'">'+data.list[i].name+'</div>');
			
		}
		$('.item').click(function(){
			game.matchMe($(this).attr('id'));
		});
	},
	//najdi mi protivnik
	matchMe:function(id){
		game.socket.emit("match me",{name:game.globals.name,id:id});
		$(".player_list_container").slideUp();

        $(".js_timer_container").delay(500).slideDown();
		var temp_tr = $(".js_timer_container").find(".js_time_remaining");
        temp_tr.html("15");
        setInterval(function() {
            var temp_num = parseInt(temp_tr.text());
            temp_tr.html(temp_num - 1);
        }, 1000)

		game.globals.t = setTimeout(function(){
			console.log("DECLINED");
			game.socket.emit("discart game",{});
            //TODO add js class
			$(".player_list_container").slideDown();
			$(".js_timer_container").hide();
		},15000);
	},
	//kazuva deka e najden protivnik
	matched:function(data){
        $(".js_timer_container").slideUp();
		clearTimeout(game.globals.t);
		console.log(data);
		game.globals.opponent.name=data.player;
		game.globals.opponent.ready=1;

		chat.init(game.globals.name,game.globals.opponent.name);

        game.socket.removeListener("list players", game.getList);
		$(".js_match_container").hide();

        //Start actual game
        //TODO vo edna fukncija
        $(".js_game_active").delay(700).slideDown();
         Board.showMessage("Prepare your ships");
        Battleships.bindEvents();
        Board.drawMyBoard();
        Board.drawOpponentBoard();
        Board.spawnBoats();
	},
	//baranje za igra
	gameRequest:function(data){
		console.log("REQUEST");
		console.log(data.id);
		game.globals.opponent.name=data.name;

        $(".js_request_container").slideDown();
        $(".js_request_container").find(".js_player_requesting").text(data.name);
        $(".js_accept_request").click(function() {
            $(".js_request_container").slideUp();
            game.acceptGame(1);
        })

	},
	//se prifaka igra
	acceptGame:function(status) {
		game.socket.emit("accept",{accept:status,name:game.globals.name});
		//chat.init(game.globals.name,game.globals.opponent.name);

        game.socket.removeListener("list players", game.getList);
        $(".js_match_container").hide();

        chat.init(game.globals.name,game.globals.opponent.name);

        //Start actual game
        //TODO vo edna fukncija
        $(".js_game_active").delay(700).slideDown();
        $(".player_list_container").slideUp();
        Board.showMessage("Prepare your ships!");
        Battleships.bindEvents();
        Board.drawMyBoard();
        Board.drawOpponentBoard();
        Board.spawnBoats();
	},
	//se isvestuva serverot deka igracot e podgotven
	playerReady:function(){
		game.socket.emit("ready",{});
	},
	//pocni igra
	beginGame:function(data){
		if(data.turn==1) {
			Board.state.can_attack=true;
			Board.showMessage("Game began! Its your turn");
		}else{
			Board.showMessage("Game began! Its not your turn");
		}
		Board.state.game_started=true;
	},
	//napaganje
	attack:function(obj){
		game.socket.emit("attack",obj);
	},
	//dobivanje na feedback od napadot
	attackFeedback:function(data){
		Board.attackFeedback(data.hit);
		game.globals.turn=false;
	},
	//prima napad i proveruva dali e pogodeno
	takeattack:function(data){
		Board.takeAttack(data.x,data.y);
	},
	//prakanje feedback dali e pogodeno ili ne
	sendattackFeedback:function(hit){
		game.socket.emit("send feedback",{hit:hit});
		game.globals.turn=true;
	},
	sendMessage:function(msg){
		game.socket.emit("send message",{msg:msg});
	},
	reciveMessage:function(data){
		console.log(data);
		$('.js_messages').append('<div class="message"><span class="name">'+game.globals.opponent.name+':</span><span>'+data.msg+'</span></div>');
	},
	disconnect:function(data){
		
	},
	endGame:function(){
		game.socket.emit('game end');
		Board.showMessage("Game has ended! You lost");
        Board.resetData();
        $(".board").toggle('explode');
		game.socket.on("list players",game.getList);
		$(".js_game_active").delay(4000).slideUp();
		$(".player_list_container").delay(4000).slideDown();

	},
	getGameEnd:function(data){
		Board.showMessage("Game has ended! You won");
		game.socket.on("list players",game.getList);
        Board.resetData();
		$(".js_game_active").delay(3000).slideUp();
		$(".player_list_container").delay(4000).slideDown();
		
		console.log(data);
	}
};
