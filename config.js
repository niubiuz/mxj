//foryou 配置文件
var APP_ID = "foryou" ;
var APP_NAME ="foryou";
var VERSION_NO = 0; //当前软件的版本
var VERSION_INFO = "V1.0.0"; //当前软件的版本
var RUNTIME = "product";//运行时环境变量 : develop 开发环境, test 测试环境, product 生产环境
var RUN_MODE = "web";//运行模式 : web 我网页, phone 手机或者平板电脑
var RUNTIME_CONFIG =[{"runtime":"develop",
					  "server_root":"http://localhost:82/foryou/",
					  "data_root":"http://localhost:82/foryou/",
					  "version_root":"http://localhost:82/foryou/apps/declare/version_config.php"},
			   		 {"runtime":"test",
					  "server_root":"http://localhost:82/foryou/",
					  "data_root":"http://localhost:82/foryou/",
					  "version_root":"http://localhost:82/foryou/apps/declare/version_config.php"},
			   		 {"runtime":"product",
					  "server_root":"http://localhost:82/foryou/",	
					  "data_root":"http://localhost:82/foryou/",					  
					  "version_root":"http://localhost:82/foryou/apps/declare/version_config.php"}];

var LOADING_CONFIG = ["秒先机及时为您收集互联网最新最全优惠信息！"
                      ];

var DATA_ROOT = "http://localhost/dsns25/";// 网站数据路径
var VERSION_ROOT = "http://localhost/dsns25/apps/declare/version_config.php";//版本更新路径

for(var i =0 ;i<RUNTIME_CONFIG.length;i++){
	if( RUNTIME == RUNTIME_CONFIG[i].runtime ){
		DATA_ROOT = RUNTIME_CONFIG[i].data_root;
		VERSION_ROOT = RUNTIME_CONFIG[i].version_root;
	}
}

var PERPAGE   = 8;//默认显示条数:如果要更改每页的显示数量只需更改此参数即可

//设置全局变量:这些全局变量只在服务器取一次
var data_new_json =null;//最新项目
var data_end_json =null;//即将截止
var data_search_json =null;//搜索结果
var data_new_count = 0;//最新项目的数量
var data_end_count = 0;//即将截止的项目数量
var weibo_config_json =null;//最新资讯配置文件json对象

//查询参数	
var curpage = -1;//当前页码
var nextpage = 1;//下一页
var querylist="";//查询和搜索生成列表html页面。在加载更多的时候将该代码加入到加载的数据前面组合成新的html代码
var data_new_list="";//查询和搜索生成列表html页面。在加载更多的时候将该代码加入到加载的数据前面组合成新的html代码
var data_end_list="";//查询和搜索生成列表html页面。在加载更多的时候将该代码加入到加载的数据前面组合成新的html代码
var data_more_list="";//加载更多的列表
var count_all = 0;//查询数据的总数
var total_count = 0; //加载数据的总数
var noticetheme="";//查询条件：主题
var querydate=""; //查询条件：时间
var kw="";//搜索框关键字

var curdate=0; //当前服务器的日期
var curtime=0; //当前服务器的时间
var transition_type = "none"; //页面转场效果
var device_platform = "android";//手机操作系统
var device_version = "";//手机操作系统版本号
var device_uuid = "";//设备的uuid唯一标识,每次删除安装的时候会改版
var device_uuid_only = "";//设备的uuid唯一标识，用户第一次安装的时候产生 
var device_name = "";//设备的型号或者是设备的名称（ios上是用户在iTunes上设置的设备名称）
var device_network ="";//当前网络状态
var app_version="";	//应用版本信息


var KEY =""; //取数据的key
//申报通知分页参数
var notice_curpage = 1; 
var notice_nextpage = 2;//默认为第二页
var downurl ="";
var verinfo ="";
var uid	= 0; //用户登录后id
var nickname	= ""; //用户登录后昵称

