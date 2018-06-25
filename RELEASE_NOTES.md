v1.01
13/02/2011
10101 - added: tooltip add tag button now auto-redirects you to add tag form if no registered landing pads are found
10102 - added: function (emmaFuncs.attempt) to handle try and catch error management
10103 - fixed: destroy emma caused errors when not loaded completely

v1.02
15/02/2011
10201 - fixed: clicking a tag dot will open webloc with top rated link so long as the dot is not pending approval or a requested link
10202 - fixed: function (emmaLib.isHidden) now checks element position related to current scroll X/Y with element offset
10203 - fixed: tag data hashes are saved into an object literal with the image src as index to allow for multiple hashes when dealing with multiple images
10204 - fixed: function (emmaLib.getStyle) and function (emmaLib.setStyle) to work with opacity values
10205 - fixed: function (emmaLib.getComputedStyles) was failing due to "unknown" value in MSIE currentStyle
10206 - fixed: rolled back some setting names for legacy issues
10207 - fixed: set maxWidth and maxHeight on the image because of a chromium bug where width and height values are overridden respectively

v1.03
01/03/2011
10301 - added: function (emmaFuncs.setWindowLink) to replace anchor href events
10302 - fixed: emma node element will now stop event propagation as to avoid unexpected anchor elements surrounding the node
10303 - fixed: bottom links not selecting bubble on hover
10304 - fixed: improper var name "nIntrusive" on "check_site.php" causing server setting to fail on front end
10305 - fixed: var (cacheTagData) now uses an object literal with an image src index to fix images with no tag data inheriting the previous images tag data
10306 - modified: var (oTagDataHash) was removed and replaced by checking var (cacheTagData) and using the result to create a hash when needed
10307 - modified: all elements that receive a click event will also receive a class that handles underline and cursor css
10308 - started: made some alterations that will help compress the js even more! but this will not be implemented in this version

