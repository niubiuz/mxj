//common.js 应用公共js函数 该js函数与当前应用无关。移动应用通用js文件

	/*PhoneGap注册事件*/
	document.addEventListener("deviceready", onDeviceReady, false);
	//PhoneGap加载完毕
	function onDeviceReady(){
		checkConnection();
		//注册回退按钮事件监听器
		document.addEventListener("backbutton",onBackKeyDown,false);
		//注册当应用从后台恢复的事件监听器
		document.addEventListener("resume", onResume, false); 
		 
		//获取当前手机的操作系统
	    device_platform = device.platform;
		device_platform = device_platform.toLowerCase();
		
		//用户启动了程序获取设备相关信息
		device_uuid_only = device.uuid;
		device_uuid  = window.localStorage[APP_ID+"_uuid"] ;
		device_uuid = changeUndefinedToEmpty(device_uuid);
		if(device_uuid  == ""){
			var create_time = curtime.substr(5, 14);
			create_time = create_time.replace(" ","");
			create_time = create_time.replace(":","");
			create_time = create_time.replace(":","");
			create_time = create_time.replace("-","");
			//用户启动了程序获取设备相关信息
			device_uuid = device_uuid_only  +"_" +  $.trim(create_time); //uuid
			window.localStorage[APP_ID+"_uuid"] = device_uuid ;
		}
		device_version_no = device.version
	    device_version = device.platform +":"+ device.version;	//操作系统版本号
	    device_name = device.name;	//操作系统版本号
	    //因为在iOS7中所有的应用都是全屏运行的，所有使得状态栏层叠在来应用里面导致头部导航栏的内容会被覆盖掉。所以在此进行判断
	    if (device_platform.indexOf("iphone") > -1|| device_platform.indexOf("ios") > -1 ||device_platform.indexOf("ipad")> -1 ){
		    if(parseFloat(device.version) >= 7.0){
		    	head_style = "myhead7";
		    	//document.body.style.marginTop = "20px";
		    }
	    }
	}

	//处理后退按钮操作	
	function onBackKeyDown(){
		var index_css 	 = getViewDsiplay("index");//首页
		var new_css		 = getViewDsiplay("view_hot_project");//最新项目
		//var end_css      = getViewDsiplay("data_end") ;//即将截止项目
		var information_css = getViewDsiplay("view_new_notice");//申报通知列表
		//var view_notice_hot_css = getViewDsiplay("data_notice_hot");//申报通知列表
		var data_notice_content_css = getViewDsiplay("data_notice_content");//申报通知正文
		var about_css = getViewDsiplay("about");//关于我们
		var setting_css = getViewDsiplay("setting");//设置
		var aboutcredit_css= getViewDsiplay("aboutcredit") ;//关于信用岛	
		var setplace_css = getViewDsiplay("setplace");//设置地区	
		var content_css = getViewDsiplay("view_content");//项目正文
		var timenode_css = getViewDsiplay("view_timenode");//时间节点
		var notice_css = getViewDsiplay("view_notice");//通知
		var publicity_css = getViewDsiplay("view_publicity");//公示信息
		var remind_css = getViewDsiplay("view_remind");//友情提醒
		var search_css = getViewDsiplay("view_search");//搜索条件
		var searchlist_css = getViewDsiplay("view_searchlist");//搜索结果
		var more_css = getViewDsiplay("more");//更多
		var about_css = getViewDsiplay("about");//关于我们
		var userinfo_css = getViewDsiplay("userinfo");//用户信息
		var regist_css = getViewDsiplay("regist");//用户注册
		var login_css = getViewDsiplay("login");//用户登录
		var req_index_css = getViewDsiplay("view_req_index");//需求首页
		var req_info_css = getViewDsiplay("view_req_info");//需求详情
		var req_my_css = getViewDsiplay("view_req_my");//我的需求列表
		var view_comment_list_css = getViewDsiplay("view_comment_list");//评论列表
		var view_feedback_index_css = getViewDsiplay("view_feedback_index");//我的反馈首页
		var view_feedback_content_css = getViewDsiplay("view_feedback_content");//评论列表
		
		
		var province_css = $("#view_province").css("display");//选择省
		var city_css = $("#view_city").css("display");//选择市
		
		if(index_css =="block"){//退出程序
			//得到本地存储的变量,如果存储的变量值正确，就说明不需要弹出提示框直接退出程序
			var isaskmore = window.localStorage[APP_ID+"_exit"];
			if(isaskmore =="noask" )
				  navigator.app.exitApp();
			else
				registry1.byId("dlg_exit").show();	
		}else{
			//当前页面
			var view="";
			//转场的目标页面
			var transpage="";
			if(new_css=="block"){
				view = registry1.byId("view_hot_project"); 
				transpage = "index";
			}else if(search_css =="block"){
				view = registry1.byId("view_search"); 
				transpage = "index";
			}else if(more_css =="block"){
				view = registry1.byId("more");
				transpage = "index"; 
			}else if(information_css == "block"){
				view = registry1.byId("view_new_notice"); 
				transpage = "index";
			}else if(timenode_css =="block" ){ 
				view = registry1.byId("view_timenode"); 
				transpage = "view_content";
			}else if(notice_css =="block"){
				view = registry1.byId("view_notice"); 
				transpage = "view_content";
			}else if(publicity_css =="block"){
				view = registry1.byId("view_publicity"); 
				transpage = "view_content";
			}else if(remind_css =="block" ){
				view = registry1.byId("view_remind"); 
				transpage = "view_content";	
			}else if(searchlist_css =="block"){//返回到搜索条件页面
				view = registry1.byId("view_searchlist");
				transpage = "view_search";
			}else if(content_css =="block"){//返回到列表页面
				$("#dlg_add_comment").hide();
				view = registry1.byId("view_content"); 
				transpage = $("#hidden_para").val();			
			}else if (about_css == "block") {
				view = registry1.byId("about");
				transpage = $("#about_back_para").val();
			}else if (setting_css == "block") {
				view = registry1.byId("setting");
				transpage = "more";
			}else if(userinfo_css =="block"){
				view = registry1.byId("userinfo"); 
				transpage = "more";
			}else if(regist_css =="block"){
				view = registry1.byId("regist"); 
				transpage = "login";
			}else if(login_css =="block" ){
				view = registry1.byId("login"); 
				transpage =  $("#login_hidden_para").val();
			}else if(data_notice_content_css =="block"){//
				view = registry1.byId("data_notice_content"); 
				transpage = "view_new_notice";			
			}else if(province_css =="block"){//从选择省页面返回到完善用户信息界面
				view = registry1.byId("view_province"); 
				transpage = "completeuserinfo";		
			}else if(city_css =="block"){//从选择市页面返回到选择省界面
				view = registry1.byId("view_city"); 
				transpage = "view_province";	
			}else if (aboutcredit_css == "block") {
				view = registry1.byId("aboutcredit");
				transpage = $("#aboutcredit_back_para").val();
			}else if (setplace_css == "block") {
				view = registry1.byId("setplace");
				transpage = $("#setplace_back_para").val();
			}else if(req_index_css == "block"){
				view = registry1.byId("view_req_index");
				transpage = "view_service_index";	
			}else if(req_my_css == "block"){
				view = registry1.byId("view_req_my");
				transpage = $("#view_req_me_back_para").val();
			}else if(req_info_css == "block"){
				view = registry1.byId("view_req_info");
				transpage = $("#req_back_para").val();	
				//从需求详细页面返回的时候将弹出框隐藏
				hideDlg("dlg_req_replay");
			}else if(getViewDsiplay("view_req_first") == "block"){
				view = registry1.byId("view_req_first");
				transpage = "index";	
			}else if(view_comment_list_css == "block"){
				$("#dlg_add_comment").hide();
				view = registry1.byId("view_comment_list");
				transpage = "view_content";	
			}else if(view_feedback_index_css == "block"){
				$("#dlg_feedback_post").hide();
				view = registry1.byId("view_feedback_index");
				transpage = "more";	
			}else if(view_feedback_content_css == "block"){
				$("#dlg_feedback_post").hide();
				view = registry1.byId("view_feedback_content");
				transpage = "view_feedback_index";	
			}else if(getViewDsiplay("feedback_post") == "block" ){
				view = registry1.byId("feedback_post");
				transpage = "view_feedback_index";	
			}else if(getViewDsiplay("view_service_index") == "block" ){
				view = registry1.byId("view_service_index");
				transpage = "index";	 
			}else if(getViewDsiplay("view_service_info") == "block" ){
				view = registry1.byId("view_service_info");
				transpage = "view_service_index";	 
			}else if(getViewDsiplay("view_pub_req_first") == "block" ){
				view = registry1.byId("view_pub_req_first");
				transpage = $("#view_pub_req_first_back_para").val();
			}else if(getViewDsiplay("view_pub_req") == "block" ){
				view = registry1.byId("view_pub_req");
				transpage = $("#view_pub_req_back_para").val();
			}else if(getViewDsiplay("view_req_pub_byme") == "block" ){
				view = registry1.byId("view_req_pub_byme");
				transpage = $("#view_req_me_back_para").val();
			}else if(getViewDsiplay("view_corporation_list") == "block" ){
				view = registry1.byId("view_corporation_list");
				transpage = $("#corlist_back_para").val();
			}else if(getViewDsiplay("view_corporation_info") == "block" ){
				view = registry1.byId("view_corporation_info");
				transpage = $("#corinfo_back_para").val();
			}
			//进行页面转场
			view.performTransition("#"+transpage,-1,"none");
		}
	}
	/**
	 * 当PhoneGap应用程序被恢复到前台运行的时候触发此事件。
	 */
	function onResume(){ 
		//检查版本更新
		checkVersion();
	} 
	/**
	 * 退出程序操作
	 */
	function doExit(){
		//如果checkbox是选中状态就设置本地的参数
		if($("#exitpara").attr("checked") =="checked" || $("#exitpara").attr("checked") ==true)
			window.localStorage[APP_ID+"_exit"] = "noask";
		navigator.app.exitApp();
	}
	/**
	 * 显示一个定制的警告框
	 */
	function showAlert(info) {
		if(RUN_MODE == "web")
			alert(info);
		else
			navigator.notification.alert(info,//显示信息
	                                     alertDismissed,//警告被忽略的回调函数
	                                     LANG_REMIND//标题
	                                     );
	}
	function alertDismissed() {
	    
	}
	/**
	 * 显示一个定制的确认对话框
	 */
	var ios_downurl = "";
	function showConfirm(info, title, downurl) {
		ios_downurl = changeUndefinedToEmpty(downurl);
		if(RUN_MODE == "web")
			confirm(info);
		else{
			//如果url不为空说明是下载的弹窗
			if(ios_downurl !="")
				navigator.notification.confirm(info,//显示信息
	                                           onConfirmUpdate,//按下按钮后触发的回调函数，返回按下按钮的索引
	                                           title,//标题
	                                           UPDATE_BUTTON//按钮名称
	                                           );
			else
				//否则是一般的confirm
				navigator.notification.confirm(info,//显示信息
	                                           onConfirmCommon,//按下按钮后触发的回调函数，返回按下按钮的索引
	                                           title,//标题
	                                           UPDATE_BUTTON_COMM
	                                           );
		}
	}
	/**
	 * 应用更新弹窗后点击每个按钮操作函数
	 * @param button
	 */
	function onConfirmUpdate(button) {
		if (button == 1){
			//获取当前客户端的时间戳，并缓存到本地如果下次打开判断24小时后再打开
			var timestamp = Date.parse(new Date());
			window.localStorage[APP_ID+"_version_update_time"] = timestamp;
			openURL(ios_downurl);
		}	
		if (button == 2)
			window.localStorage[APP_ID+"_version_update"] = "noask";
		if (button == 3){
			//获取当前客户端的时间戳，并缓存到本地如果下次打开判断24小时后再打开
			var timestamp = Date.parse(new Date());
			window.localStorage[APP_ID+"_version_update_time"] = timestamp;
		}
			
	}
	/**
	 * 删除需求
	 */
	function onConfirmCommon(button) {
		if (button == 1)
			doDelReqreplay();
	}
	/**
	 * 检查网络状态
	 */
	function checkConnection() {
		//由于该方法有的时候返回值存在错误导致程序死掉
		//if(RUN_MODE == "web")
			return 1;
		/*var networkState = navigator.connection.type;
		var states = {};
	    states[Connection.UNKNOWN] = 'Unknown connection';
	    states[Connection.ETHERNET] = 'Ethernet connection';
	    states[Connection.WIFI] = 'WiFi connection';
	    states[Connection.CELL_2G] = 'Cell 2G connection';
	    states[Connection.CELL_3G] = 'Cell 3G connection';
	    states[Connection.CELL_4G] = 'Cell 4G connection';
	    states[Connection.NONE] = 'No network connection';
	    device_network = states[networkState];
	    //如果网络没有连接，就提示并退出程序
	    if (states[networkState] == 'No network connection')
	        return -1;*/
	}
	
	//用户点击菜单按钮的时候进入到“更多”
	function onMenuKeyDown(){
		var view = registry1.byId("index"); // destination view
		view.performTransition("#more");
	}
	
	/*
	 * 设置选中checkbox方法
	 */
	function setCheckBox(id){
		$("#"+id).attr("checked",!$("#"+id).attr("checked"));
	}
	
	/**
	 * 设置选中radio 方法
	 */
	function setRadio(name,id){
		/*var checked = $("#"+id).attr("checked");
		var is_checked_id = changeUndefinedToEmpty($("input[name='"+name+"'][checked]").val());  //选择被选中Radio的Value值
		if(is_checked_id!="" && id != is_checked_id)
			$("#"+is_checked_id).attr("checked",undefined);
		//$("input:radio[name='"+name+"']").attr("checked",false);*/
		$("#"+id).attr("checked",!$("#"+id).attr("checked"));
	}
	
	/**
	 *每十分钟分钟在后台取一次数据
	 */
	window.setInterval(function(){
		               type=null;
	                   initDataNewList();//初始化最新项目
	                   initNewNotice();//加载最新通知
	                   initNewZkms();//加载最新通知
	                   
	                   },600000);

	/**
	 *加载启动画面
	 */
	$(document).ready(function(){
		
		//加载启动画面
			
		$("#preloader").show();
	    $("#preloaderContent").css("visibility" , "visible");
	    var n = Math.floor(Math.random()* LOADING_CONFIG.length  + 1) - 1;
	    $("#loading_content").text(LOADING_CONFIG[n]);
	   //dojo ready后将启动画面隐藏  
	    require
	    ([
	      "dojo/ready",
	      "dojo/_base/fx",
	      "dojo/_base/html",
	      "dojo/dom-style"
	      ], function(ready){
	           ready(function(){
	        	   Preloader.hide();
	           }
	         )}
	     );
	    //启动画面对象
	    var Preloader =
	    {	hide : function()
	        {
	            var hideAction = function() {
	                dojo.fadeOut({
	                             node:"preloader",
	                             duration:2000,
	                             onEnd: function() {
	                             	dojo.style("preloader", "display", "none");
	                             	}
	                             }).play();
	            }
	            setTimeout(hideAction, 500);
	        }
	    }        
	});
	
	/**
	 * 应用的公共js函数
	 */
	 
	/**
	 *根据时间查来生成提示的天数
	 */
	function replaceDate(time,days){
		//根据服务器时间将时间进行计算
		var day_c = compareDate(curdate,time);
		if(days == "days"){
			return day_c;
		}	
		else{
			var desc = "";
			if(day_c < 0){
				if(day_c == -1)
					desc=YESTODAY;	
				else if(day_c == -2)
					desc=TWODAYSAGO;
				else 	
					desc= -day_c+DAYSAGO;		
			}else if(day_c == 0)
				desc= TODAY;	
			else if(day_c == 1)
				desc= TOMORROW;	
			else if(day_c == 2)
				desc= AFTERTOMORROW;	
			else 
				desc= ALSO +day_c + DAY;		
			return desc;
		}
	}

	/**
	 *比较日期函数用法：将日期月今天进行比较得出天数的差
	 */
	function  compareDate(curdate,date2){	
		var curdate_array = curdate.split("-");
		var date2_array = date2.split("-");
		var dt1 = new Date();
		dt1.setFullYear(curdate_array[0]);
		dt1.setMonth(curdate_array[1]);
		dt1.setDate(curdate_array[2]);
		var dt2 = new Date();
		dt2.setFullYear(date2_array[0]);
		dt2.setMonth(date2_array[1]);
		dt2.setDate(date2_array[2]);
		var curtimes = dt1.getTime();
		var querytimes = dt2.getTime();	
		var times = (querytimes - curtimes)/86400000;
		return times.toFixed(0) ;	
	}
	
	/**
	 *转换日期：将yyyy-mm-dd转换成 mm-dd
	 */
	function  changeDate(date){	
		//进行格式化
		date = changeUndefinedToEmpty(date);
		//如果日期不为空
		if(date !=""){
			//去点时分秒
			date = date.substring(0,10);
			var date_array = date.split("-");
			date = date_array[1]*1 + MONTH + date_array[2]*1 + DAYTIME;
		}
		return date;	
	}
	/**
	 * 转换对象将 undefined转化成 ""
	 */
	function changeUndefinedToEmpty(obj){
		if(typeof(obj) =="undefined" || obj ==null )
			obj ="";	
		return obj;	
	}
	
	
	/*JSON合并函数*/
	function extend(desc,src,override){
		if(src instanceof Array){
			for(var i=0;i<src.length;i++){
				extend(desc,src[i],override);
			}
			for(var i in src){
				if(override  || !(i in desc))
					desc[i] = src[i];
			}
		}
		return desc;
		
	}
	
	/**
	 *在应用中打开链接
	 */
	function openURL(url){
		if(url =="")
			return false;
		if(url.substring(0,4) !="http")
			url ="http://" + url;
		//如果是在页面上进行测试
		if(RUN_MODE == "web")
			window.open(url, "_blank");
		else{
			//iOS 使用该方法
			if (device_platform.indexOf("iphone") > -1 || device_platform.indexOf("ios") > -1 || device_platform.indexOf("ipad") > -1) {
				//在webview中开超链接
				//window.open(url, "_blank");
				//在safari中打开链接
				window.open(url, "_system");
			} else if (device_platform.indexOf("android") > -1) {
				//android 使用该方法
				navigator.app.loadUrl(url, { openExternal:true } ); 
			}
		}
    }
	
	/**
	 *android拨号
	 */
	function dial(num){
		window.location.href="tel:0"+num;
	}
    function dial1(num){
		window.location.href="tel:"+num;
	}
    /**
	 *將ScrollableView的位置还原
	 */
    function setViewTop(id){
		 $("#" + id +" .mblScrollableViewContainer").css("-webkit-transform","translate3d(0px, 0px, 0px)");	
	}
    /**
	 *获取view页面的css样式中的display
	 */
    function getViewDsiplay(id){
    	return   $("#"+id).css("display")
	}
    /**
     * 改变背景
     */
    function changeBackground(){
    	var serviceList_str = changeUndefinedToEmpty(window.localStorage[APP_ID+"_serviceList"]);
		//如果本地存储的数据不为空
		if(serviceList_str !=""){
			var	serviceList_json = JSON.parse(serviceList_str);
			//获取随机数
			var n = Math.floor(Math.random()* serviceList_json.length  + 1) - 1;
			//随机改变背景
			$.each(serviceList_json,function(i,e){
				/*if(n==i){
					var h =  $("#service_" + (i+1)).height();
					if(i!=2 && i!=5 && i!=8 && i!=11 && i!=14){
						$("#service_" + (i+1)).animate({height:"0px"},500);
					}else{
						$("#service_" + (i+1)).animate({width:"0px"},500);
						
					}
					$("#service_" + (i+1) + " .title").hide(500);
					$("#service_" + (i+1) + " .mblImageIcon").hide(500);
					
					setTimeout(	function() {										
					//如果不是白色自他就说明已经改变来背景
					if($("#service_" + (i+1) + " .title").css("color") !="rgb(255, 255, 255)"){			
						$("#service_" + (i+1) + " .title").css("color","#fff");
						
						setTimeout(	function() {
							
							if(i!=2 && i!=5 && i!=8 && i!=11 && i!=14)
								$("#service_" + (i+1)).animate({height:(h_iconItem+6)+"px"},500);
							else
								$("#service_" + (i+1)).animate({width:(h_iconItem+6)+"px"},500);
							
							$("#service_" + (i+1)).css("background","");
							$("#service_" + (i+1)).addClass("color"+(i+1));
							$("#service_" + (i+1) + " .mblImageIcon").show(500);
							$("#service_" + (i+1) + " .title").show(500)
							
						}, 1000);	
					}else{
						
						//$("#service_" + (i+1)).hide(1000);
						//$("#service_" + (i+1) ).css("visibility","hidden");
						//$("#service_" + (i+1) + ".mblIconMenuItemAnchor").hide(1000);
						//var icon = DATA_ROOT +'data/uploads/'+e.show;
						
						var icon = "images/service_bg" + (i+1) + ".png";
						$("#service_" + (i+1)).css("background","url("+icon+")")
						$("#service_" + (i+1)).css("background-size","cover");
						$("#service_" + (i+1) + " .title").css("color","#fffffe");
						
						//$("#service_" + (i+1)).css("transition","width 2s,height 2s");
						//$("#service_" + (i+1)).css("-webkit-transfrom","rotate(360dep)");
						//$("#service_" + (i+1)).show(1000);
						setTimeout(	function() {
							$("#service_" + (i+1) + " .title").show();
							if(i!=2 && i!=5 && i!=8 && i!=11 && i!=14)
								 $("#service_" + (i+1)).animate({height:(h_iconItem+6)+"px"},500);
							else
								$("#service_" + (i+1)).animate({width:(h_iconItem+6)+"px"},500);
								
							}, 1000);	
						}
					}, 1000);	
					
					
				}*/
				if(n==i){
					
					$("#service_" + (i+1) + " .title").hide();
					$("#service_" + (i+1) + " .mblImageIcon").hide();							
					//如果不是白色自他就说明已经改变来背景
					if($("#service_" + (i+1) + " .title").css("color") !="rgb(255, 255, 255)"){			
							$("#service_" + (i+1) + " .title").css("color","#fff");
							$("#service_" + (i+1)).css("background","");
							$("#service_" + (i+1)).addClass("color"+(i+1));
							$("#service_" + (i+1) + " .mblImageIcon").show();
							$("#service_" + (i+1) + " .title").removeClass("title1");
							$("#service_" + (i+1) + " .title").show()
						
					}else{
						
						var icon = "images/service_bg" + (i+1) + ".png";
						$("#service_" + (i+1)).css("background","url("+icon+")")
						$("#service_" + (i+1)).css("background-size","cover");
						$("#service_" + (i+1) + " .title").css("color","#000");
						
						//$("#service_" + (i+1)).css("transition","width 2s,height 2s");
						//$("#service_" + (i+1)).css("-webkit-transfrom","rotate(360dep)");
						//$("#service_" + (i+1)).show(1000);
						$("#service_" + (i+1) + " .title").addClass("title1");
						$("#service_" + (i+1) + " .title").show();
					}
				}
			});
    	//:
		}
    }
   
  //两秒钟执行切换操作
	function startChageBacground(){
		var a = window.setInterval(function(){
			if(getViewDsiplay("view_service_index") == "block" ){
				changeBackground();
			}else
				window.clearInterval(a);
	    },2000);
	}

   // background-size:cover
  //添加或者修改json数据
   /* function setJson(jsonStr,name,value){
        if(!jsonStr)jsonStr="{}";
        var jsonObj = JSON.parse(jsonStr);
        jsonObj[name] = value;
        return JSON.stringify(jsonObj) 
    }
    //删除数据
    function deleteJson(jsonStr,name)
    {
        if(!jsonStr)return null;
        var jsonObj = JSON.parse(jsonStr);
        delete jsonObj[name];
            return JSON.stringify(jsonObj) 
    }
     
    //生成测试
    var myjsonStr = setJson(null,"name","aaa");
    alert(myjsonStr);
    //添加测试
    myjsonStr = setJson(myjsonStr,"age",18);
    alert(myjsonStr);
    //修改测试
    myjsonStr = setJson(myjsonStr,"age",20);
    alert(myjsonStr);
    //删除测试
    myjsonStr = deleteJson(myjsonStr,"age");
    alert(myjsonStr);
    */
