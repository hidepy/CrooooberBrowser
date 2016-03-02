(function(){
    'use strict';
    var module = angular.module('app', ['onsen','checklist-model']);
    //var module = angular.module('app', ['onsen','checklist-model','ngAnimate']);

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

        if(_args.selected_item){
            $scope.detail.title = _args.selected_item.title;
            $scope.detail.price = _args.selected_item.price;
        }

        getDetailInfo(_args.selected_item, function(data, type, parameters){
            var data = createResultItemDetail(data, type, parameters);
            console.log("get datail info callback");

            $scope.$apply(function(){
                $scope.detail = data;
            });

            item_img_carousel.refresh();
            thumb_img_carousel.refresh();

            //ヘッダから登録されたお気に入り情報の場合は、フラグを折って情報を新たに格納する
            if(_args.is_from_favorite){
                //未だ詳細情報を持っていないお気に入り情報の場合
                if(_args.selected_item && _args.selected_item.flg_dont_have_detail){
                    storageManager.saveFavoriteItem2StorageWithDetailData(data); //取得した詳細情報でデータを上書き
                }
            }

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

                storageManager.deleteCacheItem(id);
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

        //車検索の場合にtrueとなる
        $scope.is_car_serach = false;

        //バイク/車検索チェック切り替え時発生のイベント
        $scope.bikeAndCarCheckChange = function(){
            $scope.is_car_serach = ($('input[name=select_bike_or_car]:checked').val() == "car");
        };

        //現在の検索条件を保存
        $scope.processSaveSearchCondition = function(){
            console.log("in processSaveSearchCondition");

            //検索条件を組み立て＆保存
            storageManager.setSearchCondition(create_search_condition_params());
        };

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

                //var el_selected_bunrui = document.querySelector("#search_condition_bunrui_list_wrapper" + query + " > .bunrui_list_selected");
                var selected_jq_input = $("input[name=bunrui]:checked");
                var el_selected_bunrui = selected_jq_input && selected_jq_input[0] ? selected_jq_input[0].parentNode.parentNode : null;

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

        //保存された検索条件画面へ遷移
        $scope.movetoSavedSearchCondition = function(){
            myNavigator.pushPage("saved_search_condition.html");
        }
    });

    //お気に入りのコントローラ
    module.controller('ViewFavoriteController', function($scope) {

        console.log("in view favorite controller");

        //お気に入り情報のロード
        $scope.items = storageManager.getAllFavoriteItemsAsArr();

        //削除するデータリスト
        $scope.del = {
            items: []
        };

        // 削除チェックボックスの表示切り替え
        $scope.delete_switching = false;

        //お気に入り一覧データの選択処理
        $scope.processItemSelect = function(index, event){

            if($scope.delete_switching == false){ //削除ボタン表示中でなければ

                console.log("in processItemSelect");

                var item = {
                    detail_url : $scope.items[index].url,
                    id : $scope.items[index].id,
                    flg_dont_have_detail: $scope.items[index].flg_dont_have_detail //まだ詳細情報を持っていない場合のみtrue
                };

                //詳細ページに遷移する
                myNavigator.pushPage("detail_content.html", {selected_item: item, is_from_favorite: true});
            }
            else{
                //削除　ボタン表示中なら

                var target_idx = $scope.del.items.indexOf($scope.items[index].id);

                //既に登録されているか
                if(target_idx != -1){
                    //登録されている
                    $scope.del.items.splice(target_idx, 1); //削除
                }
                else{
                    $scope.del.items.push($scope.items[index].id);
                }                
            }
        };

        $scope.checkBoxToggle = function(){
            $scope.delete_switching = !$scope.delete_switching;
        };

        //削除ボタン
        $scope.deleteRecord = function(){

            console.log("in deleteRecord");

            storageManager.deleteItems($scope.del.items);

            $scope.del.items = [];
            $scope.delete_switching = false;

            $scope.items = storageManager.getAllFavoriteItemsAsArr();
        };

        $scope.checkAll = function() {
            $scope.del.items = [];

            for(var i in $scope.items){
                //console.log($scope.items[i].id);
                $scope.del.items.push($scope.items[i].id);  
            }
        };
        
        $scope.uncheckAll = function() {
            $scope.del.items = [];
        };
    });


    //保存した検索条件のコントローラ
    module.controller('ViewSavedSearchConditionController', function($scope) {

        console.log("in ViewSavedSearchConditionController");

        //保存した検索条件情報のロード
        $scope.items = storageManager.getAllSearchConditionItemsAsArr();

        //削除するデータリスト
        $scope.del = {
            items: []
        };

        // 削除チェックボックスの表示切り替え
        $scope.delete_switching = false;

        //お気に入り一覧データの選択処理
        $scope.processItemSelect = function(index, event){

            if($scope.delete_switching == false){ //削除ボタン表示中でなければ

                console.log("in processItemSelect");

                var detail_param = $scope.items[index];

                //検索条件をロードして、メイン画面へ戻って検索処理
                myNavigator.resetToPage("main.html", {animation: "slide", is_from_detail_search: true, detail_search_cond: detail_param});
            }
            else{
                //削除　ボタン表示中なら

                var target_idx = $scope.del.items.indexOf($scope.items[index].word);

                //既に登録されているか
                if(target_idx != -1){
                    //登録されている
                    $scope.del.items.splice(target_idx, 1); //削除
                }
                else{
                    $scope.del.items.push($scope.items[index].word);
                }                
            }
        };

        $scope.checkBoxToggle = function(){
            $scope.delete_switching = !$scope.delete_switching;
        };

        //削除ボタン
        $scope.deleteRecord = function(){

            console.log("in deleteRecord");

            storageManager.deleteSearchConditionItems($scope.del.items);

            $scope.del.items = [];
            $scope.delete_switching = false;

            $scope.items = storageManager.getAllSearchConditionItemsAsArr();
        };

        $scope.checkAll = function() {
            $scope.del.items = [];

            for(var i in $scope.items){
                //console.log($scope.items[i].id);
                $scope.del.items.push($scope.items[i].id);  
            }
        };
        
        $scope.uncheckAll = function() {
            $scope.del.items = [];
        };
    });

})();