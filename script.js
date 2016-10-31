var myApp = angular.module('myApp', ['angularUtils.directives.dirPagination']);


function MyController($scope, $compile) {  
  $scope.pageChangeHandler = function(num) {
      console.log('meals page changed to ' + num);
  };
}

function PageController($scope) {
  $scope.pageChangeHandler = function(num) {
    console.log('going to page ' + num);
  };
}

/************** lagislators ****************/

function parse_person(tmp) {
  var person = new Object();
  if (tmp.party == 'R') {
    person.party = "http://cs-server.usc.edu:45678/hw/hw8/images/r.png";
  } else if (tmp.party == 'D') {
    person.party = "http://cs-server.usc.edu:45678/hw/hw8/images/d.png";
  } else {
    person.party = "http://independentamericanparty.org/wp-content/themes/v/images/logo-american-heritage-academy.png";
  }
  person.name = {
    first_name: tmp.first_name, 
    last_name: tmp.last_name,
    whole_name: tmp.first_name + ', ' + tmp.last_name,
  }
  if (tmp.chamber == "house") {
    person.chamber = {
      src: "http://cs-server.usc.edu:45678/hw/hw8/images/h.png",
      name: "House",
    };
  } else {
    person.chamber = {
      src: "http://cs-server.usc.edu:45678/hw/hw8/images/s.svg",
      name: "Senate",
    }
  }
  person.district = tmp.district ? "Disctrict " + tmp.district : "N.A";
  person.state = tmp.state_name;
  return person;
}

function sort_state_lastname(legislators_basic) {
  legislators_basic.sort(function(a, b){
    var cmp1 = a.state.localeCompare(b.state);
    if (cmp1 == 0) {
      return a.name.last_name.localeCompare(b.name.last_name);
    } else {
      return cmp1;
    }
  });
}

function SidebarControl($scope, $compile, $http) {
  var legislator_func = function() {
    if (!$scope.legislators_basic) {
      $http.get("congress.php?legislators=true")
      .then(function(response) {
          $scope.legislators_data = response.data.results;
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        var legislators_basic = [];
        for (var i=0; i<$scope.legislators_data.length; i++) {
          var tmp = $scope.legislators_data[i];
          legislators_basic.push(parse_person(tmp));
        }
        sort_state_lastname(legislators_basic);
        $scope.legislators_basic = legislators_basic;
        // by state
        // $compile($('#dynamicTable').content)($scope);
      });
    }
  };
  // angular.element(document).ready(legislator_func);
  $scope.legislators = legislator_func;
}

myApp.controller('TableControl', MyController);
myApp.controller('PageController', PageController);
myApp.controller('SidebarControl', SidebarControl);
