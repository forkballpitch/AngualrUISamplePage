
//------------------삭제추가하는 기능
var app = angular.module('app', [ 'ui.grid.resizeColumns','ui.bootstrap','ngTouch', 'ui.grid', 'ui.grid.edit',  'ui.grid.rowEdit', 'ui.grid.cellNav', 'addressFormatter','ui.grid.selection','ui.grid.draggable-rows']);

angular.module('addressFormatter', []).filter('address', function () {
  return function (input) {
      return input.street + ', ' + input.city + ', ' + input.state + ', ' + input.zip;
  };
});

app.controller('MainCtrl', ['$scope', '$http','$q', '$interval', 'uiGridConstants',  function ($scope, $http, $q, $interval,uiGridConstants,serverData) {

  // $scope.gridOptions.columnDefs[3].editDropdownOptionsArray = r.data.data;


    $scope.dragEnable = true;
    $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/100.json')
      .success(function(data) {
        for(i = 0; i < data.length; i++){
        //  data[i].registered = new Date(data[i].registered);
          data[i].gender = data[i].gender==='male' ? 1 : 2;
        }
        $scope.gridOptions.data = data;
      });

  $scope.gridOptions = {

    enableColumnResizing: true, //리사이징
    enableCellEditOnFocus: true, //바로수정
  //  enableCellEdit: true, //더블클릭 수정
  //  enableRowSelection: true,
  //  enableRowReordering: true,
  //  enableSelectAll: true,
    selectionRowHeaderWidth: 35,
  //  enableColumnResize:true,
  //  rowHeight: 35 ,
    rowTemplate: '<div grid="grid" class="ui-grid-draggable-row" draggable="true"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ui-grid-cell></div></div>'
  };



      $scope.gridOptions.columnDefs = [
      //  { name: 'id', enableCellEdit: false, width: '10%' },
        { name: 'name', displayName: 'Name (editable)', width: '20%' },
      //  { name: 'age', displayName: 'Age' , type: 'number', width: '10%' },
        { name: 'gender', displayName: 'Gender', editableCellTemplate: 'ui-grid/dropdownEditor', width: '20%',
          cellFilter: 'mapGender', editDropdownValueLabel: 'gender',
        //   editDropdownOptionsArray: [
        //   { id: 1, gender: 'male' },
        //   { id: 2, gender: 'female' }
        // ]
        //20170415
        editDropdownOptionsFunction: function(rowEntity, colDef) {
            var married = {id: 1, value: 'Married'};
            var single = {id: 2, value: 'Bachelor'};
            return [{id: 1, gender: 'Married'},  {id: 2, gender: 'Bachelor'}, {id: 3, gender: 'Bachelo2'}];


        //
        //     var res = [];
        //     $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/500_complex.json')
        //     .success(function (data) {
        //        res = data;
        //     });
        // alert(res);
        //     return res;

         }

      },
  //      { name: 'registered', displayName: 'Registered' , type: 'date', cellFilter: 'date:"yyyy-MM-dd"', width: '20%' },
    //    { name: 'address', displayName: 'Address'
    //    //, type: 'object'
  //      //, cellFilter: 'address'
    //    , width: '30%' },
    //    { name: 'address.city', displayName: 'Address (even rows editable)', width: '20%'
            //  ,
            //  cellEditableCondition: function($scope){
            //  return $scope.rowRenderIndex%2
            //  }
      //  },
      //  { name: 'isActive', displayName: 'Active', type: 'boolean', width: '10%' }
       { name: 'company', displayName: 'company', enableCellEdit: false, width: '10%' }
      ];



  //선택
  $scope.gridOptions.multiSelect = true;


  $scope.addData = function() {
   var n = $scope.gridOptions.data.length + 1;
   $scope.gridOptions.data.push({
               "id": "New " + n,
               "name": "Person " + n,
               "age": 11,
               "gender": "male",
               "registered": "2017-01-01",
              "address": "dgklndflgkndflkg",
               "address.city": "dgklndflgkndflkg",
                "isActive": true
             });
  };


  $scope.removeFirstRow = function() {
    //if($scope.gridOpts.data.length > 0){
       $scope.gridOptions.data.splice(0,1);
    //}
  };

  //선택
  $scope.info = {};

   $scope.toggleMultiSelect = function() {
     $scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
   };

   $scope.selectAll = function() {
     $scope.gridApi.selection.selectAllRows();
   };


   $scope.clearAll = function() {
     $scope.gridApi.selection.clearSelectedRows();
   };



      $scope.setSelectable = function() {
        $scope.gridApi.selection.clearSelectedRows();

        $scope.gridOptions.isRowSelectable = function(row){
          if(row.entity.age > 30){
            return false;
          } else {
            return true;
          }
        };
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

        $scope.gridOptions.data[0].age = 31;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
      };

  //선택

   $scope.saveRow = function( rowEntity ) {
     // create a fake promise - normally you'd use the promise returned by $http or $resource
     var promise = $q.defer();
     $scope.gridApi.rowEdit.setSavePromise( rowEntity, promise.promise );

     // fake a delay of 3 seconds whilst the save occurs, return error if gender is "male"
     $interval( function() {
       if (rowEntity.gender === 'male' ){
         promise.reject();
       } else {
         promise.resolve();
       }
     }, 3000, 1);
   };



//

 $scope.msg = {};

 $scope.gridOptions.onRegisterApi = function(gridApi){
         gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget) {
           // dropTarget.children.item(0).innerText
            console.log("Dropped", info);
        });

         $scope.$watch('dragEnable', function (newValue, oldValue) {
           gridApi.dragndrop.setDragDisabled(!newValue);
         });

          //set gridApi on scope
          $scope.gridApi = gridApi;
          //추가!!
          gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);

          gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
            $scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue ;
            $scope.$apply();
          });



        };



}])

.filter('mapGender', function() {
  var genderHash = {
    1: 'male',
    2: 'female'
  };

  return function(input) {
    if (!input){
      return '';
    } else {
      return genderHash[input];
    }
  };
})
;
