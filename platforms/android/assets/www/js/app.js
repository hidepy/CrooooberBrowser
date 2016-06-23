(function(){
    'use strict';
    //var module = angular.module('app', ['onsen','checklist-model']);
    //var storage_manager = new StorageManager("SOFTCREAM_COLLECTION_LIST");

    var module = angular.module('CrooooberBrowserApp', ['onsen','checklist-model']);

    /* カテゴリマスタ */
    module.factory("CategoryMaster", function(){
        var data = {};

        data.b_categories_hash = {  //直前にヘッダを持っている場合、ヘッダ情報を吐く
            //licat9010:{value: "licat9010", name: "ts", header: ""},
            none: {value: "", name:"(指定なし)"},
            licat9010:{value: "licat9010", name: "マフラー", header: "<ons-list-header>バイクパーツ</ons-list-header>"},
            licat9015:{value: "licat9015", name: "外装"},
            licat9020:{value: "licat9020", name: "ハンドル・ハンドル廻り"},
            licat9025:{value: "licat9025", name: "メーター"},
            licat9030:{value: "licat9030", name: "ステップ・スタンド"},
            licat9035:{value: "licat9035", name: "足廻り"},
            licat9040:{value: "licat9040", name: "駆動系"},
            licat9045:{value: "licat9045", name: "ホイール・タイヤ"},
            licat9050:{value: "licat9050", name: "ブレーキ"},
            licat9055:{value: "licat9055", name: "電装系"},
            licat9060:{value: "licat9060", name: "冷却系"},
            licat9065:{value: "licat9065", name: "吸気・燃料系"},
            licat9070:{value: "licat9070", name: "エンジン・フレーム"},
            licat9075:{value: "licat9075", name: "その他（バイクパーツ）"},
            licat9210:{value: "licat9210", name: "ヘルメット", header: "<ons-list-header>バイク用品</ons-list-header>"},
            licat9220:{value: "licat9220", name: "ウエア"},
            licat9230:{value: "licat9230", name: "ブーツ・シューズ"},
            licat9240:{value: "licat9240", name: "グローブ・ゴーグル"},
            licat9250:{value: "licat9250", name: "プロテクター"},
            licat9260:{value: "licat9260", name: "ツーリング用品"},
            licat9270:{value: "licat9270", name: "メンテナンス"},
            licat9280:{value: "licat9280", name: "ケミカル・オイル"},
            licat9299:{value: "licat9299", name: "その他（バイク用品）"}
        };
        data.c_categories_hash = {
            none: {value: "", name:"(指定なし)"},
            licat1001:{value: "licat1001", name: "タイヤ", header: "<ons-list-header>タイヤ・ホイール</ons-list-header>"},
            licat1005:{value: "licat1005", name: "スタッドレスタイヤ"},
            licat2001:{value: "licat2001", name: "アルミホイール"},
            licat2002:{value: "licat2002", name: "スチールホイール"},
            licat2501:{value: "licat2501", name: "タイヤホイールセット"},
            licat2503:{value: "licat2503", name: "スタッドレスタイヤホイール"},
            licat2605:{value: "licat2605", name: "タイヤホイール関連"},
            licat3001:{value: "licat3001", name: "ヘッドユニット", header: "<ons-list-header>カーAV</ons-list-header>"},
            licat3002:{value: "licat3002", name: "スピーカー"},
            licat3003:{value: "licat3003", name: "アンプ"},
            licat4001:{value: "licat4001", name: "カーナビ(地デジ）"},
            licat4005:{value: "licat4005", name: "カーナビ(非地デジ）"},
            licat4010:{value: "licat4010", name: "オンダッシュモニター"},
            licat4015:{value: "licat4015", name: "インダッシュモニター"},
            licat4020:{value: "licat4020", name: "モニター・地デジ"},
            licat4025:{value: "licat4025", name: "DVDプレーヤー"},
            licat4030:{value: "licat4030", name: "カーAVアクセサリー"},
            licat4035:{value: "licat4035", name: "カーナビ(単体・その他)"},
            licat4040:{value: "licat4040", name: "ETC"},
            licat5001:{value: "licat5001", name: "足まわり", header: "<ons-list-header>カスタム・チューニング</ons-list-header>"},
            licat5010:{value: "licat5010", name: "吸気・排気系"},
            licat5015:{value: "licat5015", name: "電装系"},
            licat5020:{value: "licat5020", name: "バルブ・HID"},
            licat5025:{value: "licat5025", name: "補強パーツ"},
            licat5030:{value: "licat5030", name: "メーター系"},
            licat5035:{value: "licat5035", name: "過給機系"},
            licat5040:{value: "licat5040", name: "駆動系"},
            licat5045:{value: "licat5045", name: "冷却系"},
            licat5050:{value: "licat5050", name: "ブレーキ系"},
            licat5055:{value: "licat5055", name: "ボディパーツ"},
            licat5060:{value: "licat5060", name: "インテリア"},
            licat5065:{value: "licat5065", name: "シート"},
            licat5070:{value: "licat5070", name: "キャリア"},
            licat5099:{value: "licat5099", name: "その他(カスタム・チューニング)"},
            licat7001:{value: "licat7001", name: "ケミカル用品", header: "<ons-list-header>カー用品</ons-list-header>"},
            licat7010:{value: "licat7010", name: "メンテナンス"},
            licat7020:{value: "licat7020", name: "アクセサリー"},
            licat7099:{value: "licat7099", name: "その他(カー用品)"}
        };

        return data;
    });



    //ヘッダ一覧画面のコントローラ
    module.controller('MainController', function($scope) {
        $scope.items = [];
        $scope.is_searching = false;
        $scope.is_searching_more = false;

        outLog("in main controller");

        //最終検索時の車/バイクチェックを反映
        if(storageManager.getSearchType() == "car"){
            $("input[name=select_bike_or_car]").val(["car"]);
        }
        else{
            $("input[name=select_bike_or_car]").val(["bike"]);
        }

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
    module.controller('ViewDetailController', function($scope, $sce) {

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
                $scope.detail.comment = $sce.trustAsHtml(data.comment);
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


    //詳細条件指定検索ページのコントローラ
    module.controller('SearchDetailConditionController', function($scope, CategoryMaster) {

        outLog("in SearchDetailConditionController");

        //最終検索時の車/バイクチェックを反映
        if(storageManager.getSearchType() == "car"){
            $("input[name=select_bike_or_car_detail]").val(["car"]);
        }
        else{
            $("input[name=select_bike_or_car_detail]").val(["bike"]);
        }

        //カテゴリ情報をコピー
        //1要素は, key=licatxxxx, value:{value: licatxxxx, name: カテゴリ名称, header: あるときは}
        $scope.b_categories = CategoryMaster.b_categories_hash;
        $scope.c_categories = CategoryMaster.c_categories_hash;

        //バイク/車カテゴリ制御用フラグ
        /* 2016/06/06 hide mod start */
        //$scope.is_car_serach = false;
        $scope.is_car_search = (storageManager.getSearchType() == "car");
        console.log("detail search loading... is_car_search is: " + $scope.is_car_search);
        /* 2016/06/06 hide mod end */

        $scope.processBikeOrCarChange = function(){
            outLog("in processBikeOrCarChange");

            /* 2016/06/06 hide mod start */
            ///$scope.is_car_serach = ($('input[name=select_bike_or_car]:checked').val() == "car");
            $scope.is_car_search = ($('input[name=select_bike_or_car_detail]:checked').val() == "car");
            /* 2016/06/06 hide mod end */
        };

        //現在の検索条件を保存
        $scope.processSaveSearchCondition = function(){
            outLog("in processSaveSearchCondition");

            //検索条件を組み立て＆保存
            storageManager.setSearchCondition(create_search_condition_params());
        };

        //詳細検索条件作成
        function create_search_condition_params(){

            var sort_kbn = $("input[name=search_condition_sort]:checked").val();
            
            var bunrui_cd = (function(){
                
                /* 2016/06/06 hide mod start */
                //なんか取得対象が違っていそうだったので修正
                //var is_car = ($('input[name=select_bike_or_car]:checked').val() == "car");
                var is_car = ($('input[name=select_bike_or_car_detail]:checked').val() == "car");
                /* 2016/06/06 hide mod end */

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

            var connector = $('input[name=select_and_or]:checked').val();
            if((connector != "and") && (connector != "or")){ //andでもorでもないならデフォルト値をセット
                connector = "and";
            }

            var detail_param = {
                word: $("#setting_search_condition_keyword").val(),
                connector: connector,
                bunrui: bunrui_cd,
                kakaku_low: $("#setting_search_condition_kakaku_low").val(),
                kakaku_high: $("#setting_search_condition_kakaku_high").val(),
                sort: sort_kbn || "1",
                /* 2016/06/06 hide mod start */
                //取得対象がちがそうだった
                //search_type: $('input[name=select_bike_or_car]:checked').val() || "bike",
                search_type: $('input[name=select_bike_or_car_detail]:checked').val() || "bike",
                /* 2016/06/06 hide mod end */
                ref_date_time: formatDate()
            };

            return detail_param;
        };

        //詳細検索ボタン押下時
        $scope.processDetailSearchButtonClick = function(){
            outLog("search_condition_search_button");

            //詳細検索条件を生成
            var detail_param = create_search_condition_params();

            /* 2016/06/06 hide add start */
            // 正規の文字列が入っていれば、ストレージに格納
            if((detail_param.search_type == "bike") || (detail_param.search_type == "car")){
                storageManager.setSearchType(detail_param.search_type);
            }
            /* 2016/06/06 hide add end */

            //先にページに戻る
            myNavigator.resetToPage("main.html", {animation: "slide", is_from_detail_search: true, detail_search_cond: detail_param});
        };

        //保存された検索条件画面へ遷移
        $scope.movetoSavedSearchCondition = function(){
            myNavigator.pushPage("saved_search_condition.html");
        };
    });


    //お気に入りのコントローラ
    module.controller('ViewFavoriteController', function($scope) {

        outLog("in view favorite controller");

        //お気に入り情報のロード
        $scope.items = storageManager.getAllFavoriteItemsAsArr(true);

        //削除するデータリスト
        $scope.del = {
            items: []
        };

        // 削除チェックボックスの表示切り替え
        $scope.delete_switching = false;

        //お気に入り一覧データの選択処理
        $scope.processItemSelect = function(index, event){

            if($scope.delete_switching == false){ //削除ボタン表示中でなければ

                outLog("in processItemSelect");

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

            outLog("in deleteRecord");

            storageManager.deleteItems($scope.del.items);

            $scope.del.items = [];
            $scope.delete_switching = false;

            $scope.items = storageManager.getAllFavoriteItemsAsArr();
        };

        $scope.checkAll = function() {
            $scope.del.items = [];

            for(var i in $scope.items){
                //outLog($scope.items[i].id);
                $scope.del.items.push($scope.items[i].id);  
            }
        };
        
        $scope.uncheckAll = function() {
            $scope.del.items = [];
        };
    });

    //保存した検索条件のコントローラ
    module.controller('ViewSavedSearchConditionController', function($scope, CategoryMaster) {

        outLog("in ViewSavedSearchConditionController");

        //保存した検索条件情報のロード
        //$scope.items = storageManager.getAllSearchConditionItemsAsArr();

        $scope.items = (function(){

            var saved_cond = storageManager.getAllSearchConditionItemsAsArr(true);

            if(saved_cond == null){
                saved_cond = [];
            }

            for(var i = 0; i < saved_cond.length; i++){
                var bunrui_cd = saved_cond[i].bunrui;
                var master_type = saved_cond[i].search_type;

                //マスタからカテゴリ名称をひいてくる
                saved_cond[i].bunrui_name = (master_type == "bike") ? CategoryMaster.b_categories_hash[bunrui_cd] : CategoryMaster.c_categories_hash[bunrui_cd];

                saved_cond[i].search_type_name = (master_type == "bike") ? "バイク" : "車";

                switch(saved_cond[i].sort){
                    case "1":
                        saved_cond[i].sort_name = "新着順";
                        break;
                    case "2":
                        saved_cond[i].sort_name = "安い順";
                        break;
                    case "3":
                        saved_cond[i].sort_name = "高い順";
                        break;
                    default:
                        saved_cond[i].sort_name = "";
                        break;
                }

                saved_cond[i].price_disp = (function(low, high){
                    var low_str = isNaN(low) ? "" : "" + low;
                    var high_str = isNaN(high) ? "" : "" + low;

                    if((low_str == "") && (high_str == "")){
                        return " ";
                    }
                    else{
                        return "" + low_str + " ～ " + high_str;
                    }

                })(saved_cond[i].kakaku_low, saved_cond[i].kakaku_high);
            }

            return saved_cond;
        })();

        //削除するデータリスト
        $scope.del = {
            items: []
        };

        // 削除チェックボックスの表示切り替え
        $scope.delete_switching = false;

        //お気に入り一覧データの選択処理
        $scope.processItemSelect = function(index, event){

            if($scope.delete_switching == false){ //削除ボタン表示中でなければ

                outLog("in processItemSelect");

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

            outLog("in deleteRecord");

            storageManager.deleteSearchConditionItems($scope.del.items);

            $scope.del.items = [];
            $scope.delete_switching = false;

            $scope.items = storageManager.getAllSearchConditionItemsAsArr();
        };

        $scope.checkAll = function() {
            $scope.del.items = [];

            for(var i in $scope.items){
                //outLog($scope.items[i].id);
                $scope.del.items.push($scope.items[i].id);  
            }
        };
        
        $scope.uncheckAll = function() {
            $scope.del.items = [];
        };
    });

})();