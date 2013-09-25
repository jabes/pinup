

var exist = false, // this is used to stop someone from including the JS twice
	alive = false, // this is used to stop someone from creating multiple instances

	globalVars = {}, // constant vars that never get reset
	globalElements = {}, // used to store all global elements not specific to individual nodes
	globalKeyEvents = {}, // used to store global events used by the keypress listener

	cacheImages = {}, // keep track of all virgin images (before we butcher them)
	cacheNodes = {}, // keeps track of information regarding the node
	cacheTags = {}, // each tag is assigned a random id, this object will keep track of them indexed with the tag id
	cacheTagData = {}, // keeps track of an images tag data indexed with the image src
	cacheEvents = {},
	cacheElements = {}, // keeps track of all elements (indexed by their guid) in dom that have been added by our script

	queueTagData = {}, // nodes are indexed while waiting for a server response for tag data

	jsonpHandler = {}, // holds jsonp callback functions index by the scriptid
	jsonpTimeout = {}, // holds jsonp timeout methods index by the scriptid

	userInfo = {}, // used to save information about a user when logged in
	userHash, // used to determine if the user session has changed when drawing gui
	userLogged = false,

	support = {}, // we will add support flags here later on
	hiddenImages = {}, // we are using an object literal because an array would be hard to remove multiple indexes at once
	stats = {}, // contains some general stats

	plib,
	pfunc,

	defaultSettings,
	settings,
	classes,
	directory,
	regex,
	messages,
	attributes,
	names,
	types,
	events,
	html,
	commonHTML,
	layout,
	css,
	serverKeys,

	document = window.document,
	protoString = Object.prototype.toString,
	//isIE = navigator.userAgent.indexOf('MSIE') !== -1,
	//isOpera = protoString.call(window.opera) === '[object Opera]',
	windowLocation = window.location.href,
	defaultView = document.defaultView,

	// {opendebug}
	consoleObject = window.console,
	consoleMethods = ['log', 'info', 'warn', 'error', 'time', 'timeEnd'], // methods used to call or apply to console object
	// {closedebug}



	cssPrefix = 'PIN_',
	tagPrefix = 'tagId_', // prefix used for the tags attribute id
	sysName = 'Pinup',
	ieEventPrefix = 'on',
	cssUnit = 'px',
	monetarySymbol = '$',
	whiteSpace = ' ',
	asterisk = '*',
	ellipsis = '...',

	webProtos = ['http://', 'https://'],
	defaultWebProto = webProtos[0],

	oNamespace = {

		root: sysName,
		json: 'jsonpHandler',

		globalVars: 'globalVars',
		settings: 'settings',
		defaultSettings: 'defaultSettings',
		user: 'user',

		lib: 'lib',
		fn: 'fn',

		images: 'images',
		nodes: 'nodes',
		tags: 'tags',
		events: 'events',
		elements: 'elements',

		// html5 localStorage keys
		checkSite: 'checkSite-',
		checkImage: 'checkImage-',

		// excanvas
		vmlCanvas: 'G_vmlCanvasManager'

	},

	opacities = {
		//none: 0,
		full: 1,
		semi: 0.3
	},

	keyCodes = {
		f2: 113,
		esc: 27,
		enter: 13,
		arrowLeft: 37,
		arrowRight: 39
	},

	splElmIds = {
		'window': 'GUID-window',
		'document': 'GUID-document'
	},

	strBool = {
		1: 'yes',
		0: 'no'
	},

	readyStates = {
		complete: 'complete',
		loaded: 'loaded'
	},


	// valid typeof results
	NULL_TYPE = 'null',
	UNDEFINED_TYPE = 'undefined',
	BOOLEAN_TYPE = 'boolean',
	NUMBER_TYPE = 'number',
	STRING_TYPE = 'string',
	OBJECT_TYPE = 'object',

	// our type method (lib.type) will return the previous types (valid typeof) as well as the following types (not valid typeof)
	ARRAY_TYPE = 'array',
	FUNCTION_TYPE = 'function',
	ELEMENT_TYPE = 'element',
	DATE_TYPE = 'date',

	BOOLEAN_CLASS = '[object Boolean]',
	NUMBER_CLASS = '[object Number]',
	STRING_CLASS = '[object String]',
	ARRAY_CLASS = '[object Array]',
	FUNCTION_CLASS = '[object Function]',
	DATE_CLASS = '[object Date]',




	nLastLoginCheck = 0, // used to determine last login attempt
	scrollMem; // used to keep track of scrolling events


// note: make sure to include protocols
directory = {
	names: {
		//getSettings: 'get_settings',
		getTags: 'get_tags',
		getTagSugg: 'get_tag_suggestion',
		register: 'register',
		login: 'login',
		logout: 'logout',
		forgot: 'forgot_pass',
		checkLogin: 'check_login',
		checkImage: 'check_image',
		checkSite: 'get_site_settings',
		// files that expect user authentication and will throw errors if no session is found
		tagCreate: 'tag_create',
		tagPosition: 'tag_position',
		tagRemove: 'tag_remove',
		logTagHover: 'log_tag_hover'
	},
	paths: {
		twitter: 'http://twitter.com/intent/tweet?',
		facebook: 'https://www.facebook.com/sharer.php?',
		gateway: 'http://local.jbull.ca/work/pinup/gateway/',
		cdn: 'http://local.jbull.ca/work/pinup/cdn/',
		website: 'http://local.jbull.ca/work/pinup/'
	}
};

directory.paths.webloc = directory.paths.gateway + 'webloc.php?u=';
directory.paths.hub = directory.paths.gateway + 'hub.php';
directory.paths.themes = directory.paths.cdn + 'frontend-themes/css/';
directory.paths.excanvas = directory.paths.cdn + 'global-js/excanvas.js';


defaultSettings = {

	nMinWidth: 250,
	nMinHeight: 200,
	jsonpTimeout: 30000, // jsonp timeout length in miliseconds // zero for no timeout // default is 30 seconds
	scrollDelay: 300, // how many miliseconds to wait after a scroll event before checking for unloaded images
	navAniSpeed: 250, // animation speed of the gui

	//imageBlacklist: [], // include references (id, src, HTMLImageElement) to images you wish to be rejected
	loadImages: [], // include references (id, src, HTMLImageElement) to images you wish to be loaded

	loadAll: false, // ignore classes and load all images
	smartLoad: true, // smart load will hold off on loading images until they are visible
	forceListen: false, // WARNING: only use this if images are being dynamically added into dom
	alwaysShowTags: true,
	cssHelper: true,
	posHelper: true, // turn off if affecting layout
	animations: true, // turn off animations to speed up (if needed)
	keyListener: true,

	onReady: function () {}, // when sys has finished getting ready, run this callback
	onLogout: function () {}, // when a user session has expired, run this callback
	onLogin: function () {}, // when a user session has been created, run this callback

	//theme: "default", // if a valid theme name is provided then load that theme
	themeFile: "", // if a valid theme file is provided then load that theme

	allowFile: "jpg|jpeg|png", // filter out any image that does not contain these file types
	allowThemeManager: false, // if true then check if theme files have loaded and load them if they are missing
	allowLocalStorage: false, // allow HTML5 local caching on some queries
	allowBottomLinks: false, // if true then include a link holder after the image with links to the tags placed in said image
	allowShare: true, // if true then show a little like thumbs up icon in the tooltip for social sharing options

	dotSize: 'medium', // choose between three sizes [small, medium, large]

	dotOutlineSize: 6, // size of tag dot outline from the edge of tag in pixels // set 0 for no outline

	canvas: {

		cornerRadius: 5,
		tailWidth: 19, // should be odd number
		tailHeight: 8, // can be even or odd

		stroke: false, // false = no stroke
		shadow: true, // false = no shadow

		theme: {
			// note: must have background :-) no toggle
			backgroundStyle: "radial", // radial or linear or solid
			backgroundColor: "0-#FFFFFF 1-#CCCCCC", // radial backgrounds follow this color structure ColorStop-ColorHex and are separated by a space
			strokeWidth: 1, // minimum value is 1.0
			strokeColor: "#000000",
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			shadowBlur: 5,
			shadowColor: "#000000"
		}

	},

	tooltip: true, // if false then no tooltip
	tooltipOrientation: "top", // can be [up, right, bottom, left]
	tooltipURL: true, // if false don't show the url in the tooltip

	altImageSrc: 'pinsrc', // attribute used to load alternative image sources
	activeParentClass: 'allpins', // CLASS USED TO INITIALIZE ALL CHILDREN IMAGES
	activeChildClass: 'pinimg', // CLASS USED TO INITIALIZE A SINGLE IMAGE

	// PER-IMAGE SETTINGS
	// key: reference to image
	// value: settings object
	custom: {}

};




classes = {

	docBody: cssPrefix + 'active',

	noAnimation: cssPrefix + 'noAnimation',
	noRgbaSupport: cssPrefix + 'noRgbaSupport',
	noBoxShadowSupport: cssPrefix + 'noBoxShadowSupport',
	noBorderRadiusSupport: cssPrefix + 'noBorderRadiusSupport',

	wrapper: cssPrefix + 'wrapper',

	lightbox: cssPrefix + 'lightbox',
	lightboxWindow: cssPrefix + 'lightboxWindow',
	lightboxOverlay: cssPrefix + 'lightboxOverlay',
	lightboxImage: cssPrefix + 'lightboxImage',
	lightboxImageHolder: cssPrefix + 'lightboxImageHolder',
	lightboxNav: cssPrefix + 'lightboxNav',
	lightboxShowLeft: cssPrefix + 'lightboxShowLeft',
	lightboxShowRight: cssPrefix + 'lightboxShowRight',
	lightboxNavIcon: cssPrefix + 'lightboxNavIcon',

	node: cssPrefix + 'node',
	inlineNode: cssPrefix + 'inlineNode',
	sectionBody: cssPrefix + 'sectionBody',
	sectionFooter: cssPrefix + 'sectionFooter',

	image: cssPrefix + 'image',
	overlay: cssPrefix + 'overlay',

	logo: cssPrefix + 'logo',

	button: cssPrefix + 'button',
	lastItem: cssPrefix + 'lastItem',
	noSelect: cssPrefix + 'noSelect',
	handOver: cssPrefix + 'handOver',
	handDrag: cssPrefix + 'handDrag',

	iconLabel: cssPrefix + 'iconLabel',

	guiLeftHolder: cssPrefix + 'guiLeftHolder',
	guiRightHolder: cssPrefix + 'guiRightHolder',
	guiBotL: cssPrefix + 'btnBotL',
	guiTopR: cssPrefix + 'btnTopR',

	btnCancel: cssPrefix + 'btnCancel',
	btnSettings: cssPrefix + 'btnSettings',
	btnAddnew: cssPrefix + 'btnAddTag',

	window: cssPrefix + 'window',
	windowOverlay: cssPrefix + 'windowOverlay',
	windowBackground: cssPrefix + 'windowBackground',
	windowClose: cssPrefix + 'windowBtnClose',
	windowBody: cssPrefix + 'windowBody',
	windowLogout: cssPrefix + 'windowLogout',
	windowUserName: cssPrefix + 'windowUserName',
	windowHeader: cssPrefix + 'header',
	windowTitle: cssPrefix + 'title',

	prompt: cssPrefix + 'prompt', // sub-wrapper for the window that gives special formatting to children
	promptMessage: cssPrefix + 'promptMessage',
	promptAccept: cssPrefix + 'promptAccept',
	promptDeny: cssPrefix + 'promptDeny',


	modalMsg: cssPrefix + 'modalMsg',

	focus: cssPrefix + 'focus',
	formStyle: cssPrefix + 'formStyle',
	formError: cssPrefix + 'formError',
	formDisabledMsg: cssPrefix + 'formDisabledMsg',
	formErrorRow: cssPrefix + 'formErrorRow',
	formLabel: cssPrefix + 'formLabel',
	formLabelSm: cssPrefix + 'formLabel-sm',
	formTextField: cssPrefix + 'textField',
	formTextArea: cssPrefix + 'textArea',
	formDropDown: cssPrefix + 'dropDown',
	formDropDownDiv: cssPrefix + 'dropDownDiv',
	formBtnSubmit: cssPrefix + 'formBtnSubmit',
	formBtnLeft: cssPrefix + 'formBtnLeft', // button is on left side not right

	formOptions: cssPrefix + 'options',
	formOption_forgotPass: cssPrefix + 'optForgotPass',
	formOption_backToLogin: cssPrefix + 'optBackToLogin',
	//formOption_SignUp: cssPrefix + 'optSignUp',
	formOption_register: cssPrefix + 'optRegister',

	tag: cssPrefix + 'tag',
	tagSmall: cssPrefix + 'tagSmall',
	tagMedium: cssPrefix + 'tagMedium',
	tagLarge: cssPrefix + 'tagLarge',
	tagHolder: cssPrefix + 'tagHolder',
	tagDot: cssPrefix + 'tagDot',
	tagOutline: cssPrefix + 'tagOutline',
	tagBubble: cssPrefix + 'tagBubble',
	tagBubbleContent: cssPrefix + 'tagBubbleContent',
	tagBubbleCanvas: cssPrefix + 'tagBubbleCanvas',
	tagBubbleButton: cssPrefix + 'tagBubbleButton',

	tagLink: cssPrefix + 'tagLink',
	tagLinkText: cssPrefix + 'tagLinkText',
	tagLinkURL: cssPrefix + 'tagLinkURL',
	tagLinkLike: cssPrefix + 'tagLinkLike',

	tagDirLeft: cssPrefix + 'tagDirL',
	tagDirRight: cssPrefix + 'tagDirR',

	link: cssPrefix + 'link',
	linkHolder: cssPrefix + 'linkHolder', // the link holder below the image used on intrusive level 2
	linkHolderBackground: cssPrefix + 'linkHolderBackground',
	linkPending: cssPrefix + 'linkPending',


	shareHolder: cssPrefix + 'shareHolder',
	shareHeader: cssPrefix + 'shareHeader',
	shareButtons: cssPrefix + 'shareButtons',
	shareButton: cssPrefix + 'shareButton',

	actionOn: cssPrefix + 'on',
	actionShowWin: cssPrefix + 'showWin',
	taggingMode: cssPrefix + 'taggingMode',
	repositionMode: cssPrefix + 'repositionMode',
	removalMode: cssPrefix + 'removalMode'

};

messages = {


	// {opendebug}

	// info
	noImages: sysName + ': No images have been found',
	imageLoaded: sysName + ': Image has loaded: %o',
	imageUnloaded: sysName + ': Image has been unloaded: %s',
	imageNewSrc: sysName + ': Image src "%s" was replaced with: "%s"',
	imageCount: sysName + ': We found %i images; %i of those have been loaded and %i of those have been denied',
	sysDestroyed: sysName + ': All instances have been removed',
	themeLoaded: sysName + ': The theme "%s" has loaded',
	excanvasRequest: sysName + ': Excanvas has been requested',
	excanvasReceived: sysName + ': Excanvas has been loaded then initialized and canvas is %s',

	// warnings
	noPubKey: sysName + ': Public key was not provided',
//	invalidPubKey: sysName + ': The provided public key is not valid for this domain',
	alreadyAlive: sysName + ': System already active',
	alreadyDead: sysName + ': System does not exist',
	badInstance: sysName + ': Image already contains a valid identifier',
	noInstance: sysName + ': Image does not contain a valid identifier',
	badTarget: sysName + ': Event target is undefined',
	noImage: sysName + ': Aborted due to faulty or non-existant image reference',
	inBlacklist: sysName + ': Image was rejected because it was found in the blacklist %o',
	imageTooSmall: sysName + ': Image was rejected because it did not meet the minimum size requirements: width(%spx/%spx) and height(%spx/%spx) %o',
	imageNoSrc: sysName + ': Image was rejected because it does not have a file source %o',
	imageBadFile: sysName + ': Image was rejected because of an unknown file type "%s" on %o',
	imageNotFound: sysName + ': Image has been removed from the document and will no longer be able to load %o',
	imageIgnoreSEO: sysName + ': Image was rejected because it appears to be a SEO pseudo tag %o',
	//imageInHeader: sysName + ': Image was rejected because it was found in a header tag %o',
	sysNotActive: sysName + ': Requested action not performed because the system is not active',
	eventDuplicate: sysName + ': Ignored duplicate event type "%s" on %o',
	settingDNF: sysName + ': Custom setting "%s" was not found',
	badType: sysName + ': Custom setting "%s" was ignored because of mismatched type (expected %s but found %s)',
//	noTheme: sysName + ': No theme found. The default theme was loaded',
	themeNotFound: sysName + ': The theme "%s" was not found. The default theme was loaded',

	// logs
	jsonp: sysName + ': JSONP CALL: %s',
	serverSet: sysName + ': Settings from server: %o',
	instOutput: sysName + ': Instance done: %o',

	// errors
	jsonpTimeout: sysName + ': JSONP call has timed out on script: %s',

	// time
	sysLoadTime: sysName + ': Load Time',

	// {closedebug}



	noResults: 'No results found.',
	loading: 'Loading' + ellipsis,
	leftNavWait: 'THINKING' + ellipsis,
	formWait: 'PLEASE WAIT' + ellipsis,

	// confirmations
	removeTag: 'Are you sure you wish to permanently delete this tag?',
	removeMultiTags: 'Are you sure you wish to permanently delete this tag? Caution: There are multiple links associated with this tag.',

	// forms
	missingReqInput: 'A REQUIRED FIELD IS EMPTY',
	invalidEmail: "EMAIL ADDRESS IS NOT VALID"



};

css = {

	display: 'display',
	margin: {
		top: 'marginTop',
		right: 'marginRight',
		bottom: 'marginBottom',
		left: 'marginLeft'
	},
	padding: {
		top: 'paddingTop',
		right: 'paddingRight',
		bottom: 'paddingBottom',
		left: 'paddingLeft'
	},
	width: 'width',
	height: 'height',
	maxWidth: 'maxWidth',
	maxHeight: 'maxHeight',
	top: 'top',
	right: 'right',
	bottom: 'bottom',
	left: 'left',
	visibility: 'visibility',
	opacity: 'opacity',
	filter: 'filter',
	zIndex: 'zIndex',
	cssFloat: 'float',
	position: 'position'

};

attributes = {

	// STANDARD

	id: 'id',
	className: 'class',
	style: 'style',
	src: 'src',
	href: 'href',
	rel: 'rel',
	//title: 'title',
	name: 'name',
	type: 'type',
	width: 'width',
	height: 'height',
	align: 'align',
	hspace: 'hspace',
	vspace: 'vspace',
	unselectable: 'unselectable',


	// FORM

	disabled: 'disabled',
	readonly: 'readonly',
	selected: 'selected',
	autoComplete: 'autocomplete',

	// TAGS

	tagGuid: 'taguid',
	tagMultiGuid: 'taguids',
	tagName: 'tagname',
	tagKeywords: 'keywords',
	tagWebLink: 'weblink',
	tagPosX: 'posx',
	tagPosY: 'posy',
	tagOwnerId: 'ownerid', // user id of the account that created the tag
	tagHover: 'taghover',

	fluidWidth: 'fluidwidth', // used for nav button position memory
	hiddenKey: 'hiddenkey', // used to keep track of unloaded images
	imgLoaded: 'loaded', // used to keep track of loaded images
	orgText: 'orgtext', // used to keep track of original button text when change them to alert the user of jsonp wait
	isVisible: 'isvis', // used to keep track of button visibility while toggling the gui
	guid: 'guid'



};

names = {

	// form names (also doubles as their ids)
	formRegister: cssPrefix + 'registerForm',
	formLogin: cssPrefix + 'loginForm',
	formForgot: cssPrefix + 'formForgot',
	formCreate: cssPrefix + 'newTagForm',
	formSettings: cssPrefix + 'formSettings',

	// FORM ELEMENT NAMES

	strFullName: 'strFullName',
	strUsername: 'strUsername',
	strPassword: 'strPassword',
	strConfirmPass: 'strConfirmPass',
	strWebName: 'strWebName',
	strWebURL: 'strWebURL',

	nTagID: 'nTagID',
	strWebReferer: 'strWebReferer',
	strImageURL: 'strImageURL',
	strTagName: 'strTagName',
	strKeywords: 'strKeywords',
	strWebLink: 'strWebLink',
	nPosX: 'nPosX',
	nPosY: 'nPosY',
	strComments: 'strComments',

	btnRepositionTags: 'btnRepositionTags',
	btnRemoveTags: 'btnRemoveTags',
	btnOpenLightbox: 'btnOpenLightbox'


};

types = {

	// buttons
	button: 'button',
	submit: 'submit',

	// inputs
	text: 'text',
	password: 'password',
	hidden: 'hidden',

	// other
	jstxt: 'text/javascript',
	csstxt: 'text/css'

};

events = {

	submit: 'submit',
	scroll: 'scroll',
	click: 'click',
	load: 'load',
	unload: 'unload',
	keyup: 'keyup',
	focus: 'focus',
	blur: 'blur',
	change: 'change',
	
	mouseover: 'mouseover',
	mouseout: 'mouseout',
	mousedown: 'mousedown',
	mouseup: 'mouseup',
	mousemove: 'mousemove',
	
	touchstart: 'touchstart',
	touchend: 'touchend',

	selectstart: 'selectstart',
	readystatechange: 'readystatechange',
	domcontentloaded: 'domcontentloaded'

};

html = {

	script: 'script',
	link: 'link',
	head: 'head',
	body: 'body',
	//iframe: 'iframe',
	h2: 'h2',
	p: 'p',
	a: 'a',
	br: 'br',
	em: 'em',
	ol: 'ol',
	li: 'li',
	strong: 'strong',
	img: 'img',
	div: 'div',
	span: 'span',
	form: 'form',
	input: 'input',
	select: 'select',
	option: 'option',
	textarea: 'textarea',
	label: 'label',
	button: 'button',
	//header: 'header',
	canvas: 'canvas'


};

