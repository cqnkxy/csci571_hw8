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
  $scope.legislators = function() {
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
      var html = `
          <h1>Legislators</h1>
          <div class="carousel slide">
            <div class="carousel-inner">
              <div class="item active">
                <ul class="nav nav-tabs">
                  <li class="active"><a data-toggle="tab" href="#byState">By State</a></li>
                  <li><a data-toggle="tab" href="#House">House</a></li>
                  <li><a data-toggle="tab" href="#Senate">Senate</a></li>
                </ul>
                <div id="byState" class="tab-pane fade in active">
                  <div class="container-fluid">
                    <div class="row input-group">
                      <div class="col-md-8">Legislators By State</div>
                      <div class="col-md-4">
                        <select class="selectpicker" ng-model="q" id="search">
                          <option value=''>All States</option>
                          <option>Alabama</option>
                          <option>Alaska</option>
                          <option>Arizona</option>
                          <option>Arkansas</option>
                          <option>California</option>
                          <option>Colorado</option>
                          <option>Connecticut</option>
                          <option>Delaware</option>
                          <option>Florida</option>
                          <option>Georgia</option>
                          <option>Hawaii</option>
                          <option>Idaho</option>
                          <option>Illinois</option>
                          <option>Indiana</option>
                          <option>Iowa</option>
                          <option>Kansas</option>
                          <option>Kentucky</option>
                          <option>Louisiana</option>
                          <option>Maine</option>
                          <option>Maryland</option>
                          <option>Massachusetts</option>
                          <option>Michigan</option>
                          <option>Minnesota</option>
                          <option>Mississippi</option>
                          <option>Missouri</option>
                          <option>Montana</option>
                          <option>Nebraska</option>
                          <option>Nevada</option>
                          <option>New Hampshire</option>
                          <option>New Jersey</option>
                          <option>New Mexico</option>
                          <option>New York</option>
                          <option>North Carolina</option>
                          <option>North Dakota</option>
                          <option>Ohio</option>
                          <option>Oklahoma</option>
                          <option>Oregon</option>
                          <option>Pennsylvania</option>
                          <option>Rhode Island</option>
                          <option>South Carolina</option>
                          <option>South Dakota</option>
                          <option>Tennessee</option>
                          <option>Texas</option>
                          <option>Utah</option>
                          <option>Vermont</option>
                          <option>Virginia</option>
                          <option>Washington</option>
                          <option>West Virginia</option>
                          <option>Wisconsin</option>
                          <option>Wyoming</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <br>
                  <div class="panel panel-default">
                    <div class="panel-body">
                      <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Party</th>
                          <th>Name</th>
                          <th>Chamber</th>
                          <th>District</th>
                          <th>State</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr dir-paginate="legislator in legislators_basic | filter:q | itemsPerPage: pageSize" current-page="currentPage">
                          <td><img ng-src="{{ legislator.party }}" width='25'/></td>
                          <td>{{ legislator.name.whole_name }}</td>
                          <td><img ng-src="{{ legislator.chamber.src }}" width='25'/> {{ legislator.chamber.name }}</td>
                          <td>{{ legislator.district }}</td>
                          <td>{{ legislator.state }}</td>
                          <td>View Details</td>
                        </tr>
                      </tbody>
                    </table>
                    </div>
                  </div>
                  <div ng-controller="PageController" class="page-controller">
                    <div class="text-center">
                    <dir-pagination-controls boundary-links="true" on-page-change="pageChangeHandler(newPageNumber)" template-url="dirPagination.tpl.html"></dir-pagination-controls>
                    </div>
                  </div>
                </div>
                <div id="House" class="tab-pane fade">
                </div>
                <div id="Senate" class="tab-pane fade">
                </div>
              </div>
            </div>
          </div>
        `;
        $('#dynamicTable').html(html);
        $compile($('#dynamicTable'))($scope);
    });
  };
}

myApp.controller('TableControl', MyController);
myApp.controller('PageController', PageController);
myApp.controller('SidebarControl', SidebarControl);
