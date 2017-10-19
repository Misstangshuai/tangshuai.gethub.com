(function($, doc) {
    $.init();
    $.ready(function() {
        /**
         * 获取对象属性的值
         * 主要用于过滤三级联动中，可能出现的最低级的数据不存在的情况，实际开发中需要注意这一点；
         * @param {Object} obj 对象
         * @param {String} param 属性名
         */
        var _getParam = function(obj, param) {
            return obj[param] || '';
        };
        
    });
})(mui, document);