serverKeys = {
	
	// USER INFO
	user: {
		guid: 'guid',
		tagTotal: 'tagTotal',
		fullName: 'fullName',
		isOwner: 'isOwner'
	},

	// TAG INFO
	tags: {
		guid: 'strGUID',
		name: 'strTagName',
		imagePath: 'strImageURL',
		posX: 'nPosX',
		posY: 'nPosY',
		keywords: 'arrKeywords',
		webLink: 'strWebLink',
		ownerGuid: 'nTaggerAccountsID'
	}

};

regex = {

	// split on spaces and commas
	csv: /[\s,]+/,
	// strip all spaces
	ss: /\s/g,
	// remove spaces from begining of string
	ltrim: /^\s\s*/,
	// remove spaces from end of string
	rtrim: /\s\s*$/,
	// used to parse web urls
	purl: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
	// used to parse web url get parameters
	query: /(?:^|&)([^&=]*)=?([^&]*)/g,
	// strip all but numbers and period and minus symbol
	nump: /[^0-9\.\-]+/g,
	// used to camelize
	camel: /-+(.) ?/g,
	// used to remove trailing slashes
	tslash: /\/$/g,
	// used to grab file extensions
	fext: /[^.]+$/,
	// used in support test of opacity
	opacity: /^0.55$/,
	// used to detect mobile browsers
	mobile: /android|webos|iphone|ipad|ipod|blackberry/i
};



globalVars.availableThemes = {
	'default': 825248,
	'launch': 469725,
	'virgin': 979253
};

globalVars.availableDotSizes = {
	'small': classes.tagSmall,
	'medium': classes.tagMedium,
	'large': classes.tagLarge
};

globalVars.tooltipOrientations = {
	top: 'top',
	right: 'right',
	bottom: 'bottom',
	left: 'left'
};

globalVars.canvasDrawStyles = {
	radial: 'radial',
	linear: 'linear',
	solid: 'solid'
};





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



commonHTML = {

	buildForm: function (strFormName, arrNodes, strSubmitText) {

		var oFormAttr = {};

		arrNodes = [{
			nodeName: html.div,
			className: classes.formError
		}].concat(arrNodes);

		// add a submit button if defined
		if (!plib.isUndefined(strSubmitText)) {
			arrNodes = arrNodes.concat([commonHTML.buildButton(strSubmitText)]);
		}

		oFormAttr[attributes.name] = strFormName;

		return [{
			nodeName: html.form,
			id: strFormName,
			className: classes.formStyle,
			attr: oFormAttr,
			childNodes: arrNodes
		}];
	},

	buildFormInput: function (strType, strName) {
		return {
			nodeName: html.input,
			attr: {
				type: strType,
				name: strName,
				autocomplete: 'off'
			}
		};
	},

	buildFormTextArea: function (strName) {
		return {
			nodeName: html.textarea,
			attr: {
				name: strName
			}
		};
	},

	buildFormSelect: function (strName, arrOptions) {
		var arrNodes = [];
		plib.loopObject(arrOptions, function (prop, val) {
			arrNodes.push({
				nodeName: html.option,
				attr: {
					value: prop
				},
				text: val
			});
		});
		return {
			nodeName: html.select,
			attr: {
				name: strName
			},
			childNodes: arrNodes
		};
	},

	buildFormLabelSm: function (strLabel, oNode) {
		return commonHTML.buildFormLabel(strLabel, oNode, true);
	},

	buildFormLabel: function (strLabel, oNode, small) {
		var arrLabelTypes = {},
			className = small ? classes.formLabelSm : classes.formLabel;
		arrLabelTypes[html.input] = classes.formTextField;
		arrLabelTypes[html.textarea] = classes.formTextArea;
		arrLabelTypes[html.select] = classes.formDropDown;
		return {
			nodeName: html.label,
			className: className + whiteSpace + arrLabelTypes[oNode.nodeName],
			text: strLabel + ':' + whiteSpace,
			childNodes: [{
				nodeName: html.span,
				childNodes: [oNode]
			}]
		};
	},

	buildHeader: function (strWindowTitle) {
		return {
			nodeName: html.div,
			className: classes.windowHeader,
			childNodes: [{
				nodeName: html.a,
				className: classes.logo,
				text: sysName,
				attr: {
					href: directory.paths.website
				}
			}, {
				nodeName: html.h2,
				className: classes.windowTitle,
				text: strWindowTitle
			}]
		};
	},

	buildButton: function (strButtonText, properties) {

		var strBtnClass = classes.formBtnSubmit,
			oBtnAttr = {
				type: types.button
			};

		if (properties) {

			if (plib.isFunction(properties)) {
				properties = properties.call();
			}

			if (plib.hasProperty(properties, attributes.className)) {
				strBtnClass = strBtnClass + whiteSpace + properties[attributes.className];
				delete properties[attributes.className];
			}

			if (!plib.isObjectEmpty(properties)) {
				plib.mergeObject(oBtnAttr, properties);
			}

		}

		return {
			nodeName: html.button,
			className: strBtnClass,
			childNodes: [{
				nodeName: html.span,
				childNodes: [{
					nodeName: html.span,
					text: strButtonText
				}]
			}],
			attr: oBtnAttr
		};

	},

	backToLogin: {
		nodeName: html.div,
		className: classes.formOptions,
		childNodes: [{
			nodeName: html.span,
			className: classes.formOption_backToLogin,
			text: 'Back to Login'
		}]
	},

	logoutTab: [{
		nodeName: html.span,
		className: classes.windowLogout,
		text: 'LOGOUT'
	}, {
		nodeName: html.span,
		className: classes.windowUserName
	}],

	buildModal: function (strHeader, arrNodes) {
		arrNodes = [{
			nodeName: html.a,
			className: classes.logo,
			attr: {
				href: directory.paths.website
			},
			text: sysName
		}, {
			nodeName: html.h2,
			text: strHeader
		}].concat(arrNodes);
		return {
			nodeName: html.div,
			className: classes.modalMsg,
			childNodes: arrNodes
		};
	},

	simpleAdd: function (strNodeType, strNodeText) {
		return {
			nodeName: strNodeType,
			text: strNodeText
		};
	}

};

layout = {

	formTagCreate: commonHTML.buildForm(names.formCreate, commonHTML.logoutTab.concat([
		commonHTML.buildHeader('ADD NEW TAG'),
		commonHTML.buildFormInput(types.hidden, names.strWebReferer),
		commonHTML.buildFormInput(types.hidden, names.strImageURL),
		commonHTML.buildFormInput(types.hidden, names.nPosX),
		commonHTML.buildFormInput(types.hidden, names.nPosY),
		commonHTML.buildFormLabel('Tag name', commonHTML.buildFormInput(types.text, names.strTagName)),
		commonHTML.buildFormLabel('Keywords', commonHTML.buildFormInput(types.text, names.strKeywords)),
		commonHTML.buildFormLabel('Destination url', commonHTML.buildFormInput(types.text, names.strWebLink))
	]), 'SAVE & PUBLISH TAG'),

	formRegister: commonHTML.buildForm(names.formRegister, [
		commonHTML.buildHeader('ACCOUNT REGISTRATION'),
		commonHTML.buildFormLabel('Full Name', commonHTML.buildFormInput(types.text, names.strFullName)),
		commonHTML.buildFormLabel('E-mail', commonHTML.buildFormInput(types.text, names.strUsername)),
		commonHTML.buildFormLabel('Password', commonHTML.buildFormInput(types.password, names.strPassword)),
		commonHTML.buildFormLabel('Confirm Pass', commonHTML.buildFormInput(types.password, names.strConfirmPass)),
		commonHTML.buildHeader('SITE REGISTRATION'),
		commonHTML.simpleAdd(html.p, 'For ' + sysName + ' to work securely, it requires users to link their website to their account. Please provide us with some basic information about your website.'),
		commonHTML.buildFormLabel('Website Name', commonHTML.buildFormInput(types.text, names.strWebName)),
		commonHTML.buildFormLabel('Website Domain', commonHTML.buildFormInput(types.text, names.strWebURL)),
		commonHTML.backToLogin
	], 'REGISTER'),

	formLogin: commonHTML.buildForm(names.formLogin, [
		commonHTML.buildHeader('ACCOUNT LOGIN'),
		commonHTML.buildFormLabel('E-mail', commonHTML.buildFormInput(types.text, names.strUsername)),
		commonHTML.buildFormLabel('Password', commonHTML.buildFormInput(types.password, names.strPassword)),
		{
			nodeName: html.div,
			className: classes.formOptions,
			childNodes: [{
				nodeName: html.span,
				className: classes.formOption_forgotPass,
				text: 'Forgot your password?'
			}, {
				nodeName: html.span,
				className: classes.formOption_register,
				text: 'Sign Up'
			}]
		}
	], 'LOGIN'),

	formForgot: commonHTML.buildForm(names.formForgot, [
		commonHTML.buildHeader('FORGOT PASSWORD'),
		commonHTML.buildFormLabel('E-mail', commonHTML.buildFormInput(types.text, names.strUsername)),
		commonHTML.backToLogin
	], 'RETRIEVE PASSWORD'),

	formSettings: commonHTML.buildForm(names.formSettings, commonHTML.logoutTab.concat([
		commonHTML.buildHeader('UPDATE SETTINGS'),
		commonHTML.simpleAdd(html.p, 'This form allows administrators to change how ' + sysName + ' interacts with images. This form is not accessible to the public.'),
		commonHTML.buildButton("REPOSITION TAGS", function () {
			var objAttributes = {};
			objAttributes[attributes.className] = classes.formBtnLeft;
			objAttributes[attributes.name] = names.btnRepositionTags;
			return objAttributes;
		}),
		commonHTML.buildButton("REMOVE TAGS", function () {
			var objAttributes = {};
			objAttributes[attributes.className] = classes.formBtnLeft;
			objAttributes[attributes.name] = names.btnRemoveTags;
			return objAttributes;
		}),
		commonHTML.buildButton("OPEN IMAGES IN LIGHTBOX", function () {
			var objAttributes = {};
			objAttributes[attributes.className] = classes.formBtnLeft;
			objAttributes[attributes.name] = names.btnOpenLightbox;
			return objAttributes;
		})
	])),

	msgTagDeleted: commonHTML.buildModal('This tag has been deleted.', [
		commonHTML.simpleAdd(html.p, 'Note: because you are either the owner of the image, or the tags creator, you are able to delete it whereas the public would only be able to report.')
	]),

	msgForgot: commonHTML.buildModal('You have requested a new password.', [
		commonHTML.simpleAdd(html.p, 'A new password has been generated and sent to your email address. We recommend that you change it asap!')
	]),
	
	msgRegistered: commonHTML.buildModal('Registration was successful.', [
		commonHTML.simpleAdd(html.p, 'You have just created your account! Easy right? However there is one last step: your email needs to be authenticated. Please check your inbox for a confirmation email. If you do not receive an email within the hour, please contact our support team.')
	]),

	msgNoPermission: commonHTML.buildModal('You do not have sufficient permission.', [
		commonHTML.simpleAdd(html.p, 'The owner of this website has requested your account not be able to add or request tags. Please contact the site owner for more information.')
	]),

	msgImageDisabled: commonHTML.buildModal('This image has been disabled.', [
		commonHTML.simpleAdd(html.p, 'The ' + sysName + ' interface will no longer show on this image. If you wish the enable the interface, you can do so in the settings window.')
	]),

	msgImageEnabled: commonHTML.buildModal('This image has been enabled.', [
		commonHTML.simpleAdd(html.p, 'The ' + sysName + ' interface will now show on this image. If you wish the disabled the interface, you can do so in the settings window.')
	]),

	msgFirstTag: commonHTML.buildModal('This appears to be your first tag!', [
		commonHTML.simpleAdd(html.p, 'Luckily for you, we have made it as easy as possible. Here are some simple instructions to get you started.'),
		{
			nodeName: html.ol,
			childNodes: [{
				nodeName: html.li,
				text: 'Click on the image where you would like the tag to appear.'
			}, {
				nodeName: html.li,
				text: 'A popup form will obtain some information relevant to the tag.'
			}, {
				nodeName: html.li,
				text: 'Click save and you\'re off to the races.'
			}]
		},
		commonHTML.buildButton("GREAT, LET'S GET STARTED")
	]),
	
	/*
	msgError: commonHTML.buildModal('#@$!*&%', [
		commonHTML.simpleAdd(html.p, 'Looks like we had trouble executing the requested task.')
	]),
	*/

	confirmPrompt: {
		nodeName: html.div,
		className: classes.prompt,
		childNodes: [
			commonHTML.buildHeader("PLEASE CONFIRM"),
			{
				nodeName: html.p,
				className: classes.promptMessage
			},
			commonHTML.buildButton("YES I DO", { "class": classes.promptAccept }),
			commonHTML.buildButton("NO THANKS", { "class": classes.promptDeny })
		]
	}

};

/** @constructor */
function PinUi(PinInst) {

	this.scope = PinInst;
	this.hasUi = false; // used to check gui status when updating the gui (ie: dont create if exist, dont destroy if not exist)
	this.isHidden = false; // used to keep tack of current node toggle status
	this.allowPrivateInterfaces = false; // if true then only show public user interface items (ones that dont require you to login)

	this.offsetLeft = 0; // used to determine how far a left nav button slides out from left
	this.offsetRight = 0; // used to determine how far a left nav button slides out from right

	// WE USE AN ARRAY BECAUSE ORDER IS IMPORTANT
	this.leftNavItems = [{
		className: classes.btnAddnew,
		label: 'ADD NEW TAG',
		isPrivate: true,
		//namespace: 'btnAddNew',
		event: function (ui, button) {
			var action = function () {
					// is this the users first tag? if so then provide some instruction
					if (userInfo[serverKeys.user.tagTotal] === 0) {
						pfunc.openWindow(layout.msgFirstTag, function () {
							plib.click(plib.getElementsByClassName(classes.formBtnSubmit, this)[0], function () {
								pfunc.closeWindow();
								ui.scope.startTaggingMode(ui.scope.methodAddNewTag);
							});
						});
					} else {
						ui.scope.startTaggingMode(ui.scope.methodAddNewTag);
					}
				};
			// set button label to show as busy while we wait for jsonp
			pfunc.waitButton(button, messages.leftNavWait);
			pfunc.checkLogin(action, function () { // LOGIN TEST FAILED
				pfunc.promptLogin(action);
			}, function () { // NEUTRAL CALLBACK
				// set button label back to original text regardless of login check success or failure
				pfunc.unwaitButton(button);
			});
		}
	}];



}



