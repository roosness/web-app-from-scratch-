
(function(){
	'use strict';
	
	var app = {
		init: function() {
			routes.init();

		}
	};

	var routes = {
		init: function() {
			sections.toggle("#start");
			window.addEventListener('hashchange', function(){sections.toggle()} ,false);
		}
	};

	var sections = {
		toggle: function(route) {
			var id = route ? route : window.location.hash;
			var sections = document.querySelectorAll("section");
			var matchingSection = document.querySelector(id);
			// is het niet gemakkelijker om het zo te doen:
			//sections.classList.add("hidden"); 
			// ipv de for loop?
			for (var i = 0; i < sections.length; i++) {
				sections[i].classList.add("hidden");
			};

			matchingSection.classList.remove("hidden");

		}
	};

	app.init()
})();
