angular.extend(angular, {
	
	html : function(html) {
		var div = document.createElement('div');
		div.innerHTML = html;

		return angular.element(div.children[0]);
	},
	
	elementQuery : function(query) {
		return angular.element(document.querySelector(query));
	}
	
});

angular.module('ngExtends', []).run(function($rootScope) {

	$rootScope.$safeApply = function(fn) {
		$scope = this;
		if (!$scope.$$phase) {
			$scope.$apply ? $scope.$apply(fn) : $scope.apply(fn);
		} else {
			fn();
		}
	};
	
	var scope = $rootScope.$new();
	
	if (!scope.__proto__.merge) {
		scope.__proto__.merge = function(obj) {
			for (var key in obj) {
				this[key] = obj[key];
			}
			return this;
		}
	}
	
	var elem = angular.element(document.querySelector("body"));

	if (!elem.__proto__.appendHtml) {
		elem.__proto__.appendHtml = function(html) {
			this[0].appendChild(angular.html(html)[0]);

			var children = this.children();
			return angular.element(children[children.length - 1]);
		};
	}

	if (!elem.__proto__.appendChild) {
		elem.__proto__.appendChild = function(elem) {
			this[0].appendChild(elem[0]);
		};
	}

	if (!elem.__proto__.removeChild) {
		elem.__proto__.removeChild = function(elem) {
			this[0].removeChild(elem[0]);
		};
	}
	
	if (!elem.__proto__.insertBefore) {
		elem.__proto__.insertBefore = function(elem1, elem2) {
			this[0].insertBefore(elem1[0], elem2[0]);
		};
	}

	if (!elem.__proto__.insertAfter) {
		elem.__proto__.insertAfter = function(elem1, elem2) {
			this[0].insertBefore(elem1[0], elem2[0].nextSibling);
		};
	}

	if (!elem.__proto__.focus) {
		elem.__proto__.focus = function() {
			this[0].focus();
		};
	}
	
	if (!elem.__proto__.print) {
		elem.__proto__.print = function() {
		    var print = window.open("", "_blank");

		    var doc = print.document;
		    var win = print;

		    doc.open();

		    doc.writeln("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
		    doc.writeln("<html><head></head>");
		    doc.writeln("<body>");

		    doc.writeln("<div>");
	        doc.writeln(this.html());
		    doc.writeln("</div>");

		    doc.writeln("</body>");
		    doc.writeln("</html>");

		    doc.close();

		    setTimeout(function(){
		    	win.focus();
		        win.print();
		        win.close();
		    }, 1000);
		}
	}
	
});