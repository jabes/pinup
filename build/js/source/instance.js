
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
					plib.addEvent(elmTag, events.touchend, function (event) {
						
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

					plib.click(tagDot, function (event) {
					
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

