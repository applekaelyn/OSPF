$(function(){
	//画布对象：canvas  
    var canvas = document.getElementById('canvas'); 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //抽象的舞台对象对应一个Canvas对象，所有图形展示的地方  
    var stage = new JTopo.Stage(canvas);  
    //场景对象  
    var scene = new JTopo.Scene(stage);  
    //背景图片
    scene.background = './img/bg.jpg';
	
	var currentNode = null;
	var currentLink = null;
	
	var routerNodes  = [];
	var links = [];
	
	
	//JTopo.createStageFromJson(stageJson, canvas);
//  var A = new newRouter("A");
//  var B = new newRouter("B");
//	var link = new newLink(A, B, "10"); 
	
//	A.addEventListener('mouseup', function(event){
//		currentNode = this;
//		routerMeunShow(event);
//	});
//	link.addEventListener('mouseup', function(event){
//		currentLink = this;
//		edgeMeunShow(event);
//	});
	
	//初始化拓扑图
	req.read(callback);
	
	//获取数据后的回调函数
	function callback(res){
		n = res.info['n'];
		e = res.info['e'];
		data = res.info['data'];
		ini();
		drawTopology();
	}
	
	//绘制整个拓扑图
	function drawTopology(){
		for(var i = 0;i<n;i++){
			var num = Math.ceil(n/2);
			if((i+1) > num){
				var X = 50 + (i-num)*250;
				var Y = window.innerHeight/2;
			}else{
				var X = 50 + i*200;
				var Y = 30 ;
			}
			var router = new newRouter(data[i].name, X, Y);
			router.addEventListener('mouseup', function(event){
				currentNode = this;
				routerMeunShow(event);
			});
			routerNodes.push(router);
		}
		for(var i = 0;i<n;i++){
			for(var j=i;j<n;j++){
				if(i!=j){
					var cost = data[i].adjacent[data[j].name];
					if(cost){
						var link  = new newLink(routerNodes[i],routerNodes[j],cost);
						link.addEventListener('mouseup', function(event){
							currentLink = this;
							edgeMeunShow(event);
						});
						links.push(link);
					}
				}
			}
		}
	}
		
	
	
	//绘制路由器
	function newRouter(name, X, Y){
		var node = new JTopo.Node(name);
		node.setImage('img/router.png');
		node.setLocation(X, Y);
		node.setSize(100,100);
		node.font = "20px Arial";
		node.showSelected = false; // 不显示选中矩形
		scene.add(node);
		return node;
	}
	
	//连线
	function newLink(nodeA, nodeZ, text){
		var link = new JTopo.Link(nodeA, nodeZ, text);
		link.lineWidth = 5; // 线宽
		link.font = "20px SimHei";
		scene.add(link);
		return link;
	}
	
	//菜单点击事件
	$(".contextmenu a").click(function(event){
		var text = $(this).text();
		
		if(text == '连接'){
			drawLink(event);
		}
		
		if(text == '删除该路由'){
			scene.remove(currentNode);
			for(var i = 0;i<n;i++){
				if(data[i].name == currentNode.text){
					data.splice(i,1);
					n--;
					i--;
				}else{
					if(data[i].adjacent[currentNode.text]){
						delete data[i].adjacent[currentNode.text];
					}
				}
			}
			for(var j=0;j<e;j++){
				if(links[j].nodeA==currentNode||links[j].nodeZ==currentNode){
					links.splice(j,1);
					e--;
				}
			}
			buildTopology();
			currentNode = null;
		}
		
		if(text == '查看路由表'){
			showRouterTable();
		}
		
		if(text == '删除该连接'){
			scene.remove(currentLink);
			for(var i=0;i<e;i++){
				if(links[i].nodeA==currentLink.nodeA && links[i].nodeZ==currentLink.nodeZ){
					links.splice(i,1);
					e--;
					i--;
				}
			}
			delete data[getIndex(currentLink.nodeA.text)].adjacent[currentLink.nodeZ.text];
			delete data[getIndex(currentLink.nodeZ.text)].adjacent[currentLink.nodeA.text];
			buildTopology();
			currentLink = null;
		}
		
		if(text == '修改代价'){
			$(".cost").val("");
			$(".editCost").removeClass("hide");
		}
		
		
//		if(text == '撤销上一次操作'){
//			currentNode.restore();
//		}else{
//			currentNode.save();
//		}
		
		$(".contextmenu").hide();
	});
	
	//路由器右键菜单
	function routerMeunShow(event){
		if(event.button == 2){// 右键
			// 当前位置弹出菜单（div）
			$(".routerMeun").css({
				top: event.pageY,
				left: event.pageX
			}).show();	
		}
	}
	//边右键菜单
	function edgeMeunShow(event){
		if(event.button == 2){// 右键
			// 当前位置弹出菜单（div）
			$(".edgeMeun").css({
				top: event.pageY,
				left: event.pageX
			}).show();	
		}
	}

	
	//左键隐藏菜单
	stage.click(function(event){
		if(event.button == 0){// 左键
			// 关闭弹出菜单（div）
			$(".contextmenu").hide();
		}
	});
	
	//手动连线
	function drawLink(event){
		var beginNode = currentNode;
		var tempNodeA = currentNode;
		var tempNodeZ = new JTopo.Node('tempZ');
		tempNodeZ.setSize(1, 1);
		tempNodeZ.setLocation(event.x, event.y);
		
		var link = new newLink(tempNodeA, tempNodeZ);
		
		scene.mouseup(function(event){
			if(event.button == 2||beginNode==null){
				scene.remove(link);
				return;
			}
			if(event.target != null && event.target instanceof JTopo.Node){
				if(beginNode !== event.target){
					var endNode = event.target;
					var isExist =false;	//新的线是否存在
					for(var i=0;i<e;i++){
						if(links[i].nodeA.text==beginNode.text && links[i].nodeZ.text==endNode.text){
							isExist = true;
						}else if(links[i].nodeZ.text==beginNode.text && links[i].nodeA.text==endNode.text){
							isExist = true;
						}
					}
					if(!isExist){
						isExist = false;
						var l = new newLink(beginNode, endNode);
						l.addEventListener('mouseup', function(event){
							currentLink = this;
							edgeMeunShow(event);
						});
						data[getIndex(beginNode.text)].adjacent[endNode.text] = 0;
						data[getIndex(endNode.text)].adjacent[beginNode.text] = 0;
						e++;
						buildTopology();
						$(".cost").val("");
						$(".editCost").removeClass("hide");
						links.push(l);
						currentLink = l;
					}
					beginNode = null;
					scene.remove(link);
				}else{
					beginNode = null;
					scene.remove(link);
				}
			}else{
				beginNode = null;
				scene.remove(link);
			}
			
		});

		scene.mousemove(function(event){
			tempNodeZ.setLocation(event.x, event.y);
		});
	}

	
	//查看路由表
	function showRouterTable(){
		$(".table").remove();
		var html = "";
		var num = 0;
		var routerTable = routers[getIndex(currentNode.text)];
		var table = $(document.createElement('table'));
		table.addClass("table");
		html += "<thead><tr><th>源路由</th><th>目的路由</th><th>下一跳</th><th>最短路径</th><th>总代价</th></tr></thead>"
		html += "<tbody>";

		for(var key in routerTable.information){
			if (routerTable.information.hasOwnProperty(key) === true){
				if(getCost(routerTable,key)==Infinity){
					continue;
				}
				var path = getPath(routerTable,key);
				var s = '';
				for(var i=0;i<path.length;i++){
					s += path[i];
					if(i!=path.length-1){
						s += "->";
					}
				}
				html += "<tr><td>"+path[0]+"</td>";
				html += "<td>"+key+"</td>";
				html += "<td>"+path[1]+"</td>";
				html += "<td class='patha '>"+s+"</td>";
				html += "<td>"+getCost(routerTable,key)+"</td></tr>";
				num++;
			}
		}
		if(num==0){
			html += "<tr><td colspan='5'>该路由器不在自治系统内！</td></tr>";
		}
		
		html += "</tbody>";
		table.append(html);
		
		$(".routerTable").append(table);
		$(".routerTable").removeClass("hide");
	}
	
	//点击关闭路由表
	$(".cancel").click(function(event){
		event.preventDefault();
		$(".routerTable").addClass("hide");
	});
	
	//拖动窗口移动
	$(".routerTable,.editCost,.inputRouter").mousedown(function (event) {  
	        var obj = $(this);  
	        var isMove = true;
	        var mouseDownPosiX = event.pageX; 
			var mouseDownPosiY = event.pageY; 
			var InitPositionX = obj.css("left").replace("px", ""); 
			var InitPositionY = obj.css("top").replace("px", ""); 
			
	        $(document).mousemove(function (event) {  
                if (isMove) {  
                    var tempX = parseInt(event.pageX) - parseInt(mouseDownPosiX) + parseInt(InitPositionX); 
					var tempY = parseInt(event.pageY) - parseInt(mouseDownPosiY) + parseInt(InitPositionY); 
					obj.css("left", tempX + "px").css("top", tempY + "px");
                }  
            }).mouseup(function () {  
                    isMove = false;  
                }  
            );  
       	}  
	);
	
	//输入代价后点击确定
	$(".cost_enter").click(function(){
		var cost = $(".cost").val(); 
		if(!isNaN(cost) && cost.length!=0){
			data[getIndex(currentLink.nodeA.text)].adjacent[currentLink.nodeZ.text] = cost;
			data[getIndex(currentLink.nodeZ.text)].adjacent[currentLink.nodeA.text] = cost;
			buildTopology();
			currentLink.text = cost;
			$(".editCost").addClass("hide");
		}
	});
	
	//点击新建路由器
	$(".newRouter").click(function(){
		$(".routerName").val("");
		$(".inputRouter").removeClass("hide");
	});
	
	//输入路由器名称后
	$(".name_enter").click(function(){
		var name = $(".routerName").val();
		if(name.length==0){
			return;
		}
		var router = new newRouter(name, window.innerWidth/2, window.innerHeight/2);
		router.addEventListener('mouseup', function(event){
			currentNode = this;
			routerMeunShow(event);
		});
		data.push({"name" : name,"adjacent": {}});
		n++;
		buildTopology();
		routerNodes.push(router);
		$(".inputRouter").addClass("hide");
	});
	
	//点击刷新
	$(".refresh").click(function(){
		scene.clear();
		routerNodes.splice(0,routerNodes.length); 
		links.splice(0,links.length); 
		drawTopology();
	});
	
	//点击清除
	$(".clear").click(function(){
		scene.clear();
		routerNodes.splice(0,routerNodes.length); 
		links.splice(0,links.length); 
		data.splice(0,data.length);
	});
})
