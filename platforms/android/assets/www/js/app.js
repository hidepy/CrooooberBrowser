(function(){
    'use strict';
    var module = angular.module('app', ['onsen','checklist-model']);

    module.controller('MainController', function($scope) {
        $scope.items = [];
        $scope.is_searching = false;

        $scope.processSearchButtonClick = function(){

            var search_key = document.getElementById("search_key").value;

            console.log("検索キー: " + search_key);

            //検索条件をクリアする
            //search_condition_clear();

            $scope.is_searching = true;

            //ヘッダ情報を取得する
            getHeaderInfo(null, search_key, function(data, type, parameters){

                $scope.is_searching = false;

                console.log("first callback");

                $scope.$apply(function(){
                    $scope.items = createResultItemsHeader(data, type, parameters); 
                });
                
            });

        };

        $scope.processItemSelect = function(index, event){
            console.log("clicked");

            myNavigator.pushPage("detail_content.html", {selected_index: index, selected_item: $scope.items[index]});

        };

    });


    module.controller('ViewDetailController', function($scope) {

        $scope.detail = {};

        console.log("in view detail controller");

        var _args = myNavigator.getCurrentPage().options;

        getDetailInfo(_args.selected_item, function(data, type, parameters){
            var data = createResultItemDetail(data, type, parameters);
            console.log("get datail info callback");

            //myNavigator.pushPage("detail_content.html", {data: data});

            $scope.$apply(function(){
                $scope.detail = data;
            });
        }, function(detail_item){
            $scope.$apply(function(){
                $scope.detail = detail_item;
            });
        });

        //サムネイル押下時
        $scope.detail_thumbnail_clicked = function(event){
            $scope.detail.picture = event.item;//event.target.getAttribute("src");
        }

    });

})();