v1.04
11/03/2011
10401 - added: function (emmaLib.hasOwnProperty) to replace "property in object" with a more cross browser object literal property check solution
10402 - fixed: lazyload function was not removing listener for document scroll event after all images had loaded un-hidden
10403 - fixed: some syntax errors
10404 - modified: function (emmaLib.isFunction) to fix issues with older browsers having trouble using the constructor method
10405 - modified: function (emmaLib.isObject) to fix issues with older browsers having trouble using the constructor method
10406 - modified: function (emmaLib.isString) to fix issues with older browsers having trouble using the constructor method
10407 - modified: function (emmaLib.isNumber) to fix issues with older browsers having trouble using the constructor method
10408 - removed: function (emmaLib.isArray) nothing was using it 
10409 - removed: function (emmaLib.isUndefined) nothing was using it 
10410 - removed: escape key listener for function (emmaFuncs.openWindow (this is a temporary fix until I can find out why it is interfering with the form input fields in IE)

v1.05
20/03/2011
10501 - added: popup to instruct first time taggers
10502 - added: if the user creating a tag is in fact the website owner, then override the auto approve value as true
10503 - fixed: file (emmaHub.php) now compares the provided domain and saved domain in lower case to avoid character case issues
10504 - fixed: tag suggestion method was throwing an error as a result of the server returning an empty array
10505 - fixed: tag tooltip arrow not working due to a NaN error caused by the var "arrowOffset" being declared inside a condition that would not always be true
10506 - fixed: error in image tag limit condition was allowing 11 tags instead of 10
10507 - fixed: removed some unused variables
10508 - modified: made the tag tooltip buttons smaller

v1.06
29/03/2011
10601 - added: setting "nSmartLoadDelay" (default: 2sec) prevents over-loading while scrolling down a page by adding a load delay when smart load finds an image.
10602 - added: minimum bid button on the bid 2 claim form that adds $0.15 onto the highest bid and submits the form
10603 - added: small report button next to tag bubble links
10604 - fixed: get tags script was being fussy with keywords that had single quotes in it (now uses a subquery inside the "WHERE IN" clause instead of two separate queries)
10605 - fixed: remove previously set link holder height to get proper object.clientHeight if function (emmaLib.loadLinks) is called more than once
10606 - modified: tag create script now throws an error if any required url variables are missing
10607 - modified: tag create script now removes any html from url variables going into the db just to be safe
10608 - modified: tag suggestion dropdown icon will show a dollar symbol if the site being linked to is a paying landingpad
10609 - modified: similar images button simply links to an external url with the image src instead of asking the user to click a tag and grab its keywords
10610 - modified: syntax improvements related to form and attribute namespace
10611 - removed: left overlay button (about) and its popup
10612 - removed: remnant of a "hover" class that is no longer needed because all links recently got a "button" class which is identical

v1.07
29/03/2011
10701 - added: grey url under blue tag bubble link
10702 - modified: "similar images" -> "share image"
10703 - removed: report button from left nav links (replaced with small inline buttons next to tag bubble links)

v1.08
31/03/2011
10801 - added: setting "loadAll" (default: false) if true loads every image on website regardless of "classes.activeParent" and "classes.activeChild"
10802 - added: setting "imageWhitelist" (default: empty array) will load images (defined in array by their src  or id) regardless of "classes.activeParent" and "classes.activeChild"
10803 - added: setting "imageBlacklist" (default: empty array) will deny images from loading (defined in array by their src or id) regardless of "classes.activeParent" and "classes.activeChild" and "settings.loadAll"
10804 - modified: function (emmaFuncs.updateSettings) will now compare setting value types to make sure a string isn't provided when the system requires a number
10805 - modified: function (emmaFuncs.updateSettings) will now warn if a provided setting was not found

v1.09
01/04/2011
10901 - added: setting "allowFile" (default: jpg, jpeg, png) will deny images from loading if their format is not defined in the array.
10902 - modified: image dimensions are checked before instance run instead of after

10903 - modified: scroll event uses a new timeout event (scrollMem) to make sure it does not run to frequently as defined in miliseconds (settings.scrollDelay)
10904 - removed: smart load delay timeout event (added on 10601) - made irrelevant after modification (see 10903)

v1.10
12/04/2011
11001 - added: setting "animations" (default: true) if false will hover buttons with css and not javascript animations to conserve resources
11002 - added: function (emmaLib.isElementInDom) checks to see if an element kept in a variable is still in the dom by traversing parent nodes until we find the document object
11003 - added: clicking the bookmark button while already bookmarked will remove the bookmark
11004 - added: support check for opacity instead of browser check (IE9 supports the opacity property)
11005 - fixed: function (emmaLib.posHelper) was broken due to recent revisions (or maybe it never worked) complete rewrite was needed
11006 - fixed: function (emmaLib.updateNode) was not properly checking an object (cacheTagData) for emptiness causing the conditional to fail
11007 - fixed: bug with lazy load that was not indexing the hidden image array properly
11008 - fixed: bug when clicking the bookmark button: because the button has a mouseover and mouseout event that animates itself, it would cancel out the animation event when clicked upon. to fix this we remove the hover events when clicked and re-add them when the click event animation is complete
11009 - modified: function (emmaLib.getStyle) get inline styles of element if possible because it is faster than getComputedStyles
11010 - modified: function (emmaLib.getComputedStyles) now accepts an array of wanted css properties. if provided, we loop over it instead of the entire css array
11011 - modified: clicking the bookmark button will no longer reload tags (not sure why i thought that was needed in the first place)
11012 - modified: for performance issues, when dealing with large amounts of images on a page, we no longer check for bookmarks on run, but rather on node hover
11013 - modified: prevent duplicate loadLinks call in function (emmaLib.run) when (nIntrusive:2) and (startOpen:true) causing two calls on directory.getTags
11014 - removed: function (emmaLib.cleanStyleProp) after mods (11009) and (11010) we no longer need this function
11015 - removed: function (emmaLib.dir) was an almost exact duplicate of function (emmaLib.getParentByClassName)

v1.11
18/04/2011
11101 - added: setting "forceListen" (default: false) if true then always check for new images. implements propertychange and scroll listeners.
11102 - added: global function (emmaClass.fn.checkForImages) that will re-check images if called
11103 - added: global function (emmaClass.fn.loadImage) that will load an image by dom reference or attribute id/src when called
11104 - modified: function (emmaFuncs.loadImage) checks for a file source
11105 - modified: improved error handling in loading emma and images

v1.12
19/04/2011
11201 - modified: file (emmaHub.php) to include error handling for non-verified websites
11202 - modified: file (emma.css) parent selector (before a wrapper, now the body) was changed from an id to a class
11203 - modified: function (emmaFuncs.createEmma) no longer adds a body wrapper because it was making google ads cry
11204 - modified: function (emmaInstance.run) was split into (emmaInstance.preRun) and (emmaInstance.postRun) to speed up the ui by not waiting for jsonp to check the image
11205 - removed: global reference (window.emmaClass) consolidated into (window.EmmaActive)

v1.13
20/04/2011
11301 - added: images with no tag data get a pretty little box that confirms the fact
11302 - added: function (emmaFuncs.buildButton) to properly manage form style button creation
11303 - fixed: function (emmaLib.getCumulativeOffset) was not outputting a proper value for some websites.
11304 - fixed: function (emmaLib.click) removes button class when event is removed from element (for single run)

v1.14
21/04/2011
11401 - added: setting "ownerOnly" if true will only show a GUI for the owner of a website
11402 - fixed: loading tags after the first run was duplicating dots in the tag holder
11403 - removed: function (emmaLib.createCookie) and (emmaLib.readCookie) and (emmaLib.eraseCookie) because cookies are no longer needed after we added "in-node" dialog boxes that communicate with the server

v1.15
26/04/2011
11501 - added: all buttons that check login post-click will now immediately changes their label to read "THINKING..." to let the user know we are waiting on a jsonp call
11502 - fixed: bookmark button was set as single click mode but in some cases (login before use) it needed to be pressed twice
11503 - fixed: tag loading dialogue box was grabbing wrong classname, forcing script to grab from body resulting in improper content placement
11504 - fixed: stopped tags from re-loading on node hover during the tagging proccess
11505 - modified: function (emmaLib.buildGUI) no longer destroys and rebuilds on each call but rather keeps track of when the GUI needs to be altered

v1.16
27/04/2011
11601 - added: when a form button is clicked, it will now read "PLEASE WAIT..." to let the user know we are waiting on a jsonp call.
11602 - added: login/logout buttons are now animated.
11603 - added: function (emmaInstance.toggleGUI) press "F2" to toggle GUI.
11604 - fixed: the escape key listener was removed here (10410) because of input field failures. We are now using "keyup" not "keypress" and that seemed to make the browser happy.
11605 - modified: on tag hover, set tag holder z-index to 999 so that tag bubbles will appear on top of GUI.