PinUi.prototype = {

	init: function () {


		var ui = this,
			guiLeftHolder = plib.domAppend(html.div, ui.scope.privateElements.imgOverlay, { 'class': classes.guiLeftHolder }),
			guiRightHolder = plib.domAppend(html.div, ui.scope.privateElements.imgOverlay, { 'class': classes.guiRightHolder }),
			btnCancel = plib.domAppend(html.span, guiRightHolder, { 'class': classes.guiTopR + whiteSpace + classes.btnCancel });




		ui.offsetLeft = plib.getWidth(guiLeftHolder) - Math.abs(plib.getStyle(guiLeftHolder, css.left));
		ui.offsetRight = 10;



		plib.disableSelection(btnCancel);


		// HOVER ANIMATION OVER
		plib.addEvent(btnCancel, events.mouseover, function () {
			if (settings.animations) {
				plib.animate(guiRightHolder, css.right, 0, settings.navAniSpeed);
			} else {
				plib.setStyle(guiRightHolder, css.right, 0);
			}
		});

		// HOVER ANIMATION OUT
		plib.addEvent(btnCancel, events.mouseout, function () {
			if (settings.animations) {
				plib.animate(guiRightHolder, css.right, -ui.offsetRight, settings.navAniSpeed);
			} else {
				plib.setStyle(guiRightHolder, css.right, -ui.offsetRight);
			}
		});


		ui.scope.privateElements.guiLeftHolder = guiLeftHolder;
		ui.scope.privateElements.guiRightHolder = guiRightHolder;
		ui.scope.privateElements.btnCancel = btnCancel;

	},

	ownerInit: function () {

		var ui = this,
			btnSettings = plib.domAppend(html.span, ui.scope.privateElements.imgOverlay, { 'class': classes.btnSettings });


		plib.setAlpha(btnSettings, opacities.semi);

		plib.addEvent(btnSettings, events.mouseover, function () {
			if (settings.animations) {
				plib.fadeTo(btnSettings, opacities.full, settings.navAniSpeed);
			} else {
				plib.setAlpha(btnSettings, opacities.full);
			}
		});

		plib.addEvent(btnSettings, events.mouseout, function () {
			if (settings.animations) {
				plib.fadeTo(btnSettings, opacities.semi, settings.navAniSpeed);
			} else {
				plib.setAlpha(btnSettings, opacities.semi);
			}
		});

		plib.click(btnSettings, function () {
			pfunc.promptSettings(ui.scope.image);
		});

		ui.scope.privateElements.btnSettings = btnSettings;

	},

	check: function () {

		var ui = this;

		ui.allowPrivateInterfaces = ui.hasOwnerPrivileges();

		// if our gui was destroyed (or we never had one) then go ahead and build some
		if (!ui.hasUi) { ui.build(); }

	},

	build: function () {

		var ui = this;


		// this needs to be visible to get an accurate fluid width of its children
		// plib.show(ui.scope.privateElements.guiLeftHolder);

		// INSERT LEFT NAV BUTTONS INTO DOM
		plib.loopArray(ui.leftNavItems, function (value) {


			// dont allow private nav items to be added if we only allow public nav items
			if (value.isPrivate && !ui.allowPrivateInterfaces) { return; }

			var elmNavButton = plib.domAppend(html.span, ui.scope.privateElements.guiLeftHolder, {
				'class': classes.guiBotL + whiteSpace + value.className
			}, value.label);

			plib.disableSelection(elmNavButton);
			pfunc.setFluidWidth(elmNavButton);

			// HOVER ANIMATION OVER
			plib.addEvent(elmNavButton, events.mouseover, function () {
				var offsetLeft = plib.attribute(this, attributes.fluidWidth) - ui.offsetLeft + 5;
				if (settings.animations) {
					plib.animate(this, css.left, offsetLeft, settings.navAniSpeed);
				} else {
					plib.setStyle(this, css.left, offsetLeft);
				}
			});

			// HOVER ANIMATION OUT
			plib.addEvent(elmNavButton, events.mouseout, function () {
				if (settings.animations) {
					plib.animate(this, css.left, 0, settings.navAniSpeed);
				} else {
					plib.setStyle(this, css.left, 0);
				}
			});

			plib.click(elmNavButton, function () {
				value.event(ui, elmNavButton);
			});

			//ui.scope.privateElements[value.namespace] = elmNavButton;


		});

		if (ui.allowPrivateInterfaces) {
			ui.ownerInit();
		}


		ui.hasUi = true;

	},

	destroy: function () {

		var ui = this,
			existingGuiLeft = plib.getElementsByClassName(classes.guiBotL, ui.scope.privateElements.guiLeftHolder);

		if (existingGuiLeft.length > 0) {
			plib.loopArray(existingGuiLeft, function (value) {
				plib.removeElement(value);
			});
		}

		if (ui.scope.privateElements.btnSettings) {
			plib.removeElement(ui.scope.privateElements.btnSettings);
		}



		ui.hasUi = false;

	},


	/*
	@param {string} text The desired button label
	@param {function} callback An event to be fired once the cancel button was pressed
	*/
	enableCancelMode: function (text, callback) {

		var ui = this,
			guiRightHolder = ui.scope.privateElements.guiRightHolder,
			btnCancel = ui.scope.privateElements.btnCancel,
			cancelAction = function () {
				ui.disableCancelMode(callback);
			};


		// listen for escape mode triggers
		plib.click(btnCancel, cancelAction);
		pfunc.newKeyListener(keyCodes.esc, ui.scope.pinUID, cancelAction);

		plib.textContent(btnCancel, text);

		// show cancel button
		plib.show(guiRightHolder);
		if (settings.animations) {
			plib.animate(guiRightHolder, css.right, -ui.offsetRight, settings.navAniSpeed);
		}

	},

	/*
	@param {function} callback An event to be fired once the cancel mode has ended
	*/
	disableCancelMode: function (callback) {

		var ui = this,
			guiRightHolder = ui.scope.privateElements.guiRightHolder,
			btnCancel = ui.scope.privateElements.btnCancel,
			eventHolder;

		// remove all escape mode triggers
		plib.removeEvent(btnCancel, events.click);
		pfunc.removeKeyListener(keyCodes.esc, ui.scope.pinUID);

		if (settings.animations) {
			eventHolder = pfunc.deactivateEvents(btnCancel, [events.mouseover, events.mouseout]);
			plib.animate(guiRightHolder, css.right, -plib.getWidth(guiRightHolder), settings.navAniSpeed, function () {
				pfunc.activateEvents(btnCancel, eventHolder);
				plib.hide(guiRightHolder);
				plib.removeChildren(btnCancel);
			});
		} else {
			plib.hide(guiRightHolder);
			plib.removeChildren(btnCancel);
		}

		if (callback) { callback.call(); }

	},

	drawTooltip: function (canvas, properties) {
		
		var ctx,

			cornerRadius = properties.cornerRadius, // corner radius
			pointerWidth = properties.pointerWidth, // pointer width
			pointerHeight = properties.pointerHeight, // pointer height
			canvasPadding = properties.canvasPadding, // canvas padding

			halfPixel = properties.halfPixel, // draw on half pixel

			canvasWidth = properties.width,
			canvasHeight = properties.height,

			bubbleWidth = properties.width - (canvasPadding * 2) - (halfPixel * 2),
			bubbleHeight = properties.height - (canvasPadding * 2) - (halfPixel * 2),
			bubbleFill, // the color of the tooltip background [solid, radial, linear]

			orientation = properties.orientation,

			pointerPos, // depending on orientation, this is the tooltip center offset in pixels

			verticalOffset = (orientation === globalVars.tooltipOrientations.bottom) ? pointerHeight : 0, // adjust the vertical offset when upside down to compensate for the pointer height
			horizontalOffset = (orientation === globalVars.tooltipOrientations.right) ? pointerWidth : 0, // adjust the vertical offset when upside down to compensate for the pointer height

			radial = function (deg) {
				return (Math.PI / 180) * deg;
			},

			// POINTER OFFSET VALUES: later we may set these as zero when needed (insufficient pointer space)
			pointerOffset = {
				top: pointerHeight / 2,
				right: pointerWidth / 2,
				bottom: pointerHeight / 2,
				left: pointerWidth / 2
			},

			corners = {
				topLeft: true,
				topRight: true,
				bottomLeft: true,
				bottomRight: true
			};

		if (orientation === globalVars.tooltipOrientations.top || orientation === globalVars.tooltipOrientations.bottom) { // VERTICAL

			pointerPos = bubbleWidth / 2; // pointer offset from left
			canvasHeight += pointerHeight; // add some extra room for the vertical tail

			// LABEL IS TOUCHING LEFT SIDE
			if (properties.offsetLeft < (canvasWidth / 2)) {

				pointerPos = properties.offsetLeft - canvasPadding;
				// not enough room for the pointer?
				if (properties.offsetLeft - canvasPadding - cornerRadius < (pointerWidth / 2)) {
					pointerOffset.left = 0;
					corners.topLeft = (orientation === globalVars.tooltipOrientations.bottom) ? false : true;
					corners.bottomLeft = (orientation === globalVars.tooltipOrientations.top) ? false : true;
				}

			// LABEL IS TOUCHING RIGHT SIDE
			} else if (properties.offsetRight < (canvasWidth / 2)) {

				pointerPos = canvasWidth - properties.offsetRight - canvasPadding;
				// not enough room for the pointer?
				if (properties.offsetRight - canvasPadding - cornerRadius < (pointerWidth / 2)) {
					pointerOffset.right = 0;
					corners.topRight = (orientation === globalVars.tooltipOrientations.bottom) ? false : true;
					corners.bottomRight = (orientation === globalVars.tooltipOrientations.top) ? false : true;
				}

			}

		} else if (orientation === globalVars.tooltipOrientations.left || orientation === globalVars.tooltipOrientations.right) { // HORIZONTAL

			pointerPos = bubbleHeight / 2; // pointer offset from top
			canvasWidth += pointerWidth; // add some extra room for the horizontal tail

		}

		if (cornerRadius <= 0) {
			corners.topLeft = false;
			corners.topRight = false;
			corners.bottomLeft = false;
			corners.bottomRight = false;
		}

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		plib.setWidth(canvas, canvasWidth);
		plib.setHeight(canvas, canvasHeight);

		ctx = pfunc.getCanvasContext(canvas, "2d");

		ctx.translate(canvasPadding + horizontalOffset + halfPixel, canvasPadding + verticalOffset + halfPixel);
		ctx.beginPath();

		// CORNER TOP LEFT
		if (corners.topLeft) {
			ctx.moveTo(0, cornerRadius);
			ctx.arc(cornerRadius, cornerRadius, cornerRadius, radial(180), radial(270), false); // top left corner
		} else {
			ctx.moveTo(0, 0);
		}

		// POINTER ON TOP
		if (orientation === globalVars.tooltipOrientations.bottom) {
			ctx.lineTo(pointerPos - pointerOffset.left, 0);
			ctx.lineTo(pointerPos, -pointerHeight);
			ctx.lineTo(pointerPos + pointerOffset.right, 0);
		}

		// CORNER TOP RIGHT
		if (corners.topRight) {
			ctx.lineTo(bubbleWidth - cornerRadius, 0);
			ctx.arc(bubbleWidth - cornerRadius, cornerRadius, cornerRadius, radial(270), radial(0), false); // top right corner
		} else {
			ctx.lineTo(bubbleWidth, 0);
		}

		// POINTER ON RIGHT
		if (orientation === globalVars.tooltipOrientations.left) {
			ctx.lineTo(bubbleWidth, pointerPos - pointerOffset.top);
			ctx.lineTo(bubbleWidth + pointerWidth, pointerPos);
			ctx.lineTo(bubbleWidth, pointerPos + pointerOffset.bottom);
		}

		// CORNER BOTTOM RIGHT
		if (corners.bottomRight) {
			ctx.lineTo(bubbleWidth, bubbleHeight - cornerRadius);
			ctx.arc(bubbleWidth - cornerRadius, bubbleHeight - cornerRadius, cornerRadius, radial(0), radial(90), false); // bottom right corner
		} else {
			ctx.lineTo(bubbleWidth, bubbleHeight);
		}

		// POINTER ON BOTTOM
		if (orientation === globalVars.tooltipOrientations.top) {
			ctx.lineTo(pointerPos + pointerOffset.right, bubbleHeight);
			ctx.lineTo(pointerPos, bubbleHeight + pointerHeight);
			ctx.lineTo(pointerPos - pointerOffset.left, bubbleHeight);
		}

		// CORNER BOTTOM LEFT
		if (corners.bottomLeft) {
			ctx.arc(cornerRadius, bubbleHeight - cornerRadius, cornerRadius, radial(90), radial(180), false); // bottom left corner
		} else {
			ctx.lineTo(0, bubbleHeight);
		}

		// POINTER ON LEFT
		if (orientation === globalVars.tooltipOrientations.right) {
			ctx.lineTo(0, pointerPos + pointerOffset.bottom);
			ctx.lineTo(-pointerWidth, pointerPos);
			ctx.lineTo(0, pointerPos - pointerOffset.top);
		}

		ctx.closePath();

		// BUBBLE SHADOW
		if (properties.allowShadow) {
			// note: current revision (r3) of excanvas does not support shadow methods
			ctx.shadowColor = properties.theme.shadowColor;
			ctx.shadowOffsetX = properties.theme.shadowOffsetX;
			ctx.shadowOffsetY = properties.theme.shadowOffsetY;
			ctx.shadowBlur = properties.theme.shadowBlur;
		}

		// BUBBLE BACKGROUND
		if (properties.theme.backgroundStyle === globalVars.canvasDrawStyles.radial) {
			
			bubbleFill = ctx.createRadialGradient(bubbleWidth / 2, bubbleHeight / 2, 0, bubbleWidth / 2, bubbleHeight / 2,
				// fill radius: tall or wide
				(bubbleWidth > bubbleHeight) ? bubbleWidth : bubbleHeight);
			plib.loopArray(properties.theme.backgroundColor.split(" "), function (value) {
				var colorInfo = value.split("-");
				bubbleFill.addColorStop(colorInfo[0], colorInfo[1]);
			});
		} else if (properties.theme.backgroundStyle === globalVars.canvasDrawStyles.linear) {
			bubbleFill = ctx.createLinearGradient(bubbleWidth / 2, 0, bubbleWidth / 2, bubbleHeight);
			plib.loopArray(properties.theme.backgroundColor.split(" "), function (value) {
				var colorInfo = value.split("-");
				bubbleFill.addColorStop(colorInfo[0], colorInfo[1]);
			});
		} else if (properties.theme.backgroundStyle === globalVars.canvasDrawStyles.solid) {
			bubbleFill = properties.theme.backgroundColor;
		}

		ctx.fillStyle = bubbleFill;
		ctx.fill();

		// BUBBLE STROKE
		if (properties.allowStroke) {

			// we dont want shadows on our stroke
			if (properties.allowShadow) {
				ctx.shadowColor = null;
				ctx.shadowOffsetX = null;
				ctx.shadowOffsetY = null;
				ctx.shadowBlur = null;
			}

			ctx.strokeStyle = properties.theme.strokeColor;
			ctx.lineWidth = properties.theme.strokeWidth;
			ctx.stroke();
		}




	},

	hasOwnerPrivileges: function () {
		return !!userInfo[serverKeys.user.isOwner];
	},

	show: function (bAnimate) {


		var ui = this,
			guiLeftHolder = ui.scope.privateElements.guiLeftHolder,
			btnSettings = ui.scope.privateElements.btnSettings,
			nLeftPosition = ui.offsetLeft - plib.getWidth(guiLeftHolder);

		ui.isHidden = false;
		bAnimate = bAnimate || true;

		if (settings.animations && bAnimate) {
			plib.show(guiLeftHolder);
			plib.animate(guiLeftHolder, css.left, nLeftPosition, settings.navAniSpeed);
			if (btnSettings) {
				plib.show(btnSettings);
				plib.fadeTo(btnSettings, opacities.semi, settings.navAniSpeed);
			}
		} else {
			plib.setStyle(guiLeftHolder, css.left, nLeftPosition);
			if (btnSettings) {
				plib.show(btnSettings);
			}
		}

	},

	hide: function (bAnimate) {

		var ui = this,
			guiLeftHolder = ui.scope.privateElements.guiLeftHolder,
			btnSettings = ui.scope.privateElements.btnSettings,
			nLeftPosition = -plib.getWidth(guiLeftHolder),
			eventHolder = [];

		ui.isHidden = true;
		bAnimate = bAnimate || true;

		if (settings.animations && bAnimate) {

			if (btnSettings) {
				eventHolder[0] = pfunc.deactivateEvents(btnSettings, [events.mouseover, events.mouseout]);
				plib.fadeOut(btnSettings, settings.navAniSpeed, function () {
					pfunc.activateEvents(btnSettings, eventHolder[0]);
					plib.hide(btnSettings);
				});
			}

			eventHolder[1] = pfunc.deactivateEvents(guiLeftHolder, [events.mouseover, events.mouseout]);
			plib.animate(guiLeftHolder, css.left, nLeftPosition, settings.navAniSpeed, function () {
				pfunc.activateEvents(guiLeftHolder, eventHolder[1]);
				plib.hide(guiLeftHolder);
			});

			// loop over left nav buttons and make sure they are flush left
			// a button when hovered upon, will be exposed if this method is run
			plib.loopArray(guiLeftHolder.children, function (value) {
				var len = eventHolder.length++;
				eventHolder[len] = pfunc.deactivateEvents(value, [events.mouseover, events.mouseout]);
				plib.animate(value, css.left, 0, settings.navAniSpeed, function () {
					pfunc.activateEvents(value, eventHolder[len]);
				});
			});

		} else {
			plib.setStyle(guiLeftHolder, css.left, nLeftPosition);
			if (btnSettings) {
				plib.hide(btnSettings);
			}
		}

	},

	toggle: function (bAnimate) {

		if (this.isHidden) {
			this.show(bAnimate);
		} else {
			this.hide(bAnimate);
		}

	}



};




/** @constructor */
function PinInst(image, uid) {


	// give our instance a unique ID in which we use to reference our node
	this.uid = uid;
	// this is the image element nested in our node
	this.image = image;
	// if a special `pinsrc` attribute is provided then use it to get tags instead
	// note: the `pinsrc` attribute must be an absolute url
	// note: we grab the `src` property because it will always be an absolute url whereas the 'src' attribute may be relative
	// example: src attribute: ../images/flower.jpg
	// example: src property: http://www.domain.com/images/flower.jpg
	this.imageSrc = plib.attribute(image, settings.altImageSrc) || image.src;
	// save a copy of the original image just in case we need to 'destroy the system' and restore the image to its former glory
	this.imageClone = image.cloneNode(true);
	// this is used to prevent node updating (tag loading) during certain processes such as tagging mode or tag reposition mode
	this.disallowNodeUpdate = false;
	// this is used to stop the tag bubble from showing on tag hover
	this.allowTagBubble = true;
	// special elements that are unique to each node are kept here for reference (potentially a global method)
	this.privateElements = {};
	// each node may have their own settings object because each node could potentially have custom settings
	// `settings` is global `this.settings` is local
	this.settings = {};
	// some positional info gathered before the instance was initiated
	// this is used for reference when positioning the node
	this.dimensions = {
		width: image.width,
		height: image.height,
		offsetLeft: cacheImages[uid].offset.x,
		offsetTop: cacheImages[uid].offset.y
	};
	// keeps track of updates so that we can avoid making duplicate calls
	this.updateInProgress = false;



}


