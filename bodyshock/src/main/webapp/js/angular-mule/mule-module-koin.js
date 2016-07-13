// set-variable

var MulemgFlowSetVariable = function() {
	MuleNode.call(this);
};

MulemgFlowSetVariable.prototype.constructor = MulemgFlowSetVariable;
MulemgFlowSetVariable.prototype = Object.create(MuleNode.prototype);
MulemgFlowSetVariable.prototype.init = function(mule, parent, element) {
	MuleNode.prototype.init.call(this, mule, parent, element);
	
	this.addProperty(element, "language", "Language", "language");
	this.addProperty(element, "name", "Variable Name", "expression");
	this.addProperty(element, "value", "Value", "expression");
	
	this.setDeletable();
};

muleConfig["set-variable"] = "MulemgFlowSetVariable";

// blank

var MulemgBlank = function() {
	MuleNode.call(this);
};
	
MulemgBlank.prototype.constructor = MulemgBlank;
MulemgBlank.prototype = Object.create(MuleNode.prototype);

muleConfig["blank"] = "MulemgBlank";

// product-bureau

var MulemgProductBureau = function() {
	MuleNode.call(this);
};

MulemgProductBureau.prototype.constructor = MulemgProductBureau;
MulemgProductBureau.prototype = Object.create(MuleNode.prototype);
MulemgProductBureau.prototype.init = function(mule, parent, element) {
	MuleNode.prototype.init.call(this, mule, parent, element);
	
	this.addProperty(element, "value", "Value", "product");
	
	this.setDeletable();
};

muleConfig["product-bureau"] = "MulemgProductBureau";

//flow-external-ref

var MulemgFlowExternalRef = function() {
	MuleNode.call(this);
};

MulemgFlowExternalRef.prototype.constructor = MulemgFlowExternalRef;
MulemgFlowExternalRef.prototype = Object.create(MuleNode.prototype);
MulemgFlowExternalRef.prototype.init = function(mule, parent, element) {
	MuleNode.prototype.init.call(this, mule, parent, element);
	
	this.addProperty(element, "value", "Value", "flow-external-ref");
	
	this.setDeletable();
};

muleConfig["flow-external-ref"] = "MulemgFlowExternalRef";

//subflow-ref

var MulemgSubFlowRef = function() {
	MuleNode.call(this);
};

MulemgSubFlowRef.prototype.constructor = MulemgSubFlowRef;
MulemgSubFlowRef.prototype = Object.create(MuleNode.prototype);
MulemgSubFlowRef.prototype.init = function(mule, parent, element) {
	MuleNode.prototype.init.call(this, mule, parent, element);
	
	this.addProperty(element, "value", "Value", "subflow-ref");
	
	this.setDeletable();
};

muleConfig["subflow-ref"] = "MulemgSubFlowRef";

//external-task

var MuleExternalTask = function() {
	MuleChoice.call(this);
};

MuleExternalTask.prototype.constructor = MuleExternalTask;
MuleExternalTask.prototype = Object.create(MuleChoice.prototype);
MuleExternalTask.prototype.init = function(mule, parent, element) {
	MuleChoice.prototype.init.call(this, mule, parent, element);
	
	this.addProperty(element, "name", "Queue", "queue");
};

muleConfig["external-task"] = "MuleExternalTask";

//db-select

var MulemgDBSelect = function() {
	MuleNode.call(this);
};

MulemgDBSelect.prototype.constructor = MulemgDBSelect;
MulemgDBSelect.prototype = Object.create(MuleNode.prototype);
MulemgDBSelect.prototype.init = function(mule, parent, element) {
	MuleNode.prototype.init.call(this, mule, parent, element);
	
	this.addProperty(element, "body", "Query", "textarea");
	this.addProperty(element, "dataSource", "DataSource", "expression");
	
	this.setDeletable();
};

muleConfig["db-select"] = "MulemgDBSelect";

//foreach

var MulemgForeach = function() {
	MuleContainer.call(this);
};

MulemgForeach.prototype.constructor = MulemgForeach;
MulemgForeach.prototype = Object.create(MuleContainer.prototype);
MulemgForeach.prototype.init = function(mule, parent, element) {
	MuleContainer.prototype.init.call(this, mule, parent, element);
	
	this.addProperty(element, "collection", "Collection", "expression");
}
MulemgForeach.prototype.render = function() {
	this.base = angular.html('<div style="display: table-cell; vertical-align: top;" draggable="true"></div>');

	this.setDraggable();
	this.setSelectable();
	this.setDeletable();

	var div = this.base.appendHtml('<div style="float: left; border-radius: 4px; border: 1px solid transparent;"></div>');

	var flow = div.appendHtml('<div style="border: gray dotted 1px; cursor: default; float: left;"></div>');

	var header = flow.appendHtml('<div style="display: table; width: 100%; background-color: '+(this.deletable ? '#ADDFFF;':'#DDD;')+'"></div>');

	header.appendHtml('<img src="img/small/foreach.png" style="display: table-cell; margin: 3px; width: 16px;"/>');

	this.label = header.appendHtml('<label style="display: table-cell; vertical-align: middle; width: 100%;">'+this.properties["description"].value+'</label>');

	this.container = flow.appendHtml('<div style="padding: 10px 0px 10px 0px;"></div>');

	MuleContainer.prototype.render.call(this);
};
MulemgForeach.prototype.onCollapse = function() {
	this.btnCollapse.removeClass(this.expanded ? 'fa-plus-square-o' : 'fa-minus-square-o');
	this.btnCollapse.addClass(this.expanded ? 'fa-minus-square-o' : 'fa-plus-square-o');
	this.container.css("display", (this.expanded ? 'block' : 'none'));
};

muleConfig["foreach"] = "MulemgForeach";