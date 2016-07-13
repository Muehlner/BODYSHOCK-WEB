var charmap = {'á':'a', 'à':'a', 'ã':'a', 'â':'a', 'é':'e', 'ê':'e', 'í':'i', 'ó':'o', 'ô':'o', 'õ':'o', 'ú':'u', 'ü':'u', 'ç':'c', ' ':'_'};

var MuleUtil = {
	sanitize: function(text) {
		var result = "";
		text = text.toLowerCase();
		for (var i = 0; i < text.length; i++) {
			var ch = text.charAt(i);
			if (charmap[ch]) {
				result += charmap[ch];
			} else {
				result += ch;
			}
		}
		return result;
	}
}

var muleConfig = {};

// Base Node

var MuleNode = function() {
	
	this.id = null;	
	
	this.mule = null;
	
	this.type = null;

	this.leftNode = null;
	this.rightNode = null;

	this.parent = null;
	
	this.properties = {};

	this.base = null;
	
	this.deletable = false;

	this.children = [];
};

MuleNode.prototype.constructor = MuleNode;
MuleNode.prototype.init = function(mule, parent, element) {
	this.mule = mule;
	this.parent = parent;
	this.type = element.type;

	this.id = element.id;
	
	this.addProperty(element, "description", "Description", "text");
	this.addProperty(element, "note", "Note", "textarea");

	if (element.deletable) {
		this.setDeletable();
	}
	
	var children = element.children;
	if (children) {
		for (var i = 0; i < children.length; i++) {
			var innerElement = children[i];
			if (innerElement.type != "blank") {
				this.children[this.children.length] = this.mule.createNode(this, innerElement);
			}
		}
	}

};
MuleNode.prototype.render = function() {
	this.base = angular.html('<div style="margin: 10px; display: table-cell; vertical-align: top;"></div>');

	this.setDraggable();
	this.setSelectable();
	
	var div = this.base.appendHtml('<div style="float: left; padding: 10px; border-radius: 4px; border: 1px solid transparent;"></div>');
	
	this.createImageLabel(div, this);
};
MuleNode.prototype.refresh = function() {
	if (this.label && this.properties["description"]) {
		this.label.text(this.properties["description"].value);
	}
};

MuleNode.prototype.setSelectable = function() {
	var node = this;
	this.base.bind("click", function(e) {
		node.onClick();
		node.mule.onSelect(node);
		e.preventDefault();
		e.stopPropagation();
	});
}
MuleNode.prototype.setDraggable = function() {
	var node = this;
	node.base.attr("draggable", "true");
	this.base.bind("drag", function(e) {
		node.onDrag();
		
		var dragIcon = document.createElement('img');
		dragIcon.src = 'img/large/'+node.type+'.png';
		dragIcon.width = 48;
		dragIcon.height = 32;
		e.dataTransfer.setDragImage(dragIcon, -10, -10);
		
		e.preventDefault();
		e.stopPropagation();
	});
};
MuleNode.prototype.setDeletable = function() {
	this.deletable = true;
}

MuleNode.prototype.onDrag = function() {
	this.mule.dragged = this;
};
MuleNode.prototype.onClick = function(node) {
	if (this.mule.selected) {
		var element = this.mule.selected.base.children();
		element.css("border-color", "transparent");
		element.css("background-color", "transparent");
	}

	this.mule.selected = this;
	
	var element = this.base.children();
	element.css("border-color", "#CCC");
	element.css("background-color", "#F0F8FF");
};

MuleNode.prototype.createImageLabel = function(div, elem, color) {
	elem.image = div.appendHtml('<div style="width: 100%; height:32px; text-align:center"><img src="img/large/' + elem.type + '.png" /></div>');
	elem.label = div.appendHtml('<label style="float: left; word-break: break-word; font-weight: normal; text-align: center; margin-top: 10px; width: 100%; max-width: 100px; color:'+(color ? color : '#555')+'"></label>');
	elem.refresh();
};
MuleNode.prototype.isChildOf = function(node) {
	var parent = this.parent;
	while(parent != null && node != parent) {
		parent = parent.parent;
	}
	return parent != null;
};
MuleNode.prototype.isConnectedWith = function(node) {
	return (this.leftNode && node == this.leftNode) || (this.rightNode && node == this.rightNode);
};
MuleNode.prototype.addProperty = function(element, name, label, type) {
	this.properties[name] = {"label":label, "type":type, "value": element[name] ? unescapeHtml(element[name]) : ""};
};

