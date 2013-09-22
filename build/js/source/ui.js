
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
							pfunc.openWindow(layout.msgFirstTag, function (e) {
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


