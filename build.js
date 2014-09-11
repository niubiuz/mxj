//build.js 根据数据组合成html
    /**处理json数据组合成列
     *参数说明
     *datatype：数据类型 data_new
     *rsult json数据类型
     *curpage 当前页码 主要用于分页的
     *topcount :显示条数
     */
	function doResultForList(datatype,result,curpage,topcount){
		var listdata= result.listdata;//得到项目列表
		var innerhtml="";
	
		//当查询结果集有数据的情况
		if(result.count >0){
			var listdata= result.listdata;//得到项目列表
			var i = 0;
			var listlength = listdata.length;//列表的长度
			
			for( var i=0 ;i<listlength;i++){
				
				var timenodelist = listdata[i].timenodelist ;
				var noticelist =  listdata[i].noticelist ;
				year = listdata[i].year ;
				batch = listdata[i].batch ;
				title = listdata[i].title ;
				progress = listdata[i].progress ;
				description = listdata[i].description
				var time1 = listdata[i].time1;
				var time2 = listdata[i].time2;
				time1 =changeUndefinedToEmpty(time1);
				time2 =changeUndefinedToEmpty(time2);
				
				var desc1 = "";
				if( time1 !="")
					 desc1 = replaceDate(time1);
				var desc2 = "";
				if( time2 !="")
					 desc2 = replaceDate(time2);
				year =changeUndefinedToEmpty(year);
				batch =changeUndefinedToEmpty(batch);
				progress =changeUndefinedToEmpty(progress);
				description =changeUndefinedToEmpty(description);
				
				if( description !=""){
					description= description.replace("time1",desc1);
					description= description.replace("time2",desc2);
				}
				var notice_str = changeDate(listdata[i].noticedate)+ " "+ listdata[i].adminorg + PUB;
				var timenode_str= NO_PLEASE_KEEP_ATTENTION;
				timenodelist = changeUndefinedToEmpty(timenodelist);
				//得到最近时间节点
				var lasted_timenode = changeUndefinedToEmpty(listdata[i].lasted_timenode); 
				var day_str = "null";
				if(lasted_timenode !=""){
					timenode_str = IN_NEED_OF + changeDate(lasted_timenode.plandate)+"("+replaceDate(lasted_timenode.plandate)+")"+ COMPLETED_BEFORE +lasted_timenode.planname;
					day_str =  replaceDate(lasted_timenode.plandate,"days");	
				}else{
					//如果没有时间节点就提醒通知截至日期
					if(progress == IS_ABOUT_TO_BEGIN || progress=="" || progress == IN_THE_DECLARE)
						day_str =  replaceDate(listdata[i].enddate,"days");
				}
				
				var caption =year + batch + title;
				var moveto =datatype;
				var para = "type="+datatype+"&tid="+listdata[i].tid;
				var icon ="";
				var bgstyle ="";
				
				var num = i  + 1;
				var viewcount = listdata[i].viewcount;
				innerhtml += createHTMLForList(num,caption,icon,description,moveto,bgstyle,progress,para,notice_str,timenode_str,day_str,viewcount);	
			}
		}else 
			innerhtml = NO_DATA;	
		return innerhtml;
	}
    	
	/**
	 * 处理json数据组合成文章详细信息,并将组合的内容返回
	 */
	function doResultForContent(datatype,result,tid){
		var innerhtml="";
		var listdata= result.listdata;//得到项目列表
		var project_content = null;//项目详细信息对象
		//根据传递的tid得到一个具体的项目对象
		for( var i =0;i<listdata.length;i++){
			if(listdata[i].tid == tid){
				project_content = listdata[i];	
			}	
		}
		var timenodelist = project_content.timenodelist ;//时间节点
		var noticelist =  project_content.noticelist ;//通知
		var publicitylist =  project_content.publicitylist ;//公示信息
		var remindlist =  project_content.remindlist ;//友情提醒
		
		year  = project_content.year ;// 年份
		progress = project_content.progress ;// 进度
		title = project_content.title ;// 标题
		batch = project_content.batch ;// 批次
		level = project_content.level ;// 级别
		adminorg = project_content.adminorg ;// 主管单位
		/*调用方法将undefined转化成空格*/
		level =changeUndefinedToEmpty(level);
		year =changeUndefinedToEmpty(year);
		batch =changeUndefinedToEmpty(batch);
		adminorg =changeUndefinedToEmpty(adminorg);
		progress =changeUndefinedToEmpty(progress);
		description =changeUndefinedToEmpty(description);
		//生成项目详细信息页面
		// $("#contenttitle").html(project_content.title);
		//var  cell = '<h1 data-dojo-type="dojox.mobile.Heading" class="myhead" data-dojo-props=\'back:"返回", moveTo:"'+datatype+ '", transition:"none",fixed:"top"\'>'+project_content.title +'</h1>';-->
		//var cell = '<input type="hidden" id="hidden_para" value="'+datatype+'"/>';
		var cell = '<h2  class="mt5" style="font-size:16px;padding:5px;color: #5A6379;">'+year + batch+project_content.title+'</h2>';
		cell += '<div data-dojo-type="dojox.mobile.RoundRect" data-dojo-props="shadow:false" class="contentstyle" class="mt5">';	
		cell += '<h2 data-dojo-type="dojox.mobile.RoundRectCategory" style="margin-top:-3px;">'+PRO_DESC +'</h2>';
		cell += '<div class="decs">';
		cell += '<span>'+PRO_BATCH +COLON + batch +'</span><span class="rt">'+PRO_LEVEL +COLON +level+'</span><br/><span> '+PRO_PROGRESS +COLON +progress +'</span><span class="rt">'+PRO_ADMINORG +COLON +adminorg+'</span><br/></div>';
		/*cell += '<h2 data-dojo-type="dojox.mobile.RoundRectCategory">项目关键进度提示</h2>';
		cell += '<div id="myimg" style="margin-bottom:55px;">';
		cell += '</div>';*/
		var timeolistlength = 0;
		if(typeof(timenodelist) !="undefined"  && timenodelist != null )
			 timeolistlength = timenodelist.length;
		var timenode_list = createNoticeOrTimenodeList(ALL + TIMENODE + REQUIRE +"("+INALL+ timeolistlength+ GE + TIMENODE +")",timenodelist,datatype,project_content,"timenode",THE_PRO_HAS_NO + TIMENODE);
		var notice_list = createNoticeOrTimenodeList(ALL + NOTICE + ORIGINAL_TEXT,noticelist,datatype,project_content,"notice",THE_PRO_HAS_NO + NOTICE);
		var publicity_list = createNoticeOrTimenodeList(PUBLICITY,publicitylist,datatype,project_content,"publicity",THE_PRO_HAS_NO + PUBLICITY);
		var remind_list = createNoticeOrTimenodeList(REMIND,remindlist,datatype,project_content,"remind",THE_PRO_HAS_NO + REMIND);
		
		cell +=timenode_list;
		cell +=notice_list;
		cell +=publicity_list;
		cell +=remind_list;
		cell +='<div style="text-align:center;"><button data-dojo-type="dojox.mobile.Button"  onClick="gotoCommentView('+ tid +',\'\',\'item\')" class="btn_comment"/></button></div>';
		cell += '</div>';
		innerhtml += cell	;
		return innerhtml;	
	}
    		
	/**
	 * 根据参数生成时间节点和通知的详细信息页面
	 */
	function doResultForTimenodeOrNotice(type,datatype,result,tid,typeid){	
		var listdata= result.listdata;//得到项目列表
		var projectobj = null;//一个具体的项目对象
		var typelist = null ;//时间节点或通知列表
		var typeobj= null ;//具体的时间节点或通知对象
		var typetitle="";
		for( var i =0;i<listdata.length;i++){
			if(listdata[i].tid == tid){
				projectobj = listdata[i] ;
				if(type == "notice"){
					typelist = projectobj.noticelist;
					typetitle ="noticetitle";
				}else if(type=="publicity"){
					typelist = projectobj.publicitylist;
					type = "notice";
					typetitle ="publicitytitle";
				}else if(type =="remind"){
					typelist = projectobj.remindlist;
					typetitle ="remindtitle";
				}else{
					typelist = projectobj.timenodelist;
					typetitle ="timenodetitle";
				}
				for( var j =0;j<typelist.length;j++){
					if(typelist[j].id == typeid){
						typeobj = typelist[j]
					}
				}			
			}	
		}
		$("#"+typetitle).html(typeobj.title);
		var innerhtml =""
		//var  type_conten_list  ='<h2 data-dojo-type="dojox.mobile.RoundRectCategory"></h2><div data-dojo-type="dojox.mobile.ContentPane" class="p10">';
		var url = DATA_ROOT +'apps/declare/Public/data/tid_'+projectobj.tid +'/'+type+'_'+typeobj.id +'.gzip.php';
		//Ajax从服务器取得数据
		dojo.xhrGet({
			url: url,
			timeout:8000,
			sync:true,
			//handleAs: "json",
			load: function(response, ioArgs){
				response_compress = base64decode(response);
				//var content = zip_inflate(response_compress);
				//var content = eval('('+zip_inflate(response_compress)+')');
				var content =JSON.parse(zip_inflate(response_compress));
				content = JSON.stringify(content);
				var len = content.length;
				//去除前后的引号
				content = content.substr(1,len -2);
				innerhtml = '<div data-dojo-type="dojox.mobile.ContentPane" class="p10">';
				innerhtml += content +'</div>'; 
			},
			error: function(response, ioArgs){
				progStop();
			}			
		});
		
		return innerhtml;
	}

	/**
	 * 收藏关注
	 */
	function onStore(proid){
				
		//首先判断用户是否登录如果未登录就弹出登录窗口
		if(mid =="" || mid ==0){
			showlogin(proid);
		}else{
			addInMy(mid,proid)
			
		}
	}
    	
	/**根据传来的参数进行组合列表页面
	 *i:列表显示的序号
	 *title:列表显示标题 
	 *icon:列表显示的图标，如果没有就不显示
	 *info:列表显示的详细信息
	 *moveto:列表的转场地址
	 *bgstyle:列表显示的背景图片
	 *classstyle:列表的样式
	 *progress：进度
	 *para:参数（转场到项目详细信息的一些必要参数）
	 */
	function createHTMLForList(i,title,icon,info,moveto,bgstyle,progress,para,notice_str,timenode_str,day_str,viewcount){
		viewcount = changeUndefinedToEmpty(viewcount);
		if(viewcount == "")
			viewcount = 0;
		viewcount = viewcount/10;
		//定义数字和项目显示进度的状态
		var num = "num";
		var progressstyle = "progress";
		if(day_str =="null"){
			day_str = "";
		}else if(day_str < 0){
			day_str ="";
		}else if(day_str==0){
			day_str = TODAY;
			num	 ="num1";
		}else if(day_str==1){
			day_str = TOMORROW;
			num	 ="num1";
		}else if(day_str==2){
			day_str = AFTERTOMORROW;
			num	 ="num1";
		}else if(day_str<30){
			day_str =day_str +DAY;
			num	 ="num1";
		}else
			day_str =day_str +DAY;
		var notice_hint = LATETLY + REQUIRE;
		//如果不是申报中就不显示天数提醒
		if(progress != IN_THE_DECLARE){
			progressstyle = "progress1";
			day_str = "";
		}
		//如果是即将开始就不显示时间节点
		if(progress == IS_ABOUT_TO_BEGIN){
			timenode_str = NO_PLEASE_KEEP_ATTENTION;
            day_str = '<img src="images/start.png" style="width:33px;"/>';
        }
		//如果是已经公示就显示公示提示
		if(progress == HAS_BEING_PUBLICIZED){
			timenode_str = PUBLICITY_TIPS;
            notice_hint = PROJECT_HINT;
            day_str = '<img src="images/notice.png" style="width:40px;"/>';
            progressstyle = "progress2";

		}
        if(progress == DEADLINE1){
            day_str = '<img src="images/end.png" style="width:33px;"/>';
		}
		
		var cell1 = '<li onClick=\'goToContent("'+para+'")\'  class="item " data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#",transition:"none",noArrow:"true"\'>';
		cell1 +='<table width="100%"><tbody><tr>';
		cell1 += '<td valign="middel" align="center"  width="50px;" style="background:#f2f2f2;"><span class="'+num+'">'+day_str+'</span><br><span class="'+progressstyle+'">'+progress +'</span></td>';
		cell1 += '<td align="middel">';
		cell1 += '<span class="title">'+title+'</span>';
		//cell1 += '<span class="guanzhu">关注度：<span style="padding-right:-10px;" data-dojo-type="dojox.mobile.Rating" data-dojo-props=\'image:"images/star-orange.png",numStars:5,value:'+viewcount+'\'></span></span>';
		cell1 += '<span class="notice">'+UP_TO_DATE + NOTICE + COLON +notice_str+'</span>';
		cell1 += '<span class="timenode">'+notice_hint + COLON +timenode_str+'</span></td></tr></tbody></table></li>';	
		
		return cell1;
	}	
    	
	/**创建时间节点、通知、公示信息、友情提醒等列表
	 *title:列表显示标题
	 *data:数据
	 *datatype:当前列表显示的页面类型
	 *project_content:项目详细信息对象
	 *objtype:当前操作对象名称
	 *nodata_title:没有数据的时候提示信息
	 */
	function createNoticeOrTimenodeList(title,data,datatype,project_content,objtype,nodata_title){
		var cell = '<h2 data-dojo-type="dojox.mobile.RoundRectCategory">'+title+'</h2>';
		cell += '<ul data-dojo-type="dojox.mobile.EdgeToEdgeList" class="listitem" style="margin-top:1px;">';
		var data_list ="";
		if(typeof(data) !="undefined"  && data !=null && data !=""){
			for( var i =0;i<data.length;i++){
				if(objtype =="timenode"){
					var time = compareDate(curdate,data[i].plandate);
					var dec = "";
					if(time <0)
						dec = "(<span style='color:#6C7790;'>"+BY_THE_END_OF+"<font color='#8F8F8F'>"+data[i].plandate+","+TIME_OUT+"</font>)";
					else if(time ==0)
						dec = "(<span style='color:#6C7790;'>"+BY_THE_END_OF+"<font color='red'>"+data[i].plandate+"</font>,<font color='red'>"+TODAY + LAST_DAY +"</font>)";
					else if( 0<time && time <=7)	
						dec = "(<span style='color:#6C7790;'>"+BY_THE_END_OF+"<font color='red'>"+data[i].plandate+"</font>,"+ ALSO + "<font color='red'>"+time+"</font>"+DAY+")";
					else 
						dec = "(<span style='color:#6C7790;'>"+BY_THE_END_OF+"<font color='blue'>"+data[i].plandate+"</font>,"+ ALSO + "<font color='blue'>"+time+"</font>"+DAY+")";
					if(i>0)
						data_list  += "<div class='linestyle'></div>";
					data_list  +=' <li style="line-height:22px;height:44px;" data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#",transition:"none"\' onClick=\'goTimenodeOrNotice("timenode","datatype='+datatype+'&tid='+project_content.tid+'&timenodeid='+data[i].id +'")\'><span class="substr">'+ data[i].title +'</span><br/>' +dec +' </li>';	
				}else{
					if(i>0)
						data_list  += "<div class='linestyle'></div>";
					data_list  +=' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#",transition:"none"\' onClick=\'goTimenodeOrNotice("'+objtype+'","datatype='+datatype+'&tid='+project_content.tid+'&id='+data[i].id+'")\'>' + data[i].title +' </li>';	
				}
			}
		}else
			data_list= '<p class="pl10">'+ nodata_title +'</p>';
		cell +=data_list;
		cell +='</ul>'
		return cell;
	}
	
    	
    	
	/**
	 * 根据返回的json格式数据组合成评论列表
	 */
	function createHTMLForReqList(response,page){
		
		
	}
    	
    	
	/**
	 * 根据返回的json格式数据组合成需求列表
	 */
	function createHTMLForReqList(response,page){
		var innerhtml =""; 
		//如果json中有数据
		if(response != "" && response != -1){
			$.each(response,function(i,e){		
				innerhtml  += '<li class="item " data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"view_req_info",transition:"none",noArrow:"true"\' onClick=\'getReqInfoById('+e.id+',"'+page+'")\'>';
				innerhtml  += '<table style="width: 100%"><tbody><tr> <td align="center"  width="65px;" valign="middle">';
				innerhtml  += '<span class="num"><img src="images/buttin.png"/></span><br><span>'+e.reqprogress+'</span></td>';
				innerhtml  += '<td ><span class="title">'+e.reqtitle+'</span>';
				innerhtml  += '<div class="guanzhu">'+VIEWCOUNT+ COLON +'<span  data-dojo-type="dojox.mobile.Rating" data-dojo-props=\'image:"images/star-orange.png",numStars:5,value:'+ e.viewcount/50+'\'></span></div>';
				innerhtml  += '<div class="notice">'+PUB_DATE+ COLON +e.pubtime.substring(0,10)+'</div>';
				innerhtml  += '<div class="timenode">'+ REPLAY_COUNT + COLON +e.replycount;
				if(e.havereplied == 1)
					innerhtml += '<span>('+I_REPLAY+')</span>';
				innerhtml  += '</div></td></tr></tbody></table></li>';
			});
		}else
			innerhtml ='<p class="pl10">'+NO_DATA+'</p>';
  
    	return innerhtml;
    }
    	
	/**
	 * 根据返回的json格式数据组合成需求详情
	 */
	function createHTMLForReqInfo(response){
		var innerhtml =""; 
		var req = "";
		response = changeUndefinedToEmpty(response);
		if(response !="")
			req= changeUndefinedToEmpty(response.req);
		//alert(req.content);
		//如果json中有数据
		if(req != ""){
			//alert(uid + ":" + req.pubuid);
			innerhtml += '<h2>'+req.reqtitle+'</h2>';
			innerhtml += "<div class='desc'>";
			innerhtml += '<div class="lf"><span class="title">'+REQ_PROGRESS+ COLON +'</span><span class="lt">'+req.reqprogress_show+'</span></div><div class="rt"><span class="title">'+PUB_DATE+ COLON +'</span><span class="rt">'+ req.pubtime.substring(0,10)+'</span></div>';
			innerhtml += '<div class="lf"><span class="title">'+REPLAY_COUNT+ COLON +'</span><span class="lt">'+req.replycount+'</span></div>';
			//如果是联盟会员机构就显示是否回复并且不是自己发布的需求
			var is_sipsu_member =  window.localStorage[APP_ID+"_is_sipsu_member"];
			if(is_sipsu_member == "yes" && uid != req.pubuid){
				innerhtml += '<div class="rt"><span class="title">'+IS_REPLAY+ COLON +'</span><span class="rt">';
				if(req.havereplied != 0)
					innerhtml += '<a href="javascript:goToReplayDiv()"><img src="js/dojo1.8.1/dojox/mobile/images/tab-icon-38h.png" style="width: 18px;"/>('+I_REPLAY+')</a></span><br/></div>';
				else
					innerhtml += I_NO_REPLAY +'</span></div>';
			}else{
				innerhtml +="<br/>";	
			}
			innerhtml +="<br/></div>";
			/*else{
				innerhtml += '<div class="lf"><span class="title">'+VIEWCOUNT+ COLON +'</span><span class="lt"><span  data-dojo-type="dojox.mobile.Rating" data-dojo-props=\'image:"images/star-orange.png",numStars:5,value:'+ req.viewcount/50+'\'></span></span></div>';
				//innerhtml += '<div class="guanzhu">'+VIEWCOUNT+ COLON +'<span  data-dojo-type="dojox.mobile.Rating" data-dojo-props=\'image:"images/star-orange.png",numStars:5,value:'+ e.viewcount/50+'\'></span></div>';
			}*/
			innerhtml += req.content;
			
			if( uid == req.pubuid){
	 	  	 	var show_innerhtml = '<div class="li mt10"><div>';
    		 	if(req.reqprogress == 'waiting')
    		 		show_innerhtml += '<div style="background-color:#F8F8F8; border:1px solid #EBEBEB; padding:20px 0; color:#666666; text-align:center;">您的需求已经发布成功，正在审核中！</div>';
   			    else if(req.reqprogress=='replied')
   				   show_innerhtml += '<div style="background-color:#F8F8F8; border:1px solid #EBEBEB; padding:20px 0; color:#666666; text-align:center;">您的需求已经审核通过，正在对接中！</div>';
	   			show_innerhtml +=' </div></div>';
	   			$("#show_req_type").html(show_innerhtml);
	   			$("#show_req_type").show();
   			 }else
   				$("#show_req_type").hide();
	   			
		}else
			innerhtml ='<p class="pl10">'+NO_DATA+'</p>';
		
		return innerhtml;
	}
	/**
	 * 需求详情中跳转到回复页面
	 */
	function goToReplayDiv(){
		var h = -$("#req_info").height();
		$("#view_req_info .mblScrollableViewContainer").css("-webkit-transform","translate3d(0px, "+h+"px, 0px)");	
	}
	/*
	 * 根据返回的json格式组合成需求回复的列表
	 */
	function createHTMLForReqreplayInfo(response){
		var innerhtml =""; 
		var req = "";
		var reqreplay
		response = changeUndefinedToEmpty(response);
		if(response != ""){
			reqreplay = changeUndefinedToEmpty(response.reqreplay);
    		req = changeUndefinedToEmpty(response.req);
		}
		if(req != ""){
			//如果已经进行了回复就不再显示回复按钮或者是第三方
    		if(req.loginRoleForThis == 'reqservice' && (req.havereplied == 0 || req.havereplied == false)  && req.reqprogress != 'end'){
    			$("#reqreplay").show();
    		}	
    		//如果该用户不是服务机构就显示提醒窗口
    		if(req.loginRoleForThis == 'reqview'){
    			$("#hint").show();
    		}else
    			$("#hint").hide();
		}
		//如果json中有数据)
		if(reqreplay != ""){
            //如果需求需求已经对接就显示回复的框
			if(req.reqprogress == 'end'){
                $("#reqreplay_info").show();
                $("#replay_h2").show();
			}else{
				//如果回复数量为0 说明还没有回复
				if(req.replycount == 0){
					//如果当前登录用户是该需求的发布者就不显示回复的框
					if(uid == req.pubuid){
						$("#reqreplay_info").hide();
                    	$("#replay_h2").hide();  
					}else{
						//如果当前登录用户是联盟的会员机构就不显示回复的内容
						if(req.loginRoleForThis != 'reqservice' && response.in_same_board !=1){
							$("#reqreplay_info").show();
	                    	$("#replay_h2").show();
						}
					}	
				}else{
					$("#reqreplay_info").show();
                	$("#replay_h2").show();
				}
            }
			innerhtml += reqreplay.content;
		}else
			innerhtml ='<p class="pl10">'+NO_DATA+'</p>';
		if(response.in_same_board != 1 ){
			$("#reqreplay").hide();
    	}
		return innerhtml;
	}
    
    /**
     * 根据返回的json数据组合成html
     *参数说明
     *datatype：处理对象类型
     *rsult json数据类型
     *viewpage：渲染页面
     */
	function doResultForIndexList(result,datatype,viewpage){
		var innerhtml ="";
		//var func = "gotoFeedbackInfo";
		if(result !=""){
			$.each(result,function(i,e){
				innerhtml += '<div class="time_theme mt10" style="margin-top:10px;"><span class="time">'+e.pubdate + '&nbsp;&nbsp;</span><span class="progress">'+e.processstate+'</span></div>';
				innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" data-dojo-props=\'variableHeight:true\'>';
				if(datatype =="feedback"){	
					if(e.isreply == 1)
						innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"view_feedback_content",noArrow:true,transition:"none"\' onClick="gotoFeedbackContent('+e.id+')">'+e.content;
					else
						innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#",noArrow:true\' >'+e.content;
					if(e.noread > 0)
						innerhtml += '<div id="badge_' + e.id + '" style="float:right;font-size:12px;" data-dojo-type="dojox.mobile.Badge" class="mblDomButtonRedBadge" data-dojo-props=\'value:"'+e.noread+'"\'></div>';
					innerhtml += '</li>';
				}
				innerhtml += '</ul>';
			});
		}
		return innerhtml;				
	}
	/**
     * 根据返回的json数据组合成html
     *参数说明
     *datatype：处理对象类型
     *rsult json数据类型
     *viewpage：渲染页面
     */
	function doResultForContentList(result,datatype,viewpage){
		var innerhtml =""; 
		if(result != ""){
			$.each(result,function(i,e){
				var usertype = e.usertype;
				var pid = 0;
				var style = "question";
				var content = "Q" + COLON + e.content;
				//var user = ME;
				if(usertype == CUSTORM_SERVICE){
					style = "answer";
					//user = CUSTORM_SERVICE;
					content = "A" + COLON + e.content;
				}
				if(datatype =="feedback"){
					innerhtml += ' <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#", noArrow:true,transition:"none"\'><div class="'+style+'">';
					innerhtml +=  content +'</div>';
					if(usertype == CUSTORM_SERVICE)
						innerhtml += ' <sapn class="pubdate">'+e.pubdate+'</span></li>';	
				}
			});
		}	
		return innerhtml;
	}
	
	/**
     * 渲染生成服务超市类型
     */	
	function createHTMLForServiceType(result,type){
		var store ="";
		var data = "";
		
		if(result != ""){
			$.each(result,function(i,e){
				setJson(data,"src",e.show);
			})
		      store = new dojo.data.ItemFileReadStore({data: {
			  items: [ {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {usrc:"images/glass1.jpg", value:"glass", headerText:"glass"},
			        {src:"images/glass1.jpg", value:"glass", headerText:"glass"}
			      ]
			}});
		
		//registry.byId("carousel1").setStore(store1);
			}
		return store1;
	}
    /**
     * 渲染生成服务超市首页
     */	
	function createHTMLForServiceList(result,type){
		var innerhtml ="";
		if(result !=""){
			innerhtml += '<ul data-dojo-type="dojox.mobile.IconMenu" data-dojo-props=\'cols:3\' style="height: 500px;width: 300px;background:#3a3939;margin:10px;" id="service_ul" >';
			$.each(result,function(i,e){
				/*innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\' >';
				innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"view_service_info",noArrow:"true"\' onClick=\'gotoServiceInfo("'+e.id+'","'+e.nodename+'")\'>';
				innerhtml += '<table style="margin-right:-10px;width:100%">';
				innerhtml += '<tbody><tr valign="top">';
				var icon = changeUndefinedToEmpty(e.show);
				if(icon== "")
					icon = "images/thumb.png";
				else
					icon = DATA_ROOT +'data/uploads/'+icon;
				innerhtml += '<td width="60%"><img  src="' +icon + '"/></td>';
				innerhtml += '<td ><span class="title" >'+e.nodename+'</span>';
				innerhtml += '</td></tr>';
				innerhtml += '</tbody></table></li></ul>';*/
				//var icon = changeUndefinedToEmpty(e.show);
				var icon = "images/service_bg" + (i+1) + ".png";
				if(icon== "")
					icon = "images/thumb.png";
				else
					icon = DATA_ROOT +'data/uploads/'+icon;
				//alert(icon)
				icon = "images/service_bg" + (i+1) + ".png";
				//innerhtml += '<li class="mblIconMenuItem_service" data-dojo-type="dojox.mobile.IconMenuItem" data-dojo-props=\'moveTo:"view_service_info",icon:"images/service_' + (i+1)+'.png"\' onClick=\'gotoServiceInfo("'+e.id+'","'+e.nodename+'")\'>';
				innerhtml += '<li id="service_'+(i+1)+'" class="mblIconMenuItem_service color'+(i+1) +'" data-dojo-type="dojox.mobile.IconMenuItem" data-dojo-props=\'moveTo:"view_service_info",icon:"images/service_' + (i+1)+'.png",transition:"none"\' onClick=\'gotoServiceInfo("'+e.id+'","'+e.nodename+'")\'>';
				innerhtml += '<span	class="title">'+e.nodename+'</span></li>';
				
			});
			innerhtml += '</ul>';
		}
		return innerhtml;
	}
	
	 /**
     * 渲染生成服务超市详情页面
     */
	function createHTMLForServiceInfo(id,nodename,result){
		var innerhtml ="";
		if(result !=""){
			$.each(result,function(i,e){
				//var icon = changeUndefinedToEmpty(e.show);
				var icon = "images/service_bg" + (i+1) + ".png";
				if(icon== "")
					icon = "images/thumb.png";
				else
					icon = DATA_ROOT +'data/uploads/'+icon;
				icon = "images/service_bg" + (i+1) + ".png";
				if(e.id==id){
					//innerhtml += '<span><img style="max-width:50%" src="' +icon + '"/>'+e.nodename+'</span>';
					innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\' style="padding: 10px;">';
					innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" style="border:none">';
					innerhtml += '<table style="margin-right:-10px;width:100%">';
					innerhtml += '<tr valign="middle">';
					
					innerhtml += '<td style="width:40%"><div  style="background:url('+icon+');background-size:cover;width:60px;height:60px;border-radius:50%;border:1px solid #bdbdbd;"></div></td>';
					innerhtml += '<td ><span>'+e.nodename+'</span></tr>';
					innerhtml += '</table></li>';
					innerhtml += '<h2 data-dojo-type="dojox.mobile.RoundRectCategory" style="margin-left:5px;">'+MEMO+'</h2>';
					innerhtml += '<div  data-dojo-type="dojox.mobile.ContentPane" ><span class="memo" style="text-indent: 2em">';
					innerhtml += e.memo;
					innerhtml += '</span></div>';

					innerhtml += '<h2 data-dojo-type="dojox.mobile.RoundRectCategory" style="margin-left:5px;">'+SERVICE+'</h2>';
					//innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\' style="border:none">';
					innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	 style="border:none;margin:0px;">';
						$.each(e.biztype_list,function(j,e1){
							innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#",transition:"none",icon: "images/service_left.png"\' style="border:solid 1px #d8d8d8;margin:10px;font-size:14px;" onClick = \'gotoPubReqPage("'+e.id+'","'+e.nodename+'","'+j+'","view_service_info")\'/>'+j;
							//innerhtml += '<br/><span style="font-size:12px;color:#808080"></span>';
							innerhtml += '</li>';
						});
						innerhtml += '</ul>';	
					innerhtml += '<div style="padding:10px;background:#f2f2f2;display:none" data-dojo-type="dojox.mobile.ContentPane" >';	
					innerhtml += '<button data-dojo-type="dojox.mobile.Button"  style="background:#f2f2f2;border:none;color:#3366ff;font-size:16px;"/>'+SERVICE_COR+'</button></div>';
					innerhtml += '</ul>';
						
				}
				
			});
		}
		return innerhtml;
	}
	/**
     * 渲染生成服务超市详情页面
     *
	function createHTMLForServiceInfo(id,nodename,result){
		var innerhtml ="";
		if(result !=""){
			$.each(result,function(i,e){
				if(e.id==id){
					innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\'>';
					innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" >';
					innerhtml += '<table style="margin-right:-10px;width:100%">';
					innerhtml += '<tr valign="top">';
					var icon = changeUndefinedToEmpty(e.show);
					if(icon== "")
						icon = "images/thumb.png";
					else
						icon = DATA_ROOT +'data/uploads/'+icon;
					innerhtml += '<td><img style="max-width:100%" src="' +icon + '"/></td></tr>';
					innerhtml += '<tr><td ><span class="memo">'+e.memo+'</span></td></tr>';
					innerhtml += '</table></li></ul>';
					innerhtml += '<h2 data-dojo-type="dojox.mobile.RoundRectCategory" style="margin-left:5px;">'+SERVICE_INDEX_POINT+'</h2>';
					innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\'>';
						$.each(e.biztype_list,function(j,e1){
							innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#"\'  onClick = \'gotoPubReqPage("'+e.id+'","'+e.nodename+'","'+j+'")\'/>'+j+'</li>';
						});
						innerhtml += '</ul>';
				}
				
			});
		}
		return innerhtml;
	}
	
	/**
     * 渲染生成服务机构列表页面
     */	
	function createHTMLForCorporationType(result,type){
		var innerhtml ="";
		if(result !=""){
			//innerhtml += '<div data-dojo-type="dojox.mobile.ScrollableView" data-dojo-props=\'scrollDir:"h"\' style="width:1900px;">';
			innerhtml += '<button class="navyBtn" type="button" id="all_corType"  onClick = \'gotoCorporationList("view_corporation_list","")\'>'+ ALL +'</button>';
			$.each(result,function(i,e){
				//innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" >'+ e.nodename + '</li></ul>';
				innerhtml += '<button  type="button" onClick = \'gotoCorporationList("view_corporation_list","'+e.id+'")\' id="'+e.id+'">'+e.nodename+'</button>';
			});
		}
		return innerhtml;
	}
	/**
     * 渲染生成服务机构列表页面
     */	
	function createHTMLForCorporationList(result,type){
		result = changeUndefinedToEmpty(result);
		var innerhtml ="";
		if(result !=""){
			$.each(result,function(i,e){
				innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\'>';
				innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"view_corporation_info",transition:"none",noArrow:"true"\'  onClick=\'gotoCorporationInfo("'+e.id+'")\'>';
				innerhtml += '<table style="margin-right:-10px;width:100%;">';
				innerhtml += '<tbody><tr valign="top">';
				var icon = changeUndefinedToEmpty(e.corplogo);
				if(icon== "")
					icon = "images/thumb.png";
				else
					icon = DATA_ROOT +'data/uploads/'+icon;
				innerhtml += '<td style="width:80px;"><img  src="'+icon+'" style="width:80px;" /></td>';
				innerhtml += '<td ><span class="title" >'+e.fullname+'</span><br>';
				innerhtml += '<span class="item1">'+COR_PRODUCT + COLON + '</span>';
				var productlist = changeUndefinedToEmpty(e.productlist);
				if(productlist != "")
					innerhtml += '<span class="item2">';
					$.each(productlist,function(j,o){
						innerhtml += '<a>'+o.prodname+'</a>';
					});
					innerhtml += '</span>';
				innerhtml += '</td></tr></tbody></table></li></ul>';
			});
		}else{
			innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\'>';
			innerhtml += '<p class="pl10">' + NO_DATA + '</p></ul>';
		}
			
		return innerhtml;
	}
	
	/**
     * 渲染生成服务机构详情页面
     */	
	function createHTMLForCorporationInfo(result,type){
		result = changeUndefinedToEmpty(result);
		var innerhtml ="";
		if(result !=""){
		
			innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\' class="corporation_info">';
			innerhtml += '<li data-dojo-type="dojox.mobile.ListItem">';
			innerhtml += '<table style="margin-right:-10px;width:100%">';
			innerhtml += '<tbody><tr valign="top">';
			var icon = changeUndefinedToEmpty(result.corplogo);
			if(icon== "")
				icon = "images/thumb.png";
			else
				icon = DATA_ROOT +'data/uploads/'+icon;
			innerhtml += '<td style="width:35%"><img  src="'+icon+'"/></td>';
			innerhtml += '<td ><span class="title" >'+result.fullname+'</span></td></tr>';
			innerhtml += '<tr valign="top"><td colspan="2"><span class="memo">'+ LINKTEL + COLON + result.phones +'</span>';
			innerhtml += '<span class="memo">'+ ADDRESS + COLON +result.address+'</span>';
			var website = result.website;
			if(website.charAt(website.length-1) == "/")
				website = website.substring(0,website.length-1);
			innerhtml += '<span class="memo">'+ WEBSITE + COLON + '<a href=javascript:openURL("'+website+'")>' +website+'</a></span>';
			innerhtml += '</td></tr>';
			innerhtml += '<tr valign="top">';
			var corpintro = changeUndefinedToEmpty(result.corpintro);
			if(corpintro == "")
				corpintro = NO_DATA;
			innerhtml += '<td colspan="2"><h2 data-dojo-type="dojox.mobile.RoundRectCategory" style="margin-left:0px;width:100%;margin-bottom:5px;">'+CORPINTRO+'</h2>';
			//innerhtml += '<div class="lineS_btm" style="margin-right:10px;"></div>';
			innerhtml += '<span class="memo" style="text-indent: 2em">'+corpintro+'</span>';
			innerhtml += '</td></tr></tbody></table></li></ul>';
			//innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\'>';
			innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" >';
			innerhtml += '<h2 data-dojo-type="dojox.mobile.RoundRectCategory" >'+SERVICE_ITEM+'</h2>';			
			var productlist = changeUndefinedToEmpty(result.productlist);
			if(productlist !=""){
				$.each(productlist,function(j,e1){
					innerhtml += '<li data-dojo-type="dojox.mobile.ListItem" data-dojo-props=\'moveTo:"#",noArrow:"true"\' style="border:solid 1px #d8d8d8;margin:10px;font-size:14px;">'+e1.prodname+'</li>';
				});
			}else
				innerhtml += '<span class="memo ml10 mb10">' + NO_DATA + '</span>';
			innerhtml += '</ul>';
			innerhtml += '<ul data-dojo-type="dojox.mobile.RoundRectList" 	data-dojo-props=\'variableHeight:true\'>';
			innerhtml += '<h2 data-dojo-type="dojox.mobile.RoundRectCategory" >'+THREE_MONTHS_ABUTMENT + '</h2>';
			var reqlist = changeUndefinedToEmpty(result.reqlist);
			if(reqlist !=""){
				innerhtml +=	createHTMLForReqList(reqlist,'view_corporation_info');
			}else
				innerhtml += '<span class="memo ml10 mb10">' + NO_DATA + '</span>';			
			innerhtml += '</ul>';
		}else
			innerhtml += '<span class="memo ml10 mb10">' + NO_DATA + '</span>';
		return innerhtml;
	}
    	
