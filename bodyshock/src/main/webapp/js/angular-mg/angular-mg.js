var mgTab = function(name, icon, title) {
	
	this.name = name;
	
	this.nav = angular.html('<li></li>');
	
	this.link = this.nav.appendHtml('<a><i class="fa '+icon+'"></i></a>');
	
	this.label = this.link.appendHtml('<label></label>');
	
	this.closeBtn = this.nav.appendHtml('<button><i class="fa fa-times"></i></button>');
	
	this.content = angular.html('<div title="" class="tab-pane am-fade"></div>');
	
	this.setTitle(title);
	
	this.setActive(true);
	
}
mgTab.prototype.constructor = mgTab;
mgTab.prototype.init = function(onActive, onClose) {
	this.onActive = onActive;
	this.onClose = onClose;
	var self = this;
	this.link.bind("click", function(e) {
		self.onActive();
	});
	this.closeBtn.bind("click", function(e) {
		self.onClose();
	});
}
mgTab.prototype.getTitle = function() {
	return this.title;
}
mgTab.prototype.setTitle = function(title) {
	this.title = title;
	this.label.text(title);
	this.content.attr("title", title);
}
mgTab.prototype.setActive = function(active) {
	this.active = active;
	
	this.nav.removeClass("active");
	this.content.removeClass("active");
	
	if (active) {
		this.nav.addClass("active");
		this.content.addClass("active");		
	}
}
mgTab.prototype.close = function() {
	this.parent.tabs.remove(this);
	this.parent.nav.removeChild(this.nav);
	this.parent.content.removeChild(this.content);
	if (this.active) {
		if (this.parent.tabs.length > 0) {
			this.parent.tabs[this.parent.tabs.length - 1].onActive();
		}
	}
}

var mgNavTab = function() {
	
	this.tabs = [];
	
}
mgNavTab.prototype.constructor = mgNavTab;
mgNavTab.prototype.init = function(element) {
	this.nav = angular.element(element.children()[0]);
	this.content = angular.element(element.children()[1]);
}
mgNavTab.prototype.disableTabs = function() {
	for (var i = 0; i < this.tabs.length; i++) {
		this.tabs[i].setActive(false);
	}
}
mgNavTab.prototype.onActive = function(tab) {
	this.disableTabs();
	tab.setActive(true);
}
mgNavTab.prototype.add = function(name, icon, title, onActive, onClose) {
	this.disableTabs();
	var navTab = this;
	var tab = new mgTab(name, icon, title);
	tab.parent = this;
	tab.init(
		function() {
			navTab.onActive(tab)
			onActive(tab);
		}, 
		function() {
			onClose(tab);
		}
	);
	this.tabs.push(tab);
	this.nav.appendChild(tab.nav);
	this.content.appendChild(tab.content);
	return tab;
}

