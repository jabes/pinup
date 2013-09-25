
plib = {


	onDomReady: function (fn) {

		var listenType = document.addEventListener ? events.domcontentloaded : events.readystatechange,
			unload = function () {
				plib.removeEvent(document, listenType);
				plib.removeEvent(window, events.load);
			};

		if (document.readyState !== readyStates.complete) {

			plib.addEvent(document, listenType, function () {
				if (document.readyState === readyStates.complete) {
					unload.call();
					fn.call();
				}
			});

			// fallback on page load
			plib.addEvent(window, events.load, function () {
				unload.call();
				fn.call();
			});

		} else {

			fn.call();

		}

	},

	loadScript: function (url, callback) {

		var script,
			properties = {},
			unload = function () {
				plib.removeEvent(script, events.readystatechange);
				plib.removeEvent(script, events.load);
			};

		properties[attributes.src] = url;
		properties[attributes.type] = types.jstxt;

		script = plib.domAppend(html.script, document.getElementsByTagName(html.head)[0], properties);

		// MSIE
		plib.addEvent(script, events.readystatechange, function () {
			if (script.readyState === readyStates.complete || script.readyState === readyStates.loaded) {
				unload.call();
				callback(script);
			}
		});

		// OTHERS
		plib.addEvent(script, events.load, function () {
			unload.call();
			callback(script);
		});

	},

	/*
	type: function (o) {
		switch (o) {
		case null: return NULL_TYPE;
		case (void 0): return UNDEFINED_TYPE;
		}
		var type = typeof o;
		switch (type) {
		case 'boolean': return BOOLEAN_TYPE;
		case 'number': return NUMBER_TYPE;
		case 'string': return STRING_TYPE;
		}
		var proto = protoString.call(o);
		switch (proto) {
		case ARRAY_CLASS: return ARRAY_TYPE;
		case FUNCTION_CLASS: return FUNCTION_TYPE;
		}
		// if all fails then assume object
		return OBJECT_TYPE;
	},
	*/

	type: function (o) {

		switch (o) {
		case null:
			return NULL_TYPE;
		case (void 0):
			return UNDEFINED_TYPE;
		}

		var proto = protoString.call(o);

		switch (proto) {
		case BOOLEAN_CLASS:
			return BOOLEAN_TYPE;
		case NUMBER_CLASS:
			return NUMBER_TYPE;
		case STRING_CLASS:
			return STRING_TYPE;
		case ARRAY_CLASS:
			return ARRAY_TYPE;
		case FUNCTION_CLASS:
			return FUNCTION_TYPE;
		case DATE_CLASS:
			return DATE_TYPE;
		}

		if (o.nodeType === 1) {
			return ELEMENT_TYPE;
		}

		// if all fails then assume object
		return OBJECT_TYPE;
	},


	isElement: function (e) {
		//return !!(e && e.nodeType === 1);
		return plib.type(e) === ELEMENT_TYPE;
	},

	isNull: function (e) {
		return plib.type(e) === NULL_TYPE;
	},

	isUndefined: function (e) {
		return plib.type(e) === UNDEFINED_TYPE;
	},

	isBoolean: function (e) {
		return plib.type(e) === BOOLEAN_TYPE;
	},

	isNumber: function (e) {
		return plib.type(e) === NUMBER_TYPE;
	},

	isString: function (e) {
		return plib.type(e) === STRING_TYPE;
	},

	isObject: function (e) {
		return plib.type(e) === OBJECT_TYPE;
	},

	isFunction: function (e) {
		return plib.type(e) === FUNCTION_TYPE;
	},

	isArray: function (e) {
		return plib.type(e) === ARRAY_TYPE;
	},

	isNumeric: function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

	hasClass: function (element, s) {
		return new RegExp('\\b' + s + '\\b').test(element.className);
	},

	addClass: function (element, s) {
		if (!plib.hasClass(element, s)) {
			element.className += element.className ? whiteSpace + s : s;
		}
	},

	removeClass: function (element, s) {
		var rep = element.className.match(whiteSpace + s) ? whiteSpace + s : s;
		element.className = element.className.replace(rep, '');
		/*
		if (!element.className) {
			element.removeAttribute('class');
		}
		*/
	},

	getParentByClassName: function (element, s) {
		while (element && !plib.hasClass(element, s)) {
			element = element.parentNode || null;
		}
		return element;
	},

	getElementsByClassName: function (s, node) {

		var output = [];

		node = node || document.getElementsByTagName(html.body).item(0);

		plib.loopArray(node.getElementsByTagName(asterisk), function (value) {
			if (plib.hasClass(value, s)) {
				output.push(value);
			}
		});

		return output;

	},

	hasProperty: function (object, property) {

		var hasOwn = Object.prototype.hasOwnProperty,
			proto = '__proto__';

		if (hasOwn) {
			return hasOwn.call(object, property);
		} else {
			proto = object[proto] || object.constructor.prototype;
			return !plib.isUndefined(object[property]) && (plib.isUndefined(proto[property]) || proto[property] !== object[property]);
		}
	},

	loop: function (len, callback) {
		var i = 0;
		while (i < len) {
			if (callback(i) === null) { // if the callback returns null then break
				break;
			}
			i++;
		}
	},

	rloop: function (len, func) {
		while (len--) { // note: loop in reverse is the fastest way to iterate an array
			func(len);
		}
	},

	loopArray: function (array, callback) {

		plib.loop(array.length, function (index) {

			/*
			if (callback.length === 1) { // return value
				return callback(array[index]);
			} else if (callback.length === 2) { // return index + value
				return callback(index, array[index]);
			}
			*/

			// callback function should never have more than two parameters
			return (callback.length === 2) ? callback(index, array[index]) : callback(array[index]);

		});
	},

	loopObject: function (object, callback) {
		var property;
		for (property in object) {
			// we should really be doing a hasOwnProperty check in here but this function gets a lot of calls and I want it as fast as possible
			if (callback.length === 1) { // return just value
				if (callback(object[property]) === null) {
					break; // if the callback returns null then break
				}
			} else if (callback.length === 2) { // return both key AND value
				if (callback(property, object[property]) === null) {
					break; // if the callback returns null then break
				}
			}
		}
	},

	loopObjectKeys: function (object, callback) {
		var property;
		for (property in object) {
			if (callback(property) === null) {
				break; // if the callback returns null then break
			}
		}
	},

	isObjectEmpty: function (object) {
		var property;
		for (property in object) {
			if (plib.hasProperty(object, property)) {
				return false;
			}
		}
		return true;
	},

	mergeObject: function (object1, object2) {
		var property;
		for (property in object2) {
			object1[property] = object2[property];
		}
		return object1;
	},

	cloneObject: function (object) {
		var clone = {};
		if (!plib.isObject(object)) {
			return object;
		}
		plib.loopObject(object, function (key, val) {
			clone[key] = plib.cloneObject(val); // recursive
		});
		return clone;
	},

	// note: this function will not accept multi-dimensional objects
	getParamsFromObject: function (object) {
		var s = [];
		plib.loopObject(object, function (key, val) {
			s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(val);
		});
		return s.join('&');
	},

	getEventTarget: function (event) {
		var target;
		event = event || window.event;
		target = event.target || event.srcElement;
		if (target.nodeType === 3) { // defeat Safari bug
			target = target.parentNode;
		}
		return target;
	},

	randomID: function (size) {
		var str = '',
			i = 0,
			chars = '0123456789ABCDEFGHIJKLMNOPQURSTUVWXYZ';
		while (i < size) {
			str += chars.substr(Math.floor(Math.random() * chars.length), 1);
			i++;
		}
        return str;
	},

	getMousePosition: function (event) {

		event = event || window.event;

		var de = document.documentElement,
			b = document.body,
			cursor = {
				x: 0,
				y: 0
			};

		if (event.pageX || event.pageY) {
			cursor.x = event.pageX;
			cursor.y = event.pageY;
		} else {
			cursor.x = event.clientX + (de.scrollLeft || b.scrollLeft) - de.clientLeft;
			cursor.y = event.clientY + (de.scrollTop || b.scrollTop) - de.clientTop;
		}

		return cursor;
	},

	getWidth: function (element) {
		var width = element.offsetWidth || element.clientWidth;
		// if no value was given then the element is probably just hidden
		if (!width) {
			plib.setStyle(element, css.visibility, 'hidden');
			plib.show(element);
			width = element.offsetWidth || element.clientWidth;
			plib.hide(element);
			plib.setStyle(element, css.visibility, 'visible');
		}
		return width || 0;
	},

	setWidth: function (element, value) {
		plib.setStyle(element, css.width, value);
	},

	getHeight: function (element) {
		var height = element.offsetHeight || element.clientHeight;
		// if no value was given then the element is probably just hidden
		if (!height) {
			plib.setStyle(element, css.visibility, 'hidden');
			plib.show(element);
			height = element.offsetHeight || element.clientHeight;
			plib.hide(element);
			plib.setStyle(element, css.visibility, 'visible');
		}
		return height || 0;
	},

	setHeight: function (element, value) {
		plib.setStyle(element, css.height, value);
	},

	getCumulativeOffset: function (element) {

		var offset = {
				x: 0,
				y: 0
			};

		if (element.offsetParent) {
			do {
				offset.x += element.offsetLeft;
				offset.y += element.offsetTop;
				element = element.offsetParent;
			} while (element);
		}

		return offset;

	},

	attribute: function (element, name, value) {

		var nType = element.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if (!element || nType === 3 || nType === 8 || nType === 2) {
			return undefined;
		} else if (plib.isObject(name)) {
			// manage multiple attributes
			plib.loopObject(name, function (key, val) {
				plib.attribute(element, key, val);
			});
		} else if (!plib.isUndefined(value)) {
			if (value === null || value === false) { // REMOVE
				if (name === 'class') {
					plib.removeClass(element, value);
				} else {
					element.removeAttribute(name);
				}
				return undefined;
			} else { // ADD
				if (name === 'class') {
					plib.addClass(element, value);
				} else {
					element.setAttribute(name, value);
				}
				return value;
			}
		} else { // GET

			return element.getAttribute(name);
		}

	},

	getGUID: function (element) {

		// yes we have some elements without guids BUT only an element with a guid can have events with the exception window and document
		var guid;

		// we cant set/get attributes on document/window so keep track of them in a different way
		if (element === window) {
			guid = splElmIds.window;
		} else if (element === document) {
			guid = splElmIds.document;
		} else {
			guid = plib.attribute(element, attributes.guid); // get
			if (!guid) {
				// when creating an element OR adding events to innerHTML that never got a guid
				guid = plib.attribute(element, attributes.guid, plib.randomID(16)); // set
			}
		}

		return guid;

	},

	setStyles: function (element, object) {
		plib.loopObject(object, function (key, val) {
			/*
			key = style property (string)
			val = style value (string/number)
			*/
			plib.setStyle(element, key, val);
		});
	},

	setStyle: function (element, prop, value) {
		var style = element.style;
		// to speed things up as much as possible, im going to rely on every incoming prop being camel case
		// float is a reserved word, apply fix
		prop = (prop === css.cssFloat) ? support.cssFloat : prop;
		// Don't set styles on text and comment nodes
		if (!style || !element || element.nodeType === 3 || element.nodeType === 8) {
			return;
		}
		if (prop === css.opacity) {
			plib.setAlpha(element, value);
			return;
		}
		// we are leaving out properties we dont use
		//[css.zIndex, css.fontWeight, css.opacity, css.zoom, css.lineHeight]
		// If a number was passed in, add 'px' to the (except for certain CSS properties)
		if (plib.isNumber(value) && !plib.inArray([css.zIndex, css.opacity], prop)) {
			value += cssUnit;
		}
		// IE8 and below will error out for some reason "Error: Invalid argument."
		// use a try/catch to silence the error and it works fine..
		pfunc.attempt(function () {
			style[prop] = value;
		});
	},

	getStyle: function (element, prop, computedStyles) {

		var value,
			filter;
		
		// shift arguments if needed
		if (plib.isString(element)) {
			computedStyles = prop;
			prop = element;
			element = undefined;
		}

		if (prop === css.opacity && !support.opacity) {
			filter = plib.getStyle(element, css.filter, computedStyles);
			value = filter ? parseFloat(filter.replace(regex.nump, '')) / 100 : null;
		} else {
			computedStyles = computedStyles || plib.getComputedStyles(element);
			value = computedStyles[prop];
		}

		return (value === 'auto') ? null : value;
	},

	getComputedStyles: function (element) {

		var styles = {},
			computedStyles = defaultView ? defaultView.getComputedStyle(element, null) : element.currentStyle,
			stylesLength = computedStyles.length,
			addStyle = function (cssProperty) {


				var cssValue,
					cssType,
					parsedValue;

				// MSIE 8 and under do not support this method
				if (!plib.isUndefined(computedStyles.getPropertyValue)) {
					cssValue = computedStyles.getPropertyValue(cssProperty);
				}

				// FOR MSIE 8 and under
				// note: opera will pass in camelized properties.. so any property with a hyphen will fall back on this
				if (!cssValue) {
					cssValue = computedStyles[cssProperty];
				}


				if (cssValue) {

					cssType = plib.type(cssValue);

					// NORMALIZE THE CSS VALUE TYPECAST
					// if the value is a string but numeric or contains a css unit, parse as number
					// note: without the string type comparison, MSIE will crash because you can't index a number
					if ((plib.isNumeric(cssValue) && cssType !== NUMBER_TYPE) || (cssType === STRING_TYPE && cssValue.indexOf(cssUnit) > 0)) {
						parsedValue = parseFloat(cssValue);
						// still not a number? this is because a value may contain a css unit but may not be simply a number
						// example: "outline: #000000 0px none"
						// keep as string
						if (!isNaN(parsedValue)) {
							cssValue = parsedValue;
						}
					}

					styles[plib.camelize(cssProperty)] = cssValue;

				}

			};

		if (stylesLength) { // most browsers
			plib.loop(stylesLength, function (i) {
				addStyle(computedStyles[i]);
			});
		} else { // opera
			plib.loopObjectKeys(computedStyles, function (key) {
				if (plib.hasProperty(computedStyles, key)) {
					addStyle(key);
				}
			});
		}

		return styles;

	},

	camelize: function (str) {
		return str.replace(regex.camel, function (match, chr) {
			return chr ? chr.toUpperCase() : '';
		});
	},

	stopBubble: function (event) {
		event = event || window.event;
		if (event.preventDefault) { // W3C
			event.preventDefault();
		} else { // MSIE
			event.returnValue = false;
		}
		if (event.stopPropagation) { // W3C
			event.stopPropagation();
		} else { // MSIE
			event.cancelBubble = true;
		}
	},

	removeChildren: function (element) {
		if (element) {
			// remove children because we check for events to kill
			while (element.hasChildNodes()) {
				plib.removeElement(element.firstChild);
			}
		}
	},

	cleanElement: function (element) {

		var guid = plib.getGUID(element);

		// remove any events given to this element
		plib.removeAllEvents(element);

		// remove any children this element may have
		// we do this to manage event and element caches
		plib.removeChildren(element);

		// remove any keylisteners binded to this element
		pfunc.removeAllKeyListeners(guid);

		// remove our element from cache
		delete cacheElements[guid];

	},

	removeElement: function (element) {
		if (element) {
			plib.cleanElement(element);
			// an element can exist without being in the dom tree // so check to make sure it has a parent
			if (element.parentNode) {
				// remove any children this element may have // we do this to manage event and element caches
				element.parentNode.removeChild(element);
			}
		}
	},

	replaceElement: function (elm1, elm2) {

		// NOTE: "elm1" gets replaced with "elm2"

		plib.cleanElement(elm1);

		if (plib.isString(elm2)) {
			elm2 = document.createTextNode(elm2);
		}

		// an element can exist without being in the dom tree // so check to make sure it has a parent
		if (elm1.parentNode) {
			elm1.parentNode.replaceChild(elm2, elm1);
		}

	},

	insertBefore: function (elm1, elm2) {
		// NOTE: "elm2" gets inserted before "elm1"
		elm1.parentNode.insertBefore(elm2, elm1);
		return elm2;
	},

	insertAfter: function (elm1, elm2) {
		// NOTE: "elm2" gets inserted after "elm1"
		if (plib.isString(elm2)) {
			elm2 = document.createTextNode(elm2);
		}
		elm1.parentNode.insertBefore(elm2, plib.getNextSibling(elm1));
		return elm2;
	},

	getNextSibling: function (element) {
		do {
			element = element.nextSibling;
		} while (element && element.nodeType !== 1);
		return element;
	},

	newElement: function (strType, objAttributes, textNode) {

		var newElm = document.createElement(strType),
			guid = plib.getGUID(newElm); // create a guid for our new element

		// add our new element to our array of elements indexed by their guids
		cacheElements[guid] = newElm;

		// shift arguments if data argument was omited
		if (objAttributes && plib.isString(objAttributes)) {
			textNode = textNode || objAttributes;
			objAttributes = {};
		}

		if (objAttributes && plib.isObject(objAttributes)) {
			plib.attribute(newElm, objAttributes);
		}

		if (textNode && plib.isString(textNode)) {
			plib.appendText(newElm, textNode);
		}

		return newElm;

	},

	domAppend: function (element, elmAppendTo, objAttributes, textNode) {

		var nt1, nt2;

		// shift arguments if data argument was omited
		if (objAttributes && plib.isString(objAttributes)) {
			textNode = textNode || objAttributes;
			objAttributes = {};
		}

		if (plib.isString(element)) {
			element = plib.newElement(element, objAttributes, textNode);
		}

		nt1 = element.nodeType;
		nt2 = elmAppendTo.nodeType;

		// allow 1:ELEMENT_NODE or 11:DOCUMENT_FRAGMENT_NODE or 3:TEXT_NODE
		if ((nt1 === 1 || nt1 === 11 || nt1 === 3) && (nt2 === 1 || nt2 === 11 || nt2 === 3)) {
			elmAppendTo.appendChild(element);
		}

		return element;

	},

	domWrap: function (elmWrapper, elmInner, objAttributes, textNode) {

		// shift arguments if data argument was omited
		if (objAttributes && plib.isString(objAttributes)) {
			textNode = textNode || objAttributes;
			objAttributes = {};
		}

		if (plib.isString(elmWrapper)) {
			elmWrapper = plib.newElement(elmWrapper, objAttributes, textNode);
		}

		if (plib.isElement(elmWrapper) && plib.isElement(elmInner)) {
			// insert our new wrapper before the element we want to wrap
			elmInner.parentNode.insertBefore(elmWrapper, elmInner);
			// insert a copy of our elements children into our new wrapper
			plib.domAppend(elmInner, elmWrapper);
		}

		return elmWrapper;

	},

	isElementIn: function (element, compare) {
		while (element) {
			if (element === compare || element.nodeName.toLowerCase() === compare) {
				return true;
			}
			element = element.parentNode;
		}
		return false;
	},

	isElementEmpty: function (element) {
		//return !(element.children.length > 0);
		return element.children.length === 0;
	},

	parseHTML: function (jsonHtml, lang) {

		var documentFragment = document.createDocumentFragment(),
			buildElement;

		buildElement = function (objNodeData) {

			var oAttributes = {},
				elmNode;

			if (plib.hasProperty(objNodeData, lang.id)) {
				oAttributes.id = objNodeData[lang.id];
			}

			if (plib.hasProperty(objNodeData, lang.className)) {
				oAttributes['class'] = objNodeData[lang.className];
			}

			if (plib.hasProperty(objNodeData, lang.attr)) {
				plib.loopObject(objNodeData[lang.attr], function (key, val) {
					/*
					key = attribute name (string)
					val = attribute value (string)
					*/
					oAttributes[key] = val;
				});
			}

			// only create an element if a node name was defined, and if no parent is made then children are not possible
			if (plib.hasProperty(objNodeData, lang.nodeName)) {
				elmNode = plib.newElement(objNodeData[lang.nodeName], oAttributes);
				// if child nodes are available, recursively append them to the element we just made
				if (objNodeData[lang.childNodes] && objNodeData[lang.childNodes].length > 0) {
					plib.loopArray(objNodeData[lang.childNodes], function (value) {
						plib.domAppend(buildElement(value), elmNode);
					});
				}
			}

			if (objNodeData[lang.text] && objNodeData[lang.text].length > 0) {
				// if we just want a text node, dont create an element wrapper
				if (elmNode) {
					plib.appendText(elmNode, objNodeData[lang.text]);
				} else {
					elmNode = document.createTextNode(objNodeData[lang.text]);
				}
			}



			return elmNode;

		};

		lang = lang || {
			nodeName: 'nodeName',
			childNodes: 'childNodes',
			className: 'className',
			id: 'id',
			attr: 'attr',
			text: 'text'
		};

		if (plib.isArray(jsonHtml)) {
			plib.loopArray(jsonHtml, function (value) {
				plib.domAppend(buildElement(value), documentFragment);
			});
		} else if (plib.isObject(jsonHtml)) {
			plib.domAppend(buildElement(jsonHtml), documentFragment);
		}


		return documentFragment;

	},

	replaceHTML: function (element, html) {

		plib.removeChildren(element);

		if (plib.isString(html)) {
			/*
			// note: this function will take static html and extract elements
			var div = document.createElement(html.div);
			div.innerHTML = html;
			plib.loop(div.childNodes.length, function (n) {
				element.appendChild(div.childNodes[n]);
			});
			*/
			plib.appendText(element, html);
		} else {
			element.appendChild(plib.parseHTML(html));
		}

	},

	appendText: function (element, string) {
		if (string.length > 0) {
			return element.appendChild(document.createTextNode(string));
		}
	},

	textContentRecursive: function (element, string) {

		// note: this function simply runs down an elements node tree and looks for the last element (before the textnode if one exists)
		// sidenote: this function is a little awkward (too specific) to be in the core but I will allow it ;-)

		while (element) {

			// if the child node is not an element node, assume it is a text node and break the loop
			if (!element.firstChild || !plib.isElement(element.firstChild)) {

				if (string) { // set
					return plib.textContent(element, string);
				} else { // get
					return plib.textContent(element);
				}
			}

			element = element.firstChild;
		}

	},

	textContent: function (element, string) {

		var i, j, child;

		for (i = 0, j = element.childNodes.length; i < j; i++) {
			child = element.childNodes[i];
			if (child.nodeType === 3) { // text node
				if (string) {
					child.nodeValue = string;
				}
				return child.nodeValue;
			}
		}

		// if nothing was return at this point, a text node was not found, so make one
		return string ? plib.appendText(element, string) : '';

	},

	disableSelection: function (element) {

		if (!plib.isUndefined(element.onselectstart)) { // MSIE
			element.onselectstart = function () {
				return false;
			};
		}
		/*
		if (!plib.isUndefined(element.style.WebkitUserSelect)) { // WEBKIT
			element.style.WebkitUserSelect = 'none';
		} else if (!plib.isUndefined(element.style.KhtmlUserSelect)) { // KONQUEROR
			element.style.KhtmlUserSelect = 'none';
		} else if (!plib.isUndefined(element.style.MozUserSelect)) { // FIREFOX
			element.style.MozUserSelect = 'none';
		} else if (!plib.isUndefined(element.style.OUserSelect)) { // OPERA
			element.style.OUserSelect = 'none';
		} else if (!plib.isUndefined(element.style.userSelect)) { // REST
			element.style.userSelect = 'none';
		}
		*/

		plib.addClass(element, classes.noSelect);
		plib.attribute(element, attributes.unselectable, "on");

	},

	show: function (element) {
		element.style[css.display] = 'block';
	},

	hide: function (element) {
		element.style[css.display] = 'none';
	},

	isVisible: function (element) {
		var computedStyles = plib.getComputedStyles(element);
		return !(
			plib.getStyle(css.visibility, computedStyles) === 'hidden' || plib.getStyle(css.display, computedStyles) === 'none' || plib.getStyle(css.opacity, computedStyles) === 0
		);
	},

	// MODIFIED VERSION OF:
	// written by Dean Edwards, 2005
	// with input from Tino Zijdel, Matthias Miller, Diego Perini
	// http://dean.edwards.name/weblog/2005/10/add-event2/
	handleEvent: function (event) {

		// NOTE: this function is for IE8 and below

		// grab the event object (IE uses a global event object)
		event = event || window.event;
		plib.stopBubble(event);

		var element = this,
			returnValue = true,
			handlers = element.events[event.type]; // get a reference to the hash table of event handlers

		// execute each event handler
		plib.loopObjectKeys(handlers, function (key) {
			// key = handler guid;
			element.handleEvent = handlers[key];
			if (element.handleEvent(event) === false) {
				returnValue = false;
			}
		});

		return returnValue;
	},

	hasEvent: function (element, eventType) {
		var guid = plib.getGUID(element);
		// check for guid before event type to avoid IE crashes
		return !!(cacheEvents[guid] && cacheEvents[guid][eventType]);
	},

	/*
	replaceEvent: function (element, eventType, handler) {
		plib.removeEvent(element, eventType);
		plib.addEvent(element, eventType, handler);
	},
	*/

	addEvent: function (element, eventType, handler) {

		// handle elements that may not have a guid
		var guid = plib.getGUID(element),
			handlers;


		// we do not support event chains // if on the odd chance an event request already exists then replace the old one
		if (plib.hasEvent(element, eventType)) {

			// on second thought.. dont replace it.. ignore it instead..
			// if we want to replace a function, we can simply remove the function beforehand
			/*
			plib.removeEvent(element, eventType);
			*/
			// {opendebug}
			pfunc.warn(messages.eventDuplicate, eventType, element);
			// {closedebug}
			return;

		}

		// we store events by element id and then by event type // if our element id is not found then create one so we can start adding event types
		if (!cacheEvents[guid]) {
			cacheEvents[guid] = {};
		}

		// insert a new event type into our cache
		cacheEvents[guid][eventType] = {
			'element': element,
			'handler': handler
		};

		if (element.addEventListener) { //W3C

			element.addEventListener(eventType, handler, false);

		} else { //IE

			// assign each event handler a unique ID
			if (!handler.guid) {
				handler.guid = plib.randomID(12);
			}
			// create a hash table of event types for the element
			if (!element.events) {
				element.events = {};
			}
			// create a hash table of event handlers for each element/event pair
			handlers = element.events[eventType];

			if (!handlers) {
				handlers = element.events[eventType] = {};
				// store the existing event handler (if there is one)
				if (element[ieEventPrefix + eventType]) {
					handlers[0] = element[ieEventPrefix + eventType];
				}
			}

			// store the event handler in the hash table
			handlers[handler.guid] = handler;
			// assign a global event handler to do all the work
			element[ieEventPrefix + eventType] = plib.handleEvent;
		}

	},

	removeEvent: function (element, eventType) {

		// handle elements that may not have a guid
		var guid = plib.getGUID(element),
			handler;

		// check to see if the event exists
		if (plib.hasEvent(element, eventType)) {

			// get the handler from our cache
			handler = cacheEvents[guid][eventType].handler;

			// delete the event reference from the element
			delete cacheEvents[guid][eventType];

			// if our object has no more events attached then remove from cache altogether
			if (plib.isObjectEmpty(cacheEvents[guid])) {
				delete cacheEvents[guid];
			}

			if (element.removeEventListener) {
				element.removeEventListener(eventType, handler, false);
			} else {
				// delete the event handler from the hash table
				if (element.events && element.events[eventType]) {
					delete element.events[eventType][handler.guid];
				}
			}

		}
	},

	removeAllEvents: function (element) {

		// handle elements that may not have a guid
		var guid = plib.getGUID(element);

		if (cacheEvents[guid]) {
			plib.loopObjectKeys(cacheEvents[guid], function (key) {
				// key = event type string
				plib.removeEvent(element, key);
			});
		}

	},

	fireEvent: function (element, eventType) {
		var evt;
		// check to see if the event exists
		if (plib.hasEvent(element, eventType)) {
			if (document.createEvent) { // W3C
				evt = document.createEvent('HTMLEvents');
				evt.initEvent(eventType, true, true);
				element.dispatchEvent(evt);
			} else { // IE
				evt = document.createEventObject();
				evt.eventType = ieEventPrefix + eventType;
				element.fireEvent(evt.eventType, evt);
			}
		}
	},

	click: function (element, callback, singlerun) {

		singlerun = singlerun || false;

		// if no callback is given then we are just after the stopBubble
		if (callback) {
			plib.addClass(element, classes.button);
		}

		plib.addEvent(element, events.click, function (evt) {

			// STOP LINK DEFAULT ACTION
			plib.stopBubble(evt);
			if (singlerun) {
				plib.removeEvent(element, events.click);
				plib.removeClass(element, classes.button);
			}
			if (callback) {
				callback.call(element, evt);
			}
			return false;

		});

	},

	jsonpGarbageCollect: function (scriptId) {
		plib.removeElement(document.getElementById(scriptId));
		clearTimeout(jsonpTimeout[scriptId]);
		delete jsonpTimeout[scriptId];
		delete jsonpHandler[scriptId];
	},

	// This function was inspired by Jason Levitt's JSON script request class
	// http: //www.xml.com/pub/a/2005/12/21/json-dynamic-script-tag.html
	loadJSONP: function (srcURL, params, callback) {

		// note: params must be object

		var scriptId = 'JSONP_' + plib.randomID(12),
			urlRemote,
			strParams = '',
			startTime = new Date().getTime();

		if (params) {
			// shift arguments if data argument was omited
			if (plib.isFunction(params)) {
				callback = params;
				params = '';
			// if parameters are provided in the form of an object then convert them into a string
			} else if (plib.isObject(params)) {
				strParams = plib.getParamsFromObject(params);
				strParams = strParams ? '&' + strParams : '';
			}
		}

		urlRemote = directory.paths.hub + '?r=' + srcURL + '&jsid=' + scriptId + '&pk=' + globalVars.publicKey + strParams;

		if (settings.jsonpTimeout > 0) {
			jsonpTimeout[scriptId] = setTimeout(function () {

				// {opendebug}
				pfunc.error(messages.jsonpTimeout, urlRemote);
				// {closedebug}

				if (callback) {
					callback(null, settings.jsonpTimeout);
				}
				plib.jsonpGarbageCollect(scriptId);
			}, settings.jsonpTimeout);
		}

		jsonpHandler[scriptId] = function (data) {
			var duration = new Date().getTime() - startTime;
			if (callback) {
				callback(data, duration);
			}
			plib.jsonpGarbageCollect(scriptId);
		};

		// Build the script tag
		plib.domAppend(html.script, document.getElementsByTagName(html.head).item(0), {
			id: scriptId,
			src: urlRemote,
			type: types.jstxt
		});

		// {opendebug}
		pfunc.log(messages.jsonp, urlRemote);
		// {closedebug}

	},


	stopAnimation: function (element) {
		if (element.animationMemory) {
			clearInterval(element.animationMemory);
			//delete element.animationMemory;
		}
	},

	// Animation script was inspired from:
	// http: //cross-browser.com/x/examples/animation_tech.php
	animate: function (element, sCssProp, nTarget, uTotalTime, callback) {

		// note: in an effort to remove as much fluff as possible sCssProp must be camelcase so that we dont have to calculate it each iteration

		var props = [],
			freq,
			startTime = new Date().getTime(),
			logProps = function (cssProp, cssValue) {
				var o = {};
				o.cssProp = cssProp; // the css property that needs animating
				o.startValue = plib.getStyle(element, o.cssProp) || 0; // our animation starting points
				o.endValue = cssValue; // our animation target values
				o.displacement = o.endValue - o.startValue; // our animation displacement values
				// only numbers are animatable
				if (!isNaN(o.startValue) && !isNaN(o.endValue) && !isNaN(o.displacement)) {
					props.push(o);
				}
			};

		if (plib.isObject(sCssProp)) {
			// an object was passed in so shift some arguments
			callback = uTotalTime;
			uTotalTime = nTarget;
			nTarget = null;
			plib.loopObject(sCssProp, function (key, val) {
				logProps(key, val);
			});
		} else {
			logProps(sCssProp, nTarget);
		}

		// whoops.. looks like something went wront.. get us out of here
		if (props.length === 0) { return; }

		freq = Math.PI / (2 * uTotalTime); // frequency

		if (element.animationMemory) {
			plib.stopAnimation(element); // stop any previous animations
		}

		element.animationMemory = setInterval(function () {

			var elapsedTime = new Date().getTime() - startTime,
				f = Math.abs(Math.sin(elapsedTime * freq));

			if (elapsedTime < uTotalTime) {
				plib.loopArray(props, function (value) {
					plib.setStyle(element, value.cssProp, (f * value.displacement + value.startValue));
				});
			} else {
				plib.stopAnimation(element);
				plib.loopArray(props, function (value) {
					plib.setStyle(element, value.cssProp, value.endValue);
				});
				// we are done
				if (callback) { callback.call(element); }
			}

		}, 10);

	},

	setAlpha: function (element, n) {
		if (support.opacity) {
			element.style[css.opacity] = n;
		} else {
			element.style[css.filter] = 'alpha(opacity = ' + String(n * 100) + ') ';
		}
	},

	fadeTo: function (element, alpha, speed, callback) {
		plib.animate(element, css.opacity, alpha, speed, callback);
	},

	fadeIn: function (element, speed, callback) {
		plib.fadeTo(element, 1, speed, callback);
	},

	fadeOut: function (element, speed, callback) {
		plib.fadeTo(element, 0, speed, callback);
	},

	stripSpaces: function (s) {
		return s.replace(regex.ss, '');
	},

	inArray: function (array, object) {
		var result = false;
		plib.loopArray(array, function (value) {
			if (value === object) {
				result = true;
				return null; // break loop
			}
		});
		return result;
	},

	arrayUnique: function (array) {
		var r = [];
		plib.loopArray(array, function (value) {
			if (!plib.inArray(r, value)) {
				r[r.length] = value;
			}
		});
		return r;
	},

	removeArrayItem: function (array, itemToRemove) {
		plib.loopArray(array, function (index, value) {
			if (value === itemToRemove) {
				array.splice(index, 1);
			}
		});
		return array;
	},


	// CREDIT: http://phpjs.org/functions/parse_url
	parseUrl: function (str) {

		var key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
			q = 'queryKey',
			m = regex.purl.exec(str),
			uri = {},
			i = 14;

		while (i--) {
			uri[key[i]] = m[i] || '';
		}

		uri[q] = {};
		uri[key[12]].replace(regex.query, function ($0, $1, $2) {
			if ($1) { uri[q][$1] = $2; }
		});

		return uri;

	},

	getFileExtension: function (url) {
		var file = url ? plib.parseUrl(url).file : null,
			ext = file ? regex.fext.exec(file).pop() : null; // use pop to get last array item in case there are multiple extentions in the url (we only care about the last)
		return ext ? ext.toLowerCase() : null;
	},

	/*
	@param {integer} nIntervalTime How many milliseconds between intervals.
	@param {integer} nMaxIntervalCount How many intervals can run before termination.
	@param {function} fnCondition A check method to resolve the loop (return true to break loop).
	@param {function} fnSuccess If the condition was met then call this function.
	@param {function} fnFailure Optional function that will get called if the condition was NOT met and the max interval amount was reached.
	*/
	runInterval: function (nIntervalTime, nMaxIntervalCount, fnCondition, fnSuccess, fnFailure) {

		var interval,
			count = 0;


		if (fnCondition.call() === true) {
			fnSuccess.call();
		} else {
			interval = window.setInterval(function () {
				if (fnCondition.call() === true) {
					clearInterval(interval);
					fnSuccess.call();
				} else {
					count++;
					if (count >= nMaxIntervalCount) {
						window.clearInterval(interval);
						if (fnFailure) {
							fnFailure.call();
						}
					}
				}
			}, nIntervalTime);
		}


	},

	stringFormat: function (str, arr) {
		var formatted = str;
		plib.loopArray(arr, function (index, value) {
			var regexp = new RegExp('\\{' + index + '\\}', 'gi');
			formatted = formatted.replace(regexp, value);
		});
		return formatted;
	}


};

