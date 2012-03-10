/**
 * HoverAttribute jQuery plugin v1.0.5
 * by Alexander Wallin (http://www.afekenholm.se).
 * 
 * parseUri() method by Steven Levithan (http://blog.stevenlevithan.com/).
 * 
 * This plugin allows you to make (link-)elements more dynamic by making an attribute
 * of that element show up on hovering. This is mainly intended for <a> tags residing
 * within full-width elements, such as headings or list entries.
 * 
 * For comments, discussion, propsals and/or development; please visit
 * http://www.afekenholm.se/hoverattribute-jquery-plugin or send a mail to
 * contact@afekenholm.se.
 * 
 * @author: Alexander Wallin (http://www.afekenholm.se)
 * @version: 1.0.5
 * @url: http://www.afekenholm.se/hoverattribute-jquery-plugin
 */
(function($){
	
	// var getHrefSpan = function(class)
	$.hoverAttribute = function(el, options){
		
		// Escape conflicts
		var base = this;
		
		// Set options
		base.options = $.extend({}, $.hoverAttribute.defaults, options);
		
		// Cache elements
		base.$el = $(el);
		base.el = el; // Not in use a.t.m.
		
		// Store initial variables in the jQuery object.
		base.$el.$parent = base.$el.parent(); // Not in use a.t.m.
		base.$el.initWidth = base.$el.width();
		base.$el.initHeight = base.$el.height();
		
		// Get the content of the element and the attribute
		var	elText = base.$el.html(), 
			attrValue = base.$el.attr(base.options.attribute);
		
		base.init = function(){
			
			if (base.options.attribute == "href")
				base.buildNiceHref();
			base.buildContent();
			base.setupHovering();
			
		};
		
		// If the href attribute is chosen, 
		// build a nice href depening on the options
		base.buildNiceHref = function(){
			
			// Remove protocol
			if (base.options.removeProtocol) attrValue = attrValue.replace("http://", "");
			
			// Remove www
			if (base.options.removeWWW) attrValue = attrValue.replace("www.", "");
			
			// Shorten link
			if (base.options.wrapLink != "none") {
				
				var doWrapping = true,
					wrapLength = base.options.wrapLength; // Alias
				
				if (wrapLength == "auto")
					wrapLength = elText.length - 3; // Same num of chars, minus "..."
				else if (wrapLength == "none" || wrapLength <= 0)
					doWrapping = false; // No wrapping
				
				// If the wrap length is valid and wrapping is neccessary (3 is for "..."),
				// wrap the attribute text.
				if (doWrapping && attrValue.length > wrapLength + 3) {
					
					// Where the user wants to wrap the attribute
					var wrapLink = base.options.wrapLink;

					if (wrapLink == "after") {
						attrValue = attrValue.substr(0, wrapLength) + "...";
					}
					else if (wrapLink == "before") {
						var numChars = attrValue.length,
							wrapStart = numChars - wrapLength;
						attrValue = "..." + attrValue.substr(wrapStart, numChars - 1);
					}
					else if (wrapLink == "middle") {
						var hrefStart = attrValue.substr(0, Math.floor(attrValue.length / 2)),
							hrefEnd = attrValue.substr(hrefStart.length, attrValue.length);

						hrefStart = hrefStart.substr(0, Math.floor(wrapLength / 2));
						hrefEnd = hrefEnd.substr(
							hrefEnd.length - Math.ceil(wrapLength / 2), 
							hrefEnd.length);

						attrValue = hrefStart + "..." + hrefEnd;
					}
				}
			}
			
			// Hightlight some part of the URL
			if (base.options.highlightURLPart != "none") {
				
				var hrefParts = parseUri(attrValue),
					partName = base.options.highlightURLPart;
				
				base.highlightPart = function(str){
					attrValue = attrValue.replace(
						str,
						"<span class='hoverattribute-highlight'>" + str + "</span>");
				};
				
				// Custom highlightning of the last part of the URI
				if (partName == "lastURIPart") {
					var path = hrefParts.path,
						lastPart = path.match(/[a-zA-Z0-9-_]+\/?$/i);
					base.highlightPart(lastPart);
				}
				// From parseUri() (see below)
				else if (hrefParts[partName] != undefined && hrefParts[partName] != "") {
					base.highlightPart(hrefParts[partName]);
				}
				else {
					// Quiet, now.
				}
			}
		}
		
		base.buildContent = function(){
		
			// Set position to relative
			base.$el.css({
				'display'			: 'block',
				'position'			: 'relative',
				'width'				: base.$el.initWidth + 'px',// Set the element's width to
																// a fixed width.
				'height'	 		: base.$el.height() + 'px',
				'overflow'			: 'hidden'
			})
			.html("<span class='hoverattribute-title'>" + elText + "</span>")
			// The attribute container is initially empty, so that the height is not affected
			// before applying proper CSS.
			.append("<span class='hoverattribute-attr'></span>");
			
			// Give the element text ("title") the css properties of a showing part.
			$(".hoverattribute-title", base.$el)
			//.css($.hoverAttribute.spanCSSDefaults).css($.hoverAttribute.spanCSSVisible);
			.css($.extend({}, $.hoverAttribute.spanCSSDefaults, $.hoverAttribute.spanCSSVisible));

			// Give the attribute text the css properties of a hidden part and insert the
			// attribute value.
			$(".hoverattribute-attr", base.$el)
			.css($.extend({}, $.hoverAttribute.spanCSSDefaults, $.hoverAttribute.spanCSSHidden))
			.css({'width':'auto', 'height':base.$el.initHeight + 'px'}) // No fixed width to avoid line breaks.
			.html(attrValue);
		};
		
		base.setupHovering = function(){
			
			var animTime = base.options.animationTime * 1000,
				animEase = base.options.animationEase;
			
			// Setup the hover tweenings
			base.$el.bind('mouseover', function(){

				// If allowed, expand the element to the maximum width so that the attribute 
				// container (which is probably a description or a URL, and therefore probably
				// also longer/wider) will be fully visible.
				if (base.options.cssSettings.canExpandToFullWidth) {
					$(this).css('width', base.$el.$parent.width() + 'px');
				}

				// Hide default text
				$(".hoverattribute-title", this)
				.stop().animate($.hoverAttribute.spanCSSHidden, animTime, animEase);

				// Show attribute text
				$(".hoverattribute-attr", this)
				.stop().animate($.hoverAttribute.spanCSSVisible, animTime, animEase);
				
			})
			.bind('mouseout', function(){

				var $thisEl = $(this);
				
				// Show default text
				$(".hoverattribute-title", this)
				.stop().animate($.hoverAttribute.spanCSSVisible, animTime, animEase);

				// Hide attribute text
				$(".hoverattribute-attr", this)
				.stop().animate($.hoverAttribute.spanCSSHidden, animTime, animEase, function(){
					
					// When the attribute text is hidden, set the element to its initial width.
					// We don't want the element to be hoverable at the full parent width.
					$thisEl.css('width', base.$el.initWidth + 'px');
				});
			});
			
		};
		
		// And the Lord said:
		base.init();
		
	};
	
	$.hoverAttribute.defaults = {
		attribute: "href",
		animationTime: 0.3,
		animationEase: "swing", // "linear"
		removeProtocol: false,
		removeWWW: false,
		wrapLink: "after", // "before", "middle", "none"
		wrapLength: 60, // "auto", "none"
		highlightURLPart: "domain", // "path", "query", "lastURIPart", "none"
		cssSettings: {
			canExpandToFullWidth: true
		}
	};
	
	$.hoverAttribute.spanCSSDefaults = {
		'display'		: 'block',
		'position'		: 'absolute',
		'top'			: '0',
		'overflow'		: 'hidden',
		'width'			: 'auto'
	};
	
	$.hoverAttribute.spanCSSVisible = {
		'left'			: '0',
		'opacity'		: '1'
	};
	
	$.hoverAttribute.spanCSSHidden = {
		'left'			: '-10px',
		'opacity'		: '0'
	};
	
	$.fn.hoverAttribute = function(options){
		return this.each(function(i){
			new $.hoverAttribute(this, options);
		});
	};
	
})(jQuery);

/* parseUri JS v0.1, by Steven Levithan (http://blog.stevenlevithan.com/)
Splits any well-formed URI into the following parts (all are optional):
----------------------
• source (since the exec() method returns backreference 0 [i.e., the entire match] as key 0, we might as well use it)
• protocol (scheme)
• authority (includes both the domain and port)
    • domain (part of the authority; can be an IP address)
    • port (part of the authority)
• path (includes both the directory path and filename)
    • directoryPath (part of the path; supports directories with periods, and without a trailing backslash)
    • fileName (part of the path)
• query (does not include the leading question mark)
• anchor (fragment)
*/
function parseUri(sourceUri){
	
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
    var uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri);
    var uri = {};
    
    for(var i = 0; i < 10; i++){
        uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }
    
    // Always end directoryPath with a trailing backslash if a path was present in the source URI
    // Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key
    if(uri.directoryPath.length > 0){
        uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }

    return uri;
}