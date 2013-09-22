
	commonHTML = {

		buildForm:
			function (strFormName, arrNodes, strSubmitText) {

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

		buildFormInput:
			function (strType, strName) {
				return {
					nodeName: html.input,
					attr: {
						type: strType,
						name: strName,
						autocomplete: 'off'
					}
				};
			},

		buildFormTextArea:
			function (strName) {
				return {
					nodeName: html.textarea,
					attr: {
						name: strName
					}
				};
			},

		buildFormSelect:
			function (strName, arrOptions) {
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

		buildFormLabelSm:
			function (strLabel, oNode) {
				return commonHTML.buildFormLabel(strLabel, oNode, true);
			},

		buildFormLabel:
			function (strLabel, oNode, small) {
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

		buildHeader:
			function (strWindowTitle) {
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

		buildButton:
			function (strButtonText, properties) {

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

		buildModal:
			function (strHeader, arrNodes) {
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

		simpleAdd:
			function (strNodeType, strNodeText) {
				return {
					nodeName: strNodeType,
					text: strNodeText
				};
			}

	};

	layout = {

		formTagCreate:
			commonHTML.buildForm(names.formCreate, commonHTML.logoutTab.concat([
				commonHTML.buildHeader('ADD NEW TAG'),
				commonHTML.buildFormInput(types.hidden, names.strWebReferer),
				commonHTML.buildFormInput(types.hidden, names.strImageURL),
				commonHTML.buildFormInput(types.hidden, names.nPosX),
				commonHTML.buildFormInput(types.hidden, names.nPosY),
				commonHTML.buildFormLabel('Tag name', commonHTML.buildFormInput(types.text, names.strTagName)),
				commonHTML.buildFormLabel('Keywords', commonHTML.buildFormInput(types.text, names.strKeywords)),
				commonHTML.buildFormLabel('Destination url', commonHTML.buildFormInput(types.text, names.strWebLink))
			]), 'SAVE & PUBLISH TAG'),

		formRegister:
			commonHTML.buildForm(names.formRegister, [
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

		formLogin:
			commonHTML.buildForm(names.formLogin, [
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

		formForgot:
			commonHTML.buildForm(names.formForgot, [
				commonHTML.buildHeader('FORGOT PASSWORD'),
				commonHTML.buildFormLabel('E-mail', commonHTML.buildFormInput(types.text, names.strUsername)),
				commonHTML.backToLogin
			], 'RETRIEVE PASSWORD'),

		formSettings:
			commonHTML.buildForm(names.formSettings, commonHTML.logoutTab.concat([
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

		msgTagDeleted:
			commonHTML.buildModal('This tag has been deleted.', [
				commonHTML.simpleAdd(html.p, 'Note: because you are either the owner of the image, or the tags creator, you are able to delete it whereas the public would only be able to report.')
			]),

		msgForgot:
			commonHTML.buildModal('You have requested a new password.', [
				commonHTML.simpleAdd(html.p, 'A new password has been generated and sent to your email address. We recommend that you change it asap!')
			]),
		
		msgRegistered:
			commonHTML.buildModal('Registration was successful.', [
				commonHTML.simpleAdd(html.p, 'You have just created your account! Easy right? However there is one last step: your email needs to be authenticated. Please check your inbox for a confirmation email. If you do not receive an email within the hour, please contact our support team.')
			]),

		msgNoPermission:
			commonHTML.buildModal('You do not have sufficient permission.', [
				commonHTML.simpleAdd(html.p, 'The owner of this website has requested your account not be able to add or request tags. Please contact the site owner for more information.')
			]),

		msgImageDisabled:
			commonHTML.buildModal('This image has been disabled.', [
				commonHTML.simpleAdd(html.p, 'The ' + sysName + ' interface will no longer show on this image. If you wish the enable the interface, you can do so in the settings window.')
			]),

		msgImageEnabled:
			commonHTML.buildModal('This image has been enabled.', [
				commonHTML.simpleAdd(html.p, 'The ' + sysName + ' interface will now show on this image. If you wish the disabled the interface, you can do so in the settings window.')
			]),

		msgFirstTag:
			commonHTML.buildModal('This appears to be your first tag!', [
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
		msgError:
			commonHTML.buildModal('#@$!*&%', [
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