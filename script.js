var myApp = angular.module('myApp', 
    ['angularUtils.directives.dirPagination',
    'ngAnimate', 'ngSanitize', 'ui.bootstrap']
);

/******** local storage operation *********/

function localStorageGet(category) {
    if (!(category in localStorage)) {
        return {};
    } else {
        return JSON.parse(localStorage[category]);
    }
}

function localStorageAdd(category, key, val) {
    var obj = {};
    if (category in localStorage) {
        obj = JSON.parse(localStorage[category]);
    }
    obj[key] = val;
    // console.log("obj", obj);
    localStorage[category] = JSON.stringify(obj);
}

function localStorageDelete(category, key) {
    var obj = localStorageGet(category);
    delete obj[key];
    localStorage[category] = JSON.stringify(obj);
}

/*********** #local storage operation ******/
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
    };
    legislatorsService.getsenates = function() {
        return senates;
    };
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
        if (l.bioguide_id in localStorageGet('legislator')) {
            localStorageDelete("legislator", l.bioguide_id);
        } else {
            localStorageAdd("legislator", l.bioguide_id, l);
        }
    };
    $scope.$on("fav_le_details", function(e, l) {
        $scope.details(l);
    });
    $scope.is_favorite = function(l) {
        if (l.bioguide_id in localStorageGet('legislator')) {
            return "yellow_star";
        } else {
            return "pale_star";
        }
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
    $scope.specific_bill = {};
    $scope.details = function(bill) {
        // console.log(bill);
        $scope.specific_bill = bill;
    };
    $scope.favorite = function(bill) {
        if (bill.bill_id in localStorageGet('bill')){
            localStorageDelete("bill", bill.bill_id);
        } else {
            localStorageAdd("bill", bill.bill_id, bill);
        }
    };
    $scope.$on("fav_bi_details", function(e, b) {
        $scope.details(b);
    });
    $scope.is_favorite = function(b) {
        if (b.bill_id in localStorageGet('bill')) {
            return "yellow_star";
        } else {
            return "pale_star";
        }
    };
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
        if (c.committee_id in localStorageGet("committee")) {
            localStorageDelete("committee", c.committee_id);
        } else{
            localStorageAdd("committee", c.committee_id, c);
        }
    };
    $scope.is_favorite = function(c) {
        if (c.committee_id in localStorageGet('committee')) {
            return "yellow_star";
        } else {
            return "pale_star";
        }
    };
}

/*************** #committees ***************/
/************** favorites ******************/

myApp.service("favoritesService", function(){
    var fav_legislators = {};
    var fav_committees = {};
    var fav_bills = {};
    var favoritesService = {};
    favoritesService.getLegislators = function() {
        return fav_legislators;
    };
    favoritesService.setLegislators = function(l) {
        for (var k in fav_legislators) {
            delete fav_legislators[k];
        }
        for (var k in l) {
            fav_legislators[k] = l[k];
        }
    };
    favoritesService.getCommittees = function() {
        return fav_committees;
    };
    favoritesService.setCommittees = function(c) {
        for (var k in fav_committees) {
            delete fav_committees[k];
        }
        for (var k in c) {
            fav_committees[k] = c[k];
        }
    };
    favoritesService.getBills = function() {
        return fav_bills;
    };
    favoritesService.setBills = function(b) {
        for (var k in fav_bills) {
            delete fav_bills[k];
        }
        for (var k in b) {
            fav_bills[k] = b[k];
        }
    };
    return favoritesService;
});

function favoritesGetController($scope, favoritesService) {
    $scope.load = function () {
        favoritesService.setLegislators(localStorageGet("legislator"));
        favoritesService.setBills(localStorageGet("bill"));
        favoritesService.setCommittees(localStorageGet("committee"));
    };
}

function favoritesViewController($rootScope, $scope, legislatorsService, billsService, favoritesService) {
    $scope.favorite_legislators = favoritesService.getLegislators();
    $scope.favorite_bills = favoritesService.getBills();
    $scope.favorite_committees = favoritesService.getCommittees();
    $scope.favorite_legislator_detail_click = function(l) {
        $rootScope.$broadcast('fav_le_details', l);
    };
    $scope.delete_legislator = function(l) {
        localStorageDelete("legislator", l.bioguide_id);
        delete $scope.favorite_legislators[l.bioguide_id];
    };
    $scope.favorite_bill_detail_click = function(b) {
        $rootScope.$broadcast('fav_bi_details', b);
    };
    $scope.delete_bill = function(b) {
        localStorageDelete("bill", b.bill_id);
        delete $scope.favorite_bills[b.bill_id];
    };
    $scope.delete_committee = function(c) {
        localStorageDelete("committee", c.committee_id);
        delete $scope.favorite_committees[c.committee_id];
    };
}

/************** #favorites *****************/


myApp.controller('legislatorsGetController', legislatorsGetController);
myApp.controller('legislatorsViewController', legislatorsViewController);
myApp.controller('billsGetController', billsGetController);
myApp.controller('billsViewController', billsViewController);
myApp.controller('committeesGetController', committeesGetController);
myApp.controller('committeesViewController', committeesViewController);
myApp.controller('favoritesGetController', favoritesGetController);
myApp.controller('favoritesViewController', favoritesViewController);
