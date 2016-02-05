'use strict';
(function(){
	
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

			for (var i = 0; i < sections.length; i++) {
				sections[i].classList.add("hidden");
			};

			matchingSection.classList.remove("hidden");

		}
	};

	app.init()
})();