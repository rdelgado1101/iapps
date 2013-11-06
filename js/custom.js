// SLIDE OPEN MENU PLUGIN
// https://github.com/aldomatic/FB-Style-Page-Slide-Menu
// ---------------------------------------------------------------------------------
	$(function(){
		var menuStatus;
		
		 //Show menu
		$("a.showMenu").click(function(){
			if(menuStatus != true){				
			$(".ui-page-active").animate({
				marginLeft: "165px"
			  }, 0, function(){menuStatus = true});
			  return false;
			  } else {
				$(".ui-page-active").animate({
				marginLeft: "0px"
			  }, 0, function(){menuStatus = false});
				return false;
			  }
		});

		$('div[data-role="page"]').live('pagebeforeshow',function(event, ui){
			menuStatus = false;
			$(".pages").css("margin-left","0");
		});
		
		// Menu behaviour
		$("#menu li a").click(function(){
			var p = $(this).parent();
			if($(p).hasClass('active')){
				$("#menu li").removeClass('active');
			} else {
				$("#menu li").removeClass('active');
				$(p).addClass('active');
			}
		});
});