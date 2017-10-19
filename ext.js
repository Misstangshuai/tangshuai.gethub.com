

var settings = {
	server: "https://service.huacaizhaoyu.com/zhaohuobao-test/api",
	pass_tel: "4006601606"
};

var loading = false;
var async = function(type, api, data, succ, fail, hideWaiting) {
	if(!hideWaiting) {
		plus.nativeUI.showWaiting();
		if(loading) {
			return false;
		}
		loading = true;
	}
	var param = type == "GET" ? "" : JSON.stringify(data);
	
	var token = plus.storage.getItem("token");
	console.log("HTTP >>>> [" + api + "] >>>> [" + token + "] >>>> " + param);
	
	var headers = {};
	if (token) {
		headers["X-Auth-Token"] = token;
	}
//	var type1 = type==null?"POST":type;
	mui.ajax({
		url: settings.server + api,
		type: type,
		headers: headers,
		data: param,
		async: false,
		contentType: "application/json;charset=utf-8",
		dataType: "json",
		success: function(res) {
			if(!hideWaiting) {
				plus.nativeUI.closeWaiting();
				loading = false;
			}
			console.log("HTTP <<<< " + JSON.stringify(res));
			
			if (res.status && res.status == 401) {
				logout();
				return;
			}
			
			if (res.statusCode == "TOKEN_EXPIRED") {
				async("GET", "/auth/refresh-auth", {}, function (res) {
					if (res.statusCode == "OK" || res.statusCode == "ok") {
						async(type, api, data, succ, fail, hideWaiting);
					} else {
						logout();
					}
				}, function () {
					logout();
				});
				
				return ;
			}

			if(res.statusCode == "OK" || res.statusCode == "ok") {
				succ && succ(res);
			} else {
				fail ? fail(res) : mui.toast(res.msg);
			}
		},
		error: function(xhr, type, errorThrown) {
			if(!hideWaiting) {
				plus.nativeUI.closeWaiting();
				loading = false;
			}
			console.log("HTTP #### [" + type + "] #### [" + errorThrown + "] #### " + xhr.responseText);
			mui.alert("网络异常");
		}
	});
}

var toast = function (type, msg) {
	if (type == "ok") {
		mui.toast('<span class="mui-icon mui-icon-checkmarkempty" style="font-size: 60px"></span>操作成功');
	} else if (type == "fail") {
		mui.toast('<span class="mui-icon mui-icon mui-icon-close"></span>操作失败')
	} else if (type == "error") {
		mui.toast('<span class="mui-icon mui-icon-refreshempty"></span>网络异常');
	}
}

var clearAll = function() {
	setTimeout(function() {
		var curr = plus.webview.currentWebview();
		var wvs = plus.webview.all();
		for(var i = 0, len = wvs.length; i < len; i++) {

			if(wvs[i].getURL() == curr.getURL())
				continue;
			plus.webview.close(wvs[i], "none");
		}
	}, 500);
}

var splitWebviewId = function(url) {

	var id = "";
	if(url.indexOf("/") > -1) {
		id = url.substring(url.lastIndexOf("/") + 1).replace(".html", "");
	} else {
		id = url.replace(".html", "");
	}

	return id;
}

var linkForward = function(e) {
	var url = this.getAttribute("data-href");

	var data = {};
	if(url.indexOf("?") > 0) {
		var query = url.split("?")[1];
		url = url.split("?")[0];

		var seg = query.split("&");
		for(var i = 0; i < seg.length; i++) {
			var pair = seg[i].split("=");
			data[pair[0]] = pair[1];
		}
	}

	var id = splitWebviewId(url);
	mui.openWindow({
		url: url,
		id: id,
		extras: data
	});
	
	if (e) {
		e.stopPropagation();
	}
}

function getUser() {

	return JSON.parse(plus.storage.getItem("login_user"));
}

function nvl(str) {
	if(str === null || str === undefined) {
		return "";
	}

	return str;
}



mui.plusReady(function() {
	
	plus.screen.lockOrientation("portrait-primary");

	var links = document.querySelectorAll("a[data-href]");
	if(links) {
		for(var i = 0; i < links.length; i++) {
			links[i].addEventListener("tap", linkForward);
		}
	}
	
	
	plus.push.addEventListener("click", function(msg) {
    	var curr = plus.webview.currentWebview();
    	console.log("############## " + curr.id);
    	if (curr.id == "main") {
    		loadMsg();
    	}
    }, false);
    plus.push.addEventListener("receive", function(msg) {
        var data = JSON.parse(msg.payload);
        console.log("push receive");
        console.log(data);
    }, false);
	

});

/*
 *     // Default usage and custom precision/symbol :
    var revenue = 12345678;
    alert(revenue.formatMoney()); // $12,345,678.00
    alert(revenue.formatMoney(0, "HK$ ")); // HK$ 12,345,678
    // usage: someVar.formatMoney(decimalPlaces, symbol, thousandsSeparator, decimalSeparator)
    // defaults: (2, "$", ",", ".")
 */
var formatMoney = function (num, places, symbol, thousand, decimal) {
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "$";
    thousand = thousand || ",";
    decimal = decimal || ".";
    var number = num,
        negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};

var logout = function () {
	
	plus.storage.removeItem("token");
	plus.storage.removeItem("remember");
	plus.storage.removeItem("login_user");
	
	
	var regId = plus.push.getClientInfo().clientid;
	
	if (regId) { 
		async("GET", "/pushService/signOut?regId=" + encodeURIComponent(regId), {}, function () {
		}, function () {}, true);
	}
	
		var login = plus.webview.getWebviewById("login");
		if (login) {
			plus.webview.close(login, "none");
		}
	setTimeout(function () {
		mui.openWindow({
			url:"login.html",
			id:"login"
		});

		
	}, 100);
}

var mui_back = mui.back;
mui.back = function () {
	
    var opener = mui.currentWebview.opener();
    if (opener) {
		mui.fire(opener, "viewAppear");
    }
    
    mui_back();
}


var goods_save = function(data) {
	var list = plus.storage.getItem("goods_list");
	if (!list) {
		list = [];
	} else {
		list = JSON.parse(list);
	}
	
	if (list.indexOf(data.commodityId) == -1) {
		list.push(data.commodityId);
	}
	plus.storage.setItem("goods_list", JSON.stringify(list));
	plus.storage.setItem("goods_" + data.commodityId, JSON.stringify(data));
}

var goods_del = function (gid) {
	var ll = JSON.parse(plus.storage.getItem("goods_list"));
	ll.splice(ll.indexOf(gid), 1);
	plus.storage.setItem("goods_list", JSON.stringify(ll));
	plus.storage.removeItem("goods_" + gid);
}
