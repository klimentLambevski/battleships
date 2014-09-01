Board = {};
Board.settings = {
    size: 8
};
Board.state = {
    can_attack: false, //Is the users turn to attack
    game_started: false, //Is the game started
    available_boats: [], //definirano podolu
    my_board: Matrix.Zero(Board.settings.size, Board.settings.size), //user board
    attack_board: Matrix.Zero(Board.settings.size, Board.settings.size) //recent attacks board
};
/*
Starting and avaible boats
 */
Board.state.available_boats = [
    {
        data: {
            orientation: 2,
            size: 1
        },
        spawned: 0
    },
    {
        data: {
            orientation: 1,
            size: 2
        },
        spawned: 0
    },
    {
        data: {
            orientation: 2,
            size: 3
        },
        spawned: 0
    },
];





/*
Spawn (draw) awailable boats in the .js_ships div (not positioned on board)
 */
Board.spawnBoats = function() {
    var boats = Board.state.available_boats;
    var parent = $(".js_ships");
    parent.html("");

    $.each(boats, function(i, v){
        if(v.spawned == 0) {
            drawBoat(v);
        }
    });
    /*
    Draws a single boat with the available data
     */
    function drawBoat(boat) {
        var parent = $(".js_ships");
        var boat_data = boat.data;

        var ship_container_div = $('.js_elements .ship_container').clone();
        console.log(parent);

        ship_container_div.click(function() {
            $('.ship_container').removeClass("active");
            ship_container_div.addClass("active");
            Board.state.active_boat = boat;
        });
        if(boat_data.orientation == 1) {
            ship_container_div.addClass("horisontal");
        } else {
            ship_container_div.addClass("vertical");
        }
        for(var i = 0; i < boat_data.size; ++i) {
            ship_container_div.find(".ship_cell").eq(i).addClass("exists");
        }
        parent.append(ship_container_div);
    }
};


Board.resetData = function() {
    Board.state.available_boats = [
        {
            data: {
                orientation: 2,
                size: 1
            },
            spawned: 0
        },
        {
            data: {
                orientation: 1,
                size: 2
            },
            spawned: 0
        },
        {
            data: {
                orientation: 2,
                size: 2
            },
            spawned: 0
        }
    ];
    Board.state.my_board = Matrix.Zero(Board.settings.size, Board.settings.size);
    Board.state.attack_board = Matrix.Zero(Board.settings.size, Board.settings.size);
}
/*
Drawing the user board
 */
Board.drawMyBoard = function(){
    var parent = $(".js_my_board");
    parent.html("");

    var grid_div = $('<div class="grid">');
    $.each(Board.state.my_board.elements, function(i, val1) {
        var row_div = $('<div class="grid_row">');
        $.each(val1, function(j, val2) {
            var cell_div = $('<div class="grid_cell">');
            if(val2 == 1) cell_div.addClass("filled");
            else if(val2 == 2){
                cell_div.addClass("oponent_attack");
            } else if(val2 == 3) {
                cell_div.addClass("cell_damage");
            }
            else {
                cell_div.click(function() {
                    boat_data = Board.state.active_boat.data;
                    boat_data.x = i;
                    boat_data.y = j;
                    Board.addBoat(boat_data);
                });
            }
            row_div.append(cell_div);
        });
        grid_div.append(row_div);
    });
    parent.append(grid_div);
};
/*
Drawing recent attacks board
 */
Board.drawOpponentBoard = function() {
    var parent = $(".js_opponent_board");
    parent.html("");

    var final_div = $('<div class="grid">');
    $.each(Board.state.attack_board.elements, function(i, val1) {
        var row_div = $('<div class="grid_row">');
        $.each(val1, function(j, val2) {
            var cell_div = $('<div class="grid_cell">');
            if(val2 == 1) cell_div.addClass("attacked");
            else if(val2 == 2) cell_div.addClass("hit");
            else {
                cell_div.click(function() {
                    console.log("This field can be attacked", i, j);
                    Board.attackOpponent(i, j);
                });
            }
            row_div.append(cell_div);
        });
        final_div.append(row_div);
    });
    parent.append(final_div);
};
/*
Add boat to the my_board object in the Board.state and remove from
.js_ships div
 */