var mgTreeNode = function(level, name, icon, title) {
	this.children = [];

	this.level = level;
	this.name = name;
	
	this.base = angular.html('<div class="tree-node"></div>');

	var header = this.base.appendHtml("<div></div>")
	
	for (var i = 0; i < level - 1; i++) {
		header.appendHtml('<i class="fa"></i>');
	}
	
	this.collapse = header.appendHtml('<i class="fa"></i>');

	this.icon = header.appendHtml('<i></i>');
	
	var self = this;
	this.collapse.bind("click", function() {
		self.onCollapse();
	});
	
	this.link = header.appendHtml('<a></a>');
	
	this.link.bind("click", function() {
		self.onSelect();
	});
	
	this.content = this.base.appendHtml("<div></div>")
	
	this.setTitle(title);
	this.setIcon(icon);
	
	this.setSelect(false);
	
	this.expanded = false;
};
mgTreeNode.prototype.constructor = mgTree;
mgTreeNode.prototype.init = function(onSelect) {
	this.onSelect = onSelect;
};
mgTreeNode.prototype.findChild = function(title) {
	for (var i = 0; i < this.children; i++) {
		var child = this.children[i];
		if (child.getTitle() == title) {
			return child;
		}
	}
	return null;
};
mgTreeNode.prototype.getTitle = function() {
	return this.link[0].innerText;
};
mgTreeNode.prototype.setTitle = function(title) {
	this.link.text(title);
	this.base.attr("title", title);
};
mgTreeNode.prototype.setIcon = function(icon) {
	this.icon.removeClass(this.icon.attr('class'));
	this.icon.addClass("fa " + icon);
}
mgTreeNode.prototype.setSelect = function(selected) {
	this.selected = selected;
	this.link.removeClass("selected");
	if (this.selected) {
		this.link.addClass("selected");
	}
};
mgTreeNode.prototype.onCollapse = function() {
	if (this.children.length > 0) {
		this.collapse.removeClass(this.expanded ? "fa-caret-right" : "fa-caret-down");
		this.collapse.addClass(this.expanded ? "fa-caret-down" : "fa-caret-right");
		this.content.css("display", this.expanded ? "block" : "none");
		this.expanded = !this.expanded;
	}
};
mgTreeNode.prototype.unselectNodes = function(node) {
	node = node ? node : this;
	for (var i = 0; i < node.children.length; i++) {
		var child = node.children[i];
		child.setSelect(false);
		if (child.children.length > 0) {
			this.unselectNodes(child);
		}
	}
};
mgTreeNode.prototype.getRoot = function() {
	var parent = this.parent ? this.parent : this;
	while(parent.parent) {
		parent = parent.parent;
	}
	return parent;
}
mgTreeNode.prototype.add = function(name, icon, title, onSelect) {
	var self = this;
	var node = new mgTreeNode(this.level + 1, name, icon, title);
	node.parent = this;
	node.init(
		function() {
			self.unselectNodes(self.getRoot());
			node.setSelect(true);
			onSelect(node);
		}
	);
	this.children.push(node);
	if (this.children.length == 1) {
		this.onCollapse();
	}
	this.content.appendChild(node.base);
	return node;
};
mgTreeNode.prototype.getSelected = function(node) {
	node = node ? node : this;
	for (var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		if (child.selected) {
			return child;
		}
		if (child.children.length > 0) {
			var result = child.getSelected();
			if (result) {
				return result;
			}
		}
	}
	return null;
}


var mgTree = function() {
	this.children = [];

	this.level = 0;
	
	this.content = angular.html('<div class="tree"></div>');
};
mgTree.prototype.constructor = mgTree;
mgTree.prototype = Object.create(mgTreeNode.prototype);
mgTree.prototype.init = function(parent) {
	parent.appendChild(this.content);
};
mgTree.prototype.onCollapse = function() {
};