MuleNode.prototype.toObject = function(event) {
	var object = {id : this.id};
	object.type = this.type;
	for (var key in this.properties) {
		object[key] = escapeHtml(this.properties[key].value);
	}
	object.children = [];
	for (var i = 0; i < this.children.length; i++) {
		object.children.push(this.children[i].toObject());
	}
	return object;
};

// Channel

var MuleChannel = function() {
	MuleNode.call(this);
};

MuleChannel.prototype.constructor = MuleChannel;
MuleChannel.prototype = Object.create(MuleNode.prototype);
MuleChannel.prototype.render = function() {
	this.base = angular.html('<div style="display: table-cell; vertical-align: top; padding-top: 10px;"></div>');

	this.setDroppable();
	
	this.base.appendHtml('<div style="position: relative; width: 54px; height: 32px; z-index: 9999; opacity: 0.5;"></div>');
	
	this.createImageLabel(this.base, this);
	
	this.image.css("margin-top", "-32px");
};
MuleChannel.prototype.setDroppable = function() {
	var node = this;
	this.base.bind("drop", function(e) {
		node.onDragLeave(e);
		node.onDrop(e);
		e.preventDefault();
		e.stopPropagation();
	});
	this.base.bind("dragover", function(e) {
		node.onDragOver(e);
		e.preventDefault();
		e.stopPropagation();
	});
	this.base.bind("dragleave", function(e) {
		node.onDragLeave(e);
		e.preventDefault();
		e.stopPropagation();
	});
};
MuleChannel.prototype.onDrop = function(event) {
	if (!this.mule.readOnly) {
		if (this.mule.dragged.type != "flow" && !this.isChildOf(this.mule.dragged) && !this.mule.dragged.isConnectedWith(this)) {
			if (this.mule.dragged.parent) {
				this.parent.removeNode(this.mule.dragged);
			}
	    	this.parent.insertNode(this.mule.dragged, this);
	    }
		this.mule.dragged = null;
		this.mule.onChange();
	}
};
MuleChannel.prototype.onDragOver = function(event) {
	if (!this.mule.readOnly) {
		if (this.mule.dragged.type != "flow") {
			this.base.children().css("background", this.isChildOf(this.mule.dragged) || this.isConnectedWith(this.mule.dragged) ? 
					"url('img/remove.png') no-repeat center center" : "url('img/small/"+this.mule.dragged.type+".png') no-repeat center center");
		}
	}
};
MuleChannel.prototype.onDragLeave = function(event) {
	this.base.children().css("background", "transparent");
};

muleConfig["channel"] = "MuleChannel";

// Start/End

var MuleStartEnd = function() {
	MuleChannel.call(this);
};

MuleStartEnd.prototype.constructor = MuleChannel;
MuleStartEnd.prototype = Object.create(MuleChannel.prototype);
MuleStartEnd.prototype.render = function() {
	this.base = angular.html('<div style="display: table-cell; vertical-align: top; padding-top: 10px;"></div>');

	this.base.appendHtml('<div style="position: relative; width: 24px; height: 32px; z-index: 9999; opacity: 0.5;"></div>');
	
	this.setDroppable();
};

muleConfig["start"] = "MuleStartEnd";
muleConfig["end"] = "MuleStartEnd";

// Container

var MuleContainer = function() {
	
	MuleNode.call(this);
	
	this.container = null;
	
	this.children = [];
	
	this.startConnection = "start";
	this.connection = "channel";
	this.endConnection = "end";
	
};

