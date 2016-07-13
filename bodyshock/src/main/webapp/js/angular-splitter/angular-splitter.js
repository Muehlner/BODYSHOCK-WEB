var SplitterDirective = {
	template : '<div class="split-panes {{orientation}}" ng-transclude></div>'
}

SplitterDirective.controller = function ($scope) {
	this.scope = $scope;
	
	this.scope.panes = [];

	this.addPane = function(pane){
		if (this.scope.panes.length > 1) 
			throw 'splitters can only have two panes';
		this.scope.panes.push(pane);
		return this.scope.panes.length;
	};
};

SplitterDirective.link = function(scope, element, attrs) {
	var handler = angular.element('<div class="split-handler"></div>');
    var pane1 = scope.panes[0];
    var pane2 = scope.panes[1];
    var vertical = scope.orientation == 'vertical';
    var pane1Min = pane1.minSize || 0;
    var pane2Min = pane2.minSize || 0;
    var drag = false;
    
    if (scope.orientation == 'horizontal') {
    	pane1.elem.css('width', pane1.size + 'px');
        pane2.elem.css('width', 'calc(100% - ' + (pane1.size + 4) + 'px)');
    } else {
    	pane1.elem.css('height', pane1.size + 'px');
        pane2.elem.css('height', 'calc(100% - ' + (pane1.size + 4) + 'px)');
    }
    
    pane1.elem.after(handler);
    
    element.bind('mousemove', function (ev) {
      if (!drag) return;
      
      var bounds = element[0].getBoundingClientRect();
      var pos = 0;
      
      if (vertical) {

        var height = bounds.bottom - bounds.top;
        pos = ev.clientY - bounds.top;

        if (pos < pane1Min) return;
        if (height - pos < pane2Min) return;

        pane1.elem.css('height', pos + 'px');
        pane2.elem.css('height', 'calc(100% - ' + (pos + 4) + 'px)');
  
      } else {

        var width = bounds.right - bounds.left;
        pos = ev.clientX - bounds.left;

        if (pos < pane1Min) return;
        if (width - pos < pane2Min) return;

        pane1.elem.css('width', pos + 'px');
        pane2.elem.css('width', 'calc(100% - ' + (pos + 4) + 'px)');
      }
    });

    handler.bind('mousedown', function (ev) { 
      ev.preventDefault();
      drag = true; 
    });

    angular.element(document).bind('mouseup', function (ev) {
      drag = false;
    });    	
};

var Splitter = SplitterDirective.controller;
Splitter.prototype.constructor = Splitter;
Splitter.prototype.init = function(parent, $compile, $rootScope) {
	this.$compile = $compile;
	this.$rootScope = $rootScope;
	this.scope = $rootScope.$new().merge(this.scope);
	this.content = $compile(SplitterDirective.template.replace("ng-transclude", ""))(this.scope);
    parent.append(this.content);
    return this;
}
Splitter.prototype.add = function(scope) {
	return new Pane(scope).init(this, this.$compile, this.$rootScope);
}
Splitter.prototype.render = function() {
	SplitterDirective.link(this.scope, this.content, null);
}


var PaneDirective = {
	template: '<div class="split-pane{{index}}" ng-transclude></div>'
};

PaneDirective.controller = function ($scope) {
	this.scope = $scope;
	this.scope.index = 0;
};

PaneDirective.link = function(scope, element, attrs, bgSplitterCtrl) {
	scope.elem = element;
	scope.index = bgSplitterCtrl.addPane(scope);
};

var Pane = PaneDirective.controller;
Pane.prototype.init = function(splitter, $compile, $rootScope) {
	this.scope = $rootScope.$new().merge(this.scope);
	this.content = $compile(PaneDirective.template.replace("ng-transclude>", '><div class="content"></div>'))(this.scope).children();
	splitter.content.append(this.content);
    PaneDirective.link(this.scope, this.content, null, splitter);
    return this;
}

angular.module('ngSplitter', [])
	.provider('$splitter', function () {
		this.$get = function ($compile, $rootScope) {
			return function (parent, scope) {
				return new Splitter(scope).init(parent, $compile, $rootScope);
			};
		}
	})
	.directive('bgSplitter', function() {
		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			scope: {
				orientation: '@'
			},      
			template: SplitterDirective.template,
			controller: SplitterDirective.controller,
			link: SplitterDirective.link
		};
	})
	.directive('bgPane', function () {
	    return {
			restrict: 'E',
			require: '^bgSplitter',
			replace: true,
			transclude: true,
			scope: {
				minSize: '=',
				size: '='
			},
			template: PaneDirective.template,
			link: PaneDirective.link
	    };
	});