Board.addBoat = function(boat_data) {

    if(Board.state.game_started == true) {
        console.log("Game already started");
        return;
    }
    boat_data.x = parseInt(boat_data.x);
    boat_data.y = parseInt(boat_data.y);

    if(checkOverlap(boat_data)) {
        return;
    }

    if(boat_data.orientation == 1) {
        // boat is horisontal
        for(var i = 0; i < boat_data.size; ++i) {
            console.log("setting Board.state.my_board[", boat_data.x, boat_data.y + i, "] to 1");
            Board.state.my_board.elements[boat_data.x][boat_data.y + i] = 1;
        }
    } else {
        // boat is vertical
        for(var i = 0; i < boat_data.size; ++i) {
            Board.state.my_board.elements[boat_data.x + i][boat_data.y] = 1;
        }
    }

    Board.state.active_boat.spawned = 1;
    Board.state.active_boat = null;

    Board.drawMyBoard();
    Board.spawnBoats();

    if(checkReady()) {
        $(".js_my_board").find(".grid_cell").unbind("click");
        game.playerReady();
    }

    /*
     Check if all boats are spawned
     */
    function checkReady() {
        var ab = Board.state.available_boats;
        for(var i = 0; i < ab.length; ++i) {
            if(ab[i].spawned == 0) return false;
        }
        return true;
    }

    /*
    Check if boat is in bounds and not overlapping
     */
    function checkOverlap(boat_data) {
        if(boat_data.x < 0 || boat_data.x > 7) {
            console.log("Boat out of bounds at x =", boat_data.x);
            return true;
        }
        if(boat_data.y < 0 || boat_data.y > 7) {
            console.log("Boat out of bounds at y =", boat_data.y);
            return true;
        }
        if(boat_data.orientation == 1) {
            //horisontal
            for(var i = 0; i < boat_data.size; ++i) {
                if(boat_data.y + i > 7) {
                    console.log("Boat out of bounds at y =", boat_data.y + i);
                    return true;
                }
                if(Board.state.my_board.elements[boat_data.x][boat_data.y + i] == 1) {
                    console.log("Boat overlapping at", boat_data.x, boat_data.y + i);
                    return true;
                }
            }
        }
        else if(boat_data.orientation == 2) {
            //vertical
            for(var i = 0; i < boat_data.size; ++i) {
                if(boat_data.x + i > 7) {
                    console.log("Boat out of bounds at x =", boat_data.x + i);
                    return true;
                }
                if(Board.state.my_board.elements[boat_data.x + i][boat_data.y] == 1) {
                    console.log("Boat overlapping at", boat_data.x + i, boat_data.y);
                    return true;
                }
            }
        }
        return false;
    }
};

Board.attackOpponent = function(x, y) {
	Board.state.last_attack={x:x,y:y};
    if(Board.state.can_attack == false) {
        console.log("User cannot attack");
        Board.showMessage("Its not your turn");
        return;
    } else {
        Board.state.can_attack = false;
        game.attack({x:x,y:y});
    }

    Board.state.attack_board.elements[x][y] = 1;
    Board.drawOpponentBoard();
};

Board.takeAttack=function(x, y){
	Board.state.can_attack=true;
	if(Board.state.my_board.elements[x][y]){
		game.sendattackFeedback(true);
		Board.state.my_board.elements[x][y]=3;
		Board.showMessage("You've been hit! its your turn");
		if(Board.state.my_board.indexOf(1)==null && (Board.state.my_board.indexOf(2)!=null || Board.state.my_board.indexOf(3)!=null)){
			console.log("END GAME");
			game.endGame();
		}
	}
	else{
		game.sendattackFeedback(false);
		Board.state.my_board.elements[x][y]=2;
		Board.showMessage("You are ok! Its your turn");
	}
    Board.drawMyBoard();
};

Board.attackFeedback = function(hit) {
	var lastAttack = Board.state.last_attack;
	if(hit) {
		Board.showMessage("You hit the opponent");
		Board.state.attack_board.elements[lastAttack.x][lastAttack.y] = 2;
        Board.drawOpponentBoard();
	}
	else{
		Board.showMessage("You missed the opponent");
	}
	
	
};

Board.showMessage = function(msg) {
	$(".js_gamemessage").fadeOut().fadeIn().text(msg);
};

var Battleships = {};
Battleships.bindEvents = function() {
    $(function(){
        $(".js_add_boat").click(function() {
            var boat_data = {
                x: $(".js_input_x").val(),
                y: $(".js_input_y").val(),
                size: $(".js_input_size").val(),
                orientation: $(".js_input_orientation").val()
            };
            console.log("Adding boat with data", boat_data);
            Board.addBoat(boat_data);

        });
    });
};