(function(){
    'use strict';
    //var module = angular.module('app', ['onsen','checklist-model']);
    //var storage_manager = new StorageManager("SOFTCREAM_COLLECTION_LIST");

    var module = angular.module('CrooooberBrowserApp', ['onsen','checklist-model']);

    //ヘッダ一覧画面のコントローラ
    module.controller('MainController', function($scope) {
        $scope.items = [];
        $scope.is_searching = false;
        $scope.is_searching_more = false;

        //outLog("in main controller");

        //詳細検索ページから来た場合
        if(myNavigator.getCurrentPage().options.is_from_detail_search){
            //outLog("ok, you're from detail search!");

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
            //alert_ex("item selected!! _debug");
            outLog("item selected!!");
            myNavigator.pushPage("detail_content.html", {selected_index: index, selected_item: $scope.items[index]});
            //myNavigator.pushPage("detail_content.html");

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

        $scope._pageMove = function(){
            alert_ex("page moving!!(this is test...)");
        };

    });


    //詳細ページのコントローラ
    module.controller('ViewDetailController', function($scope) {

        $scope.detail = {};

        outLog("in view detail controller");

        var _args = myNavigator.getCurrentPage().options;

        if(_args.selected_item){
            $scope.detail.title = _args.selected_item.title;
            $scope.detail.price = _args.selected_item.price;
        }

        getDetailInfo(_args.selected_item, function(data, type, parameters){
            var data = createResultItemDetail(data, type, parameters);
            outLog("get datail info callback");

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
            
            outLog("in deleteCacheItem");

            var el_detail_title = document.getElementById("d_title");

            if(el_detail_title){
                var id = el_detail_title.getAttribute("detail_id");

                storageManager.deleteCacheItem(id);
            }
        };

        //crooooberで見る押下時
        $scope.openCrooooberPage = function(){

            outLog("in openCrooooberPage");

            window.open($scope.detail.full_url, '_system');
        };
    });




})();