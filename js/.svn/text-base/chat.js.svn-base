var chat={
	name:'',
	oponentname:'',
	init:function(name, oponentname){
		chat.name = name;
		chat.oponentname = oponentname;
        $('.js_messages').html("");
		chat.bindSendMessage();
	},
	bindSendMessage: function() {
		$(".js_chat_input").keyup(function(e) {
			if(e.which == 13) {
				game.sendMessage($(this).val());
				$('.js_messages').append('<div class="message"><span class="name">'+chat.name+'</span><span>'+$(this).val()+'</span></div>');
				$(this).val('');
			}
		});
	}
};
