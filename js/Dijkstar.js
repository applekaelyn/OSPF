

	var n,	//顶点数
		e,	//边数
		data,	//存放初始数据
		routers = [];	//路由表集合
	
	//路由表
	function RouterTable(name, information){
		this.name = name ;	//当前路由器名称
		this.information = information;	//路由表信息
		
		this.linkStateDatabase = [];	//链路状态数据库
		this.send = function(router,linkState){
			router.get(this.name,linkState);
		};
		this.get = function(name,linkState){
			this.linkStateDatabase.push({
				"name":name,
				"linkState":linkState
			});
		};
	}
		
//	req.read(callback);
	
	//初始化
	function ini(){
//		n = res.info['n'];
//		e = res.info['e'];
//		data = res.info['data'];
		//建立拓扑图
		buildTopology();
	}
	
	//建立拓扑图
	function buildTopology(){
		routers.splice(0,routers.length);//清空数组 
		for(var i = 0;i<n;i++){
			var information = {};
			for(var j =0;j<n;j++){
				if(i!=j){
					var cost = data[i].adjacent[data[j].name];
					if(cost){
						information[data[j].name] = {'cost' : cost, 'path' : [data[i].name , data[j].name]};
					}else{
						information[data[j].name] = {'cost' : Number.POSITIVE_INFINITY, 'path' : [data[i].name , data[j].name]};
					}
				}
			}
			var routerTable = new RouterTable(data[i].name, information);
			routers.push(routerTable);
		}
		
		//洪泛法
		flooding.update();
		//使用dijkstar算法得出最短路径
		updateRouterTable();
	}
	
	//使用dijkstar算法得出最短路径
	function updateRouterTable(){
		var S=[],	//已选择集合
			U=[];	//未选择集合
		for(var i = 0;i<n;i++){
			//初始化S和U集合
			S = [];
			U = [];
			S.push(routers[i].name);
			for(var j = 0;j<n;j++){
				if(routers[j].name != routers[i].name){
					U.push(routers[j].name);
				}
			}
			shortPath(i, S, U);
//			console.log(routers[i]);
		}
		
	}
	
	//获取与相邻路由器相连的链路中代价最小的边
	function minimum(RouterTable, U){
		var min={};
//		for(var key in RouterTable.information){   
//			if (RouterTable.information.hasOwnProperty(key) === true){
//				min['name'] = key;
//				min['cost'] = getCost(RouterTable, key);
//			}
//			break;
//		}
		min['name'] = U[0];
		min['cost'] = getCost(RouterTable, U[0]);
//		for(var key in RouterTable.information){   
//	        //只遍历对象自身的属性，而不包含继承于原型链上的属性。  
//	        if (RouterTable.information.hasOwnProperty(key) === true){  
//	            if(min['cost'] > getCost(RouterTable, key)){
//				    min['name'] = key;
//				    min['cost'] = getCost(RouterTable, key);
//	            }
//          }                 
//      }  
		for(var i = 0;i<U.length;i++){
			if(getCost(RouterTable, U[i]) <min.cost){
				min['name'] = U[i];
				min['cost'] = getCost(RouterTable, U[i]);
			}
		}
		
		return min;
	}
	
	//删除数组中指定元素
	Array.prototype.remove = function(b) { 
		var a = this.indexOf(b); 
		if (a >= 0) { 
			this.splice(a, 1); 
			return true; 
		} 
		return false; 
	}; 
	
	//获取路由表中到达某点的代价
	function getCost(RouterTable, name){
		for(var key in RouterTable.information){   
			if (RouterTable.information.hasOwnProperty(key) === true){
				if(key == name){
					return RouterTable.information[key].cost;
				}
			}else{
				return undefined;
			}
		}
	}
	
	//获取路由表中到达某点的路径
	function getPath(RouterTable, name){
		for(var key in RouterTable.information){   
			if (RouterTable.information.hasOwnProperty(key) === true){
				if(key == name){
					return RouterTable.information[key].path;
				}
			}
		}
	}

	//设置路由表中到达某点的代价
	function setCost(RouterTable, name, cost){
		for(var key in RouterTable.information){   
			if (RouterTable.information.hasOwnProperty(key) === true){
				if(key == name){
					RouterTable.information[key].cost = cost;
					return true;
				}
			}
		}
		return false;
	}

	//设置路由表中到达某点的路径
	function setPath(RouterTable, name, path){
		for(var key in RouterTable.information){   
			if (RouterTable.information.hasOwnProperty(key) === true){
				if(key == name){
					RouterTable.information[key].path = path;
					return true;
				}
			}
		}
		return false;
	}
	
	//获取路由表的索引
	function getIndex(name){
		for(var i = 0;i<n;i++){
			if(routers[i].name == name){
				return i;
			}
		}
	}
	
	//最短路径寻找
	function shortPath(index, S, U){
		if(U.length == 0){
			return ;
		}
		var cost = 0;
		var path = [];
		var min = minimum(routers[index], U);
		var transferIndex = getIndex(min.name);
		cost = min.cost;
		path = routers[index].information[min.name].path.concat();
		U.remove(min.name);
		S.push(min.name);
		
		for(var i = 0;i<n;i++){
			var newCost = getCost(routers[transferIndex],routers[i].name);
			if(newCost){
				if(parseInt(newCost)+parseInt(cost) < getCost(routers[index],routers[i].name)){
					path = routers[index].information[min.name].path.concat();
					path.pop();
					path = path.concat(getPath(routers[transferIndex],routers[i].name));
					setPath(routers[index],routers[i].name,path);
					setCost(routers[index],routers[i].name,parseInt(newCost)+parseInt(cost));
				}
			}
		}
		shortPath(index, S, U);
//		if(U.remove(min.name)){
//			S.push(min.name);
//			cost += min.cost-0;
//			path = S.concat();
//			//如果新的路径代价小于原来的代价
//			if(getCost(routers[index],min.name) > cost){
//				setCost(routers[index], min.name, cost);
//				setPath(routers[index], min.name, path);
//			}
//			curIndex = getIndex(min.name);
//			shortPath(index, curIndex, cost, path, S, U);
//		}else{
//			
//		}
	}

var flooding = {};

	flooding.update = function(){
		for(var i = 0;i<routers.length;i++){
			//当前路由器的名称
			var oriName = routers[i].name;
			//把自己的链路状态放入链路状态数据库中
			routers[i].linkStateDatabase.push({"name":oriName,"linkState":data[i].adjacent});
			//遍历当前路由器的相邻路由器
			for(var key in data[i].adjacent){   
				if (data[i].adjacent.hasOwnProperty(key) === true){
					var index = getIndex(key);
					//如果将要传递的链路状态在目标信息中不存在
					if(!flooding.isExist(index,oriName)){
						routers[i].send(routers[index],data[i].adjacent);
					}
				}
			}
		}
	}
	
	//判断将要传递的链路状态在目标信息中是否已经存在
	flooding.isExist = function(index,oriName){
		if(routers[index].linkStateDatabase.length==0){
			return false;
		}
		for(var j = 0;j<routers[index].linkStateDatabase.length;j++){
			if(oriName == routers[index].linkStateDatabase[j].name){
				return true;
			}
		}
		return false;
	}