PinInst.prototype = {


	destroy: function (bRemove) {

		var pInst = this;

		if (bRemove) {
			plib.removeElement(pInst.privateElements.imgNode);
		} else {
			plib.replaceElement(pInst.privateElements.imgNode, pInst.imageClone);
		}

		delete cacheNodes[pInst.uid];
		delete cacheImages[pInst.uid];
		delete cacheTags[pInst.uid];


		// {opendebug}
		pfunc.info(messages.imageUnloaded, pInst.uid);
		// {closedebug}

	},

	init: function () {

		var pInst = this,
			oImageStyles = plib.getComputedStyles(pInst.image),
			localCheckImage,
			localCheckImageNS = oNamespace.checkImage + pInst.imageCloneSrc;


		plib.attribute(pInst.image, attributes.imgLoaded, strBool[1]);
		plib.addClass(pInst.image, classes.image);


		// WRAP IMAGE WITH A DIV
		pInst.privateElements.imgNode = plib.domWrap(html.div, pInst.image, {
			'class': classes.node
		});

		// inline -> inline-block // block -> block
		if (oImageStyles[css.display] === 'inline') {
			plib.addClass(pInst.privateElements.imgNode, classes.inlineNode);
		}


		// backup any info regarding the node (we use this mostly for unloading)
		cacheNodes[pInst.uid] = {
			//node: pInst.privateElements.imgNode,
			instance: pInst,
			//originalImage: oImageClone,
			imgGUID: plib.getGUID(pInst.image)
		};


		// this will stop propagation in the event our node is wrapped in an anchor tag
		plib.click(pInst.privateElements.imgNode);

		if (pInst.settings.cssHelper) {
			pInst.styleHelper(oImageStyles);
		}



		// we add the width and height here because if we dont, when we wrap the image with our node, our css rules will overide any specified dimensions and causes a glitch effect
		plib.setWidth(pInst.image, pInst.dimensions.width);
		plib.setHeight(pInst.image, pInst.dimensions.height);
		// this is to fix a chromium bug where maxWidth and maxHeight override the width and height values respectively
		plib.setStyle(pInst.image, css.maxWidth, pInst.dimensions.width);
		plib.setStyle(pInst.image, css.maxHeight, pInst.dimensions.height);


		// we have set dimensions in the style attribute so these are redundant
		plib.attribute(pInst.image, attributes.width, null); // remove
		plib.attribute(pInst.image, attributes.height, null); // remove




		plib.setWidth(pInst.privateElements.imgNode, pInst.dimensions.width);
		plib.setHeight(pInst.privateElements.imgNode, pInst.dimensions.height);




		if (pInst.settings.posHelper) {
			pInst.positionHelper();
		}

		// CREATE A NODE WRAPPER TO AVOID PADDING ISSUES WITH POSITION ABSOLUTE
		pInst.privateElements.sectionBody = plib.domWrap(html.div, pInst.image, {
			'class': classes.sectionBody
		});
		plib.setWidth(pInst.privateElements.sectionBody, pInst.dimensions.width);
		plib.setHeight(pInst.privateElements.sectionBody, pInst.dimensions.height);



		// INSERT OUR OVERLAY INTO THE NODE BODY DIV
		pInst.privateElements.imgOverlay = plib.domAppend(html.div, pInst.privateElements.sectionBody, {
			'class': classes.overlay
		});
		plib.setWidth(pInst.privateElements.imgOverlay, pInst.dimensions.width);
		plib.setHeight(pInst.privateElements.imgOverlay, pInst.dimensions.height);




		// CREATE A HOLDER FOR THE TAGS
		pInst.privateElements.imgTagHolder = plib.domAppend(html.div, pInst.privateElements.imgOverlay, {
			'class': classes.tagHolder
		});



		// run methods that do not need to wait for the image check
		pInst.preRun();


		// check to see if we have a locally saved copy of the query
		localCheckImage = pfunc.getLocalStorage(localCheckImageNS);
		if (localCheckImage) {

			pInst.imageSrc = localCheckImage;

			// {opendebug}
			if (pInst.imageCloneSrc !== pInst.imageSrc) {
				pfunc.info(messages.imageNewSrc, pInst.imageCloneSrc, pInst.imageSrc);
			}
			// {closedebug}

			// wait for a server responce before we continue because some future functions require an updated image src
			pInst.postRun();

		} else {

			// Here we are checking the image against the server. The server may decide to change the source if necessary.
			plib.loadJSONP(directory.names.checkImage, {

				'strImageURL': pInst.imageSrc

			}, function (data) {

				// If the server returns a string that means we need to update the image src
				if (data) {
					pInst.imageSrc = data;
					// {opendebug}
					pfunc.info(messages.imageNewSrc, pInst.imageCloneSrc, pInst.imageSrc);
					// {closedebug}
				}

				pfunc.setLocalStorage(localCheckImageNS, pInst.imageSrc);

				// wait for a server responce before we continue because some future functions require an updated image src
				pInst.postRun();


			});

		}




	},


	positionHelper: function () {

		/*** NOTE
		i can't think of any reason why this is needed for absolute positioned images
		BUT we need to at least check so that we are not adding margins when positions are needed and vise versa
		***/

		var pInst = this,
			cumulativeOffset = plib.getCumulativeOffset(pInst.image),
			positionType = plib.getStyle(pInst.privateElements.imgNode, css.position),
			posMethod = (positionType === 'absolute') ? { top: css.top, left: css.left } : { top: css.margin.top, left: css.margin.left },
			posLeft = plib.getStyle(pInst.privateElements.imgNode, posMethod.left) || 0,
			posTop = plib.getStyle(pInst.privateElements.imgNode, posMethod.top) || 0,
			offsetDiffX = pInst.dimensions.offsetLeft - cumulativeOffset.x + posLeft,
			offsetDiffY = pInst.dimensions.offsetTop - cumulativeOffset.y + posTop;



		if (offsetDiffX > 0) {
			plib.setStyle(pInst.privateElements.imgNode, posMethod.left, offsetDiffX);
			pInst.dimensions.offsetLeft = offsetDiffX;
		}
		if (offsetDiffY > 0) {
			plib.setStyle(pInst.privateElements.imgNode, posMethod.top, offsetDiffY);
			pInst.dimensions.offsetTop = offsetDiffY;
		}

	},


	styleHelper: function (oCss) {

		var pInst = this,
			oNodeStyle,
			oImageStyle;


		// we dont care about the display property, it should always default to our css rule of inline-block
		// this is to prevent position issues mostly related to display:inline and its inability to manage widths and margins etc..
		delete oCss[css.display];


		// static position will break our position helper
		if (oCss[css.position] === 'static') {
			delete oCss[css.position]; // default is relative
		}

		plib.attribute(pInst.image, attributes.style, null); // remove

		// these deprecated attributes will be replicated via css rules
		plib.attribute(pInst.image, attributes.align, null); // remove
		plib.attribute(pInst.image, attributes.hspace, null); // remove
		plib.attribute(pInst.image, attributes.vspace, null); // remove


		oNodeStyle = plib.getComputedStyles(pInst.privateElements.imgNode);
		oImageStyle = plib.getComputedStyles(pInst.image);

		// COPY CSS RULES FROM IMAGE TO NODE
		plib.loopObject(oCss, function (key, val) {


			/*
			key = css rule property
			val = css rule value
			*/
			// these styles are not important or they will conflict with our overlay styles
			if (!plib.inArray(['width', 'height', 'color'], key)) {

				var nodePropVal = oNodeStyle[key],
					imgPropVal = oImageStyle[key];

				// only copy style rules if the current node stlye does not match the original image style
				if (val !== nodePropVal) {
					plib.setStyle(pInst.privateElements.imgNode, key, val);
				}
				// only copy style rules if the current image stlye does not match the original node style
				if (imgPropVal !== nodePropVal) {
					plib.setStyle(pInst.image, key, nodePropVal);
				}

			}
		});


	},


	// CONTAINS METHODS THAT CAN BE RUN BEFORE AN IMAGE CHECK IS MADE // this is mostly gui based
	preRun: function () {

		var pInst = this;

		if (pInst.settings.allowBottomLinks === true) {

			// THIS IS THE MAIN WRAPPER FOR THE AREA UNDER THE NODE
			pInst.privateElements.sectionFooter = plib.domAppend(html.div, pInst.privateElements.imgNode, {
				'class': classes.sectionFooter
			});

			// CREATE A HOLDER FOR OUR LINKS LOCATED AT THE BOTTOM OF OUR NODE
			pInst.privateElements.linkHolder = plib.domAppend(html.div, pInst.privateElements.sectionFooter, {
				'class': classes.linkHolder
			});

			plib.domAppend(html.div, pInst.privateElements.sectionFooter, {
				'class': classes.linkHolderBackground
			});

			plib.hide(pInst.privateElements.sectionFooter);

		}

		// even if "emmaAllowUI" is false, create the class so we can reference "public ui only" setting
		pInst.ui = new PinUi(pInst);
		
		// build initial ui that will never be redrawn or removed
		pInst.ui.init();

		plib.addEvent(pInst.privateElements.imgNode, events.mouseover, function (event) {
			// This is a cross browser implementation of the event 'mouseenter'
			if (new pfunc.MouseBoundaryCrossing(event, this).enteredLandmark) {
				pInst.enableImgNode();
			}
		});

		plib.addEvent(pInst.privateElements.imgNode, events.mouseout, function (event) {
			// This is a cross browser implementation of the event 'mouseleave'
			if (new pfunc.MouseBoundaryCrossing(event, this).leftLandmark) {
				pInst.disableImgNode();
			}
		});

		if (pInst.settings.alwaysShowTags) {
			plib.addClass(pInst.privateElements.imgNode, classes.actionOn);
		}

	},

	// POST RUN CONTAINS METHODS THAT CAN NOT BE RUN BEFORE AN IMAGE CHECK IS MADE
	// this is mostly tag data based
	postRun: function () {

		var pInst = this;

		// {opendebug} // just to see whats in here and loaded
		pfunc.log(messages.instOutput, pInst);
		// {closedebug}

		if (pInst.settings.alwaysShowTags) {

			//pInst.enableImgNode(); // will also update node

			pfunc.checkLogin(null, null, function () { // NEUTRAL CALLBACK
				pfunc.methodSessionChange(pInst);
			});

		}


	},

	methodAddNewTag: function (pos) {

		var pInst = this;
		
		pfunc.openPrivateWindow(layout.formTagCreate, function () {

			var newTagForm = document.forms[names.formCreate];
			newTagForm.elements[names.strWebReferer].value = windowLocation;
			newTagForm.elements[names.strImageURL].value = pInst.imageSrc;
			newTagForm.elements[names.nPosX].value = pos.x; // percentage
			newTagForm.elements[names.nPosY].value = pos.y; // percentage

			// RECENTLY TAGGED DROPDOWN STUFF
			pfunc.manageTagSuggestionList(newTagForm);
			// KEYWORD TYPE AID
			pfunc.manageKeywords(newTagForm.elements[names.strKeywords]);
			// validates the url protocol
			pfunc.validWebUrl(newTagForm.elements[names.strWebLink]);

			pfunc.manageFormSubmit(newTagForm, directory.names.tagCreate, [asterisk], function (data) {

				if (data) {
					// this = form
					pfunc.displayFormError(this, data);
				} else {
					pfunc.closeWindow();
					pInst.updateNode(true, true); // FORCE RELOAD TAGS FROM SERVER
					userInfo[serverKeys.user.tagTotal] += 1; // increment tag total to avoid unwanted "first time" messages
				}

			});

		});

	},

	updateNode: function (forceRedraw, forceReload) {

		var pInst = this,
			drawInstanceFromCache = function () {

				var timestamp = cacheTagData[this.imageSrc][0],
					data = cacheTagData[this.imageSrc][1];

				// keep track of what tags we have loaded
				this.tagsVersion = timestamp;

				if (data && !plib.isObjectEmpty(data)) {
					this.drawTagData(data);
					if (this.settings.allowBottomLinks) {
						this.drawLinkData(data);
					}
				}

			};
		
		forceRedraw = forceRedraw | false; // in some cases we need to ignore the cache and force a redraw of dom elements (can be redrawn from cache)
		forceReload = forceReload | false; // in some cases we need to ignore the cache and force a fetch for new data (can NOT be redrawn from cache)

		// if for some reason, this method has been called successively, ignore the repeated calls until we are done with the initial call
		// successive calls have occurred when a node is enabled and the user hovers over the node immediately
		if (pInst.updateInProgress === true) { return; }
		pInst.updateInProgress = true;

		if (forceReload) {
			delete cacheTagData[pInst.imageSrc]; // delete cache so we know to grab from server
		}
		
		// if we find cached tag data for this image then don't bother fetching tags from server
		if (plib.hasProperty(cacheTagData, pInst.imageSrc)) {
	
			// if the timestamps don't match then redraw the new data, otherwise don't bother.. its the same data
			if (forceRedraw || pInst.tagsVersion !== cacheTagData[pInst.imageSrc][0]) {
				drawInstanceFromCache.call(pInst);
			}

			pInst.updateInProgress = false;

		} else {

			if (!plib.hasProperty(queueTagData, pInst.uid)) {
				queueTagData[pInst.uid] = [];
			}

			if (!plib.inArray(queueTagData[pInst.uid], pInst)) {
				queueTagData[pInst.uid].push(pInst);
			}

			// if there is alreay an existing query for tags of the same image then disallow a repeat query
			if (queueTagData[pInst.uid].length > 1) { return; }


			// GET TAG DATA FROM SERVER
			plib.loadJSONP(directory.names.getTags, { 'strImageURL': pInst.imageSrc }, function (data) {

				// data null = timeout
				// data undefined = no tags
				if (data !== null) {
					cacheTagData[pInst.imageSrc] = [new Date().getTime(), data];
					plib.loopArray(queueTagData[pInst.uid], function (PinInst) {
						drawInstanceFromCache.call(PinInst);
					});
					// assume that after looping the array that we can now remove it from the queue
					delete queueTagData[pInst.uid];
				}

				pInst.updateInProgress = false;

			});
		}



	},

	tagMouseoverEvent: function (elmTag) {

		var pInst = this,
			elmTagDot = plib.getElementsByClassName(classes.tagDot, elmTag)[0],
			elmTagOutline = plib.getElementsByClassName(classes.tagOutline, elmTag)[0],
			elmTagBubble = plib.getElementsByClassName(classes.tagBubble, elmTag)[0],
			oStyles = {},
			outlineSize,
			parameters;

		
		plib.attribute(elmTag, attributes.tagHover, strBool[1]);
		plib.setStyle(elmTag, css.zIndex, 999); // put label on top of stack
		plib.setStyle(pInst.privateElements.imgTagHolder, css.zIndex, 999); // set holder so bubbles will appear on top of gui

		if (elmTagDot && elmTagOutline) {

			plib.show(elmTagOutline);

			// assume that width and height will always be the same..
			// assume the width will always be an odd number
			outlineSize = (pInst.settings.dotOutlineSize * 2) + plib.getWidth(elmTagDot);

			oStyles[css.width] = outlineSize;
			oStyles[css.height] = outlineSize;
			oStyles[css.margin.top] = -Math.floor(outlineSize / 2);
			oStyles[css.margin.left] = -Math.floor(outlineSize / 2);

			// animations will simple override any existing animations (if any)
			if (settings.animations) {
				plib.animate(elmTagOutline, oStyles, 200);
			} else {
				plib.setStyles(elmTagOutline, oStyles);
			}

		}

		if (elmTagBubble && pInst.allowTagBubble) {
			plib.show(elmTagBubble); // show tooltip
		}

		// keep track of users hovering over the tags
		parameters = pfunc.getTagGuidObject(elmTag);
		if (parameters) {
			plib.loadJSONP(directory.names.logTagHover, parameters);
		}

	},

	tagMouseoutEvent: function (elmTag) {

		var pInst = this,
			elmTagOutline = plib.getElementsByClassName(classes.tagOutline, elmTag)[0],
			elmTagBubble = plib.getElementsByClassName(classes.tagBubble, elmTag)[0],
			oStyles = {};

		plib.attribute(elmTag, attributes.tagHover, null);
		plib.setStyle(elmTag, css.zIndex, 1); // put label on bottom of stack
		plib.setStyle(pInst.privateElements.imgTagHolder, css.zIndex, 1);

		if (elmTagOutline) {

			oStyles[css.width] = 0;
			oStyles[css.height] = 0;
			oStyles[css.margin.top] = 0;
			oStyles[css.margin.left] = 0;

			// animations will simple override any existing animations (if any)
			if (settings.animations) {
				plib.animate(elmTagOutline, oStyles, 600, function () {
					plib.hide(this);
				});
			} else {
				plib.setStyles(elmTagOutline, oStyles);
				plib.hide(elmTagOutline);
			}

		}

		if (elmTagBubble) {
			plib.hide(elmTagBubble); // hide tooltip
		}

	},
	
	clearTagData: function () {
		plib.loopObjectKeys(cacheTagData, function (key) {
			delete cacheTagData[key];
		});
	},

	drawTagData: function (oTagData) {

		var pInst = this,
			allowFadeIn = plib.isElementEmpty(pInst.privateElements.imgTagHolder);

		plib.removeChildren(pInst.privateElements.imgTagHolder); // CLEAR TAGS
		plib.setAlpha(pInst.privateElements.imgTagHolder, 0);

		plib.loopObject(oTagData, function (data) {

			// data = array of tags that have the same x/y coordinates
			var oDefData = data[0],

				randID = plib.randomID(12),
				charLenLimit = 25,

				elmTag,
				elmTagDot,
				elmTagOutline,
				elmTagBubble,
				documentFragment,

				// an empty object we use to contain element parameters during their creation
				oParameters,
				outlineMargins,
				
				tagMultiGuid = [];


			oParameters = {};
			oParameters[attributes.id] = tagPrefix + pInst.uid + '-' + randID;
			oParameters[attributes.className] = classes.tag + whiteSpace + globalVars.availableDotSizes[settings.dotSize];
			oParameters[attributes.tagPosX] = oDefData[serverKeys.tags.posX];
			oParameters[attributes.tagPosY] = oDefData[serverKeys.tags.posY];
			
			if (data.length > 1) {
				plib.loopObject(data, function (v) {
					tagMultiGuid.push(v[serverKeys.tags.guid]);
				});
				oParameters[attributes.tagMultiGuid] = tagMultiGuid.join("_");
			} else {
				oParameters[attributes.tagGuid] = oDefData[serverKeys.tags.guid];
			}

			elmTag = plib.domAppend(html.div, pInst.privateElements.imgTagHolder, oParameters);


			// position the tags by percentage inside the overlay
			plib.setStyle(elmTag, css.left, String(oDefData[serverKeys.tags.posX] * 100) + '%'); // percentage from left of overlay
			plib.setStyle(elmTag, css.top, String(oDefData[serverKeys.tags.posY] * 100) + '%'); // percentage from top of overlay


			oParameters = {};
			oParameters[attributes.className] = classes.tagDot;
			elmTagDot = plib.domAppend(html.a, elmTag, oParameters);
			pfunc.setWindowLink(elmTagDot, directory.paths.webloc + oDefData[serverKeys.tags.guid]);


			if (pInst.settings.dotOutlineSize > 0) {

				oParameters = {};
				oParameters[attributes.className] = classes.tagOutline;
				elmTagOutline = plib.domAppend(html.span, elmTag, oParameters);

				outlineMargins = {};
				outlineMargins[css.width] = 0;
				outlineMargins[css.height] = 0;
				outlineMargins[css.margin.top] = 0;
				outlineMargins[css.margin.left] = 0;
				plib.setStyles(elmTagOutline, outlineMargins);

			}

			if (pInst.settings.tooltip) {

				// this document fragment contains the bubble content
				documentFragment = document.createDocumentFragment();

				if (!plib.hasProperty(cacheTags, pInst.uid)) {
					cacheTags[pInst.uid] = {};
				}

				plib.loopArray(data, function (index, value) {

					var strTagName = value[serverKeys.tags.name],
						strKeywords = value[serverKeys.tags.keywords].join(),
						strWebLink = value[serverKeys.tags.webLink],
						strGUID = value[serverKeys.tags.guid],
						nOwnerId = value[serverKeys.tags.ownerGuid],
						elmTagLink,
						elmTagLinkText,
						strTagLinkText;


					cacheTags[pInst.uid][strGUID] = randID;


					oParameters = {};
					oParameters[attributes.id] = tagPrefix + randID + '-' + strGUID; // prefix with random id because we could have the same tag multiple times.. not per image but per page
					oParameters[attributes.className] = classes.tagLink;
					oParameters[attributes.tagGuid] = strGUID;
					oParameters[attributes.tagName] = strTagName;
					oParameters[attributes.tagKeywords] = strKeywords;
					oParameters[attributes.tagWebLink] = strWebLink;
					oParameters[attributes.tagOwnerId] = nOwnerId;
					elmTagLink = plib.domAppend(html.span, documentFragment, oParameters);

					// if title is too long then shorten it
					strTagLinkText = (strTagName.length > charLenLimit) ? strTagName.substr(0, charLenLimit) + ellipsis : strTagName;

					oParameters = {};
					oParameters[attributes.className] = classes.tagLinkText;
					elmTagLinkText = plib.domAppend(html.a, elmTagLink, oParameters, strTagLinkText);
					pfunc.setWindowLink(elmTagLinkText, directory.paths.webloc + strGUID);

					if (pInst.settings.tooltipURL) {

						// DO SOME FORMATTING ON THE URL
						plib.loopArray(webProtos, function (value) {
							strWebLink = strWebLink.replace(value, '');
						});
						
						// remove trailing slash (if there is one)
						strWebLink = strWebLink.replace(regex.tslash, '');
						
						// if link is too long then shorten it
						if (strWebLink.length > charLenLimit) {
							strWebLink = strWebLink.substr(0, charLenLimit) + ellipsis;
						}

						oParameters = {};
						oParameters[attributes.className] = classes.tagLinkURL;
						plib.domAppend(html.span, elmTagLink, oParameters, strWebLink);

					}

					if (pInst.settings.allowShare) {
						// insert the like button and then add a click event onto it
						oParameters = {};
						oParameters[attributes.className] = classes.tagLinkLike;
						plib.click(plib.domAppend(html.span, elmTagLink, oParameters, 'like'), function () {
							pInst.manageTagLike(this);
						});
						plib.setStyle(elmTagLink, css.padding.right, 18); // give us some room for the share button

					}

					if (index + 1 === data.length) {
						// if the link is our only or last link, add a class that will remove the bottom border and margin
						plib.addClass(elmTagLink, classes.lastItem);
					}

				});

				elmTagBubble = pInst.drawTagBubble(elmTag, documentFragment);

				// initially hide the tooltip
				plib.hide(elmTagBubble);



			}
			
			function closeAllTags() {
				
				plib.loopObjectKeys(cacheTags, function (key) {
				
					console.log(key);
				});

			}

			closeAllTags();

			if (pfunc.isMobile()) {
			
				// SHOW TAG TOOLTIP ON TOUCHEND
				plib.addEvent(elmTag, events.touchend, function () {
					
					var elmTag = plib.getParentByClassName(this, classes.tag);
					
					plib.stopBubble();
					
					if (plib.attribute(elmTag, attributes.tagHover) === strBool[1]) {
						pInst.tagMouseoutEvent(elmTag);
					} else {
						pInst.tagMouseoverEvent(elmTag);
					}
					
				});
			
			} else {

				// SHOW TAG TOOLTIP ON MOUSEOVER
				plib.addEvent(elmTag, events.mouseover, function (event) {
					var elmTag = plib.getParentByClassName(this, classes.tag);
					if (new pfunc.MouseBoundaryCrossing(event, this).enteredLandmark) {
						pInst.tagMouseoverEvent(elmTag);
					}
				});

				// HIDE TAG TOOLTIP ON MOUSEOUT
				plib.addEvent(elmTag, events.mouseout, function (event) {
					var elmTag = plib.getParentByClassName(this, classes.tag);
					if (new pfunc.MouseBoundaryCrossing(event, this).leftLandmark) {
						pInst.tagMouseoutEvent(elmTag);
					}
				});
				
			}


		});

		if (allowFadeIn) {
			plib.fadeIn(pInst.privateElements.imgTagHolder, 800);
		} else {
			plib.setAlpha(pInst.privateElements.imgTagHolder, 1);
		}

	},

	drawTagBubble: function (elmTag, tagBubbleContent) {

		var pInst = this,

			elmTagDot = plib.getElementsByClassName(classes.tagDot, elmTag)[0],
			elmTagBubble,
			elmTagBubbleContent,

			o = {}, // contains offset info
			p = {}, // contains positional and general info

			tooltipPosition = {},
			tooltipOrientation = pInst.settings.tooltipOrientation, // this setting is subject to change so dump into a var for reference

			oParameters,

			canvas;


		oParameters = {};
		oParameters[attributes.className] = classes.tagBubble;
		elmTagBubble = plib.domAppend(html.span, elmTag, oParameters);

		oParameters = {};
		oParameters[attributes.className] = classes.tagBubbleContent;
		elmTagBubbleContent = plib.domAppend(html.span, elmTagBubble, oParameters);

		// INSERT THE CONTENT
		plib.domAppend(tagBubbleContent, elmTagBubbleContent);


		//!* ~~~ MANAGE TAG LABEL POSITIONS ~~~


		o.t = plib.getCumulativeOffset(elmTag);
		o.th = plib.getCumulativeOffset(pInst.privateElements.imgTagHolder);

		// don't ask me to explain, but strokes with odd-numbered widths look better drawn on half pixels
		p.halfPixel = (pInst.settings.canvas.stroke && pInst.settings.canvas.theme.strokeWidth % 2 !== 0) ? 0.5 : 0;


		p.bubblePadding = 3; // add some distance between the canvas edge and the tooltip for dropshadows

		// distance of bubble from the dot in pixels
		// assume that width and height will always be the same..
		p.bubbleDotDist = plib.getWidth(elmTagDot) / 2;

		p.tagBubbleWidth = plib.getWidth(elmTagBubble) + (p.halfPixel * 2);
		p.tagBubbleHeight = plib.getHeight(elmTagBubble) + (p.halfPixel * 2);

		p.tagHolderWidth = plib.getWidth(pInst.privateElements.imgTagHolder);
		p.tagHolderHeight = plib.getHeight(pInst.privateElements.imgTagHolder);


		p.tagBubbleContentHeight = plib.getHeight(elmTagBubbleContent);

		p.tagOffsetTop = (o.t.y - o.th.y);
		p.tagOffsetBottom = (p.tagHolderHeight - p.tagOffsetTop);
		p.tagOffsetLeft = (o.t.x - o.th.x);
		p.tagOffsetRight = (p.tagHolderWidth - p.tagOffsetLeft);

		p.tailWidth = pInst.settings.canvas.tailWidth;
		p.tailHeight = pInst.settings.canvas.tailHeight;

		p.totalWidth = p.tagBubbleWidth;
		p.totalHeight = p.tagBubbleHeight;


		tooltipPosition[css.top] = "auto";
		tooltipPosition[css.right] = "auto";
		tooltipPosition[css.bottom] = "auto";
		tooltipPosition[css.left] = "auto";



		if (tooltipOrientation === globalVars.tooltipOrientations.top || tooltipOrientation === globalVars.tooltipOrientations.bottom) { // VERTICAL

			tooltipPosition[css.left] = -(p.tagBubbleWidth / 2);
			p.totalHeight += p.tailHeight;

		} else if (tooltipOrientation === globalVars.tooltipOrientations.left || tooltipOrientation === globalVars.tooltipOrientations.right) { // HORIZONTAL

			// the current tail dimensions are designed for vertical tooltips
			// we need to swap them for horizontal orientation
			p.tailWidth = pInst.settings.canvas.tailHeight;
			p.tailHeight = pInst.settings.canvas.tailWidth;

			tooltipPosition[css.top] = -(p.tagBubbleHeight / 2);
			p.totalWidth += p.tailWidth;

		}


		// CHECK IF TOOLTIP IS TOUCHING ANY SIDES AND IF IT IS THEN CHANGE ORIENTATION TO OPPOSITE DIRECTION
		if (tooltipOrientation === globalVars.tooltipOrientations.top) {
			if ((p.totalHeight + p.bubbleDotDist) > p.tagOffsetTop) { // TOUCHING TOP
				tooltipOrientation = globalVars.tooltipOrientations.bottom;
			}
		} else if (tooltipOrientation === globalVars.tooltipOrientations.right) {
			if ((p.totalWidth + p.bubbleDotDist) > p.tagOffsetRight) { // TOUCHING RIGHT
				tooltipOrientation = globalVars.tooltipOrientations.left;
			}
		} else if (tooltipOrientation === globalVars.tooltipOrientations.bottom) {
			if ((p.totalHeight + p.bubbleDotDist) > p.tagOffsetBottom) { // TOUCHING BOTTOM
				tooltipOrientation = globalVars.tooltipOrientations.top;
			}
		} else if (tooltipOrientation === globalVars.tooltipOrientations.left) {
			if ((p.totalWidth + p.bubbleDotDist) > p.tagOffsetLeft) { // TOUCHING LEFT
				tooltipOrientation = globalVars.tooltipOrientations.right;
			}
		}

		if (tooltipOrientation === globalVars.tooltipOrientations.top) {
			tooltipPosition[css.bottom] = p.bubbleDotDist;
		} else if (tooltipOrientation === globalVars.tooltipOrientations.right) {
			tooltipPosition[css.left] = p.bubbleDotDist + 1;
			plib.setStyle(elmTagBubbleContent, css.padding.left, 10 + p.tailWidth); // add some padding to compensate for the tooltip tail
		} else if (tooltipOrientation === globalVars.tooltipOrientations.bottom) {
			tooltipPosition[css.top] = p.bubbleDotDist + 1;
			plib.setStyle(elmTagBubbleContent, css.top, p.totalHeight - p.tagBubbleContentHeight);
		} else if (tooltipOrientation === globalVars.tooltipOrientations.left) {
			tooltipPosition[css.right] = p.bubbleDotDist;
			plib.setStyle(elmTagBubbleContent, css.padding.right, 10 + p.tailWidth); // add some padding to compensate for the tooltip tail
		}


		if (tooltipOrientation === globalVars.tooltipOrientations.top || tooltipOrientation === globalVars.tooltipOrientations.bottom) {
			// LABEL IS TOUCHING LEFT SIDE
			if (p.tagOffsetLeft < (p.tagBubbleWidth / 2)) {
				tooltipPosition[css.left] = -p.tagOffsetLeft;
			// LABEL IS TOUCHING  SIDE
			} else if (p.tagOffsetRight < (p.tagBubbleWidth / 2)) {
				tooltipPosition[css.left] = -(p.tagBubbleWidth - p.tagOffsetRight);
			}
		}


		// set tooltip position [top, right, bottom, left]
		plib.setStyles(elmTagBubble, tooltipPosition);
		plib.setWidth(elmTagBubble, p.totalWidth);
		plib.setHeight(elmTagBubble, p.totalHeight);

		
		// CHECK FOR CANVAS SUPPORT A FEW TIMES AND FAIL GRACEFULLY
		// this is for older versions of IE that need to load ExplorerCanvas
		plib.runInterval(30, 30, function () {
			// condition
			return support.canvas;
		}, function () {

			oParameters = {};
			oParameters[attributes.className] = classes.tagBubbleCanvas;
			canvas = plib.domAppend(html.canvas, elmTagBubble, oParameters);
			canvas.pinupCanvasProperties = {
				theme: pInst.settings.canvas.theme,
				allowStroke: pInst.settings.canvas.stroke,
				allowShadow: pInst.settings.canvas.shadow,
				cornerRadius: pInst.settings.canvas.cornerRadius,
				canvasPadding: p.bubblePadding,
				halfPixel: p.halfPixel,
				width: p.tagBubbleWidth,
				height: p.tagBubbleHeight,
				offsetLeft: p.tagOffsetLeft,
				offsetRight: p.tagOffsetRight,
				pointerWidth: p.tailWidth,
				pointerHeight: p.tailHeight,
				orientation: tooltipOrientation
			};

			pInst.ui.drawTooltip(canvas, canvas.pinupCanvasProperties);

		}, function () {
			// canvas is not supported.. do something else?
		});

		return elmTagBubble;


	},

	// THESE ARE THE LINKS BELOW THE IMAGE LOADED ON INTRUSIVE LEVEL 2
	drawLinkData: function (oLinks) {


		var pInst = this,
			elmLinkHolder = pInst.privateElements.linkHolder,
			fn_tagLinkMouseover = function () {
				// find our related tag by using our link id which is the same as our tag id
				var strGUID = plib.attribute(this, attributes.tagGuid);
				// prevent error: check to make sure tag is cached first

				if (plib.hasProperty(cacheTags, pInst.uid)) {
					if (plib.hasProperty(cacheTags[pInst.uid], strGUID)) {
						pInst.tagMouseoverEvent(document.getElementById(tagPrefix + pInst.uid + '-' + cacheTags[pInst.uid][strGUID]));
					}
				}
			},
			fn_tagLinkMouseout = function () {
				// don't bother trying to find a specific tooltip to hide.. just hide them all; it's easier :)
				plib.loopArray(plib.getElementsByClassName(classes.tag, pInst.privateElements.imgTagHolder), function (value) {
					pInst.tagMouseoutEvent(value);
				});
			};


		plib.removeChildren(elmLinkHolder); // CLEAR LINKS



		// LOOP JSON ARRAY FROM SERVER
		plib.loopObject(oLinks, function (val) {

			// val = array of tags that have the same x/y coordinates

			plib.loopArray(val, function (value) {

				var elmTagLink,
					// an empty object we use to contain element parameters during their creation
					oLinkAttr;


				oLinkAttr = {};
				oLinkAttr[attributes.className] = classes.link;
				oLinkAttr[attributes.tagGuid] = value[serverKeys.tags.guid];
				elmTagLink = plib.domAppend(html.a, elmLinkHolder, oLinkAttr);
				pfunc.setWindowLink(elmTagLink, directory.paths.webloc + value[serverKeys.tags.guid]);


				oLinkAttr = {};
				oLinkAttr[attributes.className] = classes.iconLabel;
				plib.domAppend(html.span, elmTagLink, oLinkAttr);
				plib.appendText(elmTagLink, value[serverKeys.tags.name]);

				if (pInst.settings.tooltip) {
					plib.addEvent(elmTagLink, events.mouseover, fn_tagLinkMouseover);
					plib.addEvent(elmTagLink, events.mouseout, fn_tagLinkMouseout);
				}

			});

		});

		// if no links exist then hide the holder to avoid unwanted margins
		if (plib.isElementEmpty(elmLinkHolder)) {
			plib.hide(pInst.privateElements.sectionFooter);
			plib.hide(elmLinkHolder);
			// reset the node height that has been hardcoded
			plib.setHeight(pInst.privateElements.imgNode, pInst.dimensions.height);
		} else {
			plib.show(pInst.privateElements.sectionFooter);
			plib.show(elmLinkHolder);
			// reset the node height that has been hardcoded
			plib.setHeight(pInst.privateElements.imgNode, plib.getHeight(elmLinkHolder) + pInst.dimensions.height);
		}


	},

	enableImgNode: function () { // note: this function will also update the node

		var pInst = this;

		// if "disallowNodeUpdate" is true, keep the node from trying to update on hover in/out (we force the node to stay open)
		if (pInst.disallowNodeUpdate) { return; }
		
		// no need for this if tags always show
		if (!pInst.settings.alwaysShowTags) {
			plib.addClass(pInst.privateElements.imgNode, classes.actionOn);
		}

		// we dont care if the user is logged in or not here
		// just do a blind login check to update the user info
		// then we can call "methodSessionChange" which will react differently based on session status ..or lack thereof
		pfunc.checkLogin(null, null, function () { // NEUTRAL CALLBACK
			pfunc.methodSessionChange(pInst);
		});

		// listen for F2 key
		pfunc.newKeyListener(keyCodes.f2, pInst.uid, function () {
			pInst.ui.toggle();
		});

	},

	disableImgNode: function () {

		var pInst = this;

		if (pInst.disallowNodeUpdate) { return; }

		// no need for this if tags always show
		if (!pInst.settings.alwaysShowTags) {
			plib.removeClass(pInst.privateElements.imgNode, classes.actionOn);
		}

		// because we never remove the element from DOM.. manually remove the listener
		pfunc.removeKeyListener(keyCodes.f2, pInst.uid);

	},

	resetTagDotBehavior: function () {
		var pInst = this;
		plib.loopArray(plib.getElementsByClassName(classes.tagDot, pInst.privateElements.imgTagHolder), function (tagDot) {
			var tagGuidObject = pfunc.getTagGuidObject(tagDot.parentNode),
				tagGuid = tagGuidObject ? (
					plib.hasProperty(tagGuidObject, 'tagGUID') ? tagGuidObject.tagGUID : (
						plib.hasProperty(tagGuidObject, 'tagMultiGUID') ? tagGuidObject.tagMultiGUID.split("_")[0] : undefined
					) 
				) : undefined;
			plib.removeAllEvents(tagDot);
			if (tagGuid) {
				pfunc.setWindowLink(tagDot, directory.paths.webloc + tagGuid);
			}
		});
	},

	stopTaggingMode: function () {

		var pInst = this;

		pInst.disallowNodeUpdate = false;
		pInst.allowTagBubble = true;

		// make sure to remove click event from overlay
		plib.removeEvent(pInst.privateElements.imgTagHolder, events.click);
		plib.removeClass(pInst.privateElements.imgTagHolder, classes.button);

		// make sure to remove click events from dots and return their original link
		pInst.resetTagDotBehavior();


		pInst.ui.show();
		pInst.ui.disableCancelMode();

		// revert class back to original state
		plib.removeClass(pInst.privateElements.imgNode, classes.taggingMode);
		// only add node-on class if we are not trying to show our window
		// if we dont check for this, we end up adding and removing the class immediately which causes a flicker
		if (!plib.hasClass(globalElements.pInstWrapper, classes.actionShowWin)) {
			plib.addClass(pInst.privateElements.imgNode, classes.actionOn);
		}

	},

	startTaggingMode: function (callback) {

		var pInst = this;

		pfunc.checkPermission(function () {


			// while in tagging mode, loading tags is unnecessary
			pInst.disallowNodeUpdate = true;
			pInst.allowTagBubble = false;

			plib.removeClass(pInst.privateElements.imgNode, classes.actionOn);
			plib.addClass(pInst.privateElements.imgNode, classes.taggingMode);


			plib.click(pInst.privateElements.imgTagHolder, function (evt) {
				pInst.stopTaggingMode();
				if (callback) {
					callback.call(pInst, pfunc.getPosPercentage(evt));
				}
			}, true);


			// if user clicks a dot while tagging then assume they want to add a link into an existing dot
			plib.loopArray(plib.getElementsByClassName(classes.tagDot, pInst.privateElements.imgTagHolder), function (value) {
				plib.removeAllEvents(value);
				plib.click(value, function () {
					pInst.stopTaggingMode();
					if (callback) {
						callback.call(pInst, {
							'x': plib.attribute(this.parentNode, attributes.tagPosX),
							'y': plib.attribute(this.parentNode, attributes.tagPosY)
						});
					}
				}, true);
			});


			pInst.ui.hide();
			pInst.ui.enableCancelMode('CANCEL', function () {
				pInst.stopTaggingMode();
			});

		});

	},

	stopTagRepositionMode: function () {

		var pInst = this;

		pInst.disallowNodeUpdate = false;
		pInst.allowTagBubble = true;

		// if we try and stop reposition mode during a dragging process, this event will still exist..
		// we need to execute the event and remove it
		if (plib.hasEvent(document, events.mouseup)) {
			plib.fireEvent(document, events.mouseup);
			plib.removeEvent(document, events.mouseup);
			// if the mouseup event was not run then the mouseout event probably has not run as well
			// the event gets removed below so don't worry about that.. but remove the class here that would not be removed otherwise
			plib.removeClass(pInst.privateElements.imgNode, classes.handOver);
		}

		// make sure to remove click events from dots and return their original link
		pInst.resetTagDotBehavior();

		pInst.ui.show();
		pInst.ui.disableCancelMode();

		// revert class back to original state
		plib.removeClass(pInst.privateElements.imgNode, classes.repositionMode);
		plib.addClass(pInst.privateElements.imgNode, classes.actionOn);

	},

	startTagRepositionMode: function () {

		var pInst = this;

		pfunc.checkPermission(function () {

			// while in tagging mode, loading tags is unnecessary
			pInst.disallowNodeUpdate = true;
			pInst.allowTagBubble = false;

			plib.removeClass(pInst.privateElements.imgNode, classes.actionOn);
			plib.addClass(pInst.privateElements.imgNode, classes.repositionMode);

			// if user clicks a dot while tagging then assume they want to add a link into an existing dot
			plib.loopArray(plib.getElementsByClassName(classes.tag, pInst.privateElements.imgTagHolder), function (value) {

				var tagDot = plib.getElementsByClassName(classes.tagDot, value)[0];

				// we are going to re-map the events for this tag, so let's begin by removing existing events
				plib.removeAllEvents(tagDot);

				// show hand cursor icon on hover in
				plib.addEvent(tagDot, events.mouseover, function () {
					plib.addClass(pInst.privateElements.imgNode, classes.handOver);
				});

				// hide hand cursor icon on hover out
				plib.addEvent(tagDot, events.mouseout, function () {
					plib.removeClass(pInst.privateElements.imgNode, classes.handOver);
				});

				plib.addEvent(tagDot, events.mousedown, function (event) {

					plib.stopBubble(event); // stop text selection behavior

					plib.addClass(pInst.privateElements.imgNode, classes.handDrag);
					pfunc.startDragging(value);

					// DONT RELY ON MOUSEUP BEING ON THE TAG.. EDGE CONSTRAINTS MAY PREVENT THE TAG FROM FOLLOWING THE CURSOR
					plib.addEvent(document, events.mouseup, function () {

						// attempt to find at least one tag guid value
						// this method will return an object with the key value of tagGUID or tagMultiGUID
						// if neither was found then this method returns undefined
						var parameters = pfunc.getTagGuidObject(tagDot.parentNode);
						if (parameters) {

							plib.removeClass(pInst.privateElements.imgNode, classes.handDrag);
							pfunc.stopDragging(value);

							plib.removeEvent(document, events.mouseup);

							// UPDATE TAG POSITION
							parameters[serverKeys.tags.imagePath] = pInst.imageSrc;
							parameters[serverKeys.tags.posX] = plib.attribute(value, attributes.tagPosX);
							parameters[serverKeys.tags.posY] = plib.attribute(value, attributes.tagPosY);
							// make sure to clear the cache so we know this version is out of date
							plib.loadJSONP(directory.names.tagPosition, parameters, pInst.clearTagData);

						}

					});

				});

			});

			pInst.ui.hide();
			pInst.ui.enableCancelMode('DONE', function () {
				pInst.stopTagRepositionMode();
			});

		});

	},

	stopTagRemovalMode: function () {

		var pInst = this;

		pInst.disallowNodeUpdate = false;
		pInst.allowTagBubble = true;

		// make sure to remove click events from dots and return their original link
		pInst.resetTagDotBehavior();

		pInst.ui.show();
		pInst.ui.disableCancelMode();

		// revert class back to original state
		plib.removeClass(pInst.privateElements.imgNode, classes.removalMode);
		plib.addClass(pInst.privateElements.imgNode, classes.actionOn);

	},

	startTagRemovalMode: function () {

		var pInst = this;

		pfunc.checkPermission(function () {

			// while in tagging mode, loading tags is unnecessary
			pInst.disallowNodeUpdate = true;
			pInst.allowTagBubble = false;

			plib.removeClass(pInst.privateElements.imgNode, classes.actionOn);
			plib.addClass(pInst.privateElements.imgNode, classes.removalMode);

			// if user clicks a dot while tagging then assume they want to add a link into an existing dot
			plib.loopArray(plib.getElementsByClassName(classes.tag, pInst.privateElements.imgTagHolder), function (value) {

				var tagDot = plib.getElementsByClassName(classes.tagDot, value)[0];

				// we are going to re-map the events for this tag, so let's begin by removing existing events
				plib.removeAllEvents(tagDot);

				plib.click(tagDot, function () {
				
					var tagBubbleContent = plib.getElementsByClassName(classes.tagBubbleContent, tagDot.parentNode)[0],
						confirmMsg = (tagBubbleContent.children.length > 1) ? messages.removeMultiTags : messages.removeTag;
					
					pfunc.promptConfirm(confirmMsg, function () {
						
						// attempt to find at least one tag guid value
						// this method will return an object with the key value of tagGUID or tagMultiGUID
						// if neither was found then this method returns undefined
						var parameters = pfunc.getTagGuidObject(tagDot.parentNode);
						if (parameters) {	
							plib.loadJSONP(directory.names.tagRemove, parameters, function (data) {
								// data null = timeout
								// data undefined = success
								if (plib.isUndefined(data)) {
									pfunc.closeWindow();
									// remove the tag
									plib.removeElement(tagDot.parentNode);
									// remove bottom tag link(s) if needed
									if (settings.allowBottomLinks) {
										if (plib.hasProperty(parameters, 'tagGUID')) {
											plib.loopArray(pInst.privateElements.linkHolder.children, function (link) {
												if (plib.attribute(link, attributes.tagGuid) === parameters.tagGUID) {
													plib.removeElement(link);
													return null; // break loop
												}
											});
										} else if (plib.hasProperty(parameters, 'tagMultiGUID')) {
											plib.loopArray(parameters.tagMultiGUID.split("_"), function (guid) {
												plib.loopArray(pInst.privateElements.linkHolder.children, function (link) {
													if (plib.attribute(link, attributes.tagGuid) === guid) {
														plib.removeElement(link);
														return null; // break loop
													}
												});
											});
										}
									}
									// make sure to clear the cache so we know this version is out of date
									pInst.clearTagData();
								}
							});
						}

					});

				});

			});

			pInst.ui.hide();
			pInst.ui.enableCancelMode('DONE', function () {
				pInst.stopTagRemovalMode();
			});

		});

	},

	manageTagLike: function (btnLike) {

		var pInst = this,

			elmTag = plib.getParentByClassName(btnLike, classes.tag),
			elmTagLink = plib.getParentByClassName(btnLike, classes.tagLink),
			elmTagBubble = plib.getElementsByClassName(classes.tagBubble, elmTag)[0],

			shareHolder,
			shareHeader,
			shareButtons,

			share_title = plib.attribute(elmTagLink, attributes.tagName),
			share_url = plib.attribute(elmTagLink, attributes.tagWebLink),

			attr;
		
		// CONTAINER
		attr = {};
		attr[attributes.className] = classes.shareHolder;
		shareHolder = plib.newElement(html.div, attr);
		
		// HEADER TEXT
		attr = {};
		attr[attributes.className] = classes.shareHeader;
		shareHeader = plib.domAppend(html.span, shareHolder, attr, "SHARE THIS ON");

		// BUTTON HOLDER
		attr = {};
		attr[attributes.className] = classes.shareButtons;
		shareButtons = plib.domAppend(html.div, shareHolder, attr);

		// TWITTER BUTTON
		attr = {};
		attr[attributes.className] = classes.shareButton + whiteSpace + 'st_twitter_large';
		attr[attributes.href] = directory.paths.twitter + plib.getParamsFromObject({
			'text': share_title + ' found at ',
			'url': encodeURI(share_url)
		});
		plib.click(plib.domAppend(html.a, shareButtons, attr), function () {
			pfunc.openPopupWindow(plib.attribute(this, attributes.href), 480, 400);
		});

		// FACEBOOK BUTTON
		attr = {};
		attr[attributes.className] = classes.shareButton + whiteSpace + 'st_facebook_large';
		attr[attributes.href] = directory.paths.facebook + plib.getParamsFromObject({
			'u': encodeURI(share_url),
			't': encodeURIComponent(share_title)
		});
		plib.click(plib.domAppend(html.a, shareButtons, attr), function () {
			pfunc.openPopupWindow(plib.attribute(this, attributes.href), 1000, 640);
		});

		// disable node update to avoid unwanted redraws
		pInst.updateInProgress = true;

		// redraw the bubble with our new content
		plib.removeElement(elmTagBubble);
		elmTagBubble = pInst.drawTagBubble(elmTag, shareHolder);

		// redraw the tags on mouseout so on next hover the share info is gone
		plib.removeEvent(elmTag, events.mouseout);
		plib.addEvent(elmTag, events.mouseout, function (event) {
			// This is a cross browser implementation of the event 'mouseleave'
			if (new pfunc.MouseBoundaryCrossing(event, this).leftLandmark) {
				pInst.updateInProgress = false;
				pInst.updateNode(true); // FORCE REDRAW TAGS FROM CACHE
			}
		});


	}


};