angular.module('ngmg', [])
  	.directive("bsTreeView", function($compile) {
        return {
        restrict: "E",
        scope: {node: '='},
        link: function (scope, element, attrs) {
            var template = '<div class="tree-view"><p><b>{{ node.label }}</b>{{ node.value != undefined ? ":" + node.value : ""}}</p>';

            if (angular.isArray(scope.node.children)) {
                template += '<ul><li ng-repeat="child in node.children"><bs-tree-view node="child" /></li></ul>';
            }

            template += '</div>';
            var newElement = angular.element(template);
            $compile(newElement)(scope);
            element.replaceWith(newElement);
            }
        };
    })

	.directive('paging', function() {

		function setScopeValues(scope, attrs) {
			scope.items = [];
			scope.adjacent = 2;
			scope.pageCount = 10;
		}

		function internalAction(scope, page) {

			// Block clicks we try to load the active page
			if (scope.page == page) {
				return;
			}

			// Update the page in scope and fire any paging actions
			scope.page = page;
			scope.pagingAction(page);

			//scrollTo(0, 0);
		}

		function validateScopeValues(scope, pageCount) {

			// Block where the page is larger than the pageCount
			if (scope.page > pageCount) {
				scope.page = pageCount;
			}

			// Block where the page is less than 0
			if (scope.page <= 0) {
				scope.page = 1;
			}

		}

		function addRange(start, finish, scope) {

			var i = 0;
			for (i = start; i <= finish; i++) {

				var item = {
					value : i,
					title : "Page " + i,
					class : scope.page == i ? 'active' : '',
					action : function() {
						internalAction(scope, this.value);
					}
				};

				scope.items.push(item);
			}
		}

		// Add First Pages
		function addFirst(scope) {
			addRange(1, 2, scope);
		}

		// Add Last Pages
		function addLast(pageCount, scope) {
			addRange(pageCount - 1, pageCount, scope);
		}

		// Adds the first, previous text if desired   
		function addPrev(scope, pageCount) {

			// Calculate the previous page and if the click actions are allowed
			// blocking and disabling where page <= 0
			var disabled = scope.page - 1 <= 0;
			var prevPage = scope.page - 1 <= 0 ? 1 : scope.page - 1;

			var first = {
				value : '<<',
				title : 'First Page',
				class : disabled ? 'disabled' : '',
				action : function() {
					if (!disabled) {
						internalAction(scope, 1);
					}
				}
			};

			var prev = {
				value : '<',
				title : 'Previous Page',
				class : disabled ? 'disabled' : '',
				action : function() {
					if (!disabled) {
						internalAction(scope, prevPage);
					}
				}
			};

			scope.items.push(first);
			scope.items.push(prev);
		}

		// Adds the next, last text if desired
		function addNext(scope, pageCount) {

			// Calculate the next page number and if the click actions are allowed
			// blocking where page is >= pageCount
			var disabled = scope.page + 1 > pageCount;
			var nextPage = scope.page + 1 >= pageCount ? pageCount
					: scope.page + 1;

			var last = {
				value : '>>',
				title : 'Last Page',
				class : disabled ? 'disabled' : '',
				action : function() {
					if (!disabled) {
						internalAction(scope, pageCount);
					}
				}
			};

			var next = {
				value : '>',
				title : 'Next Page',
				class : disabled ? 'disabled' : '',
				action : function() {
					if (!disabled) {
						internalAction(scope, nextPage);
					}
				}
			};

			scope.items.push(next);
			scope.items.push(last);
		}

		function build(scope, attrs) {

			// Block divide by 0 and empty page size
			if (!scope.pageSize || scope.pageSize < 0) {
				return;
			}

			// Assign scope values
			setScopeValues(scope, attrs);

			// local variables
			var start, size = scope.adjacent * 2, pageCount = Math
					.ceil(scope.total / scope.pageSize);

			// Validate Scope
			validateScopeValues(scope, pageCount);

			// Calculate Counts and display
			addPrev(scope, pageCount);
			if (pageCount < (scope.pageCount + size)) {

				start = 1;
				addRange(start, pageCount, scope);

			} else {

				var finish;

				if (scope.page <= (1 + size)) {

					start = 1;
					finish = 2 + size + (scope.adjacent - 1);

					addRange(start, finish, scope);
					addLast(pageCount, scope);

				} else if (pageCount - size > scope.page
						&& scope.page > size) {

					start = scope.page - scope.adjacent;
					finish = scope.page + scope.adjacent;

					addFirst(scope);
					addRange(start, finish, scope);
					addLast(pageCount, scope);

				} else {

					start = pageCount
							- (1 + size + (scope.adjacent - 1));
					finish = pageCount;

					addFirst(scope);
					addRange(start, finish, scope);

				}
			}
			addNext(scope, pageCount);

		}
		// The actual angular directive return
		return {
			restrict : 'E',
			scope : {
				page : '=',
				total : '=',
				pageSize : '=',
				pagingAction : '='
			},
			template : '<ul class="pagination">'
					+ '<li ng-repeat="item in items" ng-class="item.class">'
					+ '<a ng-click="item.action()">{{item.value}}</a></li>'
					+ '</ul>',
			link : function(scope, element, attrs) {
				scope.$watch('page', function(value) {
					build(scope, attrs);
				});
				scope.$watch('total', function(value) {
					build(scope, attrs);
				});
			}
		};
	})

	.provider('$navTab', function () {
		this.$get = function () {
			return function () {
				return new mgNavTab();
			};
		}
	})

	.directive('bsNavTab', function() {
		return {
			restrict : 'A',
			scope : {
				controller : '='
			},
			template : '<ul class="nav nav-tabs"></ul><div class="tab-content"></div>',
			link : function(scope, element, attrs) {
				scope.controller.init(element);
			}
		};
	})
	
	.provider('$tree', function () {
		this.$get = function () {
			return function () {
				return new mgTree();
			};
		}
	})	
	
	.directive('bsTree', function() {
		return {
			restrict : 'A',
			scope : {
				controller : '='
			},
			link : function(scope, element, attrs) {
				scope.controller.init(element);
			}
		};
	})

	.run(function($templateCache) {
		$templateCache.put("/dialogs/confirm1.html", 
				'<div class="modal" role="dialog" aria-Labelledby="confirmModalLabel">'+
					'<div class="modal-dialog">'+
						'<div class="modal-content">'+
							'<div class="modal-header dialog-header-confirm">'+
								'<button type="button" class="close" ng-click="$hide()">&times;</button>'+
								'<h4 class="modal-title"><i class="fa fa-question-circle"></i> {{header}}</h4>'+
							'</div>'+
							'<div class="modal-body" ng-bind-html="message"></div>'+
							'<div class="modal-footer">'+
								'<button type="button" class="btn btn-success" ng-click="onYes()"><i class="fa fa-check"></i> Sim</button>'+
								'<button type="button" class="btn btn-danger" ng-click="onNo()"><i class="fa fa-times"></i> Não</button>'+
								'<button type="button" class="btn btn-default" ng-click="onCancel()">Cancelar</button>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>');
		$templateCache.put("/dialogs/confirm2.html", 
				'<div class="modal" role="dialog" aria-Labelledby="confirmModalLabel">'+
					'<div class="modal-dialog">'+
						'<div class="modal-content">'+
							'<div class="modal-header dialog-header-confirm">'+
								'<button type="button" class="close" ng-click="$hide()">&times;</button>'+
								'<h4 class="modal-title"><i class="fa fa-question-circle"></i> {{header}}</h4>'+
							'</div>'+
							'<div class="modal-body" ng-bind-html="message"></div>'+
							'<div class="modal-footer">'+
								'<button type="button" class="btn btn-success" ng-click="onYes()"><i class="fa fa-check"></i> Sim</button>'+
								'<button type="button" class="btn btn-danger" ng-click="onNo()"><i class="fa fa-times"></i> Não</button>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>');
		$templateCache.put("/dialogs/error.html", 
				'<div class="modal" role="dialog" aria-Labelledby="confirmModalLabel">'+
					'<div class="modal-dialog">'+
						'<div class="modal-content">'+
							'<div class="modal-header dialog-header-error">'+
								'<button type="button" class="close" ng-click="$hide()">&times;</button>'+
								'<h4 class="modal-title"><i class="fa fa-ban"></i> {{header}}</h4>'+
							'</div>'+
							'<div class="modal-body" style="overflow: auto; word-break: break-word;" ng-bind-html="message"></div>'+
							'<div class="modal-footer">'+
								'<button type="button" class="btn btn-default" ng-click="$hide()">Fechar</button>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>');
	})
	
	.provider('$confirm', function () {
		this.$get = function ($modal, $rootScope) {
			return function(header, message, onYes, onNo, cancel) {
	        	var scope = $rootScope.$new().merge({header: header, message: message});
	            var modal = $modal({scope: scope, template: '/dialogs/confirm'+ (cancel ? "1" : "2") +'.html', show: false, placement: "center"});
	            scope.onYes = function() {
	            	onYes();
	            	modal.hide();
	            };
	            scope.onNo = function() {
	            	onNo();
	            	modal.hide();
	            };
	            scope.onCancel = function() {
	            	modal.hide();
	            };
	            scope.$$postDigest(function () {
	            	modal.show();
	            });
			};
		}
	})
	
	.provider('$error', function () {
		this.$get = function ($modal, $rootScope) {
			return function(message) {
	        	var scope = $rootScope.$new().merge({header: "Ocorreu um erro", message: message});
	            $modal({scope: scope, template: '/dialogs/error.html', placement: "center"});
			};
		}
	})

	.run(function ($rootScope, $location, identityService) {
        $rootScope.$on('$routeChangeStart', function (event, next) {
        	var route = next.$$route;
        	if (route && route.access) {
    			if (route.access && route.access.requiresLogin) {
    	        	if (identityService.isLogged()) {
    	                if (route.access.permission && !identityService.hasPermission(route.access.permission)) {
    	                    identityService.openPageNotAuthorized();
    	                }
    	        	} else {
    	        		identityService.openPageLogin(route.originalPath);
    	        	}
    	        }
    		}
        });
    })
    
    .directive('permission', function (identityService, sessionService) {
        return {
          restrict: 'A',
          scope : {
        	  permission : '@'
          },
          link: function (scope, element, attrs) {
        	  scope.session = sessionService.getSession();
        	  scope.$watch('session.user', function() {
	        	  if (scope.permission) {
		        	  element.removeClass('hidden');
		              if (!identityService.hasPermission(scope.permission)) {
		            	  element.addClass('hidden');
		              }
	        	  }
        	  });
          }
        };
    })
    
    .provider('$signature', function () {
		this.$get = function () {
			return {
				toArray : function(obj) {
					var result = [];
					if (obj) {
						for (var key in obj) {
							var params = obj[key];
					
							var signature = {name: key, description: params.description, required: params.required, type: params.type};
							
							var type = params.type;
							if (type == 'string') {
								signature.size = params.size;
								signature.valid = params.valid ? params.valid.toString() : params.valid;
							} else if (type == 'integer') {
								signature.valid = params.valid ? params.valid.toString() : params.valid;
							} else if (type == 'double') { 
								signature.valid = params.valid ? params.valid.toString() : params.valid;
							} else if (type == 'date') {
								signature.format = params.format;
							} else if (type == 'collection') {
								signature.min = params.min;
								signature.max = params.max;
								signature.signature = this.toArray(params.signature);
							} else if (type == 'object') {
								signature.signature = this.toArray(params.signature);
							}
							
							result.push(signature);
						}
					}
					return result;
				},
				toObject : function(array) {
					var result = {};
					if (array) {
						for (var i = 0; i < array.length; i++) {
							var params = array[i];
							
							var name = params.name;
							var type = params.type;
					
							var signature = {description : params.description, required: params.required, type: params.type};
							
							if (type == 'string') {
								if (params.size) signature.size = params.size;
								if (params.valid) signature.valid = params.valid ? params.valid.split(",") : null;
							} else if (type == 'integer') {
								if (params.valid) signature.valid = params.valid ? params.valid.split(",") : null;
							} else if (type == 'double') { 
								if (params.valid) signature.valid = params.valid ? params.valid.split(",") : null;
							} else if (type == 'date') {
								signature.format = params.format;
							} else if (type == 'collection') {
								if (params.min) signature.min = params.min;
								if (params.max) signature.max = params.max;
								signature.signature = this.toObject(params.signature);
							} else if (type == 'object') {
								signature.signature = this.toObject(params.signature);
							}
					
							result[name] = signature;
						}
					}
					return result;
				},
				isValid : function(array) {
					for (var i = 0; i < array.length; i++) {
						var params = array[i];
						
						if (!params.name || !params.description || !params.type) {
							return false;
						}  
						
						var type = params.type;
						
						if (type == 'date') {
							if (params.format) {
								return false;
							}
						} else if (type == 'collection' || type == 'object') {
							if (!params.signature || params.signature.length == 0) {
								return false;
							}
						}
					}
					return true;
				}
			};
		}
	})
	
	.directive('bsSignature', function ($compile, $rootScope) {
		
		function createParameter(scope, parameter) {
			
			var newScope = $rootScope.$new();
			newScope.tbody = scope.tbody;
			newScope.model = scope.model;
			newScope.disabled = scope.disabled;
			newScope.parameter = parameter;
			newScope.response = scope.response;
			newScope.types = [
				{label : "Texto", value : "string"}, 
				{label : "Inteiro", value : "integer"}, 
				{label : "Decimal", value : "double"}, 
				{label : "Booleano", value : "boolean"}, 
				{label : "Data", value : "date"}, 
				{label : "Objeto", value : "object"}, 
				{label : "Coleção", value : "collection"}];
			newScope.onRemove = function(parameter) {
				newScope.model.remove(parameter);
				var tr0 = newScope.row[0];
				var tr1 = newScope.row[1];
				var tbody = newScope.tbody[0];
				tbody.removeChild(tr0);
				tbody.removeChild(tr1);
			};
			
			var html = 
				'<tr>'+
				'	<td style="width: 50px" ng-hide="disabled">'+
			    '		<button type="button" class="btn btn-link" style="height: 100%;" ng-click="onRemove(parameter)">'+
			    '			<i class="fa fa-times size-16 text-muted"></i>'+
			    '		</button>'+
				'	</td>'+
				'   <td>'+
			    '   	<input class="form-control" type="text" ng-model="parameter.name" ng-disabled="disabled"'+ 
			    '			title="Digite um nome para o parâmetro" required/>'+
				'	</td>'+
				'	<td>'+
			    '		<input class="form-control" type="text" ng-model="parameter.description" ng-disabled="disabled"'+ 
			    '			title="Digite uma descrição para o parâmetro" required/>'+
				'	</td>'+
				'	<td>'+
			    '		<button type="button" class="form-control select" ng-model="parameter.type" data-html="1"'+ 
				'			ng-options="type.value as type.label for type in types" title="Selecione um tipo de parâmetro"'+ 
				'			placeholder="Selecione..." ng-blur="onBlurType(parameter)"  bs-select ng-disabled="disabled" required>'+
				'	</td>'+
				'	<td ng-show="!response">'+
			    '		<input type="checkbox" ng-model="parameter.required" ng-disabled="disabled"'+ 
			    '			title="Informe a obrigatoriedade do parâmetro"/>'+
				'	</td>'+
				'	<td ng-show="!response && parameter.type && parameter.type == \'string\'">'+
				'		<input class="form-control" type="text" ng-model="parameter.size" ui-number-mask="0" placeholder="Tamanho" ng-disabled="disabled"'+
				'			title="Digite o tamanho do parâmetro"/>'+
				'	</td>'+
				'	<td ng-show="!response && parameter.type && (parameter.type == \'string\' || parameter.type == \'integer\' || parameter.type == \'double\')">'+
				'		<input class="form-control" type="text" ng-model="parameter.valid" placeholder="Valores Válidos" ng-disabled="disabled"'+
				'			title="Digite os valores válidos para o parâmetro"/>'+
				'	</td>'+
				'	<td ng-show="!response && parameter.type && (parameter.type == \'date\')">'+
				'		<input class="form-control" type="text" ng-model="parameter.format" placeholder="Formato" ng-disabled="disabled"'+
				'			title="Digite o formato da data" required/>'+
				'	</td>'+
				'	<td ng-show="!response && parameter.type && parameter.type == \'collection\'">'+
				'		<input class="form-control" type="text" ng-model="parameter.min" ui-number-mask="0" placeholder="Mínimo" ng-disabled="disabled"'+
				'			title="Digite a quantidade mínima do parâmetro"/>'+
				'	</td>'+
				'	<td ng-show="!response && parameter.type && parameter.type == \'collection\'">'+
				'		<input class="form-control" type="text" ng-model="parameter.max" ui-number-mask="0" placeholder="Máximo" ng-disabled="disabled"'+
				'			title="Digite a quantidade máxima do parâmetro"/>'+
				'	</td>'+
				'</tr>'+
				'<tr>'+
				'</tr>';
			
			newScope.row = $compile(html)(newScope);
			newScope.tbody.append(newScope.row);
			
			newScope.$watch('parameter.type', function() {
				var type = newScope.parameter.type;
				var parameter = newScope.parameter;
				
				if (type == 'string') {
					if (!parameter.size) parameter.size = null;
					if (!parameter.valid) parameter.valid = null;
				} else if (type == 'integer') {
					if (!parameter.valid) parameter.valid = null;
				} else if (type == 'double') { 
					if (!parameter.valid) parameter.valid = null;
				} else if (type == 'boolean') {
					// Não possui parâmetros adicionais
				} else if (type == 'date') {
					if (!parameter.format) parameter.format = null;
				} else if (type == 'collection') {
					if (!parameter.min) parameter.min = null;
					if (!parameter.max) parameter.max = null;
					if (!parameter.signature) parameter.signature = [];
				} else if (type == 'object') {
					if (!parameter.signature) parameter.signature = [];
				}				

				var tr = angular.element(newScope.row[1]);
				if (type == 'collection' || type == 'object') {
					var innerNewScope = $rootScope.$new();
					innerNewScope.model = parameter.signature;
					innerNewScope.response = newScope.response;
					innerNewScope.disabled = newScope.disabled;

					tr.append($compile('<td colspan="7" style="padding-left: 50px;"><div model="model" response="response" disabled="disabled" bs-signature></div></td>')(innerNewScope));
				} else {
					tr.contents().remove();
				}
			});
		}
		
		return {
			restrict: 'A',
			scope : {
	        	model : '=',
	        	response : '=',
	        	disabled : '='
			},
			link: function (scope, element, attrs) {
				
				var html = 
					'<table class="table">'+
					'	<thead>'+
					'		<tr>'+
					'			<th  ng-hide="disabled">'+
					'				<button type="button" class="btn btn-link" ng-click="onAdd()">'+
					'					<i class="fa fa-plus size-16"></i>'+
					'				</button>'+
					'			</th>'+
					'			<th>Nome</th>'+
					'			<th>Descrição</th>'+
					'			<th>Tipo</th>'+
					'			<th ng-show="!response">Obrigatório</th>'+
					'			<th ng-show="!response" colspan="2">Adicionais</th>'+
					'		</tr>'+
					'	</thead>'+
					'	<tbody>'+
				    '	</tbody>'+
				    '</table>';					
				
				scope.onAdd = function() {
					var parameter = {name:'',description:'',type:'',required:false};
					scope.model.push(parameter);
					createParameter(scope, parameter);
				}
				
				var table = $compile(html)(scope);
				element.append(table);
				
				scope.tbody = angular.element(table.children()[1]);
				
				for (var i = 0; i < scope.model.length; i++) {
					createParameter(scope, scope.model[i]);
				}
			}
		};
    })
    
    .directive('bsSelectFlow', function($compile, $selectExternalFlow, policyService) {
    	return {
    		restrict: 'A',
    		require: "ngModel",
    		link:  function (scope, element, attrs, ngModel) {
    			scope.selectExternalFlow = $selectExternalFlow();
    			scope.flow = {identificador : null, descricao: null};
    			scope.onChange = function(init) {
    				if (scope.flow.identificador) {
    					policyService.get(scope.flow.identificador, function(response) {
							var flow = response.data;
    						scope.flow.descricao = flowTypes[flow.type].description + " - " + flow.group_name + " - " + flow.description;
    						ngModel.$setViewValue(scope.flow.identificador);
    					});
					}
    			}
    			scope.onSelect = function() {
    				scope.selectExternalFlow.open(scope.flow, scope.groups, false, false, function(flow) {
    					scope.onChange();		
    				});
    			};
    			scope.onClean = function() {
    				scope.flow.identificador = null;
    				scope.flow.tipo = null;
    				scope.flow.grupo = null;
    				scope.flow.versao = null;
    				scope.flow.descricao = null;
    				ngModel.$setViewValue(null);
    			};
				
				scope.groups = [];
				policyService.findGroups({}, function(response) {
					scope.groups = getSelectArray(response.data, "id", "name");
				});

				var html = 
					'<input type="text" class="form-control" ng-readonly="true" ng-model="flow.descricao" />'+
					'<div class="input-group-btn">'+
					'	<button type="button" class="btn btn-default" ng-click="onSelect()" title="Seleção de Fluxo"><i class="fa fa-ellipsis-h"></i></button>'+
					'	<button type="button" class="btn btn-default" ng-click="onClean()" title="Limpar fluxo selecionao"><i class="fa fa-times"></i></button>'+
					'</div>';
					
				
				var table = $compile(html)(scope);
				element.append(table);
				
    			ngModel.$render = function() {
    				scope.flow.identificador = ngModel.$viewValue;
    				scope.onChange(true);
    			}
    		}
    	}
    })
    
    .provider('$selectExternalFlow', function() {
    	this.$get = function($rootScope, $modal, policyService, identityService) {
    		return function () {
	    		return {
	    			open : function(flowExternal, listGroups, showVersion, showEntrada, onSave) {
	    				
	    				var scope = $rootScope.$new();
	    				
	    				scope.showVersion = showVersion;
	    				scope.showEntrada = showEntrada;
	    				scope.flowExternal = flowExternal;
	    				scope.listGroups = listGroups;
	    				scope.listTypes = getSelectObject(flowTypes, "description", true);
	    				
	    				scope.onSave = function() {
	    					if (scope.flowExternal.identificador && (!scope.showEntrada || scope.flowExternal.entrada)) {
	    						onSave(scope.flowExternal);
	    						if (scope.flowExternalModal) scope.flowExternalModal.hide();
	    					}
	    				};
	    				
	    				scope.onCleanGroup = function() {
							scope.flowExternal.grupo = "";
							scope.listFlowsExternal = [];
							
							scope.onCleanFlow();
	    				}
	    				
	        			scope.onBlurTypeFlow = function(clean, callback) {
	        				if (scope.flowExternal.tipo) {
	        					if (clean) {
	        						scope.onCleanGroup();
	        					}
	        				}
	        				if (callback) callback();
	        			}
	        			
	        			scope.onCleanFlow = function() {
	        				scope.flowExternal.identificador = "";
							scope.listFlowsVersion = [];
							
							scope.onVersion();						
	        			}
	        			
	        			scope.onBlurGroupFow = function(clean, callback) {
	        				if (scope.flowExternal.grupo) {
	        					var filter = {filter:[{name:"id_group", operator: "=", value: scope.flowExternal.grupo},{name:"type", operator:"=", value: scope.flowExternal.tipo}]}; 
	        					policyService.find(filter, function(response) {
	    							scope.listFlowsExternal = getSelectArray(response.data, "id", "description");
	    							if (clean) {
	    								scope.onCleanFlow();
	    							}
	    							if (callback) callback();
	        					});
	        				} else {
	        					if (callback) callback();
	        				}
	        			}
	        			
	        			scope.onVersion = function() {
	        				scope.flowExternal.versao = "";
	        			}
	        			
	        			scope.onBlurFlowExternal = function(clean, callback) {
	        				if (scope.flowExternal.identificador) {
	        					policyService.get(scope.flowExternal.identificador, 
	        						function(response) {
	    								var politica =  response.data;
	    								scope.listFlowsVersion = getSelectArray(politica.versions, "id", "name");
	    								if (clean) {
	    									scope.onVersion();
	    								}
	    								if (callback) callback(politica);
	        						}
	        					);
	        				} else {
	        					scope.onCleanFlow();
	        					if (callback) callback({});
	        				}
	        			}
	
	    				scope.openFlowExternal = function() {
	    					scope.flowExternalModal = $modal({scope: scope, template: '/pages/editores/selecao-fluxo-externo.html'});
	    				}
	        			
	        			scope.onBlurFlowExternal(false, function(politica) {
	        				scope.flowExternal.tipo = politica.type ? politica.type : "";
	        				scope.flowExternal.grupo = politica.id_group ? politica.id_group : "";
	        				scope.onBlurGroupFow(false, function() {
	        					scope.onBlurTypeFlow(false, function() {
	        						scope.openFlowExternal();
	        					});
	        				});
	        			});
	    			}
	    		}
    		}
    	}    	
    })

;
