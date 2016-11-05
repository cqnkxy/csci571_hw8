var myApp = angular.module('myApp', 
    ['angularUtils.directives.dirPagination',
    'ngAnimate', 'ngSanitize', 'ui.bootstrap']
);

function localStorageGet(key) {
    if (!localStorage[key]) {
        return [];
    } else {
        return JSON.parse(localStorage[key]);
    }
}

function localStoragePush(key, val) {
    var vec = localStorage[key];
    if (!vec) {
        vec = [];
    } else {
        vec = JSON.parse[vec];
    }
    vec.push(val);
    localStorage[key] = JSON.stringify[vec];
}

/************** lagislators ****************/

myApp.service("legislatorsService", function() {
    var legislators = [];
    var houses = [];
    var senates = [];
    var legislatorsService = {};
    legislatorsService.list = function() {
        return legislators;
    };
    legislatorsService.gethouses = function() {
        return houses;
    }
    legislatorsService.getsenates = function() {
        return senates;
    }
    return legislatorsService;
});

function parse_legislator(l) {
    if (l.party == 'R') {
        l.party = {
            src: "http://cs-server.usc.edu:45678/hw/hw8/images/r.png",
            name: "Republic",
        };
    } else if (l.party == 'D') {
        l.party = {
            src: "http://cs-server.usc.edu:45678/hw/hw8/images/d.png",
            name: "Democrat",
        };
    } else {
        l.party = {
            src: "http://independentamericanparty.org/wp-content/themes/v/images/logo-american-heritage-academy.png",
            name: "Independent",
        };
    }
    if (l.chamber == "house") {
        l.chamber = {
            src: "http://cs-server.usc.edu:45678/hw/hw8/images/h.png",
            name: "House",
        };
    } else {
        l.chamber = {
            src: "http://cs-server.usc.edu:45678/hw/hw8/images/s.svg",
            name: "Senate",
        }
    }
    l.district = l.district ? "Disctrict " + l.district : "N.A";
    l.favorite = false;
    return l;
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
                houses = legislatorsService.gethouses();
                senates = legislatorsService.getsenates();
                legislators.forEach(function(e){
                    if (e.chamber.name == "House") {
                        houses.push(angular.copy(e));
                    } else {
                        senates.push(angular.copy(e));
                    }
                });
                houses.sort(function(a, b) {
                    return a.last_name.localeCompare(b.last_name);
                });
                senates.sort(function(a, b) {
                    return a.last_name.localeCompare(b.last_name);
                });
            });
        }
    };
    angular.element(document).ready(legislator_get);
}

function legislatorsViewController($scope, $http, legislatorsService) {
    $scope.currentPage = 1;
    $scope.legislators = legislatorsService.list();
    $scope.houses = legislatorsService.gethouses();
    $scope.senates = legislatorsService.getsenates();
    $scope.specific_legislator = {};
    $scope.details = function(l) {
        $scope.progress = Math.round(100*(new Date() - new Date(l.term_start))
            / (new Date(l.term_end) - new Date(l.term_start)));
        $scope.specific_legislator = l;
        $http.get(`congress.php?legislator_details=true&bioguide_id=${l.bioguide_id}`)
        .then(function(response) {
            $scope.bills = response.data[0].results.splice(0, 5);
            $scope.committees = response.data[1].results.splice(0, 5);
        });
    };
    $scope.favorite = function(l) {
        l.favorite = true;
        localStoragePush("legislator", l);
    };
}

/************** #lagislators ***************/
/****************** bills ******************/

myApp.service("billsService", function(){
    var bills = [];
    var active_bills = [];
    var new_bills = [];
    var billsService = {};
    billsService.list = function() {
        return bills;
    };
    billsService.getNewBills = function() {
        return new_bills;
    };
    billsService.getActiveBills = function() {
        return active_bills;
    }
    return billsService;
});

