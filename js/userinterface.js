var userinterface = {
	login: function(){
		$('.btn-login').click(function(){
			listplayers.register();
		});
	}
};


$(document).ready(function(){
	userinterface.login();
});