/* util.js */

// Enable the passage of the 'this' object through the JavaScript timers
// Great help from https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setInterval
var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
	var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
	return __nativeST__(vCallback instanceof Function ? function () {
		vCallback.apply(oThis, aArgs);
	} : vCallback, nDelay);
};
window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
	var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
	return __nativeSI__(vCallback instanceof Function ? function () {
		vCallback.apply(oThis, aArgs);
	} : vCallback, nDelay);
};

// Convert pixels to ems
// Source: https://raw.githubusercontent.com/arasbm/jQuery-Pixel-Em-Converter/master/pxem.jQuery.js
$.fn.toEm = function(settings){
	settings = jQuery.extend({
		scope: 'body'
	}, settings);
	var that = parseInt(this[0],10),
		scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
		scopeVal = scopeTest.height();
	scopeTest.remove();
	return (that / scopeVal).toFixed(8) + 'em';
};
// Convert ems to pixels
$.fn.toPx = function(settings){
    settings = jQuery.extend({
        scope: 'body'
    }, settings);
    var that = parseFloat(this[0]),
        scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
        scopeVal = scopeTest.height();
    scopeTest.remove();
    return Math.round(that * scopeVal) + 'px';
};

// Returns new DOM object from string
function createDOMObject(s) {
	return $("<div/>").html(s).contents();
}
