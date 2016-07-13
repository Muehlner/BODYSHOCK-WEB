// choice

var MuleChoice = function() {
	MuleContainer.call(this);
};

MuleChoice.prototype.constructor = MuleChoice;
MuleChoice.prototype = Object.create(MuleContainer.prototype);
MuleChoice.prototype.init = function(mule, parent, element) {
	MuleContainer.prototype.init.call(this, mule, parent, element);
	
	this.expanded = true;
	
	this.setDeletable();
};
MuleChoice.prototype.render = function() {
	
	this.base = angular.html('<div style="display: table-cell; vertical-align: top;" draggable="true"></div>');

	this.setDraggable();
	this.setSelectable();
	this.setDeletable();
	
	var div = this.base.appendHtml('<div style="float: left; border: 1px solid transparent; border-radius: 4px; "></div>');

	div = div.appendHtml('<div></div>')
		.appendHtml('<div style="display: table;"></div>');
	
	var col1 = div.appendHtml('<div style="background: #FFFFCC; cursor: pointer; display: table-cell; vertical-align: middle; border: 1px solid gray; border-radius: 4px;"></div>');
	
	this.btnCollapse = col1.appendHtml('<a style="float:left; margin: 6px;" class="fa"></a>');
	
	var node = this;
	this.btnCollapse.bind("click", function() {
		node.expanded = !node.expanded;
		node.onCollapse();
	});
	
	var choice = col1.appendHtml('<div style="margin: 10px; max-width: 100px; min-width: 100px;"></div>')
		.appendHtml('<div style="margin: 10px; display: table-cell; width: 100px;"></div>');

	this.add = col1.appendHtml('<div style="float: left; width: 100%; height: 20px; text-align: center; font-size: 18px;"></div>');
	
	this.btnAdd = this.add.appendHtml('<a class="fa fa-plus"></a>');
	
	var node = this;
	this.btnAdd.bind("click", function(e) {
		var when = node.mule.createNode(node, {"type": "when", "attrs": {"expression": ""}, "children": []});
		var children = node.container.children(); 
		var last = angular.element(children[children.length - 1]);
		node.children.insert(0, when);
		node.container.insertBefore(when.base, last);
		node.mule.onChange();
	});
	
	this.createImageLabel(choice, this);
	
	this.container = div.appendHtml('<div style="display: table-cell; border-right: 4px solid gray; border-top: 1px dashed gray; border-bottom: 1px dashed gray; padding: 10px 10px 10px 0px;"></div>');

	node.onCollapse();
	
	for (var i = 0; i < this.children.length; i++) {
		var caseNode = this.children[i];
		caseNode.render()
		this.container.append(caseNode.base);
	}
};
MuleChoice.prototype.onCollapse = function() {
	this.btnCollapse.removeClass(this.expanded ? 'fa-plus-square-o' : 'fa-minus-square-o');
	this.btnCollapse.addClass(this.expanded ? 'fa-minus-square-o' : 'fa-plus-square-o');
	this.container.css("display", (this.expanded ? 'table-cell' : 'none'));
	this.add.css("display", (this.expanded ? 'block' : 'none'));
};

muleConfig["choice"] = "MuleChoice";

// Case

var MuleCase = function() {
	MuleContainer.call(this);
};

MuleCase.prototype.constructor = MuleCase;
MuleCase.prototype = Object.create(MuleContainer.prototype);
MuleCase.prototype.init = function(mule, parent, element) {
	MuleNode.prototype.init.call(this, mule, parent, element);
	
	delete this.properties["description"];
};
MuleCase.prototype.render = function() {
	
	this.base = angular.html('<div style="display: table-row;"></div>');

	this.setSelectable();
	
	var div = this.base.appendHtml('<div style="display: table; border-right: 1px solid transparent; border-top: 1px solid transparent; border-bottom: 1px solid transparent; border-radius: 0px 4px 4px 0px; padding-top: 5px; padding-bottom: 5px;"></div>');

	var channel = div.appendHtml('<div style="display: table-cell; vertical-align: top; padding-top: 10px;"></div>');

	var type = this.type;
	this.createImageLabel(channel, {type:"channel", refresh:
		function(){
			this.label.text(type == "otherwise" ? "default" : "case");
		}
	}, "#0000FF");
	
	this.container = div.appendHtml('<div style="width: auto; margin-bottom: 10px; display: table-cell; vertical-align: middle;"></div>');

	MuleContainer.prototype.render.call(this);
};

// when

var MuleWhen = function() {
	MuleCase.call(this);
};

MuleWhen.prototype.constructor = MuleWhen;
MuleWhen.prototype = Object.create(MuleCase.prototype);
MuleWhen.prototype.init = function(mule, parent, element) {
	MuleCase.prototype.init.call(this, mule, parent, element);
	
	this.addProperty(element, "language", "Language", "language");
	this.addProperty(element, "expression", "Expression", "expression");
	
	this.setDeletable();
}

muleConfig["when"] = "MuleWhen";

// otherwise

var MuleOtherwise = function() {
	MuleCase.call(this);
};

MuleOtherwise.prototype.constructor = MuleWhen;
MuleOtherwise.prototype = Object.create(MuleCase.prototype);

muleConfig["otherwise"] = "MuleOtherwise";