pfunc = {

	systemStart: function () {


		var pseudoSEO = document.getElementById(sysName + "SEO"),
			lazyLoadEvent = function () {

				// clear scroll memory if it exists
				clearTimeout(scrollMem);
				scrollMem = setTimeout(function () {

					if (!plib.isObjectEmpty(hiddenImages)) {
						plib.loopObject(hiddenImages, function (val) {
							pfunc.loadImage(val.image);
						});
					// ONLY remove events if forceListen is off AND no images are hidden
					} else if (!settings.forceListen) {
						plib.removeEvent(document, support.propertychange);
						plib.removeEvent(document, events.scroll);
					}

					// independant from hiddenImages
					if (settings.forceListen) {
						pfunc.checkForImages();
					}

				}, settings.scrollDelay);

			};


		if (alive) {
			// {opendebug}
			pfunc.warn(messages.alreadyAlive);
			// {closedebug}
			return;
		}

		// dont allow multiple instances
		alive = true;

		// init the stats
		stats = {
			nImagesFound: 0,
			nImagesLoaded: 0,
			nImagesDenied: 0
		};


		if (settings.custom && !plib.isObjectEmpty(settings.custom) && plib.hasProperty(settings.custom, document.body.id)) {
			pfunc.updateSettings(settings.custom[document.body.id]);
		}

		// start the key listener
		pfunc.initKeyListener();

		// test for browser supported methods
		pfunc.checkSupport();



		if (plib.isElement(pseudoSEO)) {
			globalElements.pseudoSEO = pseudoSEO;
		}


		// INSERT THE WINDOW OVERLAY
		globalElements.pInstActive = plib.newElement(html.div, {
			'id': classes.docBody,
			'class': classes.docBody
		});
		// move the body's children into this wrapper
		while (document.body.firstChild) { globalElements.pInstActive.appendChild(document.body.firstChild); }
		// append the wrapper to the body
		document.body.appendChild(globalElements.pInstActive);



		// LET THE CSS FILE KNOW WHEN A CSS FEATURE IS NOT SUPPORTED
		if (!settings.animations) {
			plib.addClass(globalElements.pInstActive, classes.noAnimation);
		}
		if (!support.rgba) {
			plib.addClass(globalElements.pInstActive, classes.noRgbaSupport);
		}
		if (!support.boxShadow) {
			plib.addClass(globalElements.pInstActive, classes.noBoxShadowSupport);
		}
		if (!support.borderRadius) {
			plib.addClass(globalElements.pInstActive, classes.noBorderRadiusSupport);
		}



		// LOAD EXCANVAS IF NEEDED
		if (!support.canvas) {
			if (plib.isUndefined(window[oNamespace.vmlCanvas])) {
				// {opendebug}
				pfunc.info(messages.excanvasRequest);
				// {closedebug}
				plib.loadScript(directory.paths.excanvas, function () {
					// because we are adding the excanvas file after the document has loaded, this method does not get called
					// run this method to insert xmlns
					window[oNamespace.vmlCanvas].init_(document);
					// re-check support
					support.canvas = pfunc.getCanvasContext(document.createElement(html.canvas));
					// {opendebug}
					pfunc.info(messages.excanvasReceived, support.canvas ? 'now supported' : 'still not supported');
					// {closedebug}
				});
			}
		}


		globalElements.pInstWrapper = plib.domAppend(html.div, globalElements.pInstActive, { 'class': classes.wrapper });


		if (settings.allowThemeManager) {
			pfunc.manageTheme(settings.themeFile);
		}



		// CREATE WINDOW HTML
		globalElements.pInstWindow = plib.domAppend(html.div, globalElements.pInstWrapper, { 'class': classes.window });
		globalElements.pInstWindowOverlay = plib.domAppend(html.div, globalElements.pInstWrapper, { 'class': classes.windowOverlay });
		globalElements.pInstWindowClose = plib.domAppend(html.span, globalElements.pInstWindow, { 'class': classes.windowClose }, 'close');
		globalElements.pInstWindowBody = plib.domAppend(html.div, globalElements.pInstWindow, { 'class': classes.windowBody });
		globalElements.pInstWindowBackground = plib.domAppend(html.div, globalElements.pInstWindow, { 'class': classes.windowBackground });
		plib.click(globalElements.pInstWindowOverlay, pfunc.closeWindow);
		plib.click(globalElements.pInstWindowClose, pfunc.closeWindow);



		// we dont care if the login check succeeded or failed.. we just want to get user info if available before creating instances..
		pfunc.checkLogin(null, null, function () {



			pfunc.checkForImages();

			// SMART LOAD FEATURE WHEN NEEDED
			if ((settings.smartLoad && !plib.isObjectEmpty(hiddenImages)) || settings.forceListen) {
				plib.addEvent(document, support.propertychange, lazyLoadEvent);
				plib.addEvent(document, events.scroll, lazyLoadEvent);
			}

			// {opendebug}
			if (stats.nImagesLoaded === 0) {
				// if no images are hidden and none have loaded so far, we can assume no images exist
				pfunc.info(messages.noImages);
			}
			// {closedebug}

			// if a callback is set, let the outside world know we are ready
			if (settings.onReady) {
				settings.onReady.call(window[oNamespace.root]);
			}

			// {opendebug}
			pfunc.timeEnd(messages.sysLoadTime);
			// {closedebug}


		});





	},

	systemStop: function () {

		if (!alive) {
			// {opendebug}
			pfunc.warn(messages.alreadyDead);
			// {closedebug}
			return;
		}

		alive = false;

		// remove each node and put back the original image
		plib.loopObject(cacheNodes, function (val) {
			val.instance.destroy();
		});

		// remove the popup window
		plib.removeElement(globalElements.pInstWrapper);

		// remove the global body wrapper
		while (globalElements.pInstActive.hasChildNodes()) {
			globalElements.pInstActive.parentNode.insertBefore(globalElements.pInstActive.firstChild, globalElements.pInstActive);
		}
		plib.removeElement(globalElements.pInstActive);


		// remove any remaining events
		plib.loopObject(cacheEvents, function (val) {
			/*
			val = object that contains multiple event objects
			*/
			plib.loopObject(val, function (key, val) {
				/*
				key = event type string
				val = object that contains the element with the event and its handler
				*/
				plib.removeEvent(val.element, key);
			});
		});


		// RESET GLOBAL VARIABLES
		globalElements = {};
		globalKeyEvents = {};
		cacheImages = {};
		cacheNodes = {};
		cacheTags = {};
		cacheTagData = {};
		cacheEvents = {};
		cacheElements = {};
		queueTagData = {};
		jsonpHandler = {};
		jsonpTimeout = {};
		userInfo = {};
		support = {};
		hiddenImages = {};
		stats = {};

		settings = plib.cloneObject(defaultSettings);


		// if we reset variables that were in the window namespace then they can no longer be found until we update them
		pfunc.updateWindowNamespace();

		// manually reset login check
		nLastLoginCheck = 0;

		// do our alert before we delete our funcs : -)
		// {opendebug}
		pfunc.info(messages.sysDestroyed);
		// {closedebug}

	},

	updateWindowNamespace: function (ns, object) {

		// note: I'm not sure if this is proper.. but it works.
		// add the object to the window namespace as well as prototype it onto the constructor
		var fn = {},
			update = function (ns, object) {
				window[oNamespace.root][ns] = object;
				window[oNamespace.root].prototype[ns] = object;
			};

		// if a namespace was given then only update that namespace
		if (ns && object) {

			update(ns, object);

		// if not then update all namespaces
		} else {

			update(oNamespace.globalVars, globalVars);
			update(oNamespace.settings, settings);
			update(oNamespace.defaultSettings, defaultSettings);
			update(oNamespace.user, userInfo);

			// we do this so that our dynamically added scripts can access our jsonp handler from outside our scope
			update(oNamespace.json, jsonpHandler);

			update(oNamespace.lib, plib); // make all of lib global

			// make some functions global, not all
			plib.loopObject({
				'systemStart': pfunc.systemStart,
				'systemStop': pfunc.systemStop,
				'updateSettings': pfunc.updateSettings,
				'loadImage': pfunc.loadImage,
				'unLoadImage': pfunc.unLoadImage,
				'checkForImages': pfunc.checkForImages,
				'promptRegister': pfunc.promptRegister,
				'promptLogin': pfunc.promptLogin,
				'promptLogout': pfunc.promptLogout,
				'promptAddTag': pfunc.promptAddTag,
				'promptSettings': pfunc.promptSettings,
				'promptOpenLightbox': pfunc.promptOpenLightbox,
				'changeTheme': pfunc.changeTheme
			}, function (key, val) {
				fn[key] = val;
			});

			// now that our fn object is populated, add it to our name space
			update(oNamespace.fn, fn);

			// other potentially useful objects that should be in the global scope
			update(oNamespace.images, cacheImages);
			update(oNamespace.nodes, cacheNodes);
			update(oNamespace.tags, cacheTags);
			update(oNamespace.events, cacheEvents);
			update(oNamespace.elements, cacheElements);



		}

	},

	// http://royaltutorials.com/dom-image-zero-width-chrome/
	onImageDimensionReady: function (image, method) {

		function checkReady() {

			var dimensions = {},
				checkDimensions = function () {
					dimensions.width = plib.getWidth(image);
					dimensions.height = plib.getHeight(image);
					if (dimensions.width !== 0 && dimensions.height !== 0) {
						return true;
					}
					return false;
				};


			if (checkDimensions() === true) {
				method.call(image, dimensions);
			} else {
				plib.runInterval(10, 100, checkDimensions, function () {
					method.call(image, dimensions);
				});
			}

		}

		if (!image.complete) {
			plib.addEvent(image, events.load, checkReady);
		} else {
			checkReady();
		}

	},

	cacheImage: function (image) {
		var uid;
		if (!image.pinUID) {
			uid = plib.randomID(10);
			cacheImages[uid] = {
				loaded: false, // set true once/if sys loads onto this image
				image: image,
				offset: plib.getCumulativeOffset(image)
			};
			image.pinUID = uid;
		}
	},

	checkForImages: function (elmParentNode) {

		/*** NOTE ~~~~~~~~~~~
		never initiate on images as we find them
		loop all visible images and cache them first
		we do this so we can grab dimensions and offset values before the system has the chance to offput anything
		***/

		function checkParentForImages(parent) {
			plib.loopArray(parent.getElementsByTagName(html.img), function (image) {
				pfunc.cacheImage(image);
			});
		}

		if (!alive) {
			// {opendebug}
			pfunc.warn(messages.sysNotActive);
			// {closedebug}
			return;
		}

		if (settings.loadAll) {

			elmParentNode = elmParentNode || document;


			// if provided parent node is an element object
			if (plib.isElement(elmParentNode) || elmParentNode === document) {
				checkParentForImages(elmParentNode);
			// if provided parent is an array, then assume the array contains multiple parent objects
			} else if (plib.isArray(elmParentNode)) {
				plib.loopArray(elmParentNode, function (element) {
					checkParentForImages(element);
				});
			}

		} else {

			// CYCLE THROUGH SINGLE CLASS IMAGES
			plib.loopArray(plib.getElementsByClassName(settings.activeChildClass), function (image) {
				pfunc.cacheImage(image);
			});
			// CYCLE THROUGH GROUPED CLASS IMAGES
			plib.loopArray(plib.getElementsByClassName(settings.activeParentClass), function (element) {
				plib.loopArray(element.getElementsByTagName(html.img), function (image) {
					pfunc.cacheImage(image);
				});
			});
			if (settings.loadImages.length > 0) {
				plib.loopArray(settings.loadImages, function (image) {
					pfunc.cacheImage(image);
				});
			}

		}

		// LOOP OVER OUR IMAGE CACHE AND LOAD ANY IMAGES THAT MAY BE NEW AND UNLOADED
		plib.loopObject(cacheImages, function (val) {
			if (!val.loaded) {
				pfunc.loadImage(val.image);
			}
		});


		// {opendebug}
		pfunc.info(messages.imageCount, stats.nImagesFound, stats.nImagesLoaded, stats.nImagesDenied);
		// {closedebug}


	},

	unLoadImage: function (image, bRemove) {


		bRemove = bRemove || false;

		pfunc.manageUserInputImage(image, function (pInst) {
			pInst.destroy(bRemove);
		});

		delete cacheImages[image.pinUID];


	},

	loadImage: function (image) {


		if (!alive) {
			// {opendebug}
			pfunc.warn(messages.sysNotActive);
			// {closedebug}
			return;
		}

		stats.nImagesFound++;

		pfunc.verifyImageReference(image, function (image) {


			// use the `src` attribute because it will be the most accurate
			// the `src` attribute may be empty, but the `src` property may still contain the domain

			var pInst,
				imgFileSource = plib.attribute(image, attributes.src),
				imgFileExt = plib.getFileExtension(imgFileSource),
				valid = true;


			// has the image not yet been cached?
			// this can happen with ajaxed images or during the unload/load process
			if (!image.pinUID) {
				pfunc.cacheImage(image);
			}


			// if we created an instance already use it, if not then make a new one
			pInst = plib.hasProperty(hiddenImages, image.pinUID) ? hiddenImages[image.pinUID] : new PinInst(image, image.pinUID);


			// has the image already been initialized?
			if (plib.attribute(image, attributes.imgLoaded) === strBool[1]) {
				// {opendebug}
				pfunc.warn(messages.badInstance);
				// {closedebug}
				valid = false;

			// make sure the image has a file source
			} else if (!imgFileSource || plib.stripSpaces(imgFileSource) === '') {
				// {opendebug}
				pfunc.warn(messages.imageNoSrc, image);
				// {closedebug}
				valid = false;

			// dont load images if they are not a known image file format
			} else if (!plib.inArray(settings.allowFile.split('|'), imgFileExt)) {
				// {opendebug}
				pfunc.warn(messages.imageBadFile, imgFileExt, image);
				// {closedebug}
				valid = false;

			// a test to see if the image still exists in dom
			} else if (!plib.isElementIn(image, document)) {
				// {opendebug}
				pfunc.warn(messages.imageNotFound, image);
				// {closedebug}
				valid = false;
			} else if (globalElements.pseudoSEO && plib.isElementIn(image, globalElements.pseudoSEO)) {
				// {opendebug}
				pfunc.warn(messages.imageIgnoreSEO, image);
				// {closedebug}
				valid = false;
			}


			if (!valid) { stats.nImagesDenied++; } else {

				// to continue our image validation, the image must be loaded, wait for the image to load if needed
				pfunc.onImageDimensionReady(image, function (dimensions) {

					// prevent small images
					if (dimensions.width < settings.nMinWidth || dimensions.height < settings.nMinHeight) {
						// {opendebug}
						pfunc.warn(messages.imageTooSmall, dimensions.width, settings.nMinWidth, dimensions.height, settings.nMinHeight, this);
						// {closedebug}
						return;
					}


					// if all conditions above are met then check to see if the image is hidden
					if (settings.smartLoad) {

						if (pfunc.isHidden(this)) {
							// our image is not visible so add it to an array of instances to check when the dom is updated
							hiddenImages[this.pinUID] = pInst;
							return;
						} else if (plib.hasProperty(hiddenImages, this.pinUID)) {
							// if image is cached in our hidden images array, remove it since it is not longer hidden :p
							delete hiddenImages[this.pinUID];
						}
					}


					// !**** if all conditions above are met, then our image is valid and ready

					stats.nImagesLoaded++;


					cacheImages[this.pinUID].loaded = true;

					// {opendebug}
					pfunc.info(messages.imageLoaded, this);
					// {closedebug}



					pInst.settings = plib.cloneObject(settings);
					if (settings.custom && !plib.isObjectEmpty(settings.custom) && plib.hasProperty(settings.custom, image.id)) {
						pfunc.mergeStrictObjects(pInst.settings, settings.custom[image.id]);
					}
					// just for the hell of it :D
					delete pInst.settings.custom;



					pInst.init(); // begin loading interface

				});

			}


		});

	},



	/*
	@param {object} masterObject The object that will have its values overridden
	@param {object} slaveObject The object that merges into the existing object
	@param {boolean} strongType Should object values maintain their typecast?
	@return {object} The resulting merged object
	*/
	mergeStrictObjects: function (masterObject, slaveObject) {


		plib.loopObject(slaveObject, function (key, val) {

			var masterType,
				slaveType;

			if (plib.hasProperty(masterObject, key)) {

				masterType = plib.type(masterObject[key]);
				slaveType = plib.type(val);


				if (masterType !== slaveType) {
					// {opendebug}
					pfunc.warn(messages.badType, key, masterType, slaveType);
					// {closedebug}
					return;
				}

				// "isObjectEmpty" not only checks for empty objects, but will also weed out functions since they too, are considered objects
				// "isArray" is used to weed out arrays since they too, are considered objects
				//if (plib.isObject(val) && !plib.isArray(val) && !plib.isObjectEmpty(val)) {
				if (plib.isObject(val)) {
					// this is pretty much a hack for settings.custom
					if (plib.isObjectEmpty(masterObject[key])) {
						masterObject[key] = val;
					} else {
						pfunc.mergeStrictObjects(masterObject[key], val);
					}
				} else {
					masterObject[key] = val;
				}

			}

			// {opendebug}
			if (!plib.hasProperty(masterObject, key)) { pfunc.warn(messages.settingDNF, key); }
			// {closedebug}

		});


	},

	updateSettings: function (data) {

		// BIG NOTE: DO NOT override the settings object.. only edit/add properties etc..
		// doing so will cause the namespace pointer to change and the window object does not update..
		pfunc.mergeStrictObjects(settings, data);

	},



	initKeyListener: function () {
		if (settings.keyListener) {
			plib.addEvent(document, events.keyup, function (evt) {
				var keycode = evt.charCode || evt.keyCode;
				if (plib.hasProperty(globalKeyEvents, keycode)) {
					plib.loopObject(globalKeyEvents[keycode], function (val) {
						val(keycode);
					});
				}
			});
		}
	},

	newKeyListener: function (key, uid, callback) {
		if (settings.keyListener) {
			// if provided uid is an element, then grab its guid and use that
			if (plib.isElement(uid)) {
				uid = plib.getGUID(uid);
			}
			// insert an object into our scope, indexed by the keycode (if needed)
			if (!globalKeyEvents[key]) {
				globalKeyEvents[key] = {};
			}
			// if we found an identifier, then go ahead and insert it into our scope
			if (uid) {
				globalKeyEvents[key][uid] = callback;
			}
		}
	},


	// remove a single binded key listener (if it exists of course) relative to the keycode and identifier provided
	removeKeyListener: function (key, uid) {
		if (settings.keyListener && globalKeyEvents[key]) { // keycode specific (check for a keycode before we continue)
			// if provided uid is an element, then grab its guid and use that
			if (plib.isElement(uid)) {
				uid = plib.getGUID(uid);
			}
			// remove the callback from our keycode scope (if found)
			if (globalKeyEvents[key][uid]) {
				delete globalKeyEvents[key][uid];
			}
			// if no more callbacks exist in our keycode scope.. remove the object from the scope (its no longer being used)
			if (plib.isObjectEmpty(globalKeyEvents[key])) {
				delete globalKeyEvents[key];
			}
		}
	},

	// remove ALL binded key listeners relative to the provided indentifier (element.guid)
	// note: this is not keycode specific and we are potentially removing multiple keycodes
	removeAllKeyListeners: function (uid) {
		if (settings.keyListener) {
			// loop all keycode listeners
			plib.loopObject(globalKeyEvents, function (key, val) {
				/*
				key = keycode
				val = object that contains callback functions indexed by an identifier (element.guid)
				*/
				if (val[uid]) { // if we find our identified listener inside this keycode, then remove it
					pfunc.removeKeyListener(key, uid);
				}
			});

		}
	},

	// element has to be visible for height calculation to work
	centerHorizontal: function (element) {

		var width = plib.getWidth(element),
			offset = '-' + String(width / 2) + cssUnit;
		plib.setStyle(element, css.margin.left, offset);

	},

	// element has to be visible for height calculation to work
	centerVertical: function (element) {

		var height = plib.getHeight(element),
			offset = '-' + String(height / 2) + cssUnit;
		plib.setStyle(element, css.margin.top, offset);

	},

	openWindow: function (layObject, callback) {

		// NOTE: a window may be prompted to open EVEN IF an existing window is already open.
		// This is fine, the layout is simply updated and the keylistener is overridden.

		/*
		// did we pass in a doc fragment? if so it needs to be inserted not parsed
		if (layObject.nodeType === 11) {
			plib.removeChildren(globalElements.pInstWindowBody);
			plib.domAppend(layObject, globalElements.pInstWindowBody);
		// assume an array or object was passed that needs parsing
		} else {
			plib.replaceHTML(globalElements.pInstWindowBody, layObject);
		}
		*/

		plib.replaceHTML(globalElements.pInstWindowBody, layObject);

		// add class that makes the window visible
		plib.addClass(globalElements.pInstWrapper, classes.actionShowWin);

		// the layout has changed (or is new) so update the vertical position of the window
		pfunc.centerVertical(globalElements.pInstWindow);

		// listen for escape key to close window
		pfunc.newKeyListener(keyCodes.esc, globalElements.pInstWindow, function () {
			pfunc.closeWindow();
		});

		// run the provided callback
		if (callback) { callback.call(globalElements.pInstWindow); }

	},

	openPrivateWindow: function (layObject, callback) {

		var funcOnSuccess = function () {
				pfunc.openWindow(layObject, function () {

					var holder = plib.getElementsByClassName(classes.windowUserName, this)[0];

					plib.domAppend(html.span, holder, 'Logged in as: ');
					plib.appendText(holder, userInfo[serverKeys.user.fullName]);

					plib.click(plib.getElementsByClassName(classes.windowLogout, this)[0], function () {
						pfunc.closeWindow();
						pfunc.promptLogout();
					});

					if (callback) { callback.call(this); }

				});
			};

		pfunc.checkLogin(function () { // LOGIN TEST SUCCESS
			funcOnSuccess();
		}, function () { // LOGIN TEST FAILED
			pfunc.promptLogin(function () {
				funcOnSuccess();
			});
		});

	},

	closeWindow: function () {
		// because we never remove the element from DOM.. manually remove the listener
		pfunc.removeKeyListener(keyCodes.esc, globalElements.pInstWindow);
		plib.removeClass(globalElements.pInstWrapper, classes.actionShowWin);
		//globalElements.pInstWindowBody.innerHTML = '';
		plib.removeChildren(globalElements.pInstWindowBody);
	},

	promptConfirm: function (message, callback) {

		pfunc.openWindow(layout.confirmPrompt, function () {

			var btnAccept = plib.getElementsByClassName(classes.promptAccept, this)[0],
				btnDeny = plib.getElementsByClassName(classes.promptDeny, this)[0];

			plib.appendText(plib.getElementsByClassName(classes.promptMessage, this)[0], message);

			plib.click(btnAccept, function () {
				pfunc.waitButton(this, messages.formWait);
				plib.removeElement(btnDeny);
				callback();
			});

			plib.click(btnDeny, function () {
				pfunc.closeWindow();
			});
		});

	},

	setWindowLink: function (element, url, target) {
		target = target || '_self';
		plib.click(element, function () {
			var w = window.open(url, target);
			w.focus();
		});
		plib.attribute(element, attributes.href, url);
	},

	openPopupWindow: function (url, width, height) {

		/*
		TESTED IN:
		Opera 11.51
		Chrome 16.0.904.0
		IE 7/8/9
		FF 3.6.23
		Safari 5.1
		*/

		// NOTE: in opera, if the popup dimensions are larger than the window dimensions then it will open in a new tab instead

		var newWindow,
			docWidth = window.innerWidth || document.documentElement.clientWidth || 0,
			docHeight = window.innerHeight || document.documentElement.clientHeight || 0,
			docLeft = window.screenLeft || window.screenX || 0,
			docTop = window.screenTop || window.screenY || 0,
			posLeft = docLeft + (docWidth / 2) - (width / 2),
			posTop = docTop + (docHeight / 2) - (height / 2),
			winopts = [];

		plib.loopObject({
			'toolbar': 0,
			'scrollbars': 0,
			'location': 1,
			'statusbar': 0,
			'menubar': 0,
			'resizable': 1,
			'width': width,
			'height': height,
			'left': Math.abs(posLeft),
			'top': Math.abs(posTop)
		}, function (key, val) {
			winopts[winopts.length] = key + '=' + val;
		});


		newWindow = window.open(url, plib.randomID(8), winopts.join(','));

		if (window.focus) {
			newWindow.focus();
		}

		return newWindow; // if you want it

	},

	updateUserInfo: function (data) {
		// trigger user info erase with null
		if (data === null) {
			plib.loopObjectKeys(userInfo, function (key) {
				delete userInfo[key];
			});
		} else {
			plib.mergeObject(userInfo, data);
		}
	},

	checkLogin: function (fSuccess, fFailure, fBoth) {


		var time = new Date().getTime(),
			timeDiff = time - nLastLoginCheck,
			postCheckAction = function (data) {
				if (!plib.isObjectEmpty(data)) { // if not empty, then we have user data, which means we are logged in
					userLogged = true;
					if (fSuccess) { fSuccess(); }
				} else {
					userLogged = false;
					if (fFailure) { fFailure(); }
				}
				if (fBoth) { fBoth(); }
			};

		// if never or last attempt was more than a minute ago
		if (nLastLoginCheck === 0 || timeDiff > 60000) {

			nLastLoginCheck = time;

			plib.loadJSONP(directory.names.checkLogin, function (data) {
				pfunc.updateUserInfo(data);
				postCheckAction(data);
			});

		} else {

			postCheckAction(userInfo);
		}

	},

	checkPermission: function (callback) {
		if (!userInfo[serverKeys.user.isOwner]) {
			pfunc.openWindow(layout.msgNoPermission);
		} else if (callback) {
			callback();
		}
	},

	waitButton: function (element, text) {

		var eventHolder = pfunc.deactivateEvents(element, [events.mouseover, events.mouseout]);

		if (!plib.isObjectEmpty(eventHolder)) {
			element.oEventMemory = eventHolder;
		}

		if (text) {
			plib.attribute(element, attributes.orgText, plib.textContentRecursive(element));
			plib.textContentRecursive(element, text);
		}

	},

	unwaitButton: function (element) {

		plib.textContentRecursive(element, plib.attribute(element, attributes.orgText));
		plib.attribute(element, attributes.orgText, null); // remove

		if (element.oEventMemory) {
			pfunc.activateEvents(element, element.oEventMemory);
			delete element.oEventMemory;
		}

	},

	/*
	@param {element} element The element which needs the events removed.
	@param {array} arrEvents An array which contains events names that need to be suspended.
	@return {object} An object which contains the removed events indexed by event name.
	*/
	deactivateEvents: function (element, arrEvents) {

		var guid = plib.getGUID(element),
			eventHolder = {};

		plib.loopArray(arrEvents, function (event) {
			if (cacheEvents[guid] && cacheEvents[guid][event]) {
				eventHolder[event] = cacheEvents[guid][event].handler;
				// note: this will remove the event from cache..
				// it is now only accessible through the returned array
				plib.removeEvent(element, event);
			}
		});

		return eventHolder;

	},

	/*
	@param {element} element The element which needs the events restored.
	@param {object} eventHolder An object which contains the to-be-attached events indexed by event name. This is typically return data of the "deactivateEvents" method
	*/
	activateEvents: function (element, eventHolder) {
		plib.loopObject(eventHolder, function (key, val) {
			plib.addEvent(element, key, val);
		});
	},



	// http : //test.dragonzreef.com/mouseenterleave.htm
	// since mouseenter & mouseleave are only supported in IE, this object helps to determine if the mouse is entering or leaving an element
	// landmark : did the mouse enter or leave this 'landmark' element? Was the event fired from within this element?
	MouseBoundaryCrossing: function (evt, landmark) {

		evt = evt || window.event;
		var eventType = evt.type,
			tmpFrom,
			tmpTo;

		this.inLandmark = false;
		this.leftLandmark = false;
		this.enteredLandmark = false;

		if (eventType === events.mouseout) {
			this.toElement = evt.relatedTarget || evt.toElement;
			this.fromElement = evt.target || evt.srcElement;
		} else if (eventType === events.mouseover) {
			this.toElement = evt.target || evt.srcElement;
			this.fromElement = evt.relatedTarget || evt.fromElement;
		}

		// TARGET IS UNKNOWN
		// this seems to happen on the mouseover event when the mouse is already inside the element when the page loads and the mouse is moved : fromElement is undefined
		if (!this.toElement || !this.fromElement) {
			// {opendebug}
			pfunc.warn(messages.badTarget);
			// {closedebug}
			return;
		}

		// determine whether from-element is inside or outside of landmark (i.e., does tmpFrom == the landmark or the document?)
		tmpFrom = this.fromElement;
		// while tmpFrom is an element node
		while (plib.isElement(tmpFrom)) {
			if (tmpFrom === landmark) {
				break;
			}
			tmpFrom = tmpFrom.parentNode;
		}

		// determine whether to-element is inside or outside of landmark (i.e., does tmpTo == the landmark or the document?)
		tmpTo = this.toElement;
		// while tmpTo is an element node
		while (plib.isElement(tmpTo)) {
			if (tmpTo === landmark) {
				break;
			}
			tmpTo = tmpTo.parentNode;
		}

		if (tmpFrom === landmark && tmpTo === landmark) {
			//mouse is inside landmark; didn't enter or leave
			this.inLandmark = true;
		} else if (tmpFrom === landmark && tmpTo !== landmark) {
			//mouse left landmark
			this.leftLandmark = true;
			this.inLandmark = (eventType === events.mouseout);	//mouseout : currently inside landmark, but leaving now
																//mouseover : currently outside of landmark; just left
		} else if (tmpFrom !== landmark && tmpTo === landmark) {
			//mouse entered landmark
			this.enteredLandmark = true;
			this.inLandmark = (eventType === events.mouseover);	//mouseover : currently inside landmark; just entered
																//mouseout : currently outside of landmark, but entering now
		}

	},

	isHidden: function (element) {

		var pos = plib.getCumulativeOffset(element),
			nodeWidth = plib.getWidth(element),
			nodeHeight = plib.getHeight(element),
			pageOffsetLeft = window.pageXOffset || document.documentElement.scrollLeft, // documentElement for MSIE
			pageOffsetTop = window.pageYOffset || document.documentElement.scrollTop, // documentElement for MSIE
			windowWidth = window.innerWidth || document.documentElement.offsetWidth, // documentElement for MSIE
			windowHeight = window.innerHeight || document.documentElement.offsetHeight, // documentElement for MSIE

			// wait untill we have proper pageOffsetLeft/pageOffsetTop values
			distXfarLeft,
			distXfarRight,
			distYfarTop,
			distYfarBottom,

			fixedParent,
			fixedParentOffset,
			loopParentsAndSelf = function (element, method) {
				do {
					if (method(element)) { break; }
					element = element.offsetParent;
				} while (element);
			};

		// check for parents with fixed positions
		loopParentsAndSelf(element, function (element) {
			if (plib.getStyle(element, css.position).toLowerCase() === "fixed") {
				fixedParent = element;
				return null; // break loop
			}
		});

		// if one of the parents has a fixed position, then use it (rather than window/document) to define the pageOffset values
		if (fixedParent) {
			fixedParentOffset = plib.getCumulativeOffset(fixedParent);
			pageOffsetLeft = fixedParentOffset.x;
			pageOffsetTop = fixedParentOffset.y;
		}

		distXfarLeft = (pos.x - pageOffsetLeft + nodeWidth) < 0 ? true : false; // image is too far left
		distXfarRight = pos.x > (windowWidth + pageOffsetLeft) ? true : false; // image is too far right
		distYfarTop = (pos.y - pageOffsetTop + nodeHeight) < 0 ? true : false; // image is too far top
		distYfarBottom = pos.y > (windowHeight + pageOffsetTop) ? true : false; // image is too far bottom

		if (distXfarLeft || distXfarRight || distYfarTop || distYfarBottom || nodeWidth < 0 || nodeHeight < 0) {
			return true;
		}

		// check visibility last to avoid calling getComputedStyles
		return !plib.isVisible(element);

	},

	getPosPercentage: function (evt) {

		var evTarg = plib.getEventTarget(evt),
			pos = plib.getMousePosition(evt),
			offset = plib.getCumulativeOffset(evTarg),
			nPosX = ((pos.x - offset.x) / plib.getWidth(evTarg)).toFixed(10),
			nPosY = ((pos.y - offset.y) / plib.getHeight(evTarg)).toFixed(10);

		return {x: nPosX, y: nPosY};

	},

	manageKeywords: function (formElement) {
		plib.addEvent(formElement, events.change, function () {
			var arrKeywords = this.value.replace(regex.ltrim, '').replace(regex.rtrim, '').split(regex.csv);
			// remove duplicates and then reduce array to 10 items
			this.value = plib.arrayUnique(arrKeywords).slice(0, 10).join(', ').toLowerCase();
		});
	},

	loopFormFields: function (form, callback) {
		plib.loopArray(form.elements, function (element) {
			var node = element.nodeName.toLowerCase();
			if (node === html.input || node === html.textarea || node === html.select) {
				return callback.call(element);
			}
		});
	},

	manageFormSubmit: function (form, dir, require, callback, extraValidation) {

		// because you cant change the type attribute of a button element in IE7, and buttons default to type="button" in IE7, we need to add a click event that simulates a submit button
		plib.click(plib.getElementsByClassName(classes.formBtnSubmit, form)[0], function () {
			plib.fireEvent(form, events.submit);
		});

		// add class on focus for themeing
		pfunc.loopFormFields(form, function () {
			plib.addEvent(this, events.focus, function () {
				plib.addClass(this.parentNode, classes.focus);
			});
			plib.addEvent(this, events.blur, function () {
				plib.removeClass(this.parentNode, classes.focus);
			});
		});

		// focus on first empty field in form
		pfunc.formFocus(form);

		// listen for ENTER key
		// note: key listener will be removed when the form is removed via plib.removeElement
		pfunc.newKeyListener(keyCodes.enter, form, function () {
			plib.fireEvent(form, events.submit);
		});


		plib.addEvent(form, events.submit, function (evt) {


			var formData,
				error;

			// NOTE: do not worry about removing the event.
			// doing so could cause validation issues.
			// when the window is closed the event will remain in our cache until we clear it.

			plib.stopBubble(evt); // dont let the form ACTUALLY submit :)


			formData = pfunc.getFormData(form);

			if (pfunc.checkRequired(form, require)) {

				if (extraValidation) {
					error = extraValidation.call(form, formData);
					if (error) {
						pfunc.displayFormError(form, error);
						return false; // validation failed so kill submit
					}
				}

				// disable form while we send data so to avoid multiple requests (double clickers)
				pfunc.disableForm(form);

				plib.loadJSONP(dir, formData, function (data) {

					// data was sent, now enable the form fields again
					pfunc.enableForm(form);

					callback.call(form, data);

				});

			}

			// stop MSIE from submit
			//return false;

		});

	},

	getFormData: function (form) {

		var data = {};

		plib.loopArray(form.elements, function (element) {

			// in some cases we insert hints into the form input value
			// if we receive only this hint, then we can assume a blank value was passed
			if (element.value === monetarySymbol || element.value === defaultWebProto) {
				element.value = '';
			}

			if (element.name && element.value) {
				data[element.name] = element.value;
			}

		});

		return data;

	},

	displayFormError: function (elmForm, error) {
		var errorHolder = plib.getElementsByClassName(classes.formError, elmForm)[0];
		if (error) {
			plib.replaceHTML(errorHolder, error);
			// erase all passwords in event of a failure
			plib.loopArray(elmForm.getElementsByTagName(html.input), function (element) {
				if (element.type === types.password) {
					element.value = '';
				}
			});
			// focus on first empty field in form
			pfunc.formFocus(elmForm);

		} else {
			plib.removeChildren(errorHolder);
		}

	},

	formFocus: function (form) {
		pfunc.loopFormFields(form, function () {
			if (!this.value) {
				this.focus();
				return null; // break loop
			}
		});
	},

	checkRequired: function (form, require) {

		var n = 0, // error count
			validate = function (element) {

				var label = plib.getParentByClassName(element, classes.formLabel);

				// small labels need love too
				if (!label) {
					label = plib.getParentByClassName(element, classes.formLabelSm);
				}

				if (!element.value || element.value === '') {
					n++;
					// label will not exist for hidden fields
					if (label) {
						plib.addClass(label, classes.formErrorRow);
					}
				} else if (label) {
					plib.removeClass(label, classes.formErrorRow);
				}

			};

		// if only one parameter was given ..
		if (require.length === 1) {
			// if the parameter is an asterisk then validate all inputs
			if (require[0] === asterisk) {
				pfunc.loopFormFields(form, function () {
					validate(this);
				});
			} else {
				validate(form.elements[require[0]]);
			}
		} else if (require.length > 0) {
			plib.loopArray(require, function (value) {
				validate(form.elements[value]);
			});
		}


		if (n > 0) {
			pfunc.displayFormError(form, messages.missingReqInput);
			return false;
		} else {
			pfunc.displayFormError(form, null);
			return true;
		}

	},

	enableFormElement: function (element) {
		plib.attribute(element, attributes.disabled, null);
		if (element.nodeName.toLowerCase() === html.input) {
			plib.attribute(element, attributes.readonly, null);
		}
		return element;
	},

	disableFormElement: function (element) {
		plib.attribute(element, attributes.disabled, attributes.disabled); // value = property
		if (element.nodeName.toLowerCase() === html.input) {
			plib.attribute(element, attributes.readonly, attributes.readonly); // value = property
		}
		return element;
	},

	disableForm: function (form) {

		var formBtnSubmit = plib.getElementsByClassName(classes.formBtnSubmit, form)[0];

		plib.loopArray(form.elements, function (element) {
			pfunc.disableFormElement(element);
		});

		if (formBtnSubmit) {
			pfunc.waitButton(formBtnSubmit, messages.formWait);
		}

	},

	enableForm: function (form) {

		var formBtnSubmit = plib.getElementsByClassName(classes.formBtnSubmit, form)[0];

		plib.loopArray(form.elements, function (element) {
			pfunc.enableFormElement(element);
		});

		if (formBtnSubmit) {
			pfunc.unwaitButton(formBtnSubmit);
		}

	},

	manageTagSuggestionList: function (form) {

		var dropdown = plib.domAppend(html.div, form, { 'class': classes.formDropDownDiv }),
			elmInputFocus = form.elements[names.strTagName],
			inputOffset = plib.getCumulativeOffset(elmInputFocus),
			parentOffset = plib.getCumulativeOffset(dropdown.parentNode),
			preventFocusLoss = function (element) {
				// STOP FOCUS LOSS WHEN CLICKING THE DROPDOWN
				plib.addEvent(element, events.mousedown, function (evt) {
					plib.stopBubble(evt);
				});
				/*
				plib.addEvent(element, events.mouseup, function () {
					elmInputFocus.blur();
				});
				*/
			},
			updateDropdownList = function (strChars) {

				// avoid large amounts of queries by waiting for the user to stop typing
				clearTimeout(dropdown.timeout);
				if (strChars) {
					dropdown.timeout = setTimeout(function () {


						plib.removeChildren(dropdown);
						plib.appendText(dropdown, messages.loading);
						plib.show(dropdown);

						plib.loadJSONP(directory.names.getTagSugg, {
							'strChars': strChars
						}, function (data) {

							plib.removeChildren(dropdown);

							// prevent showing the dropdown if focus has been lost while waiting for our query to finish
							if (!plib.hasClass(elmInputFocus.parentNode, classes.focus)) {
								return;
							}

							// data null = timeout
							// data undefined = no tags

							if (data === null) {

								plib.appendText(dropdown, messages.timeoutError);

							} else if (plib.isUndefined(data)) {

								plib.textContent(dropdown, messages.noResults);

							} else {
								plib.loopArray(data, function (value) {

									var link,
										attr;

									attr = {};
									attr[attributes.tagWebLink] = value[serverKeys.tags.webLink];
									attr[attributes.tagKeywords] = value[serverKeys.tags.keywords].join(', ');
									link = plib.domAppend(html.span, dropdown, attr);



									attr = {};
									attr[attributes.className] = classes.iconLabel;
									plib.domAppend(html.span, link, attr);

									// insert the icon element and then have the text node follow suit
									plib.appendText(link, value[serverKeys.tags.name]);

									preventFocusLoss(link);

									plib.click(link, function () {



										form.elements[names.strTagName].value = plib.textContent(this);
										form.elements[names.strWebLink].value = plib.attribute(this, attributes.tagWebLink);
										form.elements[names.strKeywords].value = plib.attribute(this, attributes.tagKeywords);

										elmInputFocus.blur();

									}, true);

								});

							}


						});

					}, 300);

				} else {

					// if we try and fetch tag suggestions with an empty string then just clear the list and hide the dropdown
					plib.removeChildren(dropdown);
					plib.hide(dropdown);

				}

			};



		dropdown.style[css.left] = String(inputOffset.x - parentOffset.x - 9) + cssUnit;
		dropdown.style[css.top] = String(inputOffset.y - parentOffset.y + 33) + cssUnit;


		plib.addEvent(elmInputFocus, events.focus, function () {
			plib.addClass(this.parentNode, classes.focus);
			if (this.value) {
				updateDropdownList(this.value);
			}
		});

		plib.addEvent(elmInputFocus, events.blur, function () {
			plib.removeClass(this.parentNode, classes.focus);
			plib.removeChildren(dropdown);
			plib.hide(dropdown);
		});

		plib.addEvent(elmInputFocus, events.keyup, function () {
			// dont check for value because empty strings will clear the list as needed
			updateDropdownList(this.value);
		});


		plib.hide(dropdown);

	},

	currencyFormat: function (num) {
		var sign,
			cents,
			addCommas = function (num) {
				var i;
				num = num.toString();
				for (i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
					num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
				}
				return num;
			},
			getCents = function (num) {
				num = String(num % 100);
				if (num.length < 2) {
					num = '0' + num;
				}
				return num;
			},
			getSign = function (num) {
				return parseFloat(num) < 0 ? '-' : '';
			};
		num = num.toString().replace(regex.nump, '');
		num = isNaN(num) ? '0' : num;
		sign = getSign(num);
		num = Math.floor(Math.abs(num) * 100 + 0.50000000001);
		cents = getCents(num);
		num = addCommas(Math.floor(num / 100));

		return sign + monetarySymbol + num + '.' + cents;
	},

	urlFormat: function (url) {
		var purl = plib.parseUrl(url),
			protos = ['http', 'https'];
		if (!purl.protocol || !plib.inArray(protos, purl.protocol)) {
			url = defaultWebProto + purl.host + purl.relative;
		}
		return url;
	},

	validWebUrl: function (formElement) {
		plib.addEvent(formElement, events.change, function () {
			this.value = pfunc.urlFormat(this.value);
		});
		if (formElement.value === '') {
			formElement.value = defaultWebProto;
		} else {
			plib.fireEvent(formElement, events.change);
		}
	},

	/*
	@param {element} canvas The element to grab context from.
	@param {string} context Optional type of context.
	@return {object CanvasRenderingContext2D|boolean} If context is provided then return context. If not then test if element supports the "getContext" method.
	*/
	getCanvasContext: function (canvas, context) {

		// NOTE: VML init must be called AFTER setting width and height
		// excanvas requires dynamically created elements to be defined as the following:
		// http://code.google.com/p/explorercanvas/wiki/Instructions
		if (!plib.isUndefined(window[oNamespace.vmlCanvas])) {
			window[oNamespace.vmlCanvas].initElement(canvas);
		}

		if (context) {
			return canvas.getContext(context);
		} else {
			return !!canvas.getContext;
		}

	},

	/*
	@param {string} style A non camelized css property
	@return {array} A list that contains the property prefixed with vendor specific identifiers and camelized
	*/
	getStylePrefixes: function (style) {
		var styles = [plib.camelize(style)];
		plib.loopArray(['webkit', 'moz', 'o', 'ms', 'khtml'], function (value) {
			styles[styles.length] = plib.camelize('-' + value + '-' + style);
		});
		return styles;
	},

	checkSupport: function () {

		var div = document.createElement(html.div),
			canvas = document.createElement(html.canvas),
			span,
			color;



		div.innerHTML = '<span style="float:left;opacity:.55;"></span>';
		span = div.getElementsByTagName(html.span)[0];

		// cssFloat = w3c // styleFloat = msie
		support.cssFloat = !!span.style.cssFloat ? 'cssFloat' : 'styleFloat';

		// test if browser supports opacity
		support.opacity = regex.opacity.test(span.style[css.opacity]);

		support.propertychange = plib.hasProperty(document, 'onpropertychange') ? 'propertychange' : 'DOMAttrModified';


		support.canvas = pfunc.getCanvasContext(canvas);



		color = div.style.color;
		pfunc.attempt(function () {
			div.style.color = 'rgba(0, 0, 0, 0.5)';
		});
		support.rgba = div.style.color !== color;


		// test box-shadow and all vendor prefixed versions
		support.boxShadow = false;
		plib.loopArray(pfunc.getStylePrefixes('box-shadow'), function (value) {
			if (!plib.isUndefined(div.style[value])) {
				support.boxShadow = true;
				return null; // break
			}
		});

		// test box-shadow and all vendor prefixed versions
		support.borderRadius = false;
		plib.loopArray(pfunc.getStylePrefixes('border-radius'), function (value) {
			if (!plib.isUndefined(div.style[value])) {
				support.borderRadius = true;
				return null; // break
			}
		});



	},


	// set the fluid width for later use on elements with fixed widths
	setFluidWidth: function (element) {
		var orgWidth = plib.getWidth(element);
		plib.setWidth(element, 'auto');
		plib.setStyle(element, css.cssFloat, 'left');
		plib.attribute(element, attributes.fluidWidth, plib.getWidth(element));
		plib.setWidth(element, orgWidth);
		plib.setStyle(element, css.cssFloat, 'none');
	},



	// credit: http://en.wikibooks.org/wiki/JavaScript/Best_Practices
	isValidEmail: function (str) {
		// These comments use the following terms from RFC2822:
		// local-part, domain, domain-literal and dot-atom.
		// Does the address contain a local-part followed an @ followed by a domain?
		// Note the use of lastIndexOf to find the last @ in the address
		// since a valid email address may have a quoted @ in the local-part.
		// Does the domain name have at least two parts, i.e. at least one dot,
		// after the @? If not, is it a domain-literal?
		// This will accept some invalid email addresses
		// BUT it doesn't reject valid ones.
		var atSym = str.lastIndexOf('@'),
			// Is the domain plausible?
			lastDot = str.lastIndexOf('.');
		if (atSym < 1) { return false; } // no local-part
		if (atSym === str.length - 1) { return false; } // no domain
		if (atSym > 64) { return false; } // there may only be 64 octets in the local-part
		if (str.length - atSym > 255) { return false; } // there may only be 255 octets in the domain
		// Check if it is a dot-atom such as example.com
		if (lastDot > atSym + 1 && lastDot < str.length - 1) { return true; }
		//  Check if could be a domain-literal.
		if (str.charAt(atSym + 1) === '[' &&  str.charAt(str.length - 1) === ']') { return true; }
		return false;
	},
	
	manageBackToLogin: function (parentForm, callback) {
		plib.click(plib.getElementsByClassName(classes.formOption_backToLogin, parentForm)[0], function () {
			pfunc.promptLogin(callback);
		});
	},

	manageRegistration: function (parentForm, callback) {
		plib.click(plib.getElementsByClassName(classes.formOption_register, parentForm)[0], function () {
			pfunc.promptRegister(callback);
		});
	},

	manageForgotPass: function (parentForm, callback) {
		plib.click(plib.getElementsByClassName(classes.formOption_forgotPass, parentForm)[0], function () {
			pfunc.openWindow(layout.formForgot, function () {
				var forgotForm = document.forms[names.formForgot];
				// SHOW LOGIN WINDOW
				pfunc.manageBackToLogin(forgotForm, callback);
				pfunc.manageFormSubmit(forgotForm, directory.names.forgot, [asterisk], function (data) {
					if (data) {
						// this = form
						pfunc.displayFormError(this, data);
					} else {
						pfunc.openWindow(layout.msgForgot);
						if (userLogged) {
							pfunc.promptLogout();
						}
						if (callback) { callback(); }
					}
				});
			});
		});
	},

	promptRegister: function (callback) { // MANAGE USER LOGIN FORM

		pfunc.openWindow(layout.formRegister, function () {

			var registerForm = document.forms[names.formRegister];
			pfunc.manageBackToLogin(registerForm, callback);
			
			registerForm.elements[names.strWebURL].value = plib.parseUrl(windowLocation).host.split(".").slice(-2).join(".");

			// validates the url protocol
			pfunc.validWebUrl(registerForm.elements[names.strWebURL]);

			pfunc.manageFormSubmit(registerForm, directory.names.register, [asterisk], function (data) {

				if (plib.isString(data)) { // an error has occured
					// this = form
					pfunc.displayFormError(this, data);
				} else if (plib.isUndefined(data)) { // all good
					pfunc.openWindow(layout.msgRegistered);
					if (callback) { callback(data); }
				}

			}, function (formdata) { // EXTRA VALIDATION

				// attempt some local validation for the registration proccess
				var strEmail = formdata[names.strUsername];

				if (!pfunc.isValidEmail(strEmail)) {
					this.elements[names.strUsername].value = '';
					return messages.invalidEmail;
				}

			});


		});

	},
	
	promptLogin: function (callback) { // MANAGE USER LOGIN FORM

		pfunc.openWindow(layout.formLogin, function () {

			var loginForm = document.forms[names.formLogin];

			pfunc.manageForgotPass(loginForm, callback);
			pfunc.manageRegistration(loginForm, callback);

			pfunc.manageFormSubmit(loginForm, directory.names.login, [asterisk], function (data) {

				if (plib.isString(data)) { // an error has occured

					// this = form
					pfunc.displayFormError(this, data);

				} else if (plib.isObject(data)) { // all good

					userLogged = true;
					
					// manually reset login check because the session has been changed
					nLastLoginCheck = 0;

					// update user data
					pfunc.updateUserInfo(data);
					
					// session has changed so we need to show relevant private info
					pfunc.methodSessionChange();

					pfunc.closeWindow();

					if (settings.onLogin) {
						settings.onLogin.call(window[oNamespace.root], data);
					}

					if (callback) { callback(); }
				}

			}, function (formdata) { // EXTRA VALIDATION

				// attempt some local validation for the registration proccess
				var strEmail = formdata[names.strUsername];

				if (!pfunc.isValidEmail(strEmail)) {
					this.elements[names.strUsername].value = '';
					return messages.invalidEmail;
				}


			});


		});

	},

	promptLogout: function () {

		plib.loadJSONP(directory.names.logout);

		userLogged = false;
		
		// manually reset login check because the session has been changed
		nLastLoginCheck = 0;

		// dump user data
		pfunc.updateUserInfo(null);
		
		// session has changed so we need to clear any visible private info
		pfunc.methodSessionChange();

		
		if (settings.onLogout) {
			settings.onLogout.call(window[oNamespace.root]);
		}

	},

	methodSessionChange: function (pInst) {

		// parameter "pInst" is provided when this method is called from within the instance
		// if the parameter is not given, we update all instances and force-draw tag data once queried
		var hash = plib.getParamsFromObject(userInfo),
			action = function (hash) {

				var pInst = this;

				if (hash !== userHash) {
					pInst.ui.destroy();
				}
				
				// FORCE REDRAW TAGS FROM CACHE
				pInst.updateNode(true);
				
				// if ui was destroyed then this check will redraw the ui
				// will also change ui settings to reflect recent session change
				pInst.ui.check();
				
			};

		if (pInst) {
			action.call(pInst, hash);
		} else {
			// redraw all instances
			plib.loopObject(cacheNodes, function (val) {
				action.call(val.instance, hash);
			});
		}

		userHash = hash;

	},

	findImageByString: function (string) {

		// lets try to get the image by id first (faster?)
		// then if we dont find it loop over all images and check their src
		var element,
			imgById = document.getElementById(string);

		if (imgById) {
			element = imgById;
		} else {
			plib.loopArray(document.getElementsByTagName(html.img), function (image) {
				// dom src may not equal src set in html
				if (plib.attribute(image, attributes.src) === string || image.src === string) {
					element = image;
				}
			});
		}

		return element;

	},

	verifyImageReference: function (image, callback) {

		// if attribute is a string then try and get the dom element
		if (plib.isString(image)) {
			image = pfunc.findImageByString(image);
		}

		if (!image || !plib.isElement(image)) {
			// {opendebug}
			pfunc.warn(messages.noImage);
			// {closedebug}
			return;
		}

		if (callback) { callback(image); }

	},

	getInstanceByImage: function (image) {
		var guid = plib.getGUID(image),
			nodeKey;
		if (guid) {
			// loop the cached nodes and look for one with this image guid
			plib.loopObject(cacheNodes, function (key, val) {
				if (val.imgGUID === guid) {
					nodeKey = key;
				}
			});

		}			
		return nodeKey ? cacheNodes[nodeKey].instance : undefined;
	},

	manageUserInputImage: function (image, callback) {

		pfunc.verifyImageReference(image, function (image) {

			var pInst = pfunc.getInstanceByImage(image);

			if (!pInst) {
				// {opendebug}
				pfunc.warn(messages.noInstance);
				// {closedebug}
				return;
			}

			if (callback) { callback(pInst); }

		});

	},
	
	// attempt to find at least one tag guid value
	// this method will return an object with the key value of tagGUID or tagMultiGUID
	// if neither was found then this method returns undefined
	getTagGuidObject: function (element) {
		// start attribute probe
		var attr = {
			tagGUID: plib.attribute(element, attributes.tagGuid)
		};
		// if the desired attribute was not found then remove the object entry
		if (!attr.tagGUID) {
			delete attr.tagGUID;
			attr.tagMultiGUID = plib.attribute(element, attributes.tagMultiGuid);
		}
		// if the desired attribute was not found then remove the object entry
		if (!attr.tagMultiGUID) {
			delete attr.tagMultiGUID;
		}
		return plib.isObjectEmpty(attr) ? undefined : attr;
	},

	promptAddTag: function (image) {

		var action = function () {
				this.startTaggingMode(this.methodAddNewTag);
			};

		pfunc.manageUserInputImage(image, function (pInst) {
			pfunc.checkLogin(function () { // LOGIN TEST SUCCESS
				action.call(pInst);
			}, function () { // LOGIN TEST FAILED
				pfunc.promptLogin(function () {
					action.call(pInst);
				});
			});
		});

	},

	promptRepositionTags: function (image) {

		pfunc.manageUserInputImage(image, function (pInst) {
			pfunc.checkLogin(function () { // LOGIN TEST SUCCESS
				pInst.startTagRepositionMode();
			}, function () { // LOGIN TEST FAILED
				pfunc.promptLogin(function () {
					pInst.startTagRepositionMode();
				});
			});
		});

	},

	promptRemoveTags: function (image) {

		pfunc.manageUserInputImage(image, function (pInst) {
			pfunc.checkLogin(function () { // LOGIN TEST SUCCESS
				pInst.startTagRemovalMode();
			}, function () { // LOGIN TEST FAILED
				pfunc.promptLogin(function () {
					pInst.startTagRemovalMode();
				});
			});
		});

	},



	promptOpenLightbox: function (image) {


		var lightbox,
			lightboxOverlay,
			lightboxWindow,
			lightboxImageHolder,
			lightboxShowLeft,
			lightboxShowRight,
			maxIndex,
			index = 0,
			i = 0,
			nodeTracker = [],
			showImageByIndex = function (index) {

				var child = lightboxImageHolder.children[index],
					centerLightbox = function (element) {
						plib.show(element);
						pfunc.centerVertical(lightboxWindow);
						pfunc.centerHorizontal(lightboxWindow);
					};

				plib.loopArray(lightboxImageHolder.children, plib.hide);

				if (child.nodeName.toLowerCase() === "img") {
					// wait until image has loaded before trying to access dimensions
					pfunc.onImageDimensionReady(child, function () {
						centerLightbox(this);
						pfunc.loadImage(this);
						nodeTracker.push(cacheNodes[this.pinUID]);
					});
				} else {
					centerLightbox(child);
				}

			},
			showLeftImage = function () {
				index -= 1;
				if (index < 0) { index = maxIndex; }
				showImageByIndex(index);
			},
			showRightImage = function () {
				index += 1;
				if (index > maxIndex) { index = 0; }
				showImageByIndex(index);
			},
			destroyLightbox = function () {
				// clean up after ourselves..
				// if we dont destroy the nodes then the images are kept in cache and if we load the lightbox again, the images are included
				plib.loopArray(nodeTracker, function (node) { node.instance.destroy(); });
				nodeTracker = []; // empty the tracker
				plib.removeElement(lightbox); // will remove all sub elements, including their events and cache etc..
			},
			removeExistingLightboxes = function () {
				var element = plib.getElementsByClassName(classes.lightboxOverlay)[0];
				if (element) { plib.fireEvent(element, "click"); }
			};


		// try and remove any existing lightbox instances
		removeExistingLightboxes();

		if (!plib.isObjectEmpty(cacheImages)) {

			lightbox = plib.domAppend(html.div, globalElements.pInstActive, { 'class': classes.lightbox });
			lightboxOverlay = plib.domAppend(html.div, lightbox, { 'class': classes.lightboxOverlay });
			lightboxWindow = plib.domAppend(html.div, lightbox, { 'class': classes.lightboxWindow });
			lightboxImageHolder = plib.domAppend(html.div, lightboxWindow, { 'class': classes.lightboxImageHolder });
			lightboxShowLeft = plib.domAppend(html.div, lightboxWindow, { 'class': classes.lightboxNav + whiteSpace + classes.lightboxShowLeft });
			lightboxShowRight = plib.domAppend(html.div, lightboxWindow, { 'class': classes.lightboxNav + whiteSpace + classes.lightboxShowRight });

			// insert some icons into our nav buttons
			plib.domAppend(html.span, lightboxShowLeft, { 'class': classes.lightboxNavIcon });
			plib.domAppend(html.span, lightboxShowRight, { 'class': classes.lightboxNavIcon });

			// attach events onto lightbox elements
			plib.click(lightboxOverlay, destroyLightbox);
			plib.click(lightboxShowLeft, showLeftImage);
			plib.click(lightboxShowRight, showRightImage);
			pfunc.newKeyListener(keyCodes.arrowLeft, lightbox, showLeftImage);
			pfunc.newKeyListener(keyCodes.arrowRight, lightbox, showRightImage);

			// insert images found from cache into our image holder
			plib.loopObject(cacheImages, function (key, val) {
				if (key === image.pinUID) { index = i; }
				if (val.image.src !== window.location.href) {
					plib.domAppend(html.img, lightboxImageHolder, { 'class': classes.lightboxImage, 'src': val.image.src });
					i += 1;
				}
			});

			maxIndex = i - 1;
			showImageByIndex(index); // show first image

		}

	},

	promptSettings: function (image) {

		pfunc.openPrivateWindow(layout.formSettings, function () {

			var formSettings = document.forms[names.formSettings];
			
			plib.click(formSettings.elements[names.btnRepositionTags], function () {
				pfunc.promptRepositionTags(image);
				pfunc.closeWindow();
			});

			plib.click(formSettings.elements[names.btnRemoveTags], function () {
				pfunc.promptRemoveTags(image);
				pfunc.closeWindow();
			});

			plib.click(formSettings.elements[names.btnOpenLightbox], function () {
				pfunc.closeWindow();
				pfunc.promptOpenLightbox(image);
			});

			if (cacheTagData[image.src] && cacheTagData[image.src][1]) {
				plib.show(formSettings.elements[names.btnRepositionTags]);
				plib.show(formSettings.elements[names.btnRemoveTags]);
			} else {
				plib.hide(formSettings.elements[names.btnRepositionTags]);
				plib.hide(formSettings.elements[names.btnRemoveTags]);
			}

		});

	},


	startDragging: function (element) {

		plib.addEvent(document, events.mousemove, function (evt) {

			var mousePosition = plib.getMousePosition(evt),
				tagHolderOffset = plib.getCumulativeOffset(element.parentNode),
				pxPosX = mousePosition.x - tagHolderOffset.x,
				pxPosY = mousePosition.y - tagHolderOffset.y,
				holderWidth = plib.getWidth(element.parentNode),
				holderHeight = plib.getHeight(element.parentNode),
				tagPosition = {},
				margin = 10;


			// horizontal constraint
			if (pxPosX < margin) {
				pxPosX = margin;
			} else if (pxPosX > holderWidth - margin - 1) {
				pxPosX = holderWidth - margin - 1;
			}

			// vertical constraint
			if (pxPosY < margin) {
				pxPosY = margin;
			} else if (pxPosY > holderHeight - margin - 1) {
				pxPosY = holderHeight - margin - 1;
			}

			plib.attribute(element, attributes.tagPosX, (pxPosX / holderWidth).toFixed(10));
			plib.attribute(element, attributes.tagPosY, (pxPosY / holderHeight).toFixed(10));


			tagPosition[css.left] = pxPosX;
			tagPosition[css.top] = pxPosY;

			plib.setStyles(element, tagPosition);

		});



	},

	stopDragging: function () {

		plib.removeEvent(document, events.mousemove);

	},

	getLocalStorage: function (itemKey) {

		var item,
			itemValue,
			itemValueType;

		if (settings.allowLocalStorage && window.localStorage && window.JSON) {

			item = localStorage.getItem(itemKey).split("_");
			itemValueType = item.shift();
			itemValue = item.join("_");

			if (itemValueType === BOOLEAN_TYPE) {
				itemValue = (itemValue === 'true');
			} else if (itemValueType === NUMBER_TYPE) {
				itemValue = parseFloat(itemValue);
			} else if (itemValueType === DATE_TYPE) {
				itemValue = new Date(itemValue);
			} else if (itemValueType === ARRAY_TYPE || itemValueType === OBJECT_TYPE) {
				itemValue = JSON.parse(itemValue);
			}

		}

		return itemValue;

	},

	setLocalStorage: function (itemKey, itemValue) {

		var itemValueType;

		if (settings.allowLocalStorage && window.localStorage && window.JSON) {

			itemValueType = plib.type(itemValue);

			if (itemValueType === NULL_TYPE || itemValueType === UNDEFINED_TYPE || itemValueType === ELEMENT_TYPE || itemValueType === FUNCTION_TYPE) {
				return;
			} else if (itemValueType === BOOLEAN_TYPE || itemValueType === NUMBER_TYPE || itemValueType === DATE_TYPE) {
				itemValue = itemValue.toString();
			} else if (itemValueType === ARRAY_TYPE || itemValueType === OBJECT_TYPE) {
				itemValue = JSON.stringify(itemValue);
			}

			localStorage.setItem(itemKey, itemValueType + "_" + itemValue);

		}

	},



	manageTheme: function (fileName) {

		var attrLink,
			index;

		if (fileName && fileName !== "") {

			index = parseInt(fileName.split(".")[0], 10);


			// check to see if css has loaded
			if (plib.getStyle(globalElements.pInstWrapper, css.zIndex) !== index) {
				attrLink = {};
				attrLink[attributes.href] = directory.paths.themes + fileName;
				attrLink[attributes.rel] = 'stylesheet';
				attrLink[attributes.type] = types.csstxt;
				plib.domAppend(html.link, document.getElementsByTagName(html.head)[0], attrLink);
			}

			plib.addClass(globalElements.pInstActive, cssPrefix + index);


			// {opendebug}
			pfunc.info(messages.themeLoaded, index);
			// {closedebug}

		}

	},

	changeTheme: function (theme) {
		// remove each node and put back the original image
		plib.loopObject(cacheNodes, function (val) {
			val.instance.destroy();
		});
		pfunc.manageTheme(theme);
		pfunc.checkForImages();
	},


	// {opendebug}


	// we use this to make debugging logs when console is active in the browser and debugging is tue in settings
	log: function () {
		pfunc.print(arguments, 0);
	},
	info: function () {
		pfunc.print(arguments, 1);
	},
	warn: function () {
		pfunc.print(arguments, 2);
	},
	error: function () {
		pfunc.print(arguments, 3);
	},
	time: function () {
		pfunc.print(arguments, 4);
	},
	timeEnd: function () {
		pfunc.print(arguments, 5);
	},

	print: function (data, method) {

		method = consoleMethods[method];

		// if console and disired method exists
		if (!plib.isUndefined(consoleObject) && !plib.isNull(consoleObject)) {

			// convert the arguments object into an array
			data = Array.prototype.slice.call(data);

			// MODERN BROWSERS
			if (plib.isFunction(consoleObject[method])) {
				consoleObject[method].apply(consoleObject, data);
			// MSIE
			} else if (plib.isObject(consoleObject[method])) {
				Function.prototype.call.call(consoleObject[method], consoleObject, data);
			}
		}
	},

	// {closedebug}



	attempt: function (method) {
		try { method.call(); } catch (e) {
			// {opendebug}
			pfunc.error(sysName + plib.stringFormat(': ({0}) {1}: {2}', [e.number, e.name, e.message]));
			// {closedebug}
		}
	},

	isMobile: function () {
		return regex.mobile.test(navigator.userAgent);
	}

};




