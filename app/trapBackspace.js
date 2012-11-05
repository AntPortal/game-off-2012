/*
 * Prevents backspace from causing the user to go to the previous page.
 */
define([], function() {
	function trap(event) {
		var keynum;
		if (window.event) {// eg. IE
			keynum = window.event.keyCode;
		} else if (event.which) {// eg. Firefox
			keynum = event.which;
		}
		if (keynum == 8) { // backspace has code 8
			return false; // nullifies the backspace
		}
		return true;
	}
	document.onkeydown = trap; // IE, Firefox, Safari
	document.onkeypress = trap; // only Opera needs the backspace nullifying in onkeypress
});