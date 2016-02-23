(function(){
    'use strict';
    var module = angular.module('app', ['onsen','checklist-model']);

    //ヘッダ一覧画面のコントローラ
    module.controller('MainController', function($scope) {
        $scope.items = [];
        $scope.is_searching = false;
        $scope.is_searching_more = false;

        console.log("in main controller");

        //詳細検索ページから来た場合
        if(myNavigator.getCurrentPage().options.is_from_detail_search){
            console.log("ok, you're from detail search!");

            var param = myNavigator.getCurrentPage().options.detail_search_cond;

            //ヘッダ情報取得を駆動する
            triggerHeaderInfo("", param);
        }

        //通常の関数 ヘッダ情報取得へのバイパス
        function triggerHeaderInfo(search_key, detail_param){

            $scope.is_searching = true;

            //ヘッダ情報を取得する
            getHeaderInfo(detail_param, search_key, function(data, type, parameters){

                $scope.is_searching = false;

                $scope.$apply(function(){
                    $scope.items = createResultItemsHeader(data, type, parameters); 
                });
                
            });
        }

        //通常検索の処理
        $scope.processSearchButtonClick = function(){

            var search_key = document.getElementById("search_key").value;

            triggerHeaderInfo(search_key, null);

            //検索条件をクリアする
            //search_condition_clear();
        };

        //ヘッダ一覧データの選択処理
        $scope.processItemSelect = function(index, event){

            myNavigator.pushPage("detail_content.html", {selected_index: index, selected_item: $scope.items[index]});

        };

        // さらに検索ボタンを押下した場合の処理
        $scope.processSearchMoreButtonClick = function(){

            var search_cond = JSON.parse(document.getElementById("button_search_more").getAttribute("search_condition"));

            $scope.is_searching_more = true;

            getHeaderInfoMore(null, function(data, type, parameters){

                $scope.$apply(function(){
                    
                    $scope.is_searching_more = false;

                    $scope.items = createResultItemsHeader(data, type, parameters); 
                });

            });

        };

    });

    //詳細ページのコントローラ
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

            console.log("before refresh");
            item_img_carousel.refresh();
            thumb_img_carousel.refresh();

        }, function(detail_item){
            $scope.$apply(function(){
                $scope.detail = detail_item;
            });
        });

        //キャッシュを削除押下時
        $scope.deleteCacheItem = function(){
            
            console.log("in deleteCacheItem");

            var el_detail_title = document.getElementById("d_title");

            if(el_detail_title){
                var id = el_detail_title.getAttribute("detail_id");

                storageManager.deleteItem(id);
            }

        };

        //crooooberで見る押下時
        $scope.openCrooooberPage = function(){

            console.log("in openCrooooberPage");

            window.open($scope.detail.full_url, '_system');
        };
        

    });

    //詳細条件指定検索ページのコントローラ
    module.controller('SearchDetailConditionController', function($scope) {

        console.log("in SearchDetailConditionController");

        $scope.ts_msg = "messaggggggggggee!!";

        //検索条件クリア
        function search_condition_clear(){
            console.log("search condition clear");

            $("#setting_search_condition_keyword").val("");
            $("input[name=search_condition_sort]").val(["1"]);
            $("#search_condition_bunrui_list_wrapper > li").removeClass("bunrui_list_selected");
            $("#search_condition_bunrui_list_wrapper_car > li").removeClass("bunrui_list_selected");
            $("#setting_search_condition_kakaku_low").val("");
            $("#setting_search_condition_kakaku_high").val("");
        }

        //詳細検索条件作成
        function create_search_condition_params(){

            var sort_kbn = $("input[name=search_condition_sort]:checked").val();
            
            var bunrui_cd = (function(){
                
                var is_car = ($('input[name=select_bike_or_car]:checked').val() == "car");

                var query = is_car ? "_car" : "";

                var el_selected_bunrui = document.querySelector("#search_condition_bunrui_list_wrapper" + query + " > .bunrui_list_selected");

                var res = ((el_selected_bunrui) ? el_selected_bunrui.id : "").replace("licat", "");

                if(res.length == 4){
                    return ((is_car ? "01_" : "20_") + res.substr(0, 2) + "_" + res.substr(2, 2));
                }

                return "";

            })();   

            var detail_param = {
                word: $("#setting_search_condition_keyword").val(),
                connector: "and",
                bunrui: bunrui_cd,
                kakaku_low: $("#setting_search_condition_kakaku_low").val(),
                kakaku_high: $("#setting_search_condition_kakaku_high").val(),
                sort: sort_kbn || "1"
            };

            return detail_param;
        }

        //詳細検索ボタン押下時
        $scope.processDetailSearchButtonClick = function(){
            console.log("search_condition_search_button");

            //詳細検索条件を生成
            var detail_param = create_search_condition_params();

            //先にページに戻る
            myNavigator.resetToPage("main.html", {animation: "slide", is_from_detail_search: true, detail_search_cond: detail_param});
        };
    });

})();