req={};

	//读取文件中的数据
	req.read = function(callback){
		$.ajax({
			type:"get",
			url:"js/data.json",
			dataType : "json",
			async:true,
			success : function(data){
				callback ? callback(data) : (function(){})();
			}
		});
	}


