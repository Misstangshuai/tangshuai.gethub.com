mui.init({
    swipeBack:true //启用右滑关闭功能
});
// 启用href
mui('body').on('tap','a.wxm_a',function(){
    document.location.href=this.href;
});
//当前激活选项
//		var title=document.querySelector(".mui-title");
//		mui('.mui-bar-tab').on('tap', 'a', function(e) {
//			// 更换标题
//			title.innerHTML = this.querySelector('.mui-tab-label').innerHTML;
//		});