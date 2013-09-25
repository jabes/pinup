

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

