	var registry1;
	var parser1;
	//得到服务器时间
	getCurDate();
	
    function getCurDate(){
    	$.ajaxSettings.async = false;
        $.get(DATA_ROOT +"gettime.php",function(time){
              curtime = time;
              curdate = curtime.substring(0,10);
        });
    }
	KEY = hex_md5("dejax_declare_"+curdate);
	//首先从本地存储中获取数据
	var index_title = window.localStorage[APP_ID+"_index_title"];
	var credit_title = window.localStorage[APP_ID+"_credit_title"];
	index_title = changeUndefinedToEmpty(index_title);
	credit_title = changeUndefinedToEmpty(credit_title);
	
	//从服务器中的配置文件中读取首页和微信的文字图是微信
    //if(cs_phone ==''){
	$.getJSON(DATA_ROOT + "apps/foryou/data_config.php?key=" + KEY, function(
			response) {
		index_title = response.index_title;
		credit_title = response.credit_title;
		window.localStorage[APP_ID+"_index_title"] = index_title;
		window.localStorage[APP_ID+"_credit_title"] = credit_title;
		
	});
	if(index_title == "")
		index_title = '<span style="display:block; font-size:26px;color:#ff6600;font-weight: normal;" id="apptitle">'+APP_NAME+'</span>';
	if(credit_title == "")
        credit_title = '<img src="images/aboutcredit_title.png" style="max-width:100%;"/><div style="clear: both;"></div>';
	


	require([
		"dojo/_base/connect",
		"dojo/_base/window",
		"dojo/dom-construct",
		"dojo/dom",
		"dojo/ready",
		"dijit/registry",
		"dojox/mobile/ProgressIndicator",
		"dojox/mobile/ListItem",
		"dojox/mobile/parser",
		"dojox/mobile/TransitionEvent",
		"dojo/_base/Deferred",
		"dojox/mobile",
		"dojox/mobile/SimpleDialog",
		"dojox/mobile/ScrollableView",
		"dojox/mobile/SearchBox",
		"dojox/mobile/ContentPane",
		"dojox/mobile/Button",
		"dojox/mobile/RadioButton",
		"dojox/mobile/TabBar",
		"dojox/mobile/IconMenu",
		"dojox/mobile/Rating",
		"dojox/mobile/TextArea",
		"dojox/mobile/Opener",
		"dojox/mobile/SearchBox",
		"dijit/_base/manager",  // dijit.byId
		//"dojox/mobile/Container",
		///"dojox/mobile/SwapView",
		//"dojox/mobile/Carousel",
		//"dojo/data/ItemFileReadStore",
		//"dojox/mobile/DataCarousel",
		"dojox/mobile/compat"
		
	], function(connect, win, domConstruct,dom, ready, registry, ProgressIndicator, ListItem, parser,TransitionEvent, Deferred,ItemFileReadStore){
		registry1 = registry;
		parser1 = parser;
		//var prog = ProgressIndicator.getInstance();//创建正在加载的对象
		var prog = new ProgressIndicator({size:20});
		
		
		/*
		 *生成主题列表 
		 */
		initTheme = function(){
			//每次加载的时候进行网络连接的判断
           
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
            var noticetheme_div =  registry.byId("noticetheme");
			var container = noticetheme_div.containerNode;
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			var url = DATA_ROOT+"apps/declare/Public/data/project_theme.gzip.php?key="+KEY;
			dojo.xhrGet({
				url: url,
				timeout:8000,
				load: function(response, ioArgs){
					response_compress = base64decode(response);
					//将得到的json结果集赋值给一个全局变量
					response = eval("("+zip_inflate(response_compress)+")");
					var cell1 ='<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\' moveTo:"#"\' onClick=\'onQuery("")\'>'+ALL+'</li>';
					var cell2 ="";
					for( var i =0;i<response.length;i++){	
						if(typeof(response[i].title) !="undefined"  && response[i].title !="" && response[i].title !=null)
							cell2  += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\' moveTo:"#"\' onClick=\'onQuery("noticetheme='+ $.trim(response[i].title)+'")\'>'+response[i].title+'</li>';
					}
					container.innerHTML = cell1 + cell2;
					parser.parse(container);
					progStop();
				},
				error: function(response, ioArgs){
                        if($("#noticetheme li").length > 0){
                            progStop();
                        return false;
                        }
					var innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/ style="max-width:50%"></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick="initTheme()">'+RELOAD+'</span></div></div>';
					container.innerHTML = innerhtml
					parser.parse(container);
					progStop();//加载的图片停止
				}	
			});
		}
		
		/*
		 *进入最新项目列表
		 */	
		var newlist = null;
		var newlist_MD5 ="";
		gotoNew = function(handle){	
			$("#title_bottom").text(ORDERBY_NOTICE_PUBTIME);
			//调用方法将位置进行还原
			setViewTop("view_data_new");		
			win.body().appendChild(prog.domNode);
			prog.start();
			//将首页的提示清空
			$("#newcount").html('');
			//如果获取的数据不为空就将最新项目的MD5保存到本地
			if(newlist !=null){
				window.localStorage[APP_ID+"_datanew_list_MD5"] = JSON.stringify(newlist_MD5);
				window.localStorage[APP_ID+"_datanew_list"] = JSON.stringify(newlist);
			}
			if(handle == "first")
				progStop();
			else
				initDataNewList();
		}
		
		/*
		 *初始化最新项目，并将最新的数据存储到本地存储中
		 */
		 initDataNewList = function(handle){
			 $("#showinfo_datanew").html("");
			//每次加载的时候进行网络连接的判断
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
            var view_new = registry.byId("data_new_list"); // destination view
			var container =  view_new.containerNode;
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			var innerhtml ="";
			var url = DATA_ROOT+"apps/declare/Public/data/data_new.gzip.php?key="+KEY;
			dojo.xhrGet({
				url: url,
				timeout:8000,
				//sync:true,
				//handleAs: "json",
				load: function(response, ioArgs){
					
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					//将数据进行MD5转码
					var response_MD5 = hex_md5(response_compress);	
					//将数据转换成JSON格式
					response = JSON.parse(zip_inflate(response_compress));
					if(response !=null && response !=""){
						//从本地存储中获取
						var datanew_list = window.localStorage[APP_ID+"_datanew_list"];
						var datanew_list_MD5_old = window.localStorage[APP_ID+"_datanew_list_MD5"];
						datanew_list_MD5_old = changeUndefinedToEmpty(datanew_list_MD5_old);
						if(datanew_list_MD5_old !="")
							//去掉前后的引号
							datanew_list_MD5_old = datanew_list_MD5_old.substr(1,datanew_list_MD5_old.length -2);
						//如果当前操作是刷新
						if(handle =="refresh" ){
							//得到服务器时间
							getCurDate();
							//如果原来存在数据
							if($("#view_data_new ul li").length >0){
								//如果上次存储的MD5和现在获取的不一致就在首页进行提示
								if(datanew_list_MD5_old !="" && datanew_list_MD5_old != response_MD5  )
									$("#showinfo_datanew").html(HAS_REFRESH + response.listdata.length + SOME_NEWPROJECT)	;
								else 
									$("#showinfo_datanew").html(NO_NEWPROJECT);	
								$("#showinfo_datanew").fadeIn();
								setTimeout(	function() {
									$("#showinfo_datanew").fadeOut(5000);
								}, 2000);
									
							}else
								//调用方法将位置进行还原
								setViewTop("view_data_new");
						}else{
							//如果上次存储的MD5和现在获取的不一致就在首页进行提示
							if(datanew_list_MD5_old!="" && datanew_list_MD5_old != response_MD5)
								//$("#newcount").html('<span   class="jq-badge index">!</span>');	
								$("#newcount").html('!');	
						}
						innerhtml  = doResultForList("data_new",response);//调用生成列表的函数;	
						container.innerHTML =innerhtml;
						parser.parse(container);
						progStop();	
						newlist_MD5 = response_MD5;
					   	newlist = response; 	
					}			
				},
				error: function(response, ioArgs){
					
					//如果当前操作是刷新并且已经有数据的情况下
					if(handle =="refresh" ){
						if( $("#view_data_new ul li").length >0){
							$("#showinfo_datanew").html(NO_NEWPROJECT)	
							progStop();
							return false;	
						}else {
							$("#showinfo_datanew").html(desc);	
						}
						$("#showinfo_datanew").fadeIn();
						progStop();
						setTimeout(	function() {
							$("#showinfo_datanew").fadeOut(5000);
						}, 2000);	
					}
					if( $("#view_data_new ul li").length >0){
						progStop();
						return false;	
					}
					innerhtml= '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'initDataNewList("refresh")\'>'+RELOAD+'</span></div></div>';
					container.innerHTML =innerhtml;
					parser.parse(container);
					progStop();
				}	
			});	
		}

		//加载即将截止项目列表信息		
		gotoEnd = function(){	
			$("#title_bottom").text(ORDERBY_TIMENODE);
			//调用方法将位置进行还原
			setViewTop("view_data_end");		
			win.body().appendChild(prog.domNode);
			prog.start();	
			//如果li的length大于0说明即将截止已经渲染了，就不再从服务器上取数据
			if($("#view_data_end ul li").length >0){
				progStop();
				return ;
			}
			initDataEndList();
		}
		//生成即将截止项目列表
		 initDataEndList = function(handle){
			 
			 $("#showinfo_dataend").html("");
			//每次加载的时候进行网络连接的判断
             //网络未连接
             if(checkConnection() == -1){
             	desc = NO_NETWORK;
             }
			var view_end = registry.byId("data_end_list"); // destination view
			var container =  view_end.containerNode;
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			var innerhtml ="";
			var url = DATA_ROOT+"apps/declare/Public/data/data_end.gzip.php?key="+KEY;
			dojo.xhrGet({
				url: url,
				timeout:8000,
				//sync:true,
				//handleAs: "json",
				load: function(response, ioArgs){
					//alert(zip_inflate(response_compress));
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					//将数据进行MD5转码
					var response_MD5 = hex_md5(response_compress);	
					//将数据转换成JSON格式
					//response = JSON.parse(zip_inflate(response_compress));
					response = eval("("+zip_inflate(response_compress)+")");
					if(response !=null && response !=""){
						//如果当前操作是刷新
						if(handle =="refresh" ){
							//得到服务器时间
							getCurDate();
							//从本地存储中获取
							var dataend_list_MD5_old = window.localStorage[APP_ID+"_dataend_list_MD5"];
							//去掉前后的引号
							dataend_list_MD5_old = dataend_list_MD5_old.substr(1,dataend_list_MD5_old.length -2);
							//如果原来存在数据
							if($("#view_data_end ul li").length >0){
								//如果上次存储的MD5和现在获取的不一致就在首页进行提示
								if(dataend_list_MD5_old != response_MD5  )
									$("#showinfo_dataend").html(HAS_REFRESH+response.listdata.length+SOME_NEWPROJECT)	;
								else 
									$("#showinfo_dataend").html(NO_NEWPROJECT)	;
								$("#showinfo_dataend").fadeIn();
								setTimeout(	function() {
									$("#showinfo_dataend").fadeOut(5000);
								}, 2000);
							}else
								//调用方法将位置进行还原
								setViewTop("view_data_end");
						}
					    innerhtml = doResultForList("data_end",response);//调用生成列表的函数;
						var view_end = registry.byId("data_end_list"); // destination view
						var container =  view_end.containerNode;
						container.innerHTML = innerhtml;
						date_end_old = innerhtml;
						parser.parse(container);
						progStop();
						//如果获取的数据不为空就将最新项目的MD5保存到本地
						window.localStorage[APP_ID+"_dataend_list_MD5"] = JSON.stringify(response_MD5);
						window.localStorage[APP_ID+"_dataend_list"] = JSON.stringify(response);
					}	
						
				},
				error: function(response, ioArgs){
					
					//如果当前操作是刷新并且已经有数据的情况下
					if(handle =="refresh" ){
						if( $("#view_data_end ul li").length >0){
							$("#showinfo_dataend").html(NO_NEWPROJECT)	
							progStop();
							return false;	
						}else{
							$("#showinfo_dataend").html(desc)	
						}
						$("#showinfo_dataend").fadeIn();
						progStop();
						setTimeout(	function() {
							$("#showinfo_dataend").fadeOut(5000);
						}, 2000);	
					}
					if( $("#view_data_end ul li").length >0){
						progStop();
						return false;	
					}	
					innerhtml= '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'initDataEndList("refresh")\'>'+RELOAD+'</span></div></div>';
					container.innerHTML =innerhtml;
					parser.parse(container);
					progStop();
				}	
			});	
		}
		 
		 /**
		  *刷新项目列表
		  */
		
		 refreshProject = function(){
			 if(getViewDsiplay("view_data_new") == "block")
				 initDataNewList('refresh');
			 else
				 initDataEndList("refresh")
		 }
		 
		 /*
		 *加载最新申报通知，并将最新的数据存储到本地存储中
		 */
		var noticelist =null;
		var noticelist
		var max_noticeid = 0; 
		var notice_totall_count = 0;
		var p = 1;
		
		initNewNotice = function(handel){
			//如果是点击首页的链接来进行查询最新的资讯
			if(handel !="loadmore")
				p=1;
			if(p>1)
				$(".loadmore:eq(0)").text(LOADING);
			//首先从本地存储中获取到最新资讯
			var noticelist_old = changeUndefinedToEmpty(window.localStorage[APP_ID+"_noticelist"]);			
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			
			//每次加载的时候进行网络连接的判断
             var desc = ERROR_NETWORK_OR_DATA;
             //网络未连接
             if(checkConnection() == -1){
             	desc = NO_NETWORK;
             }
			var notice_ul = registry.byId("notice_ul"); // destination view	
			var container =  notice_ul.containerNode;
			//从本地存储中获取到上次更新的时候最大的通知id
			max_noticeid = changeUndefinedToEmpty(window.localStorage[APP_ID+"_noticeid"]);
			var notice_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_ids"]);//前面20个通知id
			var notice_new_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_new_ids"]);//最新通知id
			var notice_no_read_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_no_read_ids"]);;//未读通知id
			var innerhtml = "";
			var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=getNotice";
			//alert(url);
			//alert(url + "&noticeid="+max_noticeid + "&nextpage="+notice_nextpage + "&perpage="+PERPAGE + "&notice_no_read_ids="+notice_no_read_ids + "&p="+p + "&notice_ids="+notice_ids + "&notice_new_ids="+notice_new_ids)
			dojo.xhrGet({
				url: url,
				timeout:8000,
				content:{
						noticeid:max_noticeid,
						nextpage:notice_nextpage,
						perpage:PERPAGE,
						notice_no_read_ids:notice_no_read_ids,
						p:p,//分页参数
						notice_ids:notice_ids,
						notice_new_ids:notice_new_ids
						},
				//sync:true,
				//handleAs: "json",
				load: function(response, ioArgs){
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					//alert(zip_inflate(response_compress))
					response = JSON.parse(zip_inflate(response_compress));
					//alert(zip_inflate(response_compress))
					if(response !=null && response !=""){
						$("#data_notice_new .mblHeadingDivTitle").text(NEW_INFOMATION);
						notice_totall_count = response.count;
						noticelist = response.noticelist;
						//新通知的条数
						var count_new = response.count_new;
						count_new = changeUndefinedToEmpty(count_new);
						//加载第一页的时候将最大id保存到本地存储中
						if(p==1){
							
							//获取通知的最大id
							max_noticeid = changeUndefinedToEmpty(response.maxid);
							//将id组合存储在本地存储中
							var notice_ids = changeUndefinedToEmpty(response.notice_ids);
							//将最大通知id换缓存到本地
							window.localStorage[APP_ID+"_noticeid"]   = max_noticeid;
							//最前面20个通知id
							window.localStorage[APP_ID+"_notice_ids"] = changeUndefinedToEmpty(response.notice_ids);
							//最新通知id
							window.localStorage[APP_ID+"_notice_new_ids"] = changeUndefinedToEmpty(response.notice_new_ids);
							//未读通知id
							if(notice_no_read_ids == "")
								window.localStorage[APP_ID+"_notice_no_read_ids"] = changeUndefinedToEmpty(response.notice_no_read_ids);
							
						}
						//如果是加载更多的数据
						if(p>1){
							//将两个列表转换成字符串
							//分别去掉字符串前面[和后面的 ]
							noticelist_old = noticelist_old.substr(0,noticelist_old.length -1);
							noticelist = JSON.stringify(noticelist);
							noticelist = noticelist.substr(1,noticelist.length -1);
							//进行组合
							noticelist = $.trim(noticelist_old) + ","+$.trim(noticelist);
							//转换成json
							noticelist = JSON.parse(noticelist);
						}
						//将最新通知列表的json格式缓存到本地
						window.localStorage[APP_ID+"_noticelist"] = JSON.stringify(noticelist);
						
						//如果获取到了最新的通知
						if( count_new !="" && count_new  > 0){
							//首页中提醒最新通知的条数
							if(count_new  > 30)
								//如果通知条数大于30条就提示“很多”
								//$("#noticecount").html('<span   class="jq-badge index">很多</span>');
								$("#noticecount").html(MANY);
							else
								//少于30条就提示具体的数量
								//$("#noticecount").html( '<span   class="jq-badge index">'+count_new+'</span>');
								$("#noticecount").html("今日:"+ count_new );
						}
						$.each(noticelist,function(i,e){
							innerhtml += ' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"data_notice_content", noArrow:true,transition:"none"\' onClick=\'gotoInfoContent('+e.id+',"'+e.title+'","data_notice_new")\' style="color:#000"><div class="title">';
							if(e.type =="new")
								innerhtml += '<span style="width:90%;float:left"> '+ e.title +'</span><img src="images/new.gif" style="float:right;text-align: left;" id="img_'+e.id+'"></div>';
							else	
								innerhtml += e.title +'</div>';
							innerhtml += ' <sapn class="pubdate">'+e.pubdate +'&nbsp;&nbsp;&nbsp;&nbsp;'+SOURCE+e.source+'</span></li>';
						});
													
							
					}else
						innerhtml ="<p>"+NO_DATA+"</p>";
					innerhtml += '<div style="text-align:center;"><button data-dojo-type="dojox.mobile.Button"  onClick="initNewNotice(\'loadmore\')" class="loadmore" />'+LOAD_MORE_INFO+'</button></div>';
					container.innerHTML = innerhtml ;
					parser.parse(container);
					progStop();
					//如果总页数大于p的总数就显示分页框
					if(response.pageCount > p){
						$(".loadmore:eq(0)").html(LOAD_MORE_INFO);
						$(".loadmore:eq(0)").show();
						p++;
					}else
						$(".loadmore:eq(0)").hide();
						
				},
				error: function(response, ioArgs){
						
					if(typeof($("#notice_ul div").html()) !="undefined"){
						//网络异常的时候进行提示
						show_progress_indicator('dlg_progress',	'progress_indicator_container',desc);
						setTimeout(	function() {
							hide_progress_indicator("dlg_progress");
						}, 1000);
					}	
					//如果是第一次加载
					if(p==1){
						if($("#notice_ul li").length > 0){
							progStop();
							return false;
						}
						innerhtml= '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'initNewNotice()\'>'+RELOAD+'</span></div></div>';
						container.innerHTML =innerhtml;
						parser.parse(container);
						progStop();
					}else{
						//如果是加载更多错误
						$(".loadmore:eq(0)").html(LOAD_MORE_INFO);
						$(".loadmore:eq(0)").show();
					}
				}	
			});
		}
		
			/*
			 *进入查看最新的申报i通知
			 */
			var first = 0;
			gotoNoticeList = function(){

				$("#btn_refresh_new_notice").show();
				$("#span_title_top").removeClass("top");
				$("#span_title_bottom").text(ORDERBY_PUBTIME);
				//调用方法将位置进行还原
				setViewTop("data_notice_new");
				$(".loadmore:eq(0)").html(LOAD_MORE_INFO);
				//if(first == 0)
					//progStop();
				//else
					initNewNotice();
				//如果用户查看了最新通知那么
				//将最大通知id换缓存到本地
				/*if(noticelist !=null && noticelist != false){
					window.localStorage[APP_ID+"_noticeid"] = max_noticeid;
					//将最新通知列表的json格式缓存到本地//如果最新的通知超过了100条，就不存储最新的数据
					if(noticelist.length  < 100 )
						window.localStorage[APP_ID+"_noticelist"] = JSON.stringify(noticelist);
				}*/
				//将最新提醒清0
				//$("#noticecount").html( '');
				//first = 1;
			} 
			/*
			 * 渲染近期热点最新资讯列表
			 */
			var noticelist_old_hot ="";
			initHotNotice= function(handel){
				$("#btn_refresh_new_notice").hide();
				$("#span_title_top").addClass("top");
				$("#span_title_bottom").text(ORDERBY_VIEWCOUNT);
				//如果是点击首页的链接来进行查询最新的资讯
				if(handel !="loadmore"){
					p=1;
				//调用方法将位置进行还原
					setViewTop("data_notice_hot");	
				}else if(p>1)
					$(".loadmore:eq(1)").text(LOADING);
		
				win.body().appendChild(prog.domNode);
				prog.start();//显示正在加载的状态
				
				//每次加载的时候进行网络连接的判断
	             var desc = ERROR_NETWORK_OR_DATA;
	             //网络未连接
	             if(checkConnection() == -1){
	             	desc = NO_NETWORK;
	             }
				var notice_ul = registry.byId("notice_hot_ul"); // destination view	
				var container =  notice_ul.containerNode;

				var innerhtml = "";
				var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=getHotNotice";
				dojo.xhrGet({
					url: url,
					content:{
						perpage:PERPAGE,
						p:p
						},
					timeout:8000,
					load: function(response, ioArgs){
						//将获取到的压缩及转码的内容进行转换
						response_compress = base64decode(response);
						//alert(zip_inflate(response_compress))
						response = JSON.parse(zip_inflate(response_compress));
						if(response !=null && response !=""){
							notice_totall_count = response.count;
							noticelist = response.noticelist;
						}
						$("#data_notice_hot .mblHeadingDivTitle").text(NEW_INFOMATION);
						if(notice_totall_count !=0)	{
							if(noticelist_old_hot !=""  && p > 1){
								//将两个列表转换成字符串
								//分别去掉字符串前面[和后面的 ]
								noticelist_old_hot = noticelist_old_hot.substr(0,noticelist_old_hot.length -1);
								noticelist = JSON.stringify(noticelist);
								noticelist = noticelist.substr(1,noticelist.length -1);
								//进行组合
								noticelist = $.trim(noticelist_old_hot) + ","+$.trim(noticelist);
								//转换成json
								noticelist = JSON.parse(noticelist);
							}	
							
							$.each(noticelist,function(i,e){
								innerhtml += ' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"data_notice_content", noArrow:true,transition:"none"\' onClick=\'gotoInfoContent('+e.id+',"'+e.title+'","data_notice_hot")\' style="color:#000"><div class="title">';
								if(e.type =="new")
									innerhtml += '<span style="width:90%;float:left"> '+ e.title +'</span><img src="images/new.gif" style="float:right;text-align: left;" id="img_'+e.id+'"></div>';
								else	
									innerhtml += e.title +'</div>';
								innerhtml += ' <sapn class="pubdate">'+VIEWCOUNT + COLON + e.viewcount+'&nbsp;&nbsp;&nbsp;&nbsp;'+e.pubdate +'&nbsp;&nbsp;&nbsp;&nbsp;'+SOURCE+e.source+'</span></li>';
							});
							innerhtml += '<div style="text-align:center;"><button data-dojo-type="dojox.mobile.Button"  onClick="initHotNotice(\'loadmore\')" class="loadmore"/>'+LOAD_MORE+'</button></div>';
							noticelist_old_hot = JSON.stringify(noticelist);							
								
						}else
							innerhtml ="<p>"+NO_DATA+"</p>";
						container.innerHTML = innerhtml ;
						parser.parse(container);
						progStop();
						//如果总页数大于p的总数就显示分页框
						if(response.pageCount > p){
							$(".loadmore:eq(1)").html(LOAD_MORE);
							$(".loadmore:eq(1)").show();
							p++;
						}else
							$(".loadmore:eq(1)").hide();
							
					},
					error: function(response, ioArgs){
						if($("#notice_hot_ul li").length > 0){
							progStop();
							return false;
						}
						if(typeof($("#notice_hot_ul div").html()) !="undefined"){
							//网络异常的时候进行提示
							show_progress_indicator('dlg_progress',	'progress_indicator_container',desc);
							setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 1000);
						}	
						//如果是第一次加载
						if(p==1){
							innerhtml= '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'initHotNotice()\'>'+RELOAD+'</span></div></div>';
							container.innerHTML =innerhtml;
							parser.parse(container);
							progStop();
						}else{
							//如果是加载更多错误
							$(".loadmore:eq(1)").html(LOAD_MORE_INFO);
							$(".loadmore:eq(1)").show();
						}
					}	
				});	
			}
			/*
			 * 点击右上角刷新按钮
			 */
			refreshNotice = function(handel){
				//如果第一次页面渲染错误，就调用第一次加载数据方法
				if($("#notice_ul li").length == 0){
					if(handel == "new")
						initNewNotice();
					else if(handel == "hot")
						initHotNotice();
				}
				else
					refreshNewNotice();	
			}
	
			/*
			 *刷新通知
			 */
			 refreshNewNotice = function(){
				//每次加载的时候进行网络连接的判断
	             //网络未连接
	             if(checkConnection() == -1){
	             	desc = NO_NETWORK;
	             }
				var notice_ul = registry.byId("notice_ul"); // destination view	
				var container =  notice_ul.containerNode;
				prog.start();
				win.body().appendChild(prog.domNode);
				prog.start();//显示正在加载的状态
				var noticeid = 0 ;//最大通知id
				//从本地存储中得到数据
				var noticelist = window.localStorage[APP_ID+"_noticelist"];
				noticelist = changeUndefinedToEmpty(noticelist);
				var innerhtml = "";
				//从本地存储中获取到上次更新的时候最大的通知id
				max_noticeid = changeUndefinedToEmpty(window.localStorage[APP_ID+"_noticeid"]);
				var notice_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_ids"]);
				var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=refreshNewNotice&max_noticeid="+max_noticeid +"&perpage="+PERPAGE + "&notice_ids="+notice_ids;
				//alert(url);
				dojo.xhrGet({
					url: url,
					timeout:8000,
					//sync:true,
					//handleAs: "json",
					load: function(response, ioArgs){
						//将获取到的压缩及转码的内容进行转换
						var response_compress = base64decode(response);
						//alert(zip_inflate(response_compress));
						response = JSON.parse(zip_inflate(response_compress));
						//获取最新资讯列表
						var list = changeUndefinedToEmpty(response.data);
						//alert(list)
						//如果获取到最新的资讯
						if(list !=""){
							//获取最大ID
							max_noticeid = changeUndefinedToEmpty(response.maxid);
							//将最大通知id换缓存到本地
							window.localStorage[APP_ID+"_noticeid"] = max_noticeid;
							//将id组合缓存到本地
							window.localStorage[APP_ID+"_notice_ids"] = changeUndefinedToEmpty(response.noticeids);
							$("#showinfo").html(HAS_REFRESH+list.length+SOME_NEWINFO)
							$("#showinfo").fadeIn();
							//将列表转换成字符串
							list = JSON.stringify(list);
							//分别去掉字符串前面[和后面的 ]
							noticelist = noticelist.substr(1,noticelist.length -1);
							list = list.substr(0,list.length -1);
							//进行组合
							list = $.trim(list) + "," +$.trim(noticelist);
							//转换成json
							list = JSON.parse(list);
							//将当前的列表缓存到本地存储中
							window.localStorage[APP_ID+"_noticelist"] = JSON.stringify(list);	
							$.each(list,function(i,e){
								innerhtml += ' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"data_notice_content", noArrow:true,transition:"none"\' onClick=\'gotoInfoContent('+e.id+',"'+e.title+'","data_notice_new")\'><div class="title">';
								if(e.type =="new")
									innerhtml += '<span style="width:90%;float:left"> '+ e.title +'</span><img style="float:right" src="images/new.gif" id="img_'+e.id+'"></div>';
								else	
									innerhtml +=  e.title +'</div>';
								innerhtml += ' <sapn class="pubdate">'+e.pubdate +'&nbsp;&nbsp;&nbsp;&nbsp;'+SOURCE+e.source+'</span></li>';			
							});
							innerhtml += '<div style="text-align:center;"><button data-dojo-type="dojox.mobile.Button"  onClick="initNewNotice(\'loadmore\')" class="loadmore"/>'+LOAD_MORE_INFO+'</button></div>';
							container.innerHTML = innerhtml ;
							parser.parse(container);
						}else{
							$("#showinfo").html(NO_NEWPINFO)
							$("#showinfo").fadeIn();
						}
						progStop();
						setTimeout(	function() {
							$("#showinfo").fadeOut(5000);
						}, 2000);
					},
					error: function(response, ioArgs){
						$("#showinfo").html(desc);
						$("#showinfo").fadeIn();
						progStop();
						setTimeout(	function() {
							$("#showinfo").fadeOut(5000);
						}, 2000);	
					}	
				});
			} 
 
		
		/**
		 *查看通知的正文
		 * 如果有最新的通知，而用户没有点击查看最新的通知的时候，要对通知列表进行处理，下载在渲染的时候没有查看的最新通知的标识依然存在
		 **/
		//通知的id 
		var old_id=0;
		gotoInfoContent = function(id,title,viewPage){
			$("#notice_back_para").val(viewPage);
			var notice_content = registry.byId("notice_content"); // destination view
			var container =  notice_content.containerNode;
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			//调用方法将位置进行还原
			setViewTop("data_notice_content");
			//从本地存储中得到数据
			var noticelist = window.localStorage[APP_ID+"_noticelist"];
			noticelist = changeUndefinedToEmpty(noticelist);
			//得到未读的通知id
			var notice_no_read_ids = window.localStorage[APP_ID+"_notice_no_read_ids"];
			//获取新的通知的id
			var notice_new_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_new_ids"]);

			var notice_no_read_ids_array = notice_no_read_ids. split(","); 

			for(var i=0;i<notice_no_read_ids_array.length;i++){
				if(id == notice_no_read_ids_array[i]){
					$("#img_"+id).hide();
					//notice_no_read_ids_array.remove(i)
					notice_no_read_ids_array.splice(i,1)
				}
			}
			
			var _new_ids = "";
			for(var i=0;i<notice_no_read_ids_array.length;i++){
				if(_new_ids == "")
					_new_ids = notice_no_read_ids_array[i];
				else
					_new_ids = _new_ids +"," + notice_no_read_ids_array[i];
			}
			
			//如果上次的id和现在的id相同，并且数据已经渲染就不再进行查询
			if(old_id == id && $("#noticecontent li").length >0){
				progStop();
				return false;		
			}
			//将通知原来正文清空
			container.innerHTML = "";
			var innerhtml ="";
			var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=getDeclarationNoticeContentById&id="+id;
           // alert(url)
			dojo.xhrGet({
				url: url,
				timeout:8000,
				//async:false,
				//handleAs: "json",
				load: function(response, ioArgs){
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					
					if(response !=null && response !=""){
						innerhtml +='<div class="top"><span class="title">'+response.title+'</span><br/>';
						innerhtml +='<span class="pubdate">'+response.pubdate+'&nbsp;&nbsp;&nbsp;&nbsp;'+SOURCE +response.source+'</span></div>';
						innerhtml +='<div class="line"></div>';
						innerhtml += '<div class="content">'+response.content+'</div>';
						//innerhtml += '<div style=" position: relative;"><img src="images/box.png"/ style="max-width:95%"><div class="desc">'+NOTICE_DESC+'</div></div>';
						innerhtml += '<div style="text-align:center;"><div dojoType="dojox.mobile.Button" class="button" data-dojo-props=\'moveTo:"#"\' onClick=\'openURL("'+response.acqwurl+'")\'>'+NOTICE_BUTTON+'</div></div>';
					}else
						innerhtml = NO_DATA;
					container.innerHTML = innerhtml ;
					parser.parse(container);
					progStop();
					old_id = id;
					//将未读id存储
					window.localStorage[APP_ID+"_notice_no_read_ids"] = _new_ids;
				},
				error: function(response, ioArgs){
					old_id = id;
					container.innerHTML = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'gotoInfoContent('+id+',"'+title+'","'+viewPage+'")\'>'+RELOAD+'</span></div></div>';
					parser.parse(container);
					progStop();
				}	
			});
		
		}
		/*
		 * 从资讯正文返回
		 */
		goBackFromNoticeContent = function(){
			registry.byId("data_notice_content").performTransition("#"+$("#notice_back_para").val(),-1,"none");	
		}
		
		
		/*
		 *加载最新Zkms，并将最新的数据存储到本地存储中
		 */
		var noticelist =null;
		var noticelist
		var max_noticeid = 0; 
		var notice_totall_count = 0;
		var p = 1;
		
		initNewZkms = function(handel){
			//如果是点击首页的链接来进行查询最新的资讯
			if(handel !="loadmore")
				p=1;
			if(p>1)
				$(".loadmore:eq(0)").text(LOADING);
			//首先从本地存储中获取到最新资讯
			var noticelist_old = changeUndefinedToEmpty(window.localStorage[APP_ID+"_noticelist"]);			
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			
			//每次加载的时候进行网络连接的判断
             var desc = ERROR_NETWORK_OR_DATA;
             //网络未连接
             if(checkConnection() == -1){
             	desc = NO_NETWORK;
             }
			var notice_ul = registry.byId("notice_ul_zkms"); // destination view	
			var container =  notice_ul.containerNode;
			//从本地存储中获取到上次更新的时候最大的通知id
			max_noticeid = changeUndefinedToEmpty(window.localStorage[APP_ID+"_noticeid"]);
			var notice_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_ids"]);//前面20个通知id
			var notice_new_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_new_ids"]);//最新通知id
			var notice_no_read_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_no_read_ids"]);;//未读通知id
			var innerhtml = "";
			var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=getZkms";
			//alert(url);
			//alert(url + "&noticeid="+max_noticeid + "&nextpage="+notice_nextpage + "&perpage="+PERPAGE + "&notice_no_read_ids="+notice_no_read_ids + "&p="+p + "&notice_ids="+notice_ids + "&notice_new_ids="+notice_new_ids)
			dojo.xhrGet({
				url: url,
				timeout:8000,
				content:{
						noticeid:max_noticeid,
						nextpage:notice_nextpage,
						perpage:PERPAGE,
						notice_no_read_ids:notice_no_read_ids,
						p:p,//分页参数
						notice_ids:notice_ids,
						notice_new_ids:notice_new_ids
						},
				//sync:true,
				//handleAs: "json",
				load: function(response, ioArgs){
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					//alert(zip_inflate(response_compress))
					response = JSON.parse(zip_inflate(response_compress));
					//alert(zip_inflate(response_compress))
					if(response !=null && response !=""){
						$("#data_notice_new_zkms .mblHeadingDivTitle").text(NEW_INFOMATION);
						notice_totall_count = response.count;
						noticelist = response.noticelist;
						//新通知的条数
						var count_newzkms = response.count_new;
						count_newzkms = changeUndefinedToEmpty(count_newzkms);
						//加载第一页的时候将最大id保存到本地存储中
						if(p==1){
							
							//获取通知的最大id
							max_noticeid = changeUndefinedToEmpty(response.maxid);
							//将id组合存储在本地存储中
							var notice_ids = changeUndefinedToEmpty(response.notice_ids);
							//将最大通知id换缓存到本地
							window.localStorage[APP_ID+"_noticeid"]   = max_noticeid;
							//最前面20个通知id
							window.localStorage[APP_ID+"_notice_ids"] = changeUndefinedToEmpty(response.notice_ids);
							//最新通知id
							window.localStorage[APP_ID+"_notice_new_ids"] = changeUndefinedToEmpty(response.notice_new_ids);
							//未读通知id
							if(notice_no_read_ids == "")
								window.localStorage[APP_ID+"_notice_no_read_ids"] = changeUndefinedToEmpty(response.notice_no_read_ids);
							
						}
						//如果是加载更多的数据
						if(p>1){
							//将两个列表转换成字符串
							//分别去掉字符串前面[和后面的 ]
							noticelist_old = noticelist_old.substr(0,noticelist_old.length -1);
							noticelist = JSON.stringify(noticelist);
							noticelist = noticelist.substr(1,noticelist.length -1);
							//进行组合
							noticelist = $.trim(noticelist_old) + ","+$.trim(noticelist);
							//转换成json
							noticelist = JSON.parse(noticelist);
						}
						//将最新通知列表的json格式缓存到本地
						window.localStorage[APP_ID+"_noticelist"] = JSON.stringify(noticelist);
						
						//如果获取到了最新的通知
						if( count_newzkms !="" && count_newzkms  > 0){
							//首页中提醒最新通知的条数
							if(count_newzkms  > 30)
								//如果通知条数大于30条就提示“很多”
								//$("#noticecount").html('<span   class="jq-badge index">很多</span>');
								$("#noticecountzkms").html(MANY);
							else
								//少于30条就提示具体的数量
								//$("#noticecount").html( '<span   class="jq-badge index">'+count_new+'</span>');
								$("#noticecountzkms").html("今日:"+ count_newzkms );
						}
						$.each(noticelist,function(i,e){
							innerhtml += ' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"data_notice_content_zkms", noArrow:true,transition:"none"\' onClick=\'gotoInfoZkmsContent('+e.id+',"'+e.title+'","data_notice_new")\' style="color:#000"><div class="title">';
							if(e.type =="new")
								innerhtml += '<span style="width:90%;float:left"> '+ e.title +'</span><img src="images/new.gif" style="float:right;text-align: left;" id="img_'+e.id+'"></div>';
							else	
								innerhtml += e.title +'</div>';
							innerhtml += ' <sapn class="pubdate">'+e.pubdate +'&nbsp;&nbsp;&nbsp;&nbsp;'+SOURCE+e.source+'</span></li>';
						});
													
							
					}else
						innerhtml ="<p>"+NO_DATA+"</p>";
					innerhtml += '<div style="text-align:center;"><button data-dojo-type="dojox.mobile.Button"  onClick="initNewZkms(\'loadmore\')" class="loadmore" />'+LOAD_MORE_INFO+'</button></div>';
					container.innerHTML = innerhtml ;
					parser.parse(container);
					progStop();
					//如果总页数大于p的总数就显示分页框
					if(response.pageCount > p){
						$(".loadmore:eq(0)").html(LOAD_MORE_INFO);
						$(".loadmore:eq(0)").show();
						p++;
					}else
						$(".loadmore:eq(0)").hide();
						
				},
				error: function(response, ioArgs){
						
					if(typeof($("#notice_ul_zkms div").html()) !="undefined"){
						//网络异常的时候进行提示
						show_progress_indicator('dlg_progress',	'progress_indicator_container',desc);
						setTimeout(	function() {
							hide_progress_indicator("dlg_progress");
						}, 1000);
					}	
					//如果是第一次加载
					if(p==1){
						if($("#notice_ul_zkms li").length > 0){
							progStop();
							return false;
						}
						innerhtml= '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'initNewNotice()\'>'+RELOAD+'</span></div></div>';
						container.innerHTML =innerhtml;
						parser.parse(container);
						progStop();
					}else{
						//如果是加载更多错误
						$(".loadmore:eq(0)").html(LOAD_MORE_INFO);
						$(".loadmore:eq(0)").show();
					}
				}	
			});
		}
		
			/*
			 *进入查看最新的申报i通知
			 */
			var first = 0;
			gotoZkmsList = function(){

				$("#btn_refresh_new_notice_zkms").show();
				$("#span_title_top_zkms").removeClass("top");
				$("#span_title_bottom_zkms").text(ORDERBY_PUBTIME);
				//调用方法将位置进行还原
				setViewTop("data_notice_new_zkms");
				$(".loadmore:eq(0)").html(LOAD_MORE_INFO);
				//if(first == 0)
					//progStop();
				//else
					initNewZkms();
				//如果用户查看了最新通知那么
				//将最大通知id换缓存到本地
				/*if(noticelist !=null && noticelist != false){
					window.localStorage[APP_ID+"_noticeid"] = max_noticeid;
					//将最新通知列表的json格式缓存到本地//如果最新的通知超过了100条，就不存储最新的数据
					if(noticelist.length  < 100 )
						window.localStorage[APP_ID+"_noticelist"] = JSON.stringify(noticelist);
				}*/
				//将最新提醒清0
				//$("#noticecountzkms").html( '');
				//first = 1;
			} 
			/*
			 * 渲染近期热点最新资讯列表
			 */
			var noticelist_old_hot ="";
			initHotZkms= function(handel){
				$("#btn_refresh_new_notice_zkms").hide();
				$("#span_title_top_zkms").addClass("top");
				$("#span_title_bottom_zkms").text(ORDERBY_VIEWCOUNT);
				//如果是点击首页的链接来进行查询最新的资讯
				if(handel !="loadmore"){
					p=1;
				//调用方法将位置进行还原
					setViewTop("data_notice_hot_zkms");	
				}else if(p>1)
					$(".loadmore:eq(1)").text(LOADING);
		
				win.body().appendChild(prog.domNode);
				prog.start();//显示正在加载的状态
				
				//每次加载的时候进行网络连接的判断
	             var desc = ERROR_NETWORK_OR_DATA;
	             //网络未连接
	             if(checkConnection() == -1){
	             	desc = NO_NETWORK;
	             }
				var notice_ul = registry.byId("notice_hot_ul_zkms"); // destination view	
				var container =  notice_ul.containerNode;

				var innerhtml = "";
				var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=getHotZkms";
				dojo.xhrGet({
					url: url,
					content:{
						perpage:PERPAGE,
						p:p
						},
					timeout:8000,
					load: function(response, ioArgs){
						//将获取到的压缩及转码的内容进行转换
						response_compress = base64decode(response);
						//alert(zip_inflate(response_compress))
						response = JSON.parse(zip_inflate(response_compress));
						if(response !=null && response !=""){
							notice_totall_count = response.count;
							noticelist = response.noticelist;
						}
						$("#data_notice_hot_zkms .mblHeadingDivTitle").text(NEW_INFOMATION);
						if(notice_totall_count !=0)	{
							if(noticelist_old_hot !=""  && p > 1){
								//将两个列表转换成字符串
								//分别去掉字符串前面[和后面的 ]
								noticelist_old_hot = noticelist_old_hot.substr(0,noticelist_old_hot.length -1);
								noticelist = JSON.stringify(noticelist);
								noticelist = noticelist.substr(1,noticelist.length -1);
								//进行组合
								noticelist = $.trim(noticelist_old_hot) + ","+$.trim(noticelist);
								//转换成json
								noticelist = JSON.parse(noticelist);
							}	
							
							$.each(noticelist,function(i,e){
								innerhtml += ' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"data_notice_content_zkms", noArrow:true,transition:"none"\' onClick=\'gotoInfoZkmsContent('+e.id+',"'+e.title+'","data_notice_hot_zkms")\' style="color:#000"><div class="title">';
								if(e.type =="new")
									innerhtml += '<span style="width:90%;float:left"> '+ e.title +'</span><img src="images/new.gif" style="float:right;text-align: left;" id="img_'+e.id+'"></div>';
								else	
									innerhtml += e.title +'</div>';
								innerhtml += ' <sapn class="pubdate">'+VIEWCOUNT + COLON + e.viewcount+'&nbsp;&nbsp;&nbsp;&nbsp;'+e.pubdate +'&nbsp;&nbsp;&nbsp;&nbsp;'+SOURCE+e.source+'</span></li>';
							});
							innerhtml += '<div style="text-align:center;"><button data-dojo-type="dojox.mobile.Button"  onClick="initHotZkms(\'loadmore\')" class="loadmore"/>'+LOAD_MORE+'</button></div>';
							noticelist_old_hot = JSON.stringify(noticelist);							
								
						}else
							innerhtml ="<p>"+NO_DATA+"</p>";
						container.innerHTML = innerhtml ;
						parser.parse(container);
						progStop();
						//如果总页数大于p的总数就显示分页框
						if(response.pageCount > p){
							$(".loadmore:eq(1)").html(LOAD_MORE);
							$(".loadmore:eq(1)").show();
							p++;
						}else
							$(".loadmore:eq(1)").hide();
							
					},
					error: function(response, ioArgs){
						if($("#notice_hot_ul_zkms li").length > 0){
							progStop();
							return false;
						}
						if(typeof($("#notice_hot_ul_zkms div").html()) !="undefined"){
							//网络异常的时候进行提示
							show_progress_indicator('dlg_progress',	'progress_indicator_container',desc);
							setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 1000);
						}	
						//如果是第一次加载
						if(p==1){
							innerhtml= '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'initHotNotice()\'>'+RELOAD+'</span></div></div>';
							container.innerHTML =innerhtml;
							parser.parse(container);
							progStop();
						}else{
							//如果是加载更多错误
							$(".loadmore:eq(1)").html(LOAD_MORE_INFO);
							$(".loadmore:eq(1)").show();
						}
					}	
				});	
			}
			/*
			 * 点击右上角刷新按钮
			 */
			refreshZkms = function(handel){
				//如果第一次页面渲染错误，就调用第一次加载数据方法
				if($("#notice_ul_zkms li").length == 0){
					if(handel == "new")
						initNewZkms();
					else if(handel == "hot")
						initHotZkms();
				}
				else
					refreshNewZkms();	
			}
	
			/*
			 *刷新通知
			 */
			 refreshNewZkms = function(){
				//每次加载的时候进行网络连接的判断
	             //网络未连接
	             if(checkConnection() == -1){
	             	desc = NO_NETWORK;
	             }
				var notice_ul = registry.byId("notice_ul_zkms"); // destination view	
				var container =  notice_ul.containerNode;
				prog.start();
				win.body().appendChild(prog.domNode);
				prog.start();//显示正在加载的状态
				var noticeid = 0 ;//最大通知id
				//从本地存储中得到数据
				var noticelist = window.localStorage[APP_ID+"_noticelist"];
				noticelist = changeUndefinedToEmpty(noticelist);
				var innerhtml = "";
				//从本地存储中获取到上次更新的时候最大的通知id
				max_noticeid = changeUndefinedToEmpty(window.localStorage[APP_ID+"_noticeid"]);
				var notice_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_ids"]);
				var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=refreshNewZkms&max_noticeid="+max_noticeid +"&perpage="+PERPAGE + "&notice_ids="+notice_ids;
				//alert(url);
				dojo.xhrGet({
					url: url,
					timeout:8000,
					//sync:true,
					//handleAs: "json",
					load: function(response, ioArgs){
						//将获取到的压缩及转码的内容进行转换
						var response_compress = base64decode(response);
						//alert(zip_inflate(response_compress));
						response = JSON.parse(zip_inflate(response_compress));
						//获取最新资讯列表
						var list = changeUndefinedToEmpty(response.data);
						//alert(list)
						//如果获取到最新的资讯
						if(list !=""){
							//获取最大ID
							max_noticeid = changeUndefinedToEmpty(response.maxid);
							//将最大通知id换缓存到本地
							window.localStorage[APP_ID+"_noticeid"] = max_noticeid;
							//将id组合缓存到本地
							window.localStorage[APP_ID+"_notice_ids"] = changeUndefinedToEmpty(response.noticeids);
							$("#showinfo_zkms").html(HAS_REFRESH+list.length+SOME_NEWINFO)
							$("#showinfo_zkms").fadeIn();
							//将列表转换成字符串
							list = JSON.stringify(list);
							//分别去掉字符串前面[和后面的 ]
							noticelist = noticelist.substr(1,noticelist.length -1);
							list = list.substr(0,list.length -1);
							//进行组合
							list = $.trim(list) + "," +$.trim(noticelist);
							//转换成json
							list = JSON.parse(list);
							//将当前的列表缓存到本地存储中
							window.localStorage[APP_ID+"_noticelist"] = JSON.stringify(list);	
							$.each(list,function(i,e){
								innerhtml += ' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"data_notice_content", noArrow:true,transition:"none"\' onClick=\'gotoInfoContent('+e.id+',"'+e.title+'","data_notice_new")\'><div class="title">';
								if(e.type =="new")
									innerhtml += '<span style="width:90%;float:left"> '+ e.title +'</span><img style="float:right" src="images/new.gif" id="img_'+e.id+'"></div>';
								else	
									innerhtml +=  e.title +'</div>';
								innerhtml += ' <sapn class="pubdate">'+e.pubdate +'&nbsp;&nbsp;&nbsp;&nbsp;'+SOURCE+e.source+'</span></li>';			
							});
							innerhtml += '<div style="text-align:center;"><button data-dojo-type="dojox.mobile.Button"  onClick="initNewNotice(\'loadmore\')" class="loadmore"/>'+LOAD_MORE_INFO+'</button></div>';
							container.innerHTML = innerhtml ;
							parser.parse(container);
						}else{
							$("#showinfo_zkms").html(NO_NEWPINFO)
							$("#showinfo_zkms").fadeIn();
						}
						progStop();
						setTimeout(	function() {
							$("#showinfo_zkms").fadeOut(5000);
						}, 2000);
					},
					error: function(response, ioArgs){
						$("#showinfo_zkms").html(desc);
						$("#showinfo_zkms").fadeIn();
						progStop();
						setTimeout(	function() {
							$("#showinfo_zkms").fadeOut(5000);
						}, 2000);	
					}	
				});
			} 
 
		
		/**
		 *查看通知的正文
		 * 如果有最新的通知，而用户没有点击查看最新的通知的时候，要对通知列表进行处理，下载在渲染的时候没有查看的最新通知的标识依然存在
		 **/
		//通知的id 
		var old_id=0;
		gotoInfoZkmsContent = function(id,title,viewPage){
			$("#zkms_back_para").val(viewPage);
			var notice_content = registry.byId("notice_content_zkms"); // destination view
			var container =  notice_content.containerNode;
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			//调用方法将位置进行还原
			setViewTop("data_notice_content_zkms");
			//从本地存储中得到数据
			var noticelist = window.localStorage[APP_ID+"_noticelist"];
			noticelist = changeUndefinedToEmpty(noticelist);
			//得到未读的通知id
			var notice_no_read_ids = window.localStorage[APP_ID+"_notice_no_read_ids"];
			//获取新的通知的id
			var notice_new_ids = changeUndefinedToEmpty(window.localStorage[APP_ID+"_notice_new_ids"]);

			var notice_no_read_ids_array = notice_no_read_ids. split(","); 

			for(var i=0;i<notice_no_read_ids_array.length;i++){
				if(id == notice_no_read_ids_array[i]){
					$("#img_"+id).hide();
					//notice_no_read_ids_array.remove(i)
					notice_no_read_ids_array.splice(i,1)
				}
			}
			
			var _new_ids = "";
			for(var i=0;i<notice_no_read_ids_array.length;i++){
				if(_new_ids == "")
					_new_ids = notice_no_read_ids_array[i];
				else
					_new_ids = _new_ids +"," + notice_no_read_ids_array[i];
			}
			
			//如果上次的id和现在的id相同，并且数据已经渲染就不再进行查询
			if(old_id == id && $("#noticecontentzkms li").length >0){
				progStop();
				return false;		
			}
			//将通知原来正文清空
			container.innerHTML = "";
			var innerhtml ="";
			var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=getDeclarationZkmsContentById&id="+id;
			
           //alert(url)
			dojo.xhrGet({
				url: url,
				timeout:8000,
				//async:false,
				//handleAs: "json",
				load: function(response, ioArgs){
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					
					if(response !=null && response !=""){
						innerhtml +='<div class="top"><span class="title">'+response.title+'</span><br/>';
						innerhtml +='<span class="pubdate">'+response.pubdate+'&nbsp;&nbsp;&nbsp;&nbsp;'+SOURCE +response.source+'</span></div>';
						innerhtml +='<div class="line"></div>';
						innerhtml += '<div class="content">'+response.content+'</div>';
						//innerhtml += '<div style=" position: relative;"><img src="images/box.png"/ style="max-width:95%"><div class="desc">'+NOTICE_DESC+'</div></div>';
						innerhtml += '<div style="text-align:center;"><div dojoType="dojox.mobile.Button" class="button" data-dojo-props=\'moveTo:"#"\' onClick=\'openURL("'+response.acqwurl+'")\'>'+NOTICE_BUTTON+'</div></div>';
					}else
						innerhtml = NO_DATA;
					container.innerHTML = innerhtml ;
					parser.parse(container);
					progStop();
					old_id = id;
					//将未读id存储
					window.localStorage[APP_ID+"_notice_no_read_ids"] = _new_ids;
				},
				error: function(response, ioArgs){
					old_id = id;
					container.innerHTML = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'gotoInfoContent('+id+',"'+title+'","'+viewPage+'")\'>'+RELOAD+'</span></div></div>';
					parser.parse(container);
					progStop();
				}	
			});
		
		}
		/*
		 * 从资讯正文返回
		 */
		goBackFromZkmsContent = function(){
			registry.byId("data_notice_content_zkms").performTransition("#"+$("#zkms_back_para").val(),-1,"none");	
		}
		
		
		
		
		/**查询函数
		 *参数：value  --查询参数
		 **/
		var url_query ="";
		var querydate_temp = "";
		var noticetheme_temp = "";
		var searchlist =null;
		var searchlist_totall_count = 0;
		var p = 2;
		var key_words = "";
		onQuery = function(value){
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	show_progress_indicator('dlg_progress','progress_indicator_container',NO_NETWORK);
           		setTimeout(function(){
                       hide_progress_indicator("dlg_progress");
                       }, 2000);
           		return false;
            }
			$("#loadmore_search").html(LOAD_MORE);
			//页面转场的代码：从view_search 转到 view_searchlist页面中
			var view_search = registry.byId("view_search"); // destination view
			//重新查询时，将设置的临时变量清空归0
			data_more_list="";
			querylist="";
			nextpage =1;
			curpage = 0;//当前页码
			total_count = 0;
			COUNT_PER = PERPAGE;
			querydate_temp = "";
			noticetheme_temp = "";
			//调用方法将位置进行还原
			setViewTop("view_searchlist");
			var  searchBox = value.searchBox;
			var querydate = "";
			var noticetheme = "";
			//如果searchBox为undefined说明是查询操作，反之则是搜索操作
			if(typeof(searchBox) == "undefined"){
				if(value !=""){
					var parray = value. split("="); 
					var p1 = parray[0];
					if(p1=="querydate"){
						querydate = parray[1];
						querydate_temp = parray[1];
						noticetheme ="";
					}	
					if(p1=="noticetheme"){
						noticetheme = parray[1];
						noticetheme_temp = parray[1];
						querydate="";
					}	
				}
				url_query = DATA_ROOT + "index.php?app=Foryou&mod=Index&act=queryNew&querydate="+querydate+"&noticetheme="+noticetheme+"&perpage="+PERPAGE + "&version_info=1.1.5";
				key_words ="";
			}else{
			   var kw_temp = searchBox.value;
			   key_words = kw_temp;
			   url_query = DATA_ROOT + "index.php?app=Foryou&mod=Index&act=search&notice_search_keyword="+kw_temp+"&perpage="+PERPAGE + "&p=1";
			}
			//Ajax从服务器取得数据
			dojo.xhrGet({
				url: url_query,
				timeout:8000,
				//handleAs: "json",
				load: function(response, ioArgs){
					
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					//alert(zip_inflate(response_compress))
					response = JSON.parse(zip_inflate(response_compress));
					searchlist = response;
					searchlist_totall_count = response.count;
					
					//window.localStorage["searchlist"] = JSON.stringify(response);	
					$("#querytitle").html(response.bartitle);//标题赋值
					//$("#view_searchlist .mblHeadingSpanTitle").html(response.bartitle);
					//$("#view_searchlist .mblHeadingDivTitle").html(response.bartitle);
					if(response.count > 0){
						querylist  =	doResultForList("query",response,curpage);//调用生成列表的函数	
						//如果分页
						if(response.pageCount > 1)
							$("#loadmore_search").show();
						else
							$("#loadmore_search").hide();
					}else {
						querylist ='<p>'+NO_DATA+'</p>';
						$("#loadmore_search").hide();
					}
					
					var query_list = registry.byId("query_list");
					var container = query_list.containerNode;
					container.innerHTML = querylist;
					parser.parse(container);//将样式进行重新渲染
					progStop();//加载的图片停止
					view_search.performTransition("#view_searchlist",1,"none");
					return false;	
				},
				error: function(response, ioArgs){
					//网络异常的时候进行提示
					show_progress_indicator('dlg_progress',	'progress_indicator_container',desc);
					setTimeout(	function() {
						hide_progress_indicator("dlg_progress");
					}, 1000);
					/*showAlert(desc);
					setTimeout(function(){
						progStop();
					}, 1000);//加载的图片停止*/
				}			
			});	
			return false;	
		}
				
		/*
		 *加载更多通知
		 */
		loadmoreSearchList = function(){
			$("#loadmore_search").text(LOADING);
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
			var query_list = registry.byId("query_list"); // destination view	
			var container =  query_list.containerNode;
			prog.start();
			win.body().appendChild(prog.domNode);
			prog.start();//显示正在加载的状态
			var innerhtml = "";
			var url = "";
			if(key_words != "")
				url = DATA_ROOT + "index.php?app=Foryou&mod=Index&act=search&notice_search_keyword="+key_words+"&perpage="+PERPAGE + "&p="+p;
			//如果是关键字搜索
			else
				url= DATA_ROOT + "index.php?app=Foryou&mod=Index&act=loadmore&querydate="+querydate_temp+"&noticetheme="+noticetheme_temp+"&perpage="+PERPAGE +"&nextpage="+nextpage + "&version_info=1.1.5";
				
			dojo.xhrGet({
				url: url,
				timeout:8000,
				//sync:true,
				//handleAs: "json",
				load: function(response, ioArgs){
					//将获取到的压缩及转码的内容进行转换
					var response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					var count = 0;
					if(response !=null && response !="")
						count = response.count;
					if(count > 0 ){
						var listdata = response.listdata;
						//将两个列表转换成字符串}
						searchlist = JSON.stringify(searchlist);
						//分别去掉字符串前面[和后面的 ]
						//var listdata_old = searchlist.listdata;
						//listdata_old = JSON.stringify(listdata_old);
						searchlist = searchlist.substr(0,searchlist.length -2);
						var listdata_str= JSON.stringify(listdata);
						listdata_str = listdata_str.substr(1,listdata_str.length -1);						Notice
						//进行组合
						response = $.trim(searchlist) + ","+$.trim(listdata_str)+"}";						
						//转换成json
						response = JSON.parse(response);
						searchlist = response;						
						//window.localStorage["searchlist"] = JSON.stringify(response);
						innerhtml  =	doResultForList("query",response);//调用生成列表的函数
						if(response.listdata.length >= response.count)
							$("#loadmore_search").hide();
					}else{
						//$(".loadmore:eq(1)").html("没有更多了");
						$("#loadmore_search").hide();
						progStop();
						return false;
					}
					container.innerHTML = innerhtml ;
					parser.parse(container);
					progStop();
					nextpage ++ ;
					$("#loadmore_search").html(LOAD_MORE);
					if(key_words != "")
						p++;
				},
				error: function(response, ioArgs){
					//网络异常的时候进行提示
					show_progress_indicator('dlg_progress',	'progress_indicator_container',desc);
					setTimeout(	function() {
						hide_progress_indicator("dlg_progress");
					}, 1000);
					$("#loadmore_search").html(LOAD_MORE);
				}	
			});
		}

		/**生成项目正文
		 *参数：para - 参数
		 **/
		goToContent = function(para){
			var tid = (para.split("&")[1]).split("=")[1];//得到项目的id
			var datatype = (para.split("&")[0]).split("=")[1];//得到数据的类型
			var data = null;//得到json格式数据
			var view_transition = "";
			if(datatype == "data_new" || datatype == "data_index"){
				view_transition = registry.byId("view_hot_project");
				//data = data_new_json;
				data = window.localStorage[APP_ID+"_datanew_list"];
				data = changeUndefinedToEmpty(data);
				//如果最新项目列表不为空，就进行转换
				if (data != "")
					data = JSON.parse(data);
			}else if(datatype == "data_end"){
				view_transition = registry.byId("view_hot_project");
				data = window.localStorage[APP_ID+"_dataend_list"];
				data = changeUndefinedToEmpty(data);
				//如果最新项目列表不为空，就进行转换
				if (data != "")
					data = JSON.parse(data);
			}else{
				data = searchlist;
				datatype ="view_searchlist";	
				view_transition = registry.byId("view_searchlist");
			}
			
			//调用方法将位置进行还原
			setViewTop("view_content");	
			//页面转场
			var view_content = registry.byId("div_project_content"); // destination view
			var widget = registry.byId(datatype);
			view_transition.performTransition("#view_content",1,"none");
			win.body().appendChild(prog.domNode);
			prog.start();
			//view_content.destroyDescendants();//将页面内的内容清空
			//调用生成正文	
			var contentinfo = doResultForContent(datatype,data,tid);
			var container = view_content.containerNode;
			container.innerHTML = contentinfo;
			parser.parse(container);
			//showImg(data,tid);
			progStop();
			//获取评论信息
			getCommentCountById(tid,"item");
			//用户点击查看该项目信息的时候，将该项目的关注度增加1
			/*dojo.xhrGet({
				url: DATA_ROOT + "index.php?app=declare&mod=Index&act=setIncbyId&tid="+tid,
				timeout:8000,
				//sync:true,
				handleAs: "text",
				load: function(response, ioArgs){
            
				},
				error: function(response, ioArgs){
					
				}	
			});*/
		}
		
		/**生成时间节点和通知详细信息
		 *参数：type -当前渲染对象的类型 (timenode notice )
		 *     para - 参数
		 **/
		var tid_temp=0;
		var timenodeid_temp=0;
		var datatype_temp ="";
		goTimenodeOrNotice = function(type,para,handle){
			//调用方法将位置进行还原
			setViewTop("view_"+type);
			var datatype = (para.split("&")[0]).split("=")[1];//得到数据的类型
			var tid = (para.split("&")[1]).split("=")[1];//得到项目的id
			var typeid = (para.split("&")[2]).split("=")[1];//得到时间节点id
			var view_type = registry.byId("view_"+type); // destination view
			//如果不是刷新操作
			if(handle !="refresh"){
				
				var view = registry.byId("view_content");
				view.performTransition("#view_"+type,1,"none");
				if(tid ==tid_temp && typeid_temp==typeid && datatype_temp==datatype){
					progStop();
					return;
				}
			}
			
			win.body().appendChild(prog.domNode);
			prog.start();
			var data = null;
			if(datatype == "data_new" || datatype == "data_index"){
				//data = data_new_json;
				data = window.localStorage[APP_ID+"_datanew_list"];
				data = changeUndefinedToEmpty(data);
				//如果最新项目列表不为空，就进行转换
				if (data != "")
					data = JSON.parse(data);
			}else if(datatype == "data_end"){
				data = window.localStorage[APP_ID+"_dataend_list"];
				data = changeUndefinedToEmpty(data);
				//如果最新项目列表不为空，就进行转换
				if (data != "")
					data = JSON.parse(data);
			}else{
				data = searchlist;
				datatype ="view_searchlist";	
			}	
			//调用生成正文	
			var contentinfo = doResultForTimenodeOrNotice(type,datatype,data,tid,typeid);
			if(contentinfo == "")
				contentinfo = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'goTimenodeOrNotice("'+type+'","'+para+'","refresh")\'>'+RELOAD+'</span></div></div>';
			var container = view_type.containerNode;
			container.innerHTML = contentinfo;
			parser.parse(container);
			progStop();
			tid_temp = tid;
			typeid_temp = typeid;
			datatype_temp =datatype;
		}
		/**
    	 * 获取项目的评论信息
    	 */
		var comment_count = 0;
    	function getCommentCountById(id,objtype){
    		var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=getCommentCountById&id="+id + "&app_id="+APP_ID + "&objtype="+objtype;
    		dojo.xhrGet({
 				url: url,
 				timeout:8000,
 				sync:true,
 				load: function(response, ioArgs){
 					//将获取到的压缩及转码的内容进行转换
 					response_compress = base64decode(response);
 					response = changeUndefinedToEmpty(JSON.parse(zip_inflate(response_compress)));
 					comment_count = response;
 					if(response > 0)
						$(".btn_comment:eq(0)").text(comment_count + COMMENTS);
					else
						$(".btn_comment:eq(0)").text(NO_COMMENT);
 				},
 				error: function(response, ioArgs){
 					$(".btn_comment:eq(0) ").text(count + COMMENTS);
 				}	
 			});
    		
    	}
    
    	/**
    	 * 跳转到评论列表
    	 */
    	var item_id = 0;
    	var no_comment = 0;
    	gotoCommentView = function(id,handel,objtype){
    		//调用方法将位置进行还原
			setViewTop("view_comment_list");
    		item_id = id;
    		//如果comment_count == 0 就跳转到发布评论的页面
    		if(comment_count == 0){
    			openAddCommentView(objtype);
    			no_comment = 1
    		}else{
    			no_comment = 0;
    			registry1.byId("view_content").performTransition("#view_comment_list",1,"none");
    			getCommentById(id,handel,objtype);
    		}	
    	}
    	
    	/**
    	 * 获取评论列表
    	 */
    	var item_id = 0;
    	var comment_list_old = "";
    	getCommentById = function(id,handel,type){
    		
    		if(handel != "loadmore")
    			p = 1;
    		else{
    			$("#comment_list_ul .loadmore").html(LOADING);
    			win.body().appendChild(prog.domNode);
    			prog.start();
    		}
    			
    		var comment_list_ul = registry.byId("comment_list_ul"); // destination view	
			var container =  comment_list_ul.containerNode;
			var innerhtml = "";
    		var url = DATA_ROOT+"/index.php?app=Foryou&mod=Index&act=getCommentById&id="+id + "&perpage=" +PERPAGE + "&p=" + p +"&objtype="+type + "&app_id=" +APP_ID;
    		dojo.xhrGet({
 				url: url,
 				timeout:8000,
 				load: function(response, ioArgs){
 					//将获取到的压缩及转码的内容进行转换
 					response_compress = base64decode(response);
 					response = JSON.parse(zip_inflate(response_compress));
 					var pageCount = 1;
 					if(response !=null && response !=""){
 						var comment_list  = changeUndefinedToEmpty(response.data);
 						pageCount = changeUndefinedToEmpty(response.pageCount);
 						if(comment_list !=null && comment_list !=""){
 							
 							if(comment_list_old !=""  && p > 1){
								//将两个列表转换成字符串
								//分别去掉字符串前面[和后面的 ]
 								comment_list_old = comment_list_old.substr(0,comment_list_old.length -1);
 								comment_list = JSON.stringify(comment_list);
 								comment_list = comment_list.substr(1,comment_list.length -1);
								//进行组合
 								comment_list = $.trim(comment_list_old) + ","+$.trim(comment_list);
								//转换成json
 								comment_list = JSON.parse(comment_list);
							}
 							
 							$.each(comment_list,function(i,e){
								innerhtml += ' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#", noArrow:true,transition:"none"\'><div class="title">';
								innerhtml +=  e.content +'</div>';
								innerhtml += ' <sapn class="pubdate">'+e.pubdate +'&nbsp;&nbsp;&nbsp;&nbsp;'+e.pubusername+'</span></li>';			
							});
 							innerhtml += '<div style="text-align:center;"><button data-dojo-type="dojox.mobile.Button"  onClick=\'getCommentById('+id+',"loadmore","'+type+'")\' class="loadmore"/>'+LOAD_MORE+'</button></div>';
	 						p ++;
	 						comment_list_old = JSON.stringify(comment_list);
 						}else
 							innerhtml = NO_DATA;
 					}else{
 						innerhtml = NO_DATA;
 					}
 					container.innerHTML = innerhtml ;
 					parser.parse(container);
 					if(handel == "loadmore")
 						progStop();
 					if(pageCount > 1 && pageCount > (p-1)){
 						$("#comment_list_ul .loadmore").html(LOAD_MORE);
						$("#comment_list_ul .loadmore").show();
 					}else{
 						$("#comment_list_ul .loadmore").hide();
 					}
 					
 				},
 				error: function(response, ioArgs){
 					if($("#comment_list_ul li").length > 0){
 						progStop();
 						return false;
 					}
 					container.innerHTML = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'getCommentById('+id+',"","'+type+'")\'>'+RELOAD+'</span></div></div>';
 					parser.parse(container);
 					progStop();
 				}	
 			});
    	}
    	/*
    	 * 增加评论
    	 */
    	var add_objetype="";
    	doAddComment = function(){
    		//每次加载的时候进行网络连接的判断
            //网络未连接
            if(checkConnection() == -1){
            	show_progress_indicator('dlg_progress','progress_indicator_container',NO_NETWORK);
           		setTimeout(function(){
                       hide_progress_indicator("dlg_progress");
                       }, 2000);
           		return false;
            }
			var comment_content = $("#comment_content").attr("value");
			
			//将将html标签全部去掉空格全部去掉
			comment_content = $.trim(comment_content.replace(/<V?.+?>/g,""));
			//将回车和换行符去掉
			comment_content = $.trim(comment_content.replace(/\n/g,""));
			//将空格去掉
			comment_content = $.trim(comment_content.replace(/<V?.+?>/g,""));	
			if(comment_content == "" || comment_content == PLEASE_ENTER_YOUR_COMMENT){
				showAlert(PLEASE_ENTER_YOUR_COMMENT);
				return false;
			}	
			if (comment_content.length > 300) {
				showAlert(ALERT_REQ_REPLAY_LENGTH);
				return false;
			}
       		$("#showmessage").html(DATA_SAVING);
       		nickname = changeUndefinedToEmpty(window.localStorage[APP_ID+"_nickname"]);
       		if(nickname == "")
				nickname = ANONYMOUS;
       		var url =  DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=doAddComment";
       		
			dojo.xhrPost({
						url : url,
						content : {
							objid:item_id,
							app_id:APP_ID,
							objtype:add_objetype,
							content:comment_content,
							userid:uid,
							uname:nickname
						},
						timeout : 8000,
						load : function(response, ioArgs) {
							//将获取到的压缩及转码的内容进行转换
							response_compress = base64decode(response);
							response = JSON.parse(zip_inflate(response_compress));
							
							show_progress_indicator('dlg_progress','progress_indicator_container',response.info);
							setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
							//成功后就隐藏
							if(response.status == 1){
								getCommentCountById(item_id,add_objetype);
								if(no_comment == 1)
									gotoCommentView(item_id,"",add_objetype);	
								else
									getCommentById(item_id,"",add_objetype);
								
								hideDlg("dlg_add_comment");
							}
						},
						error : function(response, ioArgs) {
							show_progress_indicator('dlg_progress',	'progress_indicator_container',ERROR_NETWORK_OR_DATA);
							setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
						}
					});
			return false;
    	}
    	/*
    	 * 打开发表评论窗口
    	 */
    	openAddCommentView = function(objtype){
    		$("#comment_content").attr("value","");
    		add_objetype = objtype;
    		showDlg("dlg_add_comment");	
    		//$("#comment_content").focus();
    	}
    	
    	
		/*
		 * 从content返回到列表页面
		 */
		goBack = function(){
			var hidden_para = $("#hidden_para").val();
			var view = registry.byId("view_content");
			view.performTransition("#"+hidden_para,-1,"none");	
		}
		
		/*
		 *显示一个simpledialog
		 */
		showDlg = function(dlg) {
			registry.byId(dlg).show();
		}
		/*
		 *隐藏一个simpledialog
		 */
		hideDlg = function(dlg) {
			registry.byId(dlg).hide();
		}
		/*
		 *在弹出的simpledialog上面显示进度
		 */
		show_progress_indicator = function(dlg, cont, info) {
			//弹出时候将弹出框还原
			$("#showmessage").text(info);
			$("#login_failed").html("");
			var container = dom.byId(cont);
			container.appendChild(prog.domNode);
			prog.start();
			showDlg(dlg);
		}
		/*
		 * 隐藏窗口
		 */
		hide_progress_indicator = function(dlg) {
			prog.stop();
			hideDlg(dlg);
		}
		
		//登录功能
		var linkFrom = "";
		//发布需求相关参数
		var reqtype_temp = "";
		var nodename_temp = "";
		var biztype_temp = "";
		//从哪个页面进入到登录界面
		var login_from_page =""
		login = function(){
			//网络未连接
            if(checkConnection() == -1){
            	show_progress_indicator('dlg_progress','progress_indicator_container',NO_NETWORK);
           		setTimeout(function(){
                       hide_progress_indicator("dlg_progress");
                       }, 2000);
           		return false;
            }
			//输入合法性验证
			var email =	changeUndefinedToEmpty($("#login_email").attr("value"));
			var password =	changeUndefinedToEmpty($("#login_password").attr("value"));			
			if(email ==""){
				showAlert(ENTRY + YOUR + USERNAME);
				return false;
			}
			if(password =="" ){
				showAlert(ENTRY + YOUR + PASSWORD);
				return false;
			}
			show_progress_indicator('dlg_progress','progress_indicator_container',BEING + LOGIN +"...");

			var url =DATA_ROOT + "index.php?app=declare&mod=Index&act=doLogin";
			dojo.xhrPost({
				url: url,
				content:{username:email,password:password},
				timeout:10000,
				handleAs: "json",
				load: function(response, ioArgs){
					if( response.status == 1 ){	
						//登录成功后将用户的id和用户相关信息存放的本地存储中
						window.localStorage[APP_ID+"_email"] = email;
						window.localStorage[APP_ID+"_uid"]   = response.userinfo.uid;
						window.localStorage[APP_ID+"_nickname"]   = response.userinfo.uname;
						window.localStorage[APP_ID+"_ctime"]   = response.userinfo.ctime;
						window.localStorage[APP_ID+"_is_sipsu_member"]   = response.userinfo.is_sipsu_member;//是否为联盟成员
						var location = response.userinfo.location;
						if(location == null )
							location = "";
						window.localStorage[APP_ID+"_location"]   = location;
						window.localStorage[APP_ID+"_sex"]   = response.userinfo.sex;
						uid = response.userinfo.uid;
						nickname = response.userinfo.uname;
						//给我的信息页面赋值
						$("#username").html(email);
						$("#nickname").html(response.userinfo.uname);
						$("#ctime").html(response.userinfo.ctime);
						$("#location").html(location);
						if(response.userinfo.sex ==1)
							$("#sex").html(MALE);	
						else if(response.userinfo.sex ==0)	
							$("#sex").html(FEMALE);
						$("#showmessage").html(LOGIN +SUCCESS);
						setTimeout(function(){
		                      hide_progress_indicator("dlg_progress");
		                 }, 2000);
						$("#usertext").html(USER + INFO);
						
						if(login_from_page == "")//如果参数为空转场到用户信息列表
							registry.byId("login").performTransition("#userinfo",1,"none");
						else if(login_from_page == "view_pub_req")//跳转到发布需求view
							gotoPubReqPage(reqtype_temp, nodename_temp, biztype_temp, "login");
						else if(login_from_page == "view_pub_req_first")//跳转到发布需求选择大类view
							gotoPubReqPageByTabbar("login");
						else if(login_from_page == "view_req_index")//跳转到最新需求view
							gotoReqIndex("login");
						else if(login_from_page == "view_req_my")//跳转到我的需求view
							getReqOfMe("login","","login");
						
					}else{
						$("#showmessage").html(response.message);
						setTimeout(function(){
		                      hide_progress_indicator("dlg_progress");
		                 }, 2000);
					}	
				},
				error: function(response, ioArgs){
					$("#showmessage").html(desc);
					setTimeout(function(){
                     hide_progress_indicator("dlg_progress");
                 }, 2000);
				}
			});
		}
		//注册功能
		regist = function(){
			//网络未连接
            if(checkConnection() == -1){
            	show_progress_indicator('dlg_progress','progress_indicator_container',NO_NETWORK);
           		setTimeout(function(){
                       hide_progress_indicator("dlg_progress");
                       }, 2000);
           		return false;
            }
			//输入合法性检验
			var regist_nickname =	changeUndefinedToEmpty($("#regist_nickname").attr("value"));
			var email =	changeUndefinedToEmpty($("#regist_email").attr("value"));
			var password =	changeUndefinedToEmpty($("#regist_password").attr("value"));
			var repassword =changeUndefinedToEmpty($("#regist_repassword").attr("value"));
			if(regist_nickname =="" ){
				showAlert(ENTRY + YOUR + NICKNAME );
				return false;
			}
			if(email =="" ){
				showAlert(ENTRY + YOUR + USERNAME);
				return false;
			}
			if(password =="" ){
				showAlert(ENTRY + YOUR + PASSWORD);
				return false;
			}
			if(repassword =="" ){
				showAlert(ENTRY_PASSWORD_AGAIN);
				return false;
			}
			if(password != repassword){
				showAlert(PASSWORD_DIFFERENCE);
				return false;
			}
			show_progress_indicator('dlg_progress',	'progress_indicator_container',BEING + REGIST);
			
			var url =DATA_ROOT + "index.php?app=declare&mod=Index&act=doRegister";
			dojo.xhrPost({
				url: url,
				content:{email:email,password:password,nickname:regist_nickname},
				timeout:10000,
				handleAs: "json",
				load: function(response, ioArgs){
					if( response.status == 1 ){
						$("#username").html(email);
						$("#nickname").html(regist_nickname);
						//注册成功后将用户的id和用户账号存放的本地存储中
						window.localStorage[APP_ID+"_nickname"] = regist_nickname;
						window.localStorage[APP_ID+"_email"] = email;
						window.localStorage[APP_ID+"_uid"]   = response.uid;
						window.localStorage[APP_ID+"_ctime"]   = response.ctime;
						//注册成功后给我的信息页面赋值
						$("#username").html(email);
						$("#nickname").html(regist_nickname);
						$("#ctime").html(response.ctime);
						$("#sex").html(FEMALE);
						$("#location").html("");
						var widget = registry.byId("regist");
						widget.performTransition("#completeuserinfo",1,"none");
						$("#showmessage").html(REGIST + SUCCESS + "...");
						
						$("#usertext").html(USER + INFO);
					}else{
						showAlert(response.message);
					}	
					setTimeout(	function() {
						hide_progress_indicator("dlg_progress");
					}, 2000);	
				},
				error: function(response, ioArgs){
					$("#showmessage").html(desc);
					setTimeout(function(){
						hide_progress_indicator("dlg_progress");
					}, 2000);
				}
			});
		}
		
		//隐藏弹窗
		hide = function(id){
			registry.byId(id).hide();
			progStop();//加载的图片停止
		}
		//退出登录
		logout =function(){
			//用户退出时间将字段清空
			window.localStorage[APP_ID+"_nickname"] ="";
			window.localStorage[APP_ID+"_email"] ="";
			window.localStorage[APP_ID+"_uid"] ="";
			window.localStorage[APP_ID+"_location"] ="";
			window.localStorage[APP_ID+"_sex"] ="";
		    window.localStorage[APP_ID+"_ctime"] ="";
		    window.localStorage[APP_ID+"_is_sipsu_member"] = "";
		    uid = "";
		    show_progress_indicator('dlg_progress',	'progress_indicator_container',LOGOUT + SUCCESS);
			setTimeout(	function() {
						hide_progress_indicator("dlg_progress");
					}, 1000);	
			//$("#usertext").html(REGIST+ "/" + LOGIN);	
			$("#usertext").html(USER + LOGIN);
			/*var url =DATA_ROOT + "index.php?app=declare&mod=Index&act=logout";
				dojo.xhrGet({
					url: url,
					handleAs: "json",
					load: function(response, ioArgs){
						alert(response.message);
						
					}
				});	*/
		}
		//进入用户信息界面
		gotoUserInfo = function(){
            //将分享微信窗口隐藏
            hideWeChatAction();
			//首先判断用id是否在设备中存在（用户是否登录），如果存在就直接跳转到用户简单信息界面，否则就跳转到登录界面
			uid =  window.localStorage[APP_ID+"_uid"] ;
			var view = registry.byId("more");
			if(uid!="undefined" && uid >0){
				view.performTransition("#userinfo",1,"none");				
			}else{
				$("#login_hidden_para").val("more");
				view.performTransition("#login",1,"none");
			}	
		}
		//完善用户信息
		completeUserInfo =function(){
			var sex = $("input[name='sex']:checked").attr("value");
			var area_province = $("#area_province").val();
			var area_city = $("#area_city").val();
			nickname = window.localStorage[APP_ID+"_nickname"];
		    uid = window.localStorage[APP_ID+"_uid"];
			var url =DATA_ROOT + "index.php?app=Foryou&mod=Index&act=update";
			dojo.xhrPost({
				url: url,
				content:{uid:uid,nickname:nickname,sex:sex,area_province:area_province,area_city:area_city},
				timeout:10000,
				handleAs: "json",
				load: function(response, ioArgs){
					if(response.boolen ==1){
						$("#location").html(response.location);
						window.localStorage[APP_ID+"_location"] = response.location;
						window.localStorage[APP_ID+"_sex"] = response.sex;
						if(response.sex ==1)
							$("#sex").html(MALE);	
						else if(response.sex ==0)	
							$("#sex").html(FEMALE);
					}	
				},
				error: function(response, ioArgs){;
					return;
				}
			});	
		}
		//加载省
		var json_area = null;
		gotoProvince =function(){
			var data_province = registry.byId("data_province"); // destination view	
			var container =  data_province.containerNode;
			win.body().appendChild(prog.domNode);
			prog.start();
			//如果已经渲染
			if($("#data_province li").length >0){
				progStop();
				return ;
			}
			dojo.xhrGet({
				url: DATA_ROOT + "index.php?app=Foryou&mod=Index&act=getArea",
				timeout:8000,
				handleAs: "json",
				load: function(response, ioArgs){
					json_area = response;
					var provinces = response.provinces;
					var innerhtml ="";
					$.each(provinces,function(i,n){
						innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"view_city", transition:"none"\' onClick=\'gotoCity("'+n.id+'")\'>'
						innerhtml += n.name ;
						innerhtml += '</li>';
					});
					container.innerHTML =innerhtml;
					parser.parse(container);
					progStop();
				},
				error: function(response, ioArgs){
					var innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick="gotoProvince()">'+RELOAD+'</span></div></div>';
					//var innerhtml = '<p class="m10 b f14 lh22">省/直辖市信息加载超时，请检查您的网络连接是否正常 ！<a style="color:#218ECE" href="javascript:void(0)" onClick="gotoProvince()">  请点击这里进行刷新</a></p>';
					container.innerHTML =innerhtml;
					parser.parse(container);
					progStop();
				}
			});	
		}
		//进入城市列表
		var provinceid_temp=0;//省/直辖市临时变量用来判断是否重新渲染城市列表
		gotoCity = function(provinceid){
			var data_province = registry.byId("data_city"); // destination view	
			var container =  data_province.containerNode;
			win.body().appendChild(prog.domNode);
			prog.start();
			//如果已经渲染了城市列表并且是选择的是相同的省/直辖市就返回
			if($("#data_city li").length >0 && provinceid_temp == provinceid){
				progStop();
				return ;
			}
			//调用方法将位置进行还原
			setViewTop("view_city");
			var innerhtml ="";
			var json_provinces= json_area.provinces
			$.each(json_provinces,function(i,n){
				if(n.id==provinceid){
					provinceid_temp = provinceid;
					 $.each(n.citys,function(j,m){
						for(var p in m){
							innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"completeuserinfo",checked:"true",transition:"none"\' onClick=\'selectArea("'+provinceid+'","'+n.name+'","'+p+'","'+m[p]+'")\'>';
							innerhtml += m[p] ;
							innerhtml += '</li>';
						};
					});
				}
			});	
			container.innerHTML =innerhtml;
			parser.parse(container);
			progStop();
		}
		/**
		 * 设置地区相关信息
		 */
		selectArea =function(provinceid,province,cityid,city){
			$("#selectarea").html(province + " " +city);
			$("#area_province").val(provinceid) ;
			$("#area_city").val(cityid) ;
		}
		/**
		 *返回的时候将页面的位置还原 
		 */
		gotoIndex = function(){
			//调用方法将位置进行还原
			setViewTop("index");		
		}
		/**
		 * 进入搜索页面
		 */
		gotoSearch = function(){
			initTheme();//加载主题
			$("#hidden_para").val("view_searchlist")
			//调用方法将位置进行还原
			setViewTop("view_search");
		}
		
		/**
		 * 进入设置窗口
		 * */
		gotoMore = function() {
			$("#login_hidden_para").val("more")
			uid = changeUndefinedToEmpty(window.localStorage[APP_ID+"_uid"]);
			//如果用户已经登录了
			if( uid !="" && uid !=0 )
				$("#usertext").html(USER + INFO);
			else 	
				//$("#usertext").html(REGIST+ "/" + LOGIN);
				$("#usertext").html(USER + LOGIN);
			var view = registry.byId("index");
			win.body().appendChild(prog.domNode);
			prog.start();
			view.performTransition("#more",1,"none");
			progStop();//加载的图片停止
		}

		/**
		 * 进入设置页面
		 */
		gotoSetting = function() {
			var view = registry.byId("index");
			win.body().appendChild(prog.domNode);
			prog.start();

			if (tel != "")
				$("#tel").html(tel);
			$("#weixinnum").val(weixinnum);
			$("#email").val(email);
			$("#username").val(username);
			view.performTransition("#setting",1,"none");
			progStop();//加载的图片停止
		}
		
		/**
		 *进入关于此应用
		 */
		gotoAbout = function(para) {
			//将分享微信窗口隐藏
            hideWeChatAction();
			//调用方法将位置进行还原
			setViewTop("about");
			var view = registry.byId("index");
			if (para == 1)
				$("#about_back_para").val("index");
			else{
				$("#about_back_para").val("more");
				view = registry.byId("more");
			}
			win.body().appendChild(prog.domNode);
			prog.start();
			view.performTransition("#about",1,"none");
			progStop();//加载的图片停止					
		}
		/**
		 *从关于此应用中返回
		 */
		goBackFromAbout = function() {
			var hidden_para = $("#about_back_para").val();
			var view = registry.byId("about");
			view.performTransition("#"+hidden_para,-1,"none");
			
		}
		
		/**
		 *进入关于园区信用岛
		 */
		gotoAboutCredit = function(para) {
			//将分享微信窗口隐藏
            hideWeChatAction();
			//调用方法将位置进行还原
			setViewTop("aboutcredit");
			var view = registry.byId("index");
			if (para == 1)
				$("#aboutcredit_back_para").val("index");
			else{
				$("#aboutcredit_back_para").val("more");
				view = registry.byId("more");
			}
			win.body().appendChild(prog.domNode);
			prog.start();
			view.performTransition("#aboutcredit",1,"none");
			progStop();//加载的图片停止					
		}
		/**
		 *从关于园区信用岛中返回
		 */
		goBackFromAboutCredit = function() {
			var hidden_para = $("#aboutcredit_back_para").val();
			var view = registry.byId("aboutcredit");
			view.performTransition("#"+hidden_para,-1,"none");
		}
		
		/**
		 *进入到设置地区的页面
		 */
		 gotoSetPlace = function(para){
			 var view = registry.byId("index");
			 if(para == 1)
				$("#setplace_back_para").val("index");
			 else{
				 $("#setplace_back_para").val("setting");
				 view = registry.byId("setting"); 
			 }		
			win.body().appendChild(prog.domNode);
			prog.start();
			view.performTransition("#setplace",1,"none");
			progStop();//加载的图片停止	
		}
	   /**
		*从关于园区信用岛中返回
		*/
		goBackFromSetPlace = function() {
			var hidden_para = $("#setplace_back_para").val();
			var view = registry.byId("setplace");
			view.performTransition("#"+hidden_para,-1,"none");
		}
	    
		/**
		 * 进入服务超市首页
		 */
		gotoServiceIndex = function(){
			
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
            win.body().appendChild(prog.domNode);
			prog.start();	
			var isnoask = window.localStorage[APP_ID+"_req_noask"];
			if(isnoask != "noask"){
				//调用方法将位置进行还原
				setViewTop("view_req_first");
				registry.byId("index").performTransition("#view_req_first",1,"none");
				progStop();//加载的图片停止
			}else{
				//调用方法将位置进行还原
				setViewTop("view_service_index");
				registry.byId("index").performTransition("#view_service_index",1,"none");

				//调用渲染生成需求列表函数
				initServiceList();
			}
			
			/*
			var store1 = new dojo.data.ItemFileReadStore({data: {
				  items: [ {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"},
				        {src:"images/notice.png", value:"glass", footerText:"glass"}
				      ]
				}});
			
			registry.byId("carousel1").setStore(store1);
			*/
		}
		/**
		 * goBackFromServiceList
		 */
		goBackFromServiceList = function(){
			
			//$("#service_type_div").fadeOut(2000);
			$("#service_head").hide(1000)
			$("#view_service_index").hide(1000);
			$("#index").fadeIn(1500);
		}
		/**
		 * 进入服务超市详情页面
		 */
		gotoServiceInfo = function(id,nodename){
			//调用方法将位置进行还原
			setViewTop("view_service_info");
			win.body().appendChild(prog.domNode);
			prog.start();	
			var service_info = registry.byId("service_info"); // destination view	
			var container =  service_info.containerNode;
			var innerhtml = "";
			var serviceList_str = changeUndefinedToEmpty(window.localStorage[APP_ID+"_serviceList"]);
			if(serviceList_str !=""){
				var	serviceList_json = JSON.parse(serviceList_str);
				//渲染生成服务超市类型
				innerhtml = createHTMLForServiceInfo(id, nodename, serviceList_json);
				container.innerHTML = innerhtml;
				parser.parse(container);
				progStop();//加载的图片停止
				//$("#view_service_info .mblHeadingDivTitle").text(nodename);
			}
		}
		/**
		 * 获取服务超市列表信息
		 */
		var serviceList_JSON = "";
	
		initServiceList = function(){
			
			var clientWidth = document.body.clientWidth-20;
			var clientHeight = clientWidth/3 * 5;
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
			win.body().appendChild(prog.domNode);
			prog.start();	
			var service_list = registry.byId("service_list"); // destination view	
			var container =  service_list.containerNode;
			var innerhtml = "";
			var serviceList_str = changeUndefinedToEmpty(window.localStorage[APP_ID+"_serviceList"]);
			//如果本地存储的数据不为空
			if(serviceList_str !=""){
				/*var service_list_html ="";
				dojo.xhrGet({
					url : DATA_ROOT+ "apps/declare/service_list.html?key=" + KEY,
					sync:true,
					load : function(response, ioArgs) {
						window.localStorage[APP_ID+"_aboutcredit"] = response;
						var container = service_list.containerNode;
						container.innerHTML = response;
						parser.parse(container);
					}
				});
			*/
				var	serviceList_json = JSON.parse(serviceList_str);
					service_list.destroyDescendants();//将页面内的内容清空
				//if($("#service_list ul li").length ==0){
					//渲染生成服务超市类型
					innerhtml = createHTMLForServiceList(serviceList_json);
					container.innerHTML = innerhtml;
					parser.parse(container);
				//}
				
				
				//alert(window.screen.width);
				//alert("屏幕可用大小："+screen.availWidth+"*"+screen.availHeight)
				$("#service_ul").css("width",clientWidth+"px");
				$("#service_ul").css("height",clientHeight+"px");
				h_iconItem =  $("#service_1").height();
				//两秒钟以后执行切换操作
				setTimeout(	function() {
					startChageBacground();
				}, 2000);
			}
			dojo.xhrGet({
				url : DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=getServiceList&perpage=3",
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					response = changeUndefinedToEmpty(response);
					serviceList_JSON = response;
					window.localStorage[APP_ID+"_serviceList"] = zip_inflate(response_compress);
					//将数据进行MD5转码
					var serviceList_MD5 =  window.localStorage[APP_ID+"_serviceList_MD5"];
					//如果MD5码不相等就进行渲染
					if(serviceList_MD5 != hex_md5(response_compress)){
						if( response !="")
							innerhtml = createHTMLForServiceList(response);
						container.innerHTML = innerhtml;
						parser.parse(container);
					}
					progStop();
					//将数据进行MD5转码
					window.localStorage[APP_ID+"_serviceList_MD5"] = hex_md5(response_compress);
					$("#service_ul").css("width",clientWidth+"px");
					$("#service_ul").css("height",clientHeight+"px");
				},
				error : function(response, ioArgs) {
					if($("#service_list li").length > 0){
						progStop();
						return false;
					}
					show_progress_indicator('dlg_progress',	'progress_indicator_container',ERROR_NETWORK_OR_DATA);
					setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
					innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick="initServiceList();">'+RELOAD+'</span></div></div>';
					container.innerHTML = innerhtml;
					parser.parse(container);
				}
			}); 
		}
		/**
	     *获取最新需求
	     */
		var nextpage_req_index = 1;
		var nextpage_req_my = 1;
		var josn_reqlist_old_index = null;
		var josn_reqlist_old_my = null;
		gotoReqIndex = function(page,handle,fromPage){
			var view = registry.byId("view_service_index");
			if(changeUndefinedToEmpty(page) !="")
				view = registry.byId(page);
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
            if(uid == ""){
				login_from_page = "view_req_index";
				view.performTransition("#login",1,"none");
				$("#login_hidden_para").val("view_service_index");
				progStop();
				return false
			}
           //调用方法将位置进行还原
			setViewTop("view_req_index");
			nextpage_req_index = 1;
			josn_reqlist_old_index = null;
			if(handle !="refresh")
				view.performTransition("#view_req_index",1,"none");
			$("#req_back_para_old").val("view_req_index");
			//调用渲染生成需求列表函数
			initReqList("",page);
		}
		/**
		 * 从需求首页返回
		 */
		gobackFromViewReqIndex = function(){
			registry.byId("view_req_index").performTransition("#view_service_index",1,"none");
			//两秒钟以后执行切换操作
			setTimeout(	function() {
				startChageBacground();
			}, 2000);
		}
		/**
		 * 渲染生成需求列表页面
		 * 参数说明：type：标识渲染的页面
		 *         from：主要是从登录界面跳转到列表页面时候的参数
		 *         handel：操作-刷新
		 */
		var josn_reqlist_old_pub_byme ="";
		var nextpage_req_pub_byme = 1;
		initReqList = function(type,from,handel){
			if(from !="login" &&  from !="view_pub_req"){
				win.body().appendChild(prog.domNode);
				prog.start();	
			}
			//根据type来动态来赋值
			var req_list = registry.byId("req_list"); // destination view	
			var btn_load_more = "btn_loadmore_req_index";
			var page = "view_req_index";
			var josn_reqlist_old = josn_reqlist_old_index;
			var curpage = nextpage_req_index;
			var nextpage_req = nextpage_req_index;
			var ul_id = "req_list";
			if(type == "replayByMe"){
				req_list = registry.byId("req_list_replay"); // destination view	
				btn_load_more = "btn_loadmore_req_my";
				page = "view_req_my";
				josn_reqlist_old = josn_reqlist_old_my;
				curpage = nextpage_req_my;
				nextpage_req = nextpage_req_my;
				ul_id = "req_list_replay";
			}else if(type == "pubByMe"){
				req_list = registry.byId("req_pub_byme_list"); // destination view	
				btn_load_more = "btn_loadmore_req_pub_byme";
				page = "view_req_pub_byme";
				josn_reqlist_old = josn_reqlist_old_pub_byme;
				curpage = nextpage_req_pub_byme;
				nextpage_req = nextpage_req_pub_byme;
				ul_id = "req_pub_byme_list";
			}
			$("#"+btn_load_more).text(LOADING);
			
			//如果是刷新就显示第一页数据
			if(handel == "refresh")
				nextpage_req = 1;
                
			var container =  req_list.containerNode;
			var innerhtml = "";
			dojo.xhrGet({
				url : DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=getReqList",
				content : {
					userid : uid,
					perpage:PERPAGE,
					p:nextpage_req,
					type:type
				},
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					var data = "";
					if(response !=null && response !="")
						data = changeUndefinedToEmpty(response.data);
					if(josn_reqlist_old){
						var string_reqlist_old = JSON.stringify(josn_reqlist_old);
						var string_response = JSON.stringify(response.data);
						string_reqlist_old = string_reqlist_old.substr(0,string_reqlist_old.length -1);
						string_response = string_response.substr(1,string_response.length -1);
						string_response =  $.trim(string_reqlist_old) +"," + $.trim(string_response);
						data =  JSON.parse(string_response);
					}
					innerhtml = createHTMLForReqList(data,page);
					container.innerHTML = innerhtml;
					parser.parse(container);
					if(from !="login" &&  from !="view_pub_req")
						progStop();
					//$("#req_list").hide();
					//分页按钮
					//如果总页数大于p的总数就显示分页框
					if(response.pageCount > curpage){
						$("#"+btn_load_more).show();
					}else
						$("#"+btn_load_more).hide();
					$("#"+btn_load_more).text(LOAD_MORE);
					
					if(type == "replayByMe"){
						josn_reqlist_old_my = data;
						nextpage_req_my++;
					}else if(type == "pubByMe"){
						josn_reqlist_old_pub_byme = data;
						nextpage_req_pub_byme ++ ;
					}else{
						josn_reqlist_old_index = data;
						nextpage_req_index++;
					}	
				},
				error : function(response, ioArgs) {
					$("#"+btn_load_more).text(LOAD_MORE);
					
					show_progress_indicator('dlg_progress',	'progress_indicator_container',ERROR_NETWORK_OR_DATA);
					setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
					//如果是第一次加载数据出错的时候才会显示刷新的按钮
					if(nextpage_req == 1){
						if($("#"+ul_id +" li").length > 0){
							progStop();
							return false;
						}
						innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'initReqList("'+type+'","","refresh");\'>'+RELOAD+'</span></div></div>';
						container.innerHTML = innerhtml;
						parser.parse(container);
					}
				}
			}); 
		}
		
	    /**
	     *从登录窗口返回 
	     */
		goBackFromLogin = function(){
			var hidden_para = $("#login_hidden_para").val();
			var view = registry.byId("login");
			view.performTransition("#"+hidden_para,-1,"none");
			if(hidden_para == "view_service_index"){
				//两秒钟以后执行切换操作
				setTimeout(	function() {
					startChageBacground();
				}, 2000);
			}
			
		}
	    /**
	     *用户在阅读第一次使用后点击为知道按钮 
	     */
		reqFirstSub = function(){
			var view = registry.byId("view_req_first");
			//如果用户选择了不再提示
			if($("#reqNoShow").attr("checked") == "checked")
				window.localStorage[APP_ID+"_req_noask"] = "noask";
			//跳转到服务超市页面
			view.performTransition("#view_service_index",1,"none");
			
			//渲染服务超市
			initServiceList();
		}
		/**
		 * 点击底部导航栏进入发布需求页面进入发布需求页面
		 */
		var pubFromView ="";
		gotoPubReqPageByTabbar = function( fromPage ){
			if(fromPage == "login")
				$("#view_pub_req_first_back_para").val("view_service_index");
			else{
				win.body().appendChild(prog.domNode);
				prog.start();
				$("#view_pub_req_first_back_para").val(fromPage);
				view_req_me_back_para
				pubFromView = fromPage;
			}
			setViewTop("view_pub_req_first");
			$("#view_service_index li").removeClass("mblTabBarButtonSelected");
			//如果用户未登录跳转到登录界面
			var view = registry.byId("view_service_index");
			if(changeUndefinedToEmpty(fromPage) !="")
				view = registry.byId(fromPage);
			if(uid == ""){
				login_from_page = "view_pub_req_first";
				view.performTransition("#login",1,"none");
				$("#login_hidden_para").val(fromPage);
				progStop();
				return false
			}
			var innerhtml = "";
			var req_first_list = registry.byId("req_first_list"); // destination view	
			req_first_list.destroyDescendants();//将页面内的内容清空	
			var container =  req_first_list.containerNode;
			//如果没有数据就从服务器获取此时调用函数initServiceList（）;
			var serviceList_str = changeUndefinedToEmpty(window.localStorage[APP_ID+"_serviceList"]);
			if(serviceList_str  == "")
				initServiceList()
			//获取到已经加载的数据并进行转换
			if(serviceList_str !=""){
				var serviceList_json = JSON.parse(serviceList_str)
				
			
				$.each(serviceList_json,function(i,e){
					innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#"\' style="border:solid 1px #d8d8d8;margin:10px;font-size:14px;" onclick=\'javascript:choiceReqType("'+e.id+'","'+e.nodename+'")\'>'+e.nodename +'</li>';
				});
			
				if( hex_md5(innerhtml) != hex_md5(changeUndefinedToEmpty(window.localStorage[APP_ID+"_req_first_list_htnl_md5"]))){
					container.innerHTML = innerhtml;
					parser.parse(container);
				}
				if(fromPage != "login")
					progStop();
				//将需求大类的MD5存储
				window.localStorage[APP_ID+"_req_first_list_htnl_md5"] = hex_md5(innerhtml);
				view.performTransition("#view_pub_req_first",1,"none");
			}
				
		}
		
		/**
		 * goBackFromViewPubReqFirst从需求发布页面返回
		 */
		goBackFromViewPubReqFirst = function(){
			
			registry.byId("view_pub_req_first").performTransition("#"+$("#view_pub_req_first_back_para").val(),-1,"none");
			if($("#view_pub_req_first_back_para").val() == "view_service_index"){
				//两秒钟以后执行切换操作
				setTimeout(	function() {
					startChageBacground();
				}, 2000);
			}
		}
		/**
		 * 选择需求服务类型
		 */
		choiceReqType = function(reqtype, nodename){
			//如果用户选择了一个类型那么就调用方法gotoPubReqPage();
			gotoPubReqPage(reqtype, nodename, "", "view_pub_req_first");
			$("#view_pub_req_back_para").val("view_pub_req_first");
		} 
		/**
		 * 进入发布需求页面
		 */
		gotoPubReqPage = function(reqtype, nodename, biztype, fromPage){
			//alert(pubFromView)
			if(fromPage !="login"){
				win.body().appendChild(prog.domNode);
				prog.start();	
			}
			$("#view_pub_req_back_para").val("view_service_info");
			//如果用户未登录跳转到登录界面
			var view = registry.byId("view_service_info");
			if(changeUndefinedToEmpty(fromPage) !="")
				view = registry.byId(fromPage);
			if(uid == ""){
				login_from_page = "view_pub_req";
				reqtype_temp  = reqtype;
				nodename_temp = nodename;
				biztype_temp  = biztype
				view.performTransition("#login",1,"none");
				$("#login_hidden_para").val("view_service_info");
				progStop();
				return false
			}
			else{
				//调用方法将位置进行还原
				setViewTop("view_pub_req");
				if(pubFromView == "view_req_pub_byme" || pubFromView == "view_req_my")
				   pubFromView = "view_service_index";
				if(fromPage == "view_service_info")
					pubFromView = "view_service_info";
				//view.performTransition("#view_pub_req",1,"none");
			}
			//corporation_list.destroyDescendants();//将页面内的内容清空	
			//alert(DATA_ROOT	+ "index.php?app=declare&mod=Index&act=pubReq&reqtype =" + reqtype + "&biztype="+ biztype);
			dojo.xhrGet({
				url : DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=pubReq&reqtype =" + reqtype + "&biztype="+ biztype,
				content : {
					reqtype : reqtype,
					biztype : biztype
				},
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					$("#biztype_list_ul").html(response)
					view.performTransition("#view_pub_req",1,"none");
					if(fromPage !="login")
						progStop();
				},
				error : function(response, ioArgs) {
					show_progress_indicator('dlg_progress',	'progress_indicator_container',desc);
					setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
					var innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'getReqInfoById('+id+')\'>'+RELOAD+'</span></div></div>';
					
					container.innerHTML = innerhtml;
					parser.parse(container);
                    $("#view_req_info").show();    
				}
			}); 
			$("#service_type").text(nodename);
		}
		/**
		 * goBackFromViewPubReq:L从需求发布页面返回
		 */
		goBackFromViewPubReq = function(){
			registry.byId("view_pub_req").performTransition("#"+$("#view_pub_req_back_para").val(),-1,"none");
			if($("#view_pub_req_back_para").val() == "view_service_index"){
				//两秒钟以后执行切换操作
				setTimeout(	function() {
					startChageBacground();
				}, 2000);
			}
		}
		/**
		 * doPubReq：发布需求
		 */
		doPubReq = function(){
			//每次加载的时候进行网络连接的判断
            //网络未连接
            if(checkConnection() == -1){
            	show_progress_indicator('dlg_progress','progress_indicator_container',NO_NETWORK);
           		setTimeout(function(){
                       hide_progress_indicator("dlg_progress");
                       }, 2000);
           		return false;
            }
			var reqattrs_otherinfo = $("#reqattrs_otherinfo").val();
			//将将html标签全部去掉空格全部去掉
			reqattrs_otherinfo = $.trim(reqattrs_otherinfo.replace(/<V?.+?>/g,""));
			//将回车和换行符去掉
			reqattrs_otherinfo = $.trim(reqattrs_otherinfo.replace(/\n/g,""));
			//将空格去掉
			reqattrs_otherinfo = $.trim(reqattrs_otherinfo.replace(/<V?.+?>/g,""));	
			/*if(req_pub_content == "" || req_pub_content == PLEASE_ENTER_YOUR_FEEDBACK){
				showAlert(PLEASE_ENTER_YOUR_FEEDBACK);
				return false;
			}*/
			if (reqattrs_otherinfo.length > 300) {
				showAlert(ALERT_REQ_REPLAY_LENGTH);
				return false;
			}
			var reqattrs_biztype =  $("#reqattrs_biztype").val();
			if(reqattrs_biztype == ""){
				showAlert(PLEASE_ENTER_BIZ_TYPE);
				return false;
			}
			var reqattrs_priority =  $("#reqattrs_priority").val();
			/*if(reqattrs_priority == ""){
				showAlert(PLEASE_ENTER_BIZ_TYPE);
				return false;
			}*/
			show_progress_indicator('dlg_progress','progress_indicator_container', DATA_SAVING);
       		var url =  DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=doPubReq";
			dojo.xhrPost({
				url : url,
				content : {
					reqattrs_otherinfo : reqattrs_otherinfo,//注意存储岛xml中的数据前面要加上前缀reqattrs_，否则后台无法解析
					reqattrs_biztype : reqattrs_biztype,//注意存储岛xml中的数据前面要加上前缀reqattrs_，否则后台无法解析
					reqattrs_priority : reqattrs_priority,//注意存储岛xml中的数据前面要加上前缀reqattrs_，否则后台无法解析
					reqtype : $("#reqtype_typeid").val(),
					contractperson:$("#req_pub_linkuser").val(),
					contractphone:$("#req_pub_linktel").val(),
					opencontract:1,//允许公开联系方式
					openreq:1,//允许公开需求
					reqattrs_xml:$("#reqattrs_xml").val(),
					uname : nickname,
					userid:uid
				},
				handleAs: "json",
				timeout : 8000,
				load : function(response, ioArgs) {
					
					//成功跳转到为发布的页面
					if(response.status == 1){
						getReqOfMe("view_pub_req");
						setTimeout(	function() {
							show_progress_indicator('dlg_progress','progress_indicator_container',response.info);
							setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 1000);
						}, 1000);
						
					}
				},
				error : function(response, ioArgs) {
					show_progress_indicator('dlg_progress',	'progress_indicator_container', ERROR_NETWORK_OR_DATA);
					setTimeout(	function() {
						hide_progress_indicator("dlg_progress");
					}, 2000);
				}
			});
			return false;
		}
		
		/**
		 * 渲染我的需求列表：
		 * 包含我回复的需求和我发布的需求
		 */
		getReqOfMe = function(fromPage,targetView,handel){
			
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
            //alert($("#view_req_me_back_para").val());
            //如果不是从需求发布页面跳转过来的
            if(	pubFromView ==""){
	            if( fromPage == "login" ){
					$("#view_req_me_back_para").val("view_service_index"); 
		        }else{
		        	if(fromPage !="view_req_pub_byme" && fromPage !="view_req_my" && fromPage !="view_pub_req")
		        		$("#view_req_me_back_para").val(fromPage);
		        }
            }else{
            	$("#view_req_me_back_para").val(pubFromView);
            	pubFromView = "";
            }
            	
			//如果用户未登录跳转到登录界面
			var view = registry.byId("view_service_index");
			if(changeUndefinedToEmpty(fromPage) !="")
				view = registry.byId(fromPage);
			if(uid == ""){
				 if(targetView =="view_req_pub_byme")
					 login_from_page = "view_req_pub_byme";
				 else
					 login_from_page = "view_req_my";
				view.performTransition("#login",1,"none");
				$("#login_hidden_para").val(fromPage);
				progStop();
				return false
			}
			//登录用户不是联盟会员机构就跳转到“我发布的页面”
			var is_sipsu_member =  window.localStorage[APP_ID+"_is_sipsu_member"];
			//如果是联盟会员机构就跳转到“我的需求view”，否则跳转到“我发布的需求view”
			if(is_sipsu_member != "yes"){
				//调用方法将位置进行还原
    			setViewTop("view_req_pub_byme");
    			$("#req_back_para_old").val("view_req_pub_byme");
				$("#title1").text(REQ_PUB_BYME);
				$("#tabbar").hide();
				$("#req_pub_byme_list").css("margin-top","20px");	
				nextpage_req_pub_byme =1 ;
    			josn_reqlist_old_pub_byme = null;
    			initReqList('pubByMe',fromPage);
    			if(handel !="refresh")
    				view.performTransition("#view_req_pub_byme",1,"none");
				return false;
			}else{
				
				$("#title1").text(REQ_OFME);
				$("#tabbar").show();
				$("#req_pub_byme_list").css("margin-top","75px");
				//如果目标view为“我发布的需求”
	            if(fromPage =="view_pub_req" || targetView =="view_req_pub_byme"){
	            	//调用方法将位置进行还原
	    			setViewTop("view_req_pub_byme");
	    			nextpage_req_pub_byme =1 ;
	    			josn_reqlist_old_pub_byme = null;
	    			initReqList('pubByMe',fromPage);
	    			if(handel !="refresh")
	    				view.performTransition("#view_req_pub_byme",1,"none");
	    			$("#req_back_para_old").val("view_req_pub_byme");
	    			
	            }else{
	            	//调用方法将位置进行还原
	    			setViewTop("view_req_my");
	    			nextpage_req_my =1 ;
	    			josn_reqlist_old_my = null;
	    			
	    			initReqList('replayByMe',fromPage);
	    			$("#req_back_para_old").val("view_req_my");
	    			if(handel !="refresh")
	    				view.performTransition("#view_req_my",1,"none");
	           }
			} 
		}
		/**
		 * 从我的需求view返回
		 */
		goBackFromMyReqView =function(fromView){
			registry.byId(fromView).performTransition("#"+$("#view_req_me_back_para").val(),-1,"none");
			if($("#view_req_me_back_para").val() == "view_service_index"){
				//两秒钟以后执行切换操作
				setTimeout(	function() {
					startChageBacground();
				}, 2000);
			}
		}
		/**
	     *根据需求id获取需求的详细信息
	     */
		getReqInfoById = function(id,page){
			$("#req_back_para").val(page);
			
			win.body().appendChild(prog.domNode);
			prog.start();
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
			//调用方法将位置进行还原
			setViewTop("view_req_info");
			var req_info = registry.byId("req_info"); // destination view
			var reqreplay_info = registry.byId("reqreplay_info"); // destination view
			
			var container =  req_info.containerNode;
			container.innerHTML = '<p class="m10 b f14">'+LOADING_WAIT+'</p>';
            
			$("#reqreplay_info").hide();
			$("#reqreplay").hide();
            $("#replay_h2").hide();
            //alert(DATA_ROOT	+ "index.php?app=declare&mod=Index&act=getReqInfoById&userid="+uid +"&id="+id)
			var container_replay =  reqreplay_info.containerNode;
			dojo.xhrGet({
				url : DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=getReqInfoById",
				content : {
					userid : uid,
					id : id
				},
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					var innerhtml = createHTMLForReqInfo(response);
					var innerhtml_replay = createHTMLForReqreplayInfo(response);
					container.innerHTML =innerhtml;
					container_replay.innerHTML =innerhtml_replay;
					parser.parse(container);
					progStop();
					$("#reqId").val(id);
                        //$("#view_req_info").show();
				},
				error : function(response, ioArgs) {
					show_progress_indicator('dlg_progress',	'progress_indicator_container',desc);
					setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
					var innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick=\'getReqInfoById('+id+')\'>'+RELOAD+'</span></div></div>';
					container.innerHTML = innerhtml;
					parser.parse(container);
                    $("#view_req_info").show();    
				}
			}); 
		}
	    /**
	     *显示回复需求弹出框
	     */
	    showRepalydlg = function(){
	    	showDlg("dlg_req_replay");	
	    }
	    /**
	     * 需求回复界面 
	     */
	    reqRepaly = function(){
	    	$("#req_replay_content").attr("value",'');
	    	showRepalydlg();
	    	$("#reqRplayId").val(0);
	    }
	   /**
	    *回复需求以及编辑需求的回复
	    */
	    doReplay  = function(){
	    	
	    	 //每次加载的时候进行网络连接的判断
            //网络未连接
            if(checkConnection() == -1){
            	show_progress_indicator('dlg_progress','progress_indicator_container',NO_NETWORK);
           		setTimeout(function(){
                       hide_progress_indicator("dlg_progress");
                       }, 2000);
           		return false;
            }
			var req_replay_content = $("#req_replay_content").attr("value");
			//将将html标签全部去掉空格全部去掉
			req_replay_content = $.trim(req_replay_content.replace(/<V?.+?>/g,""));
			//将回车和换行符去掉
			req_replay_content = $.trim(req_replay_content.replace(/\n/g,""));
			//将空格去掉
			req_replay_content = $.trim(req_replay_content.replace(/<V?.+?>/g,""));	
			if (req_replay_content.length > 300) {
				showAlert(ALERT_REQ_REPLAY_LENGTH);
				return false;
			}
			//uid = changeUndefinedToEmpty(uid);
			show_progress_indicator('dlg_progress','progress_indicator_container',DATA_SAVING);
       		var reqRplayId = $("#reqRplayId").val();
       		var reqId = $("#reqId").val();
       		var url =  DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=doAddReqreply";
       		if(reqRplayId != 0)
       			url =  DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=doEditReqreply";
			dojo.xhrPost({
						url : url,
						content : {
							userid:uid,
							uname:nickname,
							rid:reqId,
							content : req_replay_content,
							rrid:reqRplayId
						},
						timeout : 8000,
						load : function(response, ioArgs) {
							//将获取到的压缩及转码的内容进行转换
							response_compress = base64decode(response);
							response = JSON.parse(zip_inflate(response_compress));
							$("#showmessage").html(response.info);
							hideDlg("dlg_req_replay");
							//如果需求回复id为0那么说明是进行回复
							if(reqRplayId == 0){
								if(response.status == 0){
									setTimeout(	function() {
										hide_progress_indicator("dlg_progress");
									}, 2000);
									return false;
								}
									
								$("#reqreplay_info").hide();
								$("#reqreplay").hide();
								$("#replay_h2").hide();
								$("#showmessage").html(REPLAY_SUCCESS);
								var req_info = registry.byId("req_info"); // destination view
								var reqreplay_info = registry.byId("reqreplay_info"); // destination view
								var container =  req_info.containerNode;
								var container_replay =  reqreplay_info.containerNode;
								container.innerHTML = '<p class="m10 b f14">'+LOADING_WAIT+'</p>';
								var innerhtml = createHTMLForReqInfo(response);
								var innerhtml_replay = createHTMLForReqreplayInfo(response);
								container.innerHTML =innerhtml;
								container_replay.innerHTML =innerhtml_replay;
								parser.parse(container);
								$("#reqId").val(reqId);
							}else{
								$("#edittime_"+reqRplayId).show();
								$("#reqreplay_"+reqRplayId).show();
								if(response.replydesc)
									$("#replydesc_"+reqRplayId).html(response.replydesc);
								else{
									$("#reqreplay_"+reqRplayId).hide();
									$("#replydesc_"+reqRplayId).html(response.replydesc);
									}	
								$("#edittime_"+reqRplayId).html(response.edittime);
							}
							setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
						},
						error : function(response, ioArgs) {
							show_progress_indicator('dlg_progress',	'progress_indicator_container',ERROR_NETWORK_OR_DATA);
							setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
						}
					});
			return false;
	    }
	    
	    /**
	     * 编辑需求回复
	     */
	    editReqreply = function(replayid){
	    	$("#req_replay_content").attr("value",$.trim($("#replydesc_"+replayid).text()));
	    	$("#reqRplayId").val(replayid);
	    	showRepalydlg();
	    }
	    /**
	     * 删除回复
	     */
        var req_id = 0;
        var replay_id = 0;
	    delReqreplay = function(rrid,rid){
            req_id = rid;
            replay_id  = rrid
	    	//每次加载的时候进行网络连接的判断
            //网络未连接
            if(checkConnection() == -1){
            	show_progress_indicator('dlg_progress','progress_indicator_container',NO_NETWORK);
           		setTimeout(function(){
                       hide_progress_indicator("dlg_progress");
                       }, 2000);
           		return false;
            }
            //删除需求
            if(RUN_MODE == "web"){
            	if(confirm(CONFIRM_DEL_REQ_REPLAY))
            		doDelReqreplay();
            }else
            	showConfirm(CONFIRM_DEL_REQ_REPLAY,LANG_REMIND);
	    }
        /**
         * 删除需求回复
         */	
   		doDelReqreplay = function(){
            
	    		dojo.xhrGet({
					url : DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=delReqreplay",
					content : {
						rid : req_id,
						rrid: replay_id
					},
					timeout : 8000,
					sync:true,
					handleAs : "json",
					load : function(response, ioArgs) {
						show_progress_indicator('dlg_progress',	'progress_indicator_container', response.info);
						setTimeout(	function() {
									hide_progress_indicator("dlg_progress");
								}, 2000)
						//如果删除成功就将当前的回复删除或者隐藏,同时将回复按钮显示
						if(response.status ==1){
							$("#reqReplay_list_"+replay_id).hide();
							$("#reqreplay").show();	
							if(response.count == 0){
								$("#reqreplay_info").hide();
		                    	$("#replay_h2").hide();
							}	
						}	
					},
					error : function(response, ioArgs) {
						show_progress_indicator('dlg_progress',	'progress_indicator_container', ERROR_NETWORK_OR_DATA);
						setTimeout(	function() {
									hide_progress_indicator("dlg_progress");
								}, 2000);
					}
				}); 
	    	}
	    /**
	     * 从需求详情页面返回
	     */
	    goBackFromReqInfo = function(){
			registry.byId("view_req_info").performTransition("#"+$("#req_back_para").val(),-1,"none");
			//如果此时$("#req_back_para").val() == "view_corporation_info"
			//alert($("#req_back_para").val())
			//alert($("#req_back_para_old").val())
			if( $("#req_back_para").val()== "view_corporation_info")
				$("#req_back_para").val($("#req_back_para_old").val());
	    }
	    /**
		 * 进入服务机构列表
		 */

		var corporationList_JSON = "";
		var corporationList_p = 1;
		var corType = "";
		var old_corType="";
    	gotoCorporationList = function(fromPage,type){
    		//如果在机构列表页面中点击同一个类型按钮就直接返回
    		if(changeUndefinedToEmpty(corType) == changeUndefinedToEmpty(type)  && fromPage =="view_corporation_list")
    			return false;
    		//如果点击的是全部按钮
    		/*if(changeUndefinedToEmpty(type) ==""){
    			$("#all_corType").css("border-color","#048bf4");
    			$("#all_corType").css("background","#048bf4");
    			$("#all_corType").css("color","#fff");
    			$("#"+corType).css("border-color","#dbdbdb");
    			$("#"+corType).css("color","#000");
    			$("#"+corType).css("background","#fff");
    		}else{
    			if(changeUndefinedToEmpty(corType) !=""){
        			$("#"+corType).css("border-color","#dbdbdb");
        			$("#"+corType).css("color","#000");
        			$("#"+corType).css("background","#fff");
        		}else{
        			$("#all_corType").css("border-color","#dbdbdb");
        			$("#all_corType").css("background","#fff");
        			$("#all_corType").css("color","#000");
        		}
    			$("#"+type).css("border-color","#048bf4");
        		$("#"+type).css("background","#048bf4");
        		$("#"+type).css("color","#fff");
    		}*/
    		
    		$("#corporation_list").hide();
    		corType = type;
    		$("#btn_loadmore_corporation_list").hide();	
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
            if(fromPage != "view_corporation_list"){
        		$("#corlist_back_para").val(fromPage);
            	setViewTop("view_corporation_list");
            }else{
            	$("#view_corporation_list .mblScrollableViewContainer:eq(1) ").css("-webkit-transform","translate3d(0px, 0px, 0px)");	
            }
            	
			//调用方法将位置进行还原
			//setViewTop("view_corporation_list");
           	
			//还原分页参数
			corporationList_p = 1;
			corporationList_JSON = "";
			//调用渲染生成需求列表函数
			initCorporationList(fromPage);
	
		}
    	
		/**
		 * 获取服务机构列表信息
		 */
    	
		initCorporationList = function(fromPage){
			corType =  changeUndefinedToEmpty(corType);
			
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
			win.body().appendChild(prog.domNode);
			prog.start();	
			var corporation_list = registry.byId("corporation_list"); // destination view
			if(corporationList_p == 1)
				corporation_list.destroyDescendants();//将页面内的内容清空
			var container =  corporation_list.containerNode;
			var innerhtml = "";
			var url = DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=getCorporationList&perpage=" + PERPAGE  + "&p=" + corporationList_p + "&catid="+corType;
			//alert(url)
			//alert()
			
			dojo.xhrGet({
				url : url,
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					response = changeUndefinedToEmpty(response);
					var pageCount = response.corporation_list.pageCount;
					if(corporationList_JSON ){
						var string_corporationList_old = JSON.stringify(corporationList_JSON);
						var string_response = JSON.stringify(response.corporation_list.data);
						string_corporationList_old = string_corporationList_old.substr(0,string_corporationList_old.length -1);
						string_response = string_response.substr(1,string_response.length -1);
						string_response =  $.trim(string_corporationList_old) +"," + $.trim(string_response);
						response =  JSON.parse(string_response);
						innerhtml = createHTMLForCorporationList(response);
						corporationList_JSON = response;
					}else{
						var cor_type_html = createHTMLForCorporationType(response.cart_list.data);
						var cor_type_list = registry.byId("corporation_type"); // destination view	
						var container_cor_type =  cor_type_list.containerNode;
						container_cor_type.innerHTML = cor_type_html;
						parser.parse(container_cor_type);
						innerhtml = createHTMLForCorporationList(response.corporation_list.data);
						corporationList_JSON = response.corporation_list.data;
					}

					container.innerHTML = innerhtml;
					parser.parse(container);
					progStop();
					if(corType){
						$("#"+corType).addClass("navyBtn");
						$("#all_corType").removeClass("navyBtn");
					}
					else{
						$("#all_corType").addClass("navyBtn");
					}
						
					//如果总页数大于p的总数就显示分页框
					//alert(pageCount)
					if(pageCount > corporationList_p)
						$("#btn_loadmore_corporation_list").show();
					else
						$("#btn_loadmore_corporation_list").hide();	
					corporationList_p ++ ;
					if(fromPage != "view_corporation_list")
						registry.byId(fromPage).performTransition("#view_corporation_list",1,"none");	
					$("#corporation_list").fadeIn(1000);
					
				},
				error : function(response, ioArgs) {
					$("#corporation_list").fadeIn(1000);
					if($("#corporation_list li").length > 0){
						progStop();
						return false;
					}
					show_progress_indicator('dlg_progress',	'progress_indicator_container',ERROR_NETWORK_OR_DATA);
					setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
					innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick="initCorporationList();">'+RELOAD+'</span></div></div>';
					container.innerHTML = innerhtml;
					parser.parse(container);
				}
			}); 
		}
		/**
		 * 进入服务机构空间信息
		 */
		gotoCorporationInfo = function(id,fromView){
			//如果是从需求详情页面点击来的
			if(fromView == "view_req_info"){
				registry.byId("view_req_info").performTransition("#view_corporation_info",1,"none");
				$("#corinfo_back_para").val("view_req_info");
				//从需求详情页面进入机构详情后，如果再点击机构对接中的需求进行需求详情，这样在回退的时候会出现错误
				//$("#corinfo_back_para").val("req_back_para");
			}else
				$("#corinfo_back_para").val("view_corporation_list");
			//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
          //调用方法将位置进行还原
			setViewTop("view_corporation_info");
			var corporation_info = registry.byId("corporation_info"); // destination view	
			var container = corporation_info.containerNode;
			corporation_info.destroyDescendants();//将页面内的内容清空
			win.body().appendChild(prog.domNode);
			prog.start();
			/*var corporation = "";
			$.each(corporationList_JSON,function(i,e){
				if(e.id==id){
					corporation = $(this);
					return false;
				}
			});*/
			//var url = DATA_ROOT	+ "index.php?app=declare&mod=Index&act=getCorporationInfoById&cid=" + id;
			//alert(url)
			dojo.xhrGet({
				url : DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=getCorporationInfoById",
				content : {
					cid : id
				},
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					response = changeUndefinedToEmpty(response);
					var innerhtml = createHTMLForCorporationInfo(response);
					container.innerHTML = innerhtml;
					parser.parse(container);
					progStop();
				},
				error : function(response, ioArgs) {
					if($("#corporation_list li").length > 0){
						progStop();
						return false;
					}
					show_progress_indicator('dlg_progress',	'progress_indicator_container',ERROR_NETWORK_OR_DATA);
					setTimeout(	function() {
								hide_progress_indicator("dlg_progress");
							}, 2000);
					innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' onClick="initCorporationList();">'+RELOAD+'</span></div></div>';
					container.innerHTML = innerhtml;
					parser.parse(container);
				}
			}); 
		}

		/**
	     * 从服务机构列表页面返回
	     */
		goBackFromCorList = function(){
			registry.byId("view_corporation_list").performTransition("#"+$("#corlist_back_para").val(),-1,"none");
			if($("#corlist_back_para").val() == "view_service_index"){
				//两秒钟以后执行切换操作
				setTimeout(	function() {
					startChageBacground();
				}, 2000);
			}
	    }
		/**
	     * 从服务机构详情页面返回
	     */
		goBackFromCorInfo = function(){
			registry.byId("view_corporation_info").performTransition("#"+$("#corinfo_back_para").val(),-1,"none");
	    }
		
		/**
		 * gotoEidtReqInfoView编辑我发布的需求
		 */
		gotoEidtReqInfoView = function(){
			
		}
	    /**
    	 * 进入反馈列表页面
    	 */
    	gotoViewFeedbackIndex = function(handle){
    		//将分享微信窗口隐藏
            hideWeChatAction();
    		//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
             if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
            //调用方法将位置进行还原
			setViewTop("view_feedback_index");
			var innerhtml = "";
			var feedback_index_ul = registry.byId("feedback_index_ul");
			var container = feedback_index_ul.containerNode;
			if(handle != "add"){
				win.body().appendChild(prog.domNode);
				prog.start();
			}
			//alert(DATA_ROOT	+ "index.php?app=declare&mod=Index&act=getFeedbackList&uuid=" +device_uuid_only +"&userid="+uid +"&appid="+APP_ID +"&appversionid="+VERSION_NO)
			dojo.xhrGet({
				url : DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=getFeedbackList",
				content : {
					uuid : device_uuid_only,//uuid
					userid:uid,
 					app_id : APP_ID,
 					appversionid : VERSION_NO
				},
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					var response_compress = base64decode(response);
					response = changeUndefinedToEmpty(JSON.parse(zip_inflate(response_compress)));
					if(response !="")
						innerhtml = doResultForIndexList(changeUndefinedToEmpty(response.data), "feedback", "feedback_index_ul");
					if (innerhtml == "")
						innerhtml = "<p>"+NO_FEEDBACK+"</p>";
					container.innerHTML = innerhtml;
					parser.parse(container);
					if(handle != "add")
						progStop();//加载的图片停止
				},
				error : function(response, ioArgs) {
					if($("#feedback_index_ul li").length > 0){
 						progStop();
 						return false;
 					}
					//var innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' style="height:30px;" onClick="gotoViewFeedbackIndex()">'+RELOAD+'</span></div></div>';
					var innerhtml = '<div  style="margin:0 auto;"><span style="font-size:14px;color:#989696;">'+FEEDBACK_NO_NETWORK+'</span></div>';
					container.innerHTML = innerhtml;
					parser.parse(container);
					if(handle != "add")
						progStop();//加载的图片停止
				}
			});
    	}
    	/**
    	 * 显示反馈详情
    	 */
    	gotoFeedbackContent = function(id){
    		//每次加载的时候进行网络连接的判断
            var desc = ERROR_NETWORK_OR_DATA;
            //网络未连接
            if(checkConnection() == -1){
            	desc = NO_NETWORK;
            }
          //调用方法将位置进行还原
			setViewTop("view_feedback_content");
			var feedback_content_ul = registry.byId("feedback_content_ul"); // destination view	
			var container = feedback_content_ul.containerNode;
			win.body().appendChild(prog.domNode);
			prog.start();
			dojo.xhrGet({
				url : DATA_ROOT + "index.php?app=Foryou&mod=Index&act=getFeedbackeContentById&id="+id,
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					var response_compress = base64decode(response);
					response = changeUndefinedToEmpty(JSON.parse(zip_inflate(response_compress)));
					var innerhtml = doResultForContentList(	response, "feedback", view_feedback_content);
					container.innerHTML = innerhtml;
					parser.parse(container);
					$("#badge_"+id).hide();
					progStop();//加载的图片停止
					//如果已经有回复就显示追问的按钮)
					if(response.length > 1)
						$("#btn_feedback_more").show();
					else
						$("#btn_feedback_more").hide();
					$("#pid").val(response[0].id);
				},
				error : function(response, ioArgs) {
					var innerhtml = '<div  style="margin:0 auto; text-align:center;"><div><img src="images/error.png"/></div><div>'+desc+'<br/><span data-dojo-type="dojox.mobile.ToolBarButton" data-dojo-props=\'light:false,icon:"js/dojo1.8.1/dojox/mobile/images/tab-icon-38w.png"\' style="height:30px;" onClick=gotoFeedbackContent('+ id+')>'+RELOAD+'</span></div></div>';
					container.innerHTML = innerhtml;
					progStop();//加载的图片停止
				}
			});
    	}
    	/**
	     *显示发布反馈信息弹出框
	     */
	    showAddFeedbackdlg = function(fromPage){
	    	if(fromPage!="content")
	    		$("#pid").val(0);
	    	$("#feedback_content").val("");
	    	showDlg("dlg_feedback_post");	
	    }
	    gotoAddFeedbackPage = function(fromPage){
	    	if(fromPage!="content")
	    		$("#pid").val(0);
	    	$("#feedback_content").val("");
	    	//$("#feedback_content").focus();
	    }
    	/**
    	 * 发布反馈信息
    	 */
    	doAddFeedback = function(){
    		//每次加载的时候进行网络连接的判断
            //网络未连接
        	
            if(checkConnection() == -1){
            	show_progress_indicator('dlg_progress','progress_indicator_container',NO_NETWORK);
           		setTimeout(function(){
                       hide_progress_indicator("dlg_progress");
                       }, 2000);
           		return false;
            }
			var feedback_content = $("#feedback_content").val();
			var pid = $("#pid").val();
			//$("#feedback_content").focus();
			//将将html标签全部去掉空格全部去掉
			feedback_content = $.trim(feedback_content.replace(/<V?.+?>/g,""));
			//将回车和换行符去掉
			feedback_content = $.trim(feedback_content.replace(/\n/g,""));
			//将空格去掉
			feedback_content = $.trim(feedback_content.replace(/<V?.+?>/g,""));	
			if(feedback_content == "" || feedback_content == PLEASE_ENTER_YOUR_FEEDBACK){
				showAlert(PLEASE_ENTER_YOUR_FEEDBACK);
				return false;
			}
			if (feedback_content.length > 300) {
				showAlert(ALERT_REQ_REPLAY_LENGTH);
				return false;
			}
			show_progress_indicator('dlg_progress','progress_indicator_container', DATA_SAVING);
       		var url =  DATA_ROOT	+ "index.php?app=Foryou&mod=Index&act=doAddFeedback";
			dojo.xhrPost({
				url : url,
				content : {
					uuid : device_uuid_only,//uuid
					userid:uid,//用户id
					uname:nickname,
					device_name : device_name,
					device_platform : device_platform,
					device_version : device_version,
 					app_id : APP_ID,
 					app_name : APP_NAME,
 					app_version : app_version,
 					app_version_id : VERSION_NO,
 					content:feedback_content,
 					pid:pid
				},
				timeout : 8000,
				load : function(response, ioArgs) {
					//将获取到的压缩及转码的内容进行转换
					response_compress = base64decode(response);
					response = JSON.parse(zip_inflate(response_compress));
					
					show_progress_indicator('dlg_progress','progress_indicator_container',response.info);
					setTimeout(	function() {
						hide_progress_indicator("dlg_progress");
					}, 5000);
					//成功后就隐藏
					if(response.status == 1){
						if(pid > 0)
							gotoFeedbackContent(pid);
						else{
							gotoViewFeedbackIndex("add");
							//进行页面转场
							registry.byId("feedback_post").performTransition("#view_feedback_index",-1,"none");
						}
							
					}
				},
				error : function(response, ioArgs) {
					
					show_progress_indicator('dlg_progress',	'progress_indicator_container', ERROR_NETWORK_OR_DATA);
					setTimeout(	function() {
						hide_progress_indicator("dlg_progress");
					}, 2000);
				}
			});
			return false;
    	}
    	
    	
		/**
		 * 自定义图片停止方法
		 */
		progStop = function(time) {
			time = changeUndefinedToEmpty(time);
			if (time == "")
				time = 1000;
			setTimeout(function() {
				prog.stop();
			}, time);
		}
		
		/**
		 *检查版本，去服务器上去检查是否有新的版本 
		 */
		checkVersion = function(handel) {
			dojo.xhrGet({
				url : VERSION_ROOT + "?device_platform="
						+ device_platform + "key=" + KEY,
				timeout : 2000,
				handleAs : "json",
				load : function(response, ioArgs) {
					var verno_new = "";
					var verinfo_new = "";
					var updateinfo_new = "";
					var verinfo_new = "";
					//如果是android版本,在配置中取android参数项
					if (device_platform == "android") {
						verno_new      = response.android_verno;
						downurl 	   = DATA_ROOT + response.android_downurl;
						updateinfo_new = response.android_updateinfo_new;
						verinfo_new    = response.android_verinfo;	
					}else if(device_platform == "ios"){
						//如果是ios版本,在配置中取ios参数项
						verno_new      = response.ios_verno;
						downurl 	   = response.ios_appstoreurl;
						updateinfo_new = response.ios_updateinfo;
						verinfo_new    = response.ios_verinfo;			
					}
					//增加判断，如果是用户收到刷新就不判断存储的值
					if(handel == "check"){
						win.body().appendChild(prog.domNode);
						prog.start();
						if (VERSION_NO < verno_new){ 
							setTimeout(	function() {
								showConfirm(updateinfo_new, NOW + HAVE + NEW + VERSION +":V"+ verinfo_new + "." + verno_new , downurl);
								progStop();
							}, 2000);
							
						}else{
							
							setTimeout(	function() {
								show_progress_indicator('dlg_progress',  'progress_indicator_container', NO_NEW_VERSION);
								setTimeout(	function() {
									hide_progress_indicator("dlg_progress");
								}, 2000);
							}, 5000);
							
							$("#showmessage").html(NO_NEW_VERSION);
							
						}
					}else{
						if( VERSION_NO < verno_new && window.localStorage[APP_ID+"_version_update"] != "noask"){
							//获取当前客户端的时间戳，并缓存到本地如果下次打开判断24小时后再打开
							var timestamp = Date.parse(new Date());
							var update_time = changeUndefinedToEmpty(window.localStorage[APP_ID+"_version_update_time"]);
							if(update_time != "")
								update_time = parseInt(update_time);
							else
								update_time = 0;
							if(timestamp - update_time > 1000 * 3600 * 24)
								showConfirm(updateinfo_new, NOW + HAVE + NEW + VERSION +":V"+ verinfo_new + "." + verno_new , downurl);
						} 
								
						}
					
				},
				error : function(response, ioArgs) {
					if(handel == "check"){
						show_progress_indicator('dlg_progress',	'progress_indicator_container', ERROR_NETWORK_OR_DATA);
						setTimeout(	function() {
							hide_progress_indicator("dlg_progress");
						}, 2000);
					}
				}
			});
		}
		
		 /*
         *打开分享微信窗口
         */
        openWeChatSheet = function(){
        	$("#0").css("color","#000");
    		$("#0").css("background","#fff");
    		$("#1").css("color","#000");
    		$("#1").css("background","#fff");
        	$("#cancel").css("background","#6d7278");
            $("#weChatSheet").show();
            dijit.registry.byId('weChatSheet').show()
        }
        /*
         *分享微信
         */
        sendWeChat = function(id){
       
        	$("#"+id).css("background","#048bf4");
    		$("#"+id).css("border","none");
    		$("#"+id).css("color","#fff");
        	sendType=id;
            if(id != "cancel"){
                show_progress_indicator('dlg_progress', 'progress_indicator_container', START_WECHAT);
                sendAPPContent();
            }
            dijit.byId("weChatSheet").hide();
            setTimeout(	function() {
            	$("#weChatSheet").hide();
			}, 500);
            setTimeout(	function() {
				hide_progress_indicator("dlg_progress");
			}, 2000);
        }
        
        hideWeChatAction = function(){
            $("#weChatSheet").hide();
        }
		
		//等整个页面完全准备好了再加载数据
		ready(function(){
			var clientWidth = document.body.clientWidth-20;
			var clientHeight = document.body.clientHeight-200;
			//alert(window.screen.width);
			//alert("屏幕可用大小："+screen.availWidth+"*"+screen.availHeight)
			//$("#index .mblIconMenu").css("width",clientWidth+"px")
			//$("#index .mblIconMenu").css("height",clientHeight+"px")
			//$("#service_ul").css("height",clientHeight+"px")
			$("body").css("background","#f2f2f2")	
			//启动的时候检查更新
			checkVersion();
			$("#weChatSheet").hide();
			$(".myhead").css("font-size","20px");
			initNewNotice();//加载最新通知
			initNewZkms();//加载最新通知
				
			if(RUNTIME != "product"){
				app_version = VERSION_INFO + "." + VERSION_NO  + BETA;
			}else{
				app_version = VERSION_INFO + "." + VERSION_NO ;
			}
			
			uid = changeUndefinedToEmpty(window.localStorage[APP_ID+"_uid"]);
			nickname = changeUndefinedToEmpty(window.localStorage[APP_ID+"_nickname"]);
			var is_sipsu_member =  window.localStorage[APP_ID+"_is_sipsu_member"];
			if(is_sipsu_member == "yes")
				$("#div_to_view_req_index").show();
			else
				$("#div_to_view_req_index").hide();
			
			
			
			$("#infomore").html(VERSION + INFO+":"+app_version);
			//给我的信息页面赋值
			$("#username").html(window.localStorage[APP_ID+"_email"]);
			$("#nickname").html(nickname);
			$("#ctime").html(window.localStorage[APP_ID+"_ctime"]);
			$("#location").html(window.localStorage[APP_ID+"_location"]);
			if(window.localStorage[APP_ID+"_sex"] ==1)
				$("#sex").html(MALE);	
			else if(window.localStorage[APP_ID+"_sex"] ==0)	
				$("#sex").html(FEMALE);
			
			/*
			 *將关于信用岛进行渲染第一次加载的时候，从文件中读取。存储在本地
			 */
			//var aboutcredit_innerhtml = window.localStorage[APP_ID+"_aboutcredit"];
			//aboutcredit = changeUndefinedToEmpty(aboutcredit);
			dojo.xhrGet({
				url : DATA_ROOT+ "apps/mobile/aboutcredit.html?key=" + KEY,
				sync:true,
				load : function(response, ioArgs) {
					aboutcredit_innerhtml	= response;
					window.localStorage[APP_ID+"_aboutcredit"] = response;
				}
			});
			var aboutcredit_ul = registry.byId("aboutcredit_ul");
			var container = aboutcredit_ul.containerNode;
			container.innerHTML = aboutcredit_innerhtml;
			parser.parse(container);
			
			//用户启动了程序后将用户设备相关信息上传到服务器上
			var myDate = new Date();
            var mytime =    myDate.getHours() +":" +myDate.getMinutes() +":" + myDate.getSeconds();
           
            if(curtime.length <= 10);
            	curtime = curdate +" " + mytime;
            	if(RUN_MODE =="web"){
                	device_uuid ="testuuid_declare_12121212";
            		device_uuid_only ='testuuid_declare';
            		device_platform= 'android';
            		device_name ='www';
            		device_version = '4.01';
            	}
			dojo.xhrGet({
				url: DATA_ROOT + "index.php?app=Foryou&mod=Index&act=setUserStatistics",
				content : {
					uuid : device_uuid,
 					uuid_only:device_uuid_only,
 					device_name : device_name,
 					device_platform : device_platform,
 					device_version : device_version,
 					device_network : device_network,
 					app_id : APP_ID,
 					app_name : APP_NAME,
 					app_version : app_version,
 					app_version_id : VERSION_NO,
 					run_mod:RUN_MODE//运行模式
				},
				timeout:8000,
				handleAs: "text",
				load: function(response, ioArgs){
					
				}
			});
			//根据手机操作系统版本的不同去除各个版本不兼容的功能
 			if (device_platform.indexOf("iphone") > -1|| device_platform.indexOf("ios") > -1 ||device_platform.indexOf("ipad")> -1 ){
 				//checkVersion("ios");
 				//选择所有的具有dojox.mobile.Heading，替换其class；
 				 $(".myhead").each(function(i){
 					$(this).addClass(head_style);
 				 });
              //如果是ipad去掉微信
              if(window.screen.width > 320){
                $(".myhead").css("font-size","25px");
                $("#wechat").remove();
                $("#weChatSheet").remove();
              }
 			}else if (device_platform.indexOf("android") > -1 && RUN_MODE !="web"){
 				//如果是android系统
 				//checkVersion("android");
 				$("#wechat").remove();
 				$("#weChatSheet").remove();
			 }
		})		
	});