/*

NOTES
-------------------------------
>	All dom elements created by Pinup will receive an attribute "guid" (globally unique identifier), of which the value will consist of 16 random characters.
	This attribute may be used to reference an element inside an object etc.
>	Tag data from the server will be indexed by an md5 hash of the tag position X and Y. The value will be an array of tags that possess those coordinates.

*/

/** @constructor */
function Pinup(publicKey, sysParams) {

	if (window === this) {
		return new Pinup(publicKey, sysParams);
	}

	settings = plib.cloneObject(defaultSettings);

	// note: we end up merging the hard coded settings twice because some settings are used before we can access the server settings
	if (sysParams) {
		// EXTEND SETTINGS FROM PROPERTIES GIVEN WHEN THE CLASS IS CALLED
		pfunc.updateSettings(sysParams);
	}

	// {opendebug}
	pfunc.time(messages.sysLoadTime);
	// {closedebug}


	// include some specific variables and methods into the window object for global accessibility
	pfunc.updateWindowNamespace();

	// execute as soon as DOM is loaded
	plib.onDomReady(function () {

		var localCheckSite,
			localCheckSiteNS = oNamespace.checkSite + globalVars.publicKey,
			fn_sysInitialize = function (data) {

				// EXTEND SETTINGS FROM SERVER RESPONCE
				if (data) {
					// just for fun lets see what the server gives us
					// {opendebug}
					pfunc.log(messages.serverSet, data);
					// {closedebug}
					pfunc.updateSettings(data);
				}

				// note: we end up merging the hard coded settings twice because some settings are used before we can access the server settings
				if (sysParams) {
					// EXTEND SETTINGS FROM PROPERTIES GIVEN WHEN THE CLASS IS CALLED
					pfunc.updateSettings(sysParams);
				}


				pfunc.systemStart();

			};

		if (!exist) {

			// don't let sys run twice..
			exist = true;

			// set the public key
			if (publicKey) { globalVars.publicKey = publicKey; }

			// check to see if we have a locally saved copy of the query
			localCheckSite = pfunc.getLocalStorage(localCheckSiteNS);
			if (localCheckSite) {

				fn_sysInitialize(localCheckSite);

			} else if (!plib.isUndefined(globalVars.publicKey)) {

				plib.loadJSONP(directory.names.checkSite, {
					'strWebUrl' : window.location.hostname
				}, function (data) {

					// null = timeout
					// undefined = no data
					if (data !== null) {

						fn_sysInitialize(data);

						pfunc.setLocalStorage(localCheckSiteNS, data);

					}


				});

			}


			plib.addEvent(window, events.unload, pfunc.systemStop);
			return;


		} else {

			// {opendebug}
			pfunc.warn(messages.noPubKey);
			// {closedebug}
			return;

		}

	});


}

// make our constructor globally accessible
window[oNamespace.root] = Pinup;

