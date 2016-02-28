function Marker(lat, lon, name) {
	var self = this;
	// latitude 
	self.lat = ko.observable(lat);
	// longitude
	self.lon = ko.observable(lon);
	// name of the marker
	self.name = ko.observable(name);
	// default infowindow with empty content
	self.infowindow = new google.maps.InfoWindow({
					content: ""
				});

	self.myLatlng = ko.computed(function() {
		return new google.maps.LatLng(self.lat(),self.lon());
	}, self);

	self.marker = ko.computed(function() {
		return new google.maps.Marker({
    position: self.myLatlng(),
    map: map,
    title: self.name()
});
	}, self);

}


// ViewModel
function AppViewModel() {
	var self = this;

    // Stores the search box input value
	self.saved_value = ko.observable("");

    // Set of markers appearing on the list view
	self.markers = ko.observableArray([
		new Marker(38.712088, -9.127635, "Fado"),
		new Marker(38.752954, -9.184753, "Stadium of Light"),
		new Marker(38.725917, -9.150767, "Sebastião José de Carvalho e Melo, 1st Marquis of Pombal"),
		new Marker(38.787844, -9.390641, "Pena National Palace"),
		new Marker(38.761489, -9.161807, "Estádio José Alvalade"),
		new Marker(38.714072, -9.133497, "São Jorge Castle"),
		new Marker(38.717080, -9.135792, "Martim Moniz"),
		new Marker(38.715906, -9.124717, "Church of Santa Engrácia"),
		new Marker(38.714063, -9.138957, "Rossio Square"),
		new Marker(38.708847, -9.136921, "Rua Augusta Arch")
		]);
    
    //Function that takes to strings and sees if str2 appears in str1
	self.match = function(str1, str2,i){
		if(str2){
		str2 = str2.trim();
		str1 = str1.trim();
		for(var k = 0; k < str1.length; k++) {
			if(str1.substring(k, k + str2.length) === str2){
				self.markers()[i].marker().setMap(map);
				return true;
			}
		}
		self.markers()[i].marker().setMap(null);
		return false;
	} else {
		for(var k = 0; k < self.markers().length; k++ ){
			self.markers()[i].marker().setMap(map);
			return true;
		}
	}
};
	
    // Create the Ajax request URL  
    
	var titles = encodeURI(self.markers()[0].name());


	for(var i=1; i < self.markers().length; i++) {
		titles = titles + "|" + encodeURI(self.markers()[i].name());

	}

    // Final URL
	var wikiURL = "http://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles="+ titles+"&exlimit=max";
    

    // Set error message if the response takes more than 8s 
    var wikiRequestTimeout = setTimeout(function() {
    	$("#error").addClass("col-md-12 alert alert-danger").text("Failed to get info windows");

    }, 8000);

    // Ajax request
	$.ajax({
		url: wikiURL,
		dataType: "jsonp",
		success: function(response) {
			// If the request succeeds clear error timer
			clearTimeout(wikiRequestTimeout);
            
            // If the request succeeds send success notification
			$("#error").addClass("alert alert-success").text("Success!");

			var i = 0;
			for(var obj in response.query.pages) {

				self.markers()[i].marker().infowindow = new google.maps.InfoWindow({
					// Set Info Window content using TextExtracts
					content: response.query.pages[obj].extract
				});
                
                // Add click listener to each marker
				google.maps.event.addListener(self.markers()[i].marker(), 'click', (function(icopy) {

					return function() {

						for(var j = 0; j < self.markers().length; j++){

						    // Close all info windows 
							self.markers()[j].marker().infowindow.close();
							// Reset animation
							self.markers()[j].marker().setAnimation(null);

						}
                    // Open info window on click
					self.markers()[icopy].marker().infowindow.open(map, self.markers()[icopy].marker());
					// Animate clicked marker 
					self.markers()[icopy].marker().setAnimation(google.maps.Animation.BOUNCE);
				};
			})(i));

				i++;
			}
			

		}
	});


}

// Activates knockout.js
ko.applyBindings(new AppViewModel());