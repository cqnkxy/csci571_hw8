var myApp = angular.module('myApp', ['angularUtils.directives.dirPagination']);

myApp.service("legislatorsService", function() {
	var legislators = [];
	var legislatorsService = {};

	legislatorsService.list = function() {
		return legislators;
	};

	return legislatorsService;
});

function PageController($scope) {
	$scope.pageChangeHandler = function(num) {
		console.log('going to page ' + num);
	};
}

/************** lagislators ****************/

function parse_legislator(tmp) {
	if (tmp.party == 'R') {
		tmp.party = "http://cs-server.usc.edu:45678/hw/hw8/images/r.png";
	} else if (tmp.party == 'D') {
		tmp.party = "http://cs-server.usc.edu:45678/hw/hw8/images/d.png";
	} else {
		tmp.party = "http://independentamericanparty.org/wp-content/themes/v/images/logo-american-heritage-academy.png";
	}
	if (tmp.chamber == "house") {
		tmp.chamber = {
			src: "http://cs-server.usc.edu:45678/hw/hw8/images/h.png",
			name: "House",
		};
	} else {
		tmp.chamber = {
			src: "http://cs-server.usc.edu:45678/hw/hw8/images/s.svg",
			name: "Senate",
		}
	}
	tmp.district = tmp.district ? "Disctrict " + tmp.district : "N.A";
	return tmp;
}

function sort_state_lastname(legislators) {
	legislators.sort(function(a, b){
		var cmp1 = a.state.localeCompare(b.state);
		if (cmp1 == 0) {
			return a.last_name.localeCompare(b.last_name);
		} else {
			return cmp1;
		}
	});
}

function legislatorsGetController($scope, $http, legislatorsService) {
	var legislator_get = function() {
		legislators = legislatorsService.list();
		if (legislators.length == 0) {
			$http.get("congress.php?legislators=true")
			.then(function(response) {
				var vec = response.data.results;
				for (var i=0; i<vec.length; i++) {
					var tmp = parse_legislator(vec[i]);
					legislators.push(tmp);
				}
				sort_state_lastname(legislators);
				console.log(legislators);
			});
		}
	};
	angular.element(document).ready(legislator_get);
	$scope.legislators_get = legislator_get;
}

function legislatorsViewController($scope, legislatorsService) {
	$scope.currentPage = 1;
	$scope.pageSize = 10;
	$scope.legislators = legislatorsService.list();
}


/******************** bills ***********************/

function billsGetController($scope, $http) {

}

/******************** committees ***********************/

function committeesGetController($scope, $http) {

}

/******************** favorites ***********************/

function favoritesGetController($scope, $http) {

}


myApp.controller('legislatorsGetController', legislatorsGetController);
myApp.controller('legislatorsViewController', legislatorsViewController);
myApp.controller('billsGetController', billsGetController);
myApp.controller('committeesGetController', committeesGetController);
myApp.controller('favoritesGetController', favoritesGetController);
myApp.controller('PageController', PageController);
