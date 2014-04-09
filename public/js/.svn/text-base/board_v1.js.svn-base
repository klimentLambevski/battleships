Board = {
    settings: {
        board_size: 8
    },
	init: function() {
		$(function() {
            var draggable = $(".draggable");
            var board = $(".board");

            Board.board_init(board);
            draggable.draggable();
		});
	}(),
    board_init: function(board){
        console.log("Creating board in ", board);
        var max_size =  this.settings.board_size * this.settings.board_size;
        var board_field = Board.get_element(".board_field");

        for(var i = 0; i < max_size; ++i) board.append(board_field.clone());

    },
    get_element: function(elem_name) {
        return $(".js_elements").find(elem_name);
    },
    selected_boat: {
        orientation: 0,
        size: 2
    }
}

Boats = {
    draw_boat: function() {
        var data = {};
        data.orientation = 1;
        data.size = 1;

        var b_html = Board.get_element(".boat_grid").clone();

        if(data.orientation == 1) {
            b_html.addClass("vertical");
        } else {
            b_html.addClass("horisontal");
        }

        for(var i = 0; i < 1; i++) {
            console.log(b_html.find(".cell").eq(i).addClass("active"));
        }
        console.log(b_html);
        $(".ovde").append(b_html);
    }
}