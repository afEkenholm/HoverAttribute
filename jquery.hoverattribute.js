/**
	hoverAttribute v 1.0
	
	@author: Alexander Wallin (http://www.afekenholm.se)
*/

var timeStart = new Date().getTime();
var checkTime = false;

(function($){
	
	// var getHrefSpan = function(class)
	$.hoverAttribute = function(el, options){
		
		// Escape conflicts
		var base = this;
		
		// Set options
		base.options = $.extend({}, $.hoverAttribute.defaults, options);
		
		// Cache elements
		var $a = $(el),
			$aParent = $a.parent(),
			href = $a.attr(base.options.hoverAttribute),
			title = $a.html(),
			initWidth = $a.width();
		
		base.init = function(){
			
			base.buildNiceHref();
			base.buildContent();
			base.setupHovering();
			
			if (checkTime) alert(new Date().getTime() - timeStart + " ms");
			
		};
		
		// Build a nice href depening on the options
		base.buildNiceHref = function(){
			
			var hrefParts = parseUri(href);
			
			// Remove protocol
			if (base.options.removeProtocol) {
				href = href.replace("http://", "");
			}
			
			// Remove www
			if (base.options.removeWWW) {
				href = href.replace("www.", "");
			}
			
			// Shorten link
			if (base.options.wrapLink != "none") {
				
				wrapLength = base.options.wrapLength;
				
				if (typeof(wrapLength) == "string" 
						|| href.length > base.options.wrapLength + 3) {
							
					var wrapWhere = base.options.wrapLink;
					if (typeof(wrapLength) == "string") {
						wrapLength = title.length - 3;
					}

					if (wrapWhere == "after") {
						href = href.substr(0, wrapLength);
						href += "...";
					}
					else if (wrapWhere == "before") {
						var numChars = href.length,
							wrapStart = numChars - wrapLength;
						href = "..." + href.substr(wrapStart, href.length - 1);
					}
					else if (wrapWhere == "middle") {
						var hrefStart = href.substr(0, Math.floor(href.length / 2)),
							hrefEnd = href.substr(hrefStart.length, href.length);

						hrefStart = hrefStart.substr(0, Math.floor(wrapLength / 2));
						hrefEnd = hrefEnd.substr(
							hrefEnd.length - Math.ceil(wrapLength / 2), 
							hrefEnd.length);

						href = hrefStart + "..." + hrefEnd;
					}
				}
			}
			
			// Hightlight some part of the URL
			if (base.options.highlightURLPart != "none") {
				
				// alert("begin highlight");
				
				var part = base.options.highlightURLPart;
				
				base.highlightPart = function(str){
					// alert("highlight: " + str);
					href = href.replace(
						str,
						"<span class='hrefhover-highlight'>" + str + "</span>");
				};
				
				// Custom
				if (part == "lastURIPart") {
					var path = hrefParts.path,
						lastPart = path.match(/[a-zA-Z0-9-_]+\/?$/i);
					base.highlightPart(lastPart);
				}
				// From parseUri()
				else if (hrefParts[part] != undefined && hrefParts[part] != "") {
					// alert(part " => " + hrefParts[part]);
					base.highlightPart(hrefParts[part]);
				}
			}
		}
		
		base.buildContent = function(){
			
			var aHeight = $a.height() + 'px';
			if (base.options.cssProperties.isInParagraph) {
				if (base.options.cssProperties.aHeight != null) {
					aHeight = base.options.cssProperties.aHeight;
				}
				else
					aHeight = $a.css('font-size');
			}
			
			// Set position to relative
			$a.css({
				'display'			: 'inline-block',
				'position'			: 'relative',
				'width'				: $a.width() + 'px',
				// 'height'			: aHeight + " !important",
				'height'			: $a.height() + 'px',
				'overflow'			: 'hidden'
			})
			.html("<span class='hrefhover-title'>" + title + "</span>")
			.append("<span class='hrefhover-href'></span>");
			
			
			// alert($a.css('height'));
			// alert(base.options.cssProperties.aHeight);

			// Give the parent a height
			// $aParent.css("height", $a.height() + "px");

			// Enclose the a content in a span tag
			$titleSpan = $(".hrefhover-title", $a)
			.css(cssDefaults).css(cssVisible);

			// Insert href into the html content
			$hrefSpan = $(".hrefhover-href", $a)
			.css(cssDefaults).css(cssHidden)
			.html(href);
		};
		
		base.setupHovering = function(){
			
			// Setup the hover tweenings
			$a.bind('mouseover', function(){

				if (base.options.cssProperties.canUseFullWidth) {
					$(this).css('width', '100%');
				}
				else {
					$(this).css('width', base.options.cssProperties.expandATo);
				}

				$(".hrefhover-title", this)
				.stop().animate(cssHidden, 300, "swing");

				$(".hrefhover-href", this)
				.stop().animate(cssVisible, 300, "swing");
				
			})
			.bind('mouseout', function(){

				var $this_a = $(this);

				$(".hrefhover-title", this)
				.stop().animate(cssVisible, 300, "swing");

				$(".hrefhover-href", this)
				.stop().animate(cssHidden, 300, "swing", function(){
					$this_a.css('width', initWidth + 'px');
				});
			});
			
		};
		
		base.init();
		
	};
	
	$.hoverAttribute.defaults = {
		hoverAttribute: "href",
		removeProtocol: false,
		removeWWW: false,
		wrapLink: "after", // "before", "middle", "none"
		wrapLength: 60, // "inherit"
		highlightURLPart: "domain", // "path", "query", "lastURIPart", "none"
		cssProperties: {
			canUseFullWidth: true,
			expandATo: 'auto',
			isInParagraph: false,
			aHeight: null
		}
	};
	
	// $.hoverAttribute.cssDefaults = {
	var cssDefaults = {
		'display'		: 'inline-block',
		'position'		: 'absolute',
		'top'			: '0'
	};
	
	// $.hoverAttribute.cssVisible = {
	var cssVisible = {
		'left'			: '0',
		'opacity'		: '1'
	};
	
	// $.hoverAttribute.cssHidden = {
	var cssHidden = {
		'left'			: '-10px',
		'opacity'		: '0'
	};
	
	$.fn.hoverAttribute = function(options){
		return this.each(function(i){
			new $.hoverAttribute(this, options);
		});
	};
	
})(jQuery);

/* parseUri JS v0.1, by Steven Levithan (http://badassery.blogspot.com)
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