var head_style = "myhead";//head样式参数
/**为了便于压缩后修改中文将js中的中文用配置项来替代*/
var desc = "当前网络不可用";
var NO_NETWORK = "网络未连接";
var ERROR_NETWORK_OR_DATA = "当前网络不可用";
var ALL = "全部";
var RELOAD = "重新加载";
var HAS_REFRESH = "为您刷新了";
var SOME_NEWPROJECT = "条新的项目";
var SOME_NEWINFO = "条新的最新资讯";
var NO_NEWPROJECT = "没有新的项目";
var NO_NEWPINFO = "没有新的资讯";
var NEW_INFOMATION = "最新资讯";
var LOAD_MORE_INFO = "点击加载更早的推荐";
var LOAD_MORE = "点击加载更多";
var LOADING = "正在加载...";
var LOADING_WAIT = "数据正在加载，请稍候";
var MANY ="很多";
var SOURCE ="来源：";
var ENTRY = "请输入";
var ENTRY_PASSWORD_AGAIN = "请再次输入您的密码";
var YOUR = "你的";
var MALE = "男";
var FEMALE = "女";
var USERNAME = "账号";
var PASSWORD = "密码"
var NICKNAME = "昵称";
var LOGIN = "登录";
var REGIST = "注册";
var LOGOUT = "退出"
var BEING= "正在";
var SUCCESS ="成功";
var FAIL ="失败";
var USER ="用户";
var INFO ="信息";
var PASSWORD_DIFFERENCE = "两次输入的密码不一致，请重新输入";
var VERSION = "版本";
var BETA = "测试版";
var NOW = "现在";
var HAVE = "有";
var NEW = "新的";
var YESTODAY 		= "昨天";
var TWODAYSAGO   	= "两天前";
var DAYSAGO   	= "天前";
var TODAY 		= "今天";
var TOMORROW   	= "明天";
var AFTERTOMORROW  = "后天";
var DAY 		= "天";
var YEAR 		= "年";
var MONTH 		= "月";
var DAYTIME 		= "日";
var ALSO   		= "还有";
var PUB       	= "发布";
var NO_DATA   	= "暂无相关数据";
var ERROR_DATA   	= "数据加载异常";
var VIEWCOUNT 	= "关注度：";
var PUBDATE     = "发布时间：";
var REPLAYCOUNT = "回复数：";
var ORIGINAL_TEXT = "原文";
var NOTICE =  "通知";
var TIMENODE =  "时间节点";
var PUBLICITY = "公示信息";
var REMIND = "友情提醒";
var REQUIRE =  "要求";
var INALL =  "共";
var GE = "个";
var BY_THE_END_OF  = "截止到";
var LAST_DAY = "最后一天";
var REQ_PROGRESS = "对接状态";
var PUB_DATE = "发布日期";
var REPLAY_COUNT = "回复数量";
var VIEWCOUNT = "关注度";
var COLON = "：";
var PRO_DESC = "项目简介";
var PRO_BATCH = "批次"; 
var PRO_LEVEL = "项目级别";
var PRO_PROGRESS = "阶段";
var PRO_ADMINORG = "主管单位";
var PRO_DESC = "项目简介";
var THE_PRO_HAS_NO ="该项目还没有";
var UP_TO_DATE= "最新";
var LATETLY= "最近";
var PROJECT_HINT = "项目提示";
var TIME_OUT= "时间已过";
var IS_REPLAY ="是否回复";
var I_NO_REPLAY ="我还未回复";
var I_REPLAY ="我已回复";
var REPLAY_SUCCESS = "回复需求成功！";
var CONFIRM_DEL_REQ_REPLAY="你确定删除该条需求回复？";
var ALERT_REQ_REPLAY_LENGTH ="最多只能输入300个字";
var DATA_SAVING ="数据保存中...";
var LOGIN_FIRST = "请先登录";
var IN_THE_DECLARE = "申报中";
var IS_ABOUT_TO_BEGIN = "即将开始";
var HAS_BEING_PUBLICIZED = "已经公示";
var DEADLINE = "已截止";
var DEADLINE1 = "申报截止";
var NO_PLEASE_KEEP_ATTENTION ="暂无，请保持关注";
var PUBLICITY_TIPS ="请点击查看公示信息";
var IN_NEED_OF ="需在";
var COMPLETED_BEFORE ="之前完成";
var NOTICE_DESC = "本文只是原文的快照，若您发现文章中的链接无法打开，请您点击查看原文";
var NOTICE_BUTTON = "查看原文";
var LANG_REMIND = "温馨提醒";
var UPDATE_BUTTON = "马上升级,忽略此版本,下次吧";
var UPDATE_BUTTON_COMM ="确认,取消";
var START_WECHAT ="正在启动微信";
var NO_COMMENT = "还没有评论";
var COMMENTS = "人评论";
var PLEASE_ENTER_YOUR_COMMENT = "请输入您的评论"
var NO_FEEDBACK = "您还没有提交任何反馈意见和建议，您现在可以点击右上角 + 提交您的反馈意见和建议，我们将不断为您改进！";
var DEVICE = "设备";
var DEVICE_VERSION ="系统版本";
var CLIENT_VERSION ="客户端版本";
var PLEASE_ENTER_YOUR_FEEDBACK = "请输入您的意见和建议"
var CUSTORM_SERVICE ="客服";
var ANONYMOUS = "匿名用户";
var NO_NEW_VERSION ="暂无新版本";
var FEEDBACK_NO_NETWORK = "需要连接网络才能查看您提交的反馈信息";
var PLEASE_ENTER_REQ_TYPE = "请您选择需求类型";
var PLEASE_ENTER_BIZ_TYPE = "请选择您的服务类型";
var SERVICE_INDEX_POINT = "点击下面的链接，可直接针对服务提需求";
var SERVICE = "服务";
var MEMO = "简介";
var LINKTEL = "联系电话";
var ADDRESS = "办公地址";
var WEBSITE = "公司网址";
var CORPINTRO = "公司简介";
var SERVICE_ITEM = "服务项目";
var THREE_MONTHS_ABUTMENT = "最近三个月的对接";
var COR_PRODUCT  = "提供的服务";
var REQ_PUB_BYME = "我发布的需求";
var REQ_OFME = "我的需求";
var ORDERBY_NOTICE_PUBTIME = "(按通知发布时间排序)";
var ORDERBY_TIMENODE = "(按时间节点时间排序)";
var ORDERBY_PUBTIME = "(按发布时间排序)";
var ORDERBY_VIEWCOUNT = "(按热度排序)";
var SERVICE_COR = "看看哪些机构提供此服务";
