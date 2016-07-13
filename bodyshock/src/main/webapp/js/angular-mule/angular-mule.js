var MuleToolDirective = {
	template : 
		'<div class="panel-group" bs-collapse>' +
		'	<div class="panel panel-default" ng-repeat="group in tools">' +
		'		<div class="panel-heading">' +
		'			<h4 class="panel-title">' +
		'				<a bs-collapse-toggle>{{group.name}}</a>' +
		'			</h4>' +
		'		</div>' +
		'		<div class="panel-collapse" bs-collapse-target>' +
		'			<div class="panel-body">' +
		'				<div class="tool-component" draggable="true" mule="mule" ng-repeat="tool in group.children" element="tool.element" mule-node>' +
		'					<img src="img/small/{{tool.element.style ? tool.element.style : tool.element.type}}.png"/>' +
		'					<label>{{tool.name}}</label>' +
		'				</div>' +
		'			</div>' +
		'		</div>' +
		'	</div>' +
		'</div>'
};

MuleToolDirective.controller = function($scope) {
	this.scope = $scope;
};

var MuleTool = MuleToolDirective.controller;
MuleTool.prototype.init = function(parent, $compile, $rootScope) {
	this.scope = $rootScope.$new().merge(this.scope);
	this.content = $compile(MuleToolDirective.template)(this.scope);
	parent.append(this.content);
};

angular.module('ngMule', [])
	.provider('$muleGraph', function () {
		this.$get = function () {
			return function (parent, onSelect, onDelete, onChange) {
				return new MuleGraph(parent, onSelect, onDelete, onChange);
			};
		}
	})
	.provider('$muleTools', function () {
		this.$get = function ($compile, $rootScope) {
			return function (parent, scope) {
				return new MuleTool(scope).init(parent, $compile, $rootScope);
			};
		}
	})
	.directive('muleNode', function() {
		return {
			restrict : 'A',
			scope : {
				element : "=",
				mule: "="
			},
			link : function(scope, element, attrs) {
				element.bind('drag', function(e) {
					
					var element = {};
					
					angular.copy(scope.element, element);
					
					scope.mule.dragged = scope.mule.createNode(null, element);
					
					var dragIcon = document.createElement('img');
					dragIcon.src = 'img/large/'+scope.element.type+'.png';
					dragIcon.width = 48;
					dragIcon.height = 32;
					e.dataTransfer.setDragImage(dragIcon, -10, -10);
					
					e.preventDefault();
					e.stopPropagation();
				});
			}
		};
	})
	.directive('muleTools', function() {
		return {
			restrict : 'A',
			scope : {
				tools : "=",
				mule : "="
			},
			template : MuleToolDirective.template
		};
	});