MuleContainer.prototype.constructor = MuleContainer;
MuleContainer.prototype = Object.create(MuleNode.prototype);
MuleContainer.prototype.render = function() {
	this.startNode = this.createConnection(this, this.startConnection, "");
	this.container.append(this.startNode.base);
	
	this.endNode = this.createConnection(this, this.endConnection, "");
	this.connect(this.endNode, this.startNode, null);
	this.container.append(this.endNode.base);

	for (var i = 0; i < this.children.length; i++) {
		var node = this.children[i];
		this.appendNode(node);
	}
};
MuleContainer.prototype.createConnection = function(parent, type, description) {
	var node = this.mule.createNode(parent, {"type":type, "description":description});
	return node;
};
MuleContainer.prototype.connect = function(node, leftNode, rightNode) {
	if (node) {
		node.leftNode = leftNode;
		node.rightNode = rightNode;
		if (leftNode) {
			leftNode.rightNode = node;
		}
		if (rightNode) {
			rightNode.leftNode = node;
		}
	} else {
		if (leftNode) {
			leftNode.rightNode = rightNode;
		}
		if (rightNode) {
			rightNode.leftNode = leftNode;
		}
	}
}
MuleContainer.prototype.appendNode = function(node) {
	this.insertNode(node, this.endNode, true);
};
MuleContainer.prototype.insertNode = function(node, destNode, newNode) {
	var leftNode = this.startNode;
	var rightNode = this.endNode;
	if (this.startNode == destNode) {
		if (this.startNode.rightNode == this.endNode) {
			rightNode = this.endNode;
		} else {
			rightNode = this.createConnection(this, this.connection, "");
			this.connect(rightNode, node, destNode.rightNode);
			destNode.parent.container.insertAfter(rightNode.base, destNode.base);
		}
	} else {
		if (this.startNode.rightNode != this.endNode) {
			leftNode = this.createConnection(this, this.connection, "");
			rightNode = destNode;
			this.connect(leftNode, destNode.leftNode, node);
			destNode.parent.container.insertBefore(leftNode.base, rightNode.base);
		}
	}
	node.parent = destNode.parent;
	this.connect(node, leftNode, rightNode);
	destNode.parent.container.insertBefore(node.base, rightNode.base);
	if (!newNode) {
		var children = destNode.parent.children;
		var pos = 0;
		if (children.length > 0) {
			if (leftNode.leftNode) {
				pos = children.indexOf(leftNode.leftNode) + 1;
			} else {
				pos = children.indexOf(rightNode.rightNode);
			}
		}
		children.insert(pos, node);
		this.mule.onChange();
	}
};
MuleContainer.prototype.removeNode = function(node) {
	var leftNode = node.leftNode;
	var rightNode = node.rightNode;
	if (rightNode != node.parent.endNode) {
		rightNode.parent.container.removeChild(rightNode.base);
		rightNode = rightNode.rightNode;
	} else {
		if (leftNode != node.parent.startNode) {
			leftNode.parent.container.removeChild(leftNode.base);
			leftNode = leftNode.leftNode;
		}
	}
	this.connect(null, leftNode, rightNode);
	node.parent.container.removeChild(node.base);
	node.parent.children.remove(node);
	this.mule.onChange();
};
MuleContainer.prototype.toObject = function(event) {
	var obj = MuleNode.prototype.toObject.call(this, event);
	if (obj.children.length == 0) {
		obj.children.push({"type":"blank"});
	}
	return obj;
}

// Separator

var MuleSeparator = function() {
	MuleChannel.call(this);
};

MuleSeparator.prototype.constructor = MuleSeparator;
MuleSeparator.prototype = Object.create(MuleChannel.prototype);
MuleSeparator.prototype.render = function() {
	this.base = angular.html('<div style="height:10px; float: left; width: 100%; vertical-align: middle; "></div>');
	
	this.setDroppable();
	
	this.base.appendHtml('<div style="height:4px; float: left; width: 100%"></div>');
};
MuleSeparator.prototype.onDrop = function(event) {
	if (!this.mule.readOnly) {
		if (this.mule.dragged.type == "flow" && !this.mule.dragged.isConnectedWith(this) && this.mule.dragged.canMove(this)) {
			if (this.mule.dragged.parent) {
				this.parent.removeNode(this.mule.dragged);
			}
	    	this.parent.insertNode(this.mule.dragged, this);
	    }
		this.mule.dragged = null;
		this.mule.onChange();
	}
};
MuleSeparator.prototype.onDragOver = function(event) {
	if (!this.mule.readOnly) {
		if (this.mule.dragged.type == "flow") {
			this.base.children().css("background", !this.mule.dragged.canMove(this) || this.isConnectedWith(this.mule.dragged) ? "#CCC" : "#000");
		}
	}
};
MuleSeparator.prototype.onDragLeave = function(event) {
	this.base.children().css("background", "transparent");
};

