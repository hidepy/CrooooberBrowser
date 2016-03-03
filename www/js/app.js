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

    /* カテゴリマスタ */
    module.factory("CategoryMaster", function(){
        var data = {};

        data.b_categories_hash = {  //直前にヘッダを持っている場合、ヘッダ情報を吐く
            //licat9010:{value: "licat9010", name: "ts", header: ""},
            none: {value: "", name"(指定なし)"},
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
            none: {value: "", name"(指定なし)"},
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
            licat5001:{value: "licat5001", name: "足まわり". header: "<ons-list-header>カスタム・チューニング</ons-list-header>"},
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










/*
抜き出したやつ bparts
 <ons-list-header>バイクパーツ
licat9010 マフラー
licat9015 外装
licat9020 ハンドル・ハンドル廻り
licat9025 メーター
licat9030 ステップ・スタンド
licat9035 足廻り
licat9040 駆動系
licat9045 ホイール・タイヤ
licat9050 ブレーキ
licat9055 電装系
licat9060 冷却系
licat9065 吸気・燃料系
licat9070 エンジン・フレーム
licat9075 その他（バイクパーツ）

 <ons-list-header>バイク用品
licat9210 ヘルメット
licat9220 ウエア
licat9230 ブーツ・シューズ
licat9240 グローブ・ゴーグル
licat9250 プロテクター
licat9260 ツーリング用品
licat9270 メンテナンス
licat9280 ケミカル・オイル
licat9299 その他（バイク用品）
 



抜き出したやつ cparts
<ons-list-header>タイヤ・ホイール</ons-list-header>
licat1001 タイヤ
licat1005 スタッドレスタイヤ
licat2001 アルミホイール
licat2002 スチールホイール
licat2501 タイヤホイールセット
licat2503 スタッドレスタイヤホイール
licat2605 タイヤホイール関連
  <ons-list-header>カーAV</ons-list-header>
licat3001 ヘッドユニット
licat3002 スピーカー
licat3003 アンプ
licat4001 カーナビ(地デジ）
licat4005 カーナビ(非地デジ）
licat4010 オンダッシュモニター
licat4015 インダッシュモニター
licat4020 モニター・地デジ
licat4025 DVDプレーヤー
licat4030 カーAVアクセサリー
licat4035 カーナビ(単体・その他)
licat4040 ETC
  <ons-list-header>カスタム・チューニング</ons-list-header>
licat5001 足まわり
licat5010 吸気・排気系
licat5015 電装系
licat5020 バルブ・HID
licat5025 補強パーツ
licat5030 メーター系
licat5035 過給機系
licat5040 駆動系
licat5045 冷却系
licat5050 ブレーキ系
licat5055 ボディパーツ
licat5060 インテリア
licat5065 シート
licat5070 キャリア
licat5099 その他(カスタム・チューニング)
  <ons-list-header>カー用品</ons-list-header>
licat7001 ケミカル用品
licat7010 メンテナンス
licat7020 アクセサリー
licat7099 その他(カー用品)

*/


/*
http://qiita.com/M-ISO/items/102c6daf192187d5a161
//ex1 //値返す書き方
var myApp = angular.module('MyApp',[]);
myApp.factory('myUrlFactory',function myUrlFunc(){
 return 'https://github.com/kenjimorita/'; 
})

//ex2 //関数を返す書き方
var myApp = angular.module('MyApp',[]);
myApp.factory('myFunc',function($window){
 return{
   get : function(text){
     $window.text;
     alert($window.text);
   }
 }
})

//ex3 //インスタンスに登録していき最後返却する書き方
var myApp = angular.module('MyApp',[]);
myApp.factory('factoryService',function(){
 var moritaService = {}; //moritaServiceインスタンスを生成
 moritaService.message = "This is kenjiService";//プロパティ登録
 moritaService.value = {//オブジェクト登録
  value  : 111,
  value2 : 222 
 };
 moritaService.add = function(a,b){//メソッド登録
  retunr a + b;
 }
 return moritaService; //ホストオブジェクトを返却//このserviceを利用する側はmoritaServiceをそのまま利用する
})

//ex4 //DIできるfactory。他のサービスを利用しながら定義
var myApp = angular.module('MyApp',[]); 
myApp.value('myURL','https://github.com/kenjimorita/');//アプリケーション全体の定数管理（サーバーサイドのURLなど）今回使わない
myApp.constant('apiUrl','/api/products.json');
myApp.constant('apiKey','faea13vata42gae5kk6eeeg75645nkiji');
//$resourceをラップしたサービスを定義
myApp.factory('myApiFactory',[$resource,apiUrl,apiKey,
function($resurce,apiUrl,apiKey){//配列で最後定義
 return $resource(apiUrl).query({api_key : apiKey});
}]);
//↓myApiFactoryを利用する側
angular.module('myApp').controller('moritaController',
['$scope','myApiFactory',
 function($scope,myApiFactory){
  $scope.apiFactory = myApiFactory;
 }]
)

//ex5 既にどこかで用意されているHogeClass
.factory('MyService',function(){
 return new HogeClass();
})

//ex6 サービスオブジェクトを返す
.factory('MyService',function(){
 return FooClass.GetInstance(data);
})
*/

})();