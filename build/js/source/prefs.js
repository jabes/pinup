

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
			gateway: 'http://www.jbull.ca/work/pinup/gateway/',
			cdn: 'http://www.jbull.ca/work/pinup/cdn/',
			website: 'http://www.jbull.ca/work/pinup/'
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