muleConfig["separator"] = "MuleSeparator";

// Flow

var MuleFlow = function() {
	MuleContainer.call(this);
};

MuleFlow.prototype.constructor = MuleFlow;
MuleFlow.prototype = Object.create(MuleContainer.prototype);
MuleFlow.prototype.init = function(mule, parent, element) {
	MuleContainer.prototype.init.call(this, mule, parent, element);
	
	this.style = element.style ? element.style : "flow";
	
	this.expanded = true;
}
MuleFlow.prototype.render = function() {

	this.base = angular.html('<div style="float: left; width: 100%"></div>');

	this.setDraggable();
	this.setSelectable();
	
	var div = this.base.appendHtml('<div style="float: left; border-radius: 4px; border: 1px solid transparent;"></div>');
	
	var flow = div.appendHtml('<div style="border: gray dotted 1px; cursor: default; float: left;"></div>');

	var header = flow.appendHtml('<div style="background-color: '+(this.deletable ? '#ADDFFF;':'#DDD;')+'"></div>');
	
	this.btnCollapse = header.appendHtml('<a style="float:left; margin: 6px;" class="fa"></a>');
	
	var node = this;
	this.btnCollapse.bind("click", function() {
		node.expanded = !node.expanded;
		node.onCollapse();
	});
	
	header.appendHtml('<img src="img/small/'+this.style+'.png" style="height: 16px;"/>');
	
	this.label = header.appendHtml('<label style="margin: 3px;">'+this.properties["description"].value+'</label>');

	this.container = flow.appendHtml('<div style="padding: 10px 0px 10px 0px;"></div>');
	
	node.onCollapse();
	
	MuleContainer.prototype.render.call(this);
};
MuleFlow.prototype.onCollapse = function() {
	this.btnCollapse.removeClass(this.expanded ? 'fa-plus-square-o' : 'fa-minus-square-o');
	this.btnCollapse.addClass(this.expanded ? 'fa-minus-square-o' : 'fa-plus-square-o');
	this.container.css("display", (this.expanded ? 'block' : 'none'));
};
MuleFlow.prototype.canMove = function(separator) {
	return this.deletable && (this.mule.type == 2 || (separator.rightNode && separator.rightNode.deletable) || (separator.leftNode && separator.leftNode.deletable));
}

muleConfig["flow"] = "MuleFlow";

// Graph

var MuleGraph = function(parent, onSelect, onDelete, onChange) {
	MuleContainer.call(this);

	this.container = parent;
	
	this.onSelect = onSelect;
	
	this.onDelete = onDelete;
	
	var graph = this;
	
	this.onChange = function() {
		graph.changed = true;
		onChange();
	};
	
	this.countNode = 0;

	this.selected = null;
	
	this.dragged = null;
	
	this.startConnection = "separator";
	this.connection = "separator";
	this.endConnection = "separator";
	
	this.readOnly = false;
	
	this.type = 1;
	
	this.ids = 0;
};

MuleGraph.prototype.constructor = MuleGraph;
MuleGraph.prototype = Object.create(MuleContainer.prototype);
MuleGraph.prototype.uniqueId = function() {
	this.ids = this.ids + 1;
	return new Date().getTime() + "_" + this.ids.toString();
}
MuleGraph.prototype.createNode = function(parent, element) {
	var node = eval("new "+muleConfig[element.type]+"()");
	if (!element.id) {
		element.id = this.uniqueId();
	}
	node.init(this.mule, parent, element);
	node.render();
	return node;
};
MuleGraph.prototype.start = function(flows) {
	this.init(this, null, {"type":"graph", "children": flows});
	this.render();
};
MuleGraph.prototype.onKeyPress = function(event) {
	if (event.which == 46) {
		if (!this.readOnly && this.selected && this.selected.deletable && document.body === document.activeElement) {
			this.selected.parent.removeNode(this.selected);
			this.selected = null;
			this.onDelete(this.selected);
		}
	}
};