function parse_bill(bill, active) {
    if (bill.chamber == "house") {
        bill.chamber = {
            src: "http://cs-server.usc.edu:45678/hw/hw8/images/h.png",
            name: "House",
        };
    } else {
        bill.chamber = {
            src: "http://cs-server.usc.edu:45678/hw/hw8/images/s.svg",
            name: "Senate",
        }
    }
    if (active) {
        bill.active_or_new = "active";
    } else {
        bill.active_or_new = "new";
    }
    bill.bill_type = bill.bill_type.toUpperCase();
    bill.favorite = false;
    return bill;
}

function billsGetController($scope, $http, billsService) {
    var bill_get = function() {
        active_bills = billsService.getActiveBills();
        new_bills = billsService.getNewBills();
        if (active_bills.length == 0) {
            $http.get("congress.php?bills=true")
            .then(function(response) {
                var vec_active = response.data[0].results.splice(0, 50);
                var vec_new = response.data[1].results.splice(0, 50);
                for (var i=0; i<vec_active.length; i++) {
                    active_bills.push(parse_bill(vec_active[i], true));
                    new_bills.push(parse_bill(vec_new[i], false));
                }
            });
        }
    };
    angular.element(document).ready(bill_get);
}

function billsViewController($scope, billsService) {
    $scope.active_bills = billsService.getActiveBills();
    $scope.new_bills = billsService.getNewBills();
    $scope.details = function(bill) {
        // console.log(bill);
        $scope.specific_bill = bill;
    }
    $scope.favorite = function(bill) {
        bill.favorite = true;
        localStoragePush("bill", bill);
    }
}

/****************** #bills *****************/
/*************** committees ****************/

myApp.service("committeesService", function(){
    var c_houses = [];
    var c_senates = [];
    var c_joints = [];
    var committeesService = {};
    committeesService.getHouses = function() {
        return c_houses;
    };
    committeesService.getSenates = function() {
        return c_senates;
    };
    committeesService.getJoints = function() {
        return c_joints;
    };
    return committeesService;
});

function sort_id(committees) {
    committees.sort(function(a, b){
        return a.committee_id.localeCompare(b.committee_id);
    });
}

function parse_committee(c) {
    if (!c.office) {
        c.office = "N.A";
    }
    if (c.chamber == "house") {
        c.chamber = {
            src: "http://cs-server.usc.edu:45678/hw/hw8/images/h.png",
            name: "House",
        };
    } else {
        c.chamber = {
            src: "http://cs-server.usc.edu:45678/hw/hw8/images/s.svg",
            name: "Senate",
        }
    }
    c.favorite = false;
    return c;
}

function committeesGetController($scope, $http, committeesService) {
    var committee_get = function() {
        // Unexpected name collision if I name it simply houses in the
        //  $http call back function
        c_houses = committeesService.getHouses();
        c_senates = committeesService.getSenates();
        c_joints = committeesService.getJoints();
        if (c_houses.length == 0) {
            $http.get("congress.php?committees=true")
            .then(function(response) {
                var h = response.data[0].results;
                var s = response.data[1].results;
                var j = response.data[2].results;
                h.forEach(function(e){
                    c_houses.push(parse_committee(e));
                });
                s.forEach(function(e){
                    c_senates.push(parse_committee(e));
                });
                j.forEach(function(e){
                    c_joints.push(parse_committee(e));
                });
                sort_id(c_houses);
                sort_id(c_senates);
                sort_id(c_joints);
                console.log(c_joints);
            });
        }
    };
    angular.element(document).ready(committee_get);
}

function committeesViewController($scope, committeesService) {
    $scope.houses = committeesService.getHouses();
    $scope.senates = committeesService.getSenates();
    $scope.joints = committeesService.getJoints();
    $scope.favorite = function(c) {
        c.favorite = true;
        localStoragePush("committee", c);
    };
}

/*************** #committees ***************/
/************** favorites ******************/

function favoritesGetController($scope, $http) {

}

/************** #favorites *****************/


myApp.controller('legislatorsGetController', legislatorsGetController);
myApp.controller('legislatorsViewController', legislatorsViewController);
myApp.controller('billsGetController', billsGetController);
myApp.controller('billsViewController', billsViewController);
myApp.controller('committeesGetController', committeesGetController);
myApp.controller('committeesViewController', committeesViewController);
myApp.controller('favoritesGetController', favoritesGetController);
