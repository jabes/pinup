
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

