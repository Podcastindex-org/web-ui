//Save the selected text
function saveSelection() {
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            var ranges = [];
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        }
    } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange();
    }
    console.log("can't get selection.");
    return null;
}


//Restore a text selection
function restoreSelection(savedSel) {
    if (savedSel) {
        if (window.getSelection) {
            sel = window.getSelection();
            sel.removeAllRanges();
            for (var i = 0, len = savedSel.length; i < len; ++i) {
                sel.addRange(savedSel[i]);
            }
        } else if (document.selection && savedSel.select) {
            savedSel.select();
        }
    }
}


/**
 * author Remy Sharp
 * url http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 */
(function ($) {
    function getViewportHeight() {
        var height = window.innerHeight; // Safari, Opera
        var mode = document.compatMode;

        if ((mode || !$.support.boxModel)) { // IE, Gecko
            height = (mode == 'CSS1Compat') ?
                document.documentElement.clientHeight : // Standards
                document.body.clientHeight; // Quirks
        }

        return height;
    }

    $(window).scroll(function () {
        var vpH = getViewportHeight(),
            scrolltop = (document.documentElement.scrollTop ?
                document.documentElement.scrollTop :
                document.body.scrollTop),
            elems = [];

        // naughty, but this is how it knows which elements to check for
        $.each($.cache, function () {
            if (this.events && this.events.inview) {
                elems.push(this.handle.elem);
            }
        });

        if (elems.length) {
            $(elems).each(function () {
                var $el = $(this),
                    top = $el.offset().top,
                    height = $el.height(),
                    inview = $el.data('inview') || false;

                if (scrolltop > (top + height) || scrolltop + vpH < top) {
                    if (inview) {
                        $el.data('inview', false);
                        $el.trigger('inview', [false]);
                    }
                } else if (scrolltop < (top + height)) {
                    if (!inview) {
                        $el.data('inview', true);
                        $el.trigger('inview', [true]);
                    }
                }
            });
        }
    });

    // kick the event to pick up any elements already in view.
    // note however, this only works if the plugin is included after the elements are bound to 'inview'
    $(function () {
        $(window).scroll();
    });
})(jQuery);


var debounce = function (func, threshold, execAsap) {

    var timeout;

    return function debounced() {
        var obj = this, args = arguments;

        function delayed() {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null;
        };

        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);

        timeout = setTimeout(delayed, threshold || 100);
    };

}


//A general purpose debouncer extension
//_____via http://www.hnldesign.nl/blog/debouncing-events-with-jquery/
var deBouncer = function ($, cf, of, interval) {
    // deBouncer by hnldesign.nl
    // based on code by Paul Irish and the original debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
        var timeout;

        return function debounced() {
            var obj = this, args = arguments;

            function delayed() {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            }

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || interval);
        };
    };
    jQuery.fn[cf] = function (fn) {
        return fn ? this.bind(of, debounce(fn)) : this.trigger(cf);
    };
};


//http://stackoverflow.com/questions/4652734/return-html-from-a-user-selection/4652824#4652824
//Get html of selected text
function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    } else if ($('#outliner').length > 0) {
        html = opGetLineText();
    }
    return html;
}


//Extend jquery so we can easily center an element
//_____via stackflow: http://stackoverflow.com/questions/210717/using-jquery-to-center-a-div-on-the-screen
jQuery.fn.center = function (horz, vert) {
    this.css("position", "absolute");
    if (vert == true) {
        this.css("top", Math.max(0, (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop()) + "px");
    }
    if (horz == true) {
        this.css("left", Math.max(0, (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    }
    return this;
}


//A jquery selector extension to determine if an element is visible in the viewport
//_____via http://remysharp.com/2009/01/26/element-in-view-event-plugin/
$.extend($.expr[':'], {
    inView: function (a) {
        var st = (document.documentElement.scrollTop || document.body.scrollTop),
            ot = $(a).offset().top,
            wh = (window.innerHeight && window.innerHeight < $(window).height()) ? window.innerHeight : $(window).height();
        return ot > st && ($(a).height() + ot) < (st + wh);
    }
});


//Empty and blank string checks, for convenience
//_____via http://stackoverflow.com/questions/154059/what-is-the-best-way-to-check-for-an-empty-string-in-javascript
function isEmpty(str) {
    return (!str || 0 === str.length);
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}


//Is this object an image?
function isImage(url, type) {
    var type = (typeof type === "undefined") ? false : type;

    if (type) {
        if (type.indexOf(systemUrl) == -1 && type.indexOf('image') != -1 && url.indexOf('http') == 0) {
            return true;
        }
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.jpg') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.jpeg') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.png') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.gif') != -1 && url.indexOf('http') == 0) {
        return true;
    }

    return false;
};


//Is it video?
function isVideo(url, type) {
    var type = (typeof type === "undefined") ? false : type;

    if (type) {
        if (type.indexOf(systemUrl) == -1 && type.indexOf('video') != -1 && url.indexOf('http') == 0) {
            return true;
        }
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.m4v') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.mp4') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.avi') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.mov') != -1 && url.indexOf('http') == 0) {
        return true;
    }

    return false;
};


//Is it audio?
function isAudio(url, type) {
    var type = (typeof type === "undefined") ? false : type;

    if (type) {
        if (type.indexOf(systemUrl) == -1 && type.indexOf('audio') != -1 && url.indexOf('http') == 0) {
            return true;
        }
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.mp3') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.m4a') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.wav') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.ogg') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('.wmv') != -1 && url.indexOf('http') == 0) {
        return true;
    }

    return false;
};


//Is it html content?
function isHtml(url, type) {
    var type = (typeof type === "undefined") ? false : type;

    if (type) {
        if (type.indexOf(systemUrl) == -1 && type.indexOf('html') != -1 && url.indexOf('http') == 0) {
            return true;
        }
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('youtube') != -1 && url.indexOf('http') == 0) {
        return true;
    }
    if (url.indexOf(systemUrl) == -1 && url.indexOf('vimeo') != -1 && url.indexOf('http') == 0) {
        return true;
    }

    return false;
};


// Modified from http://ejohn.org/blog/javascript-pretty-date/#comment-297458
function prettyDate(date) {
    var date, seconds, formats, i = 0, f;
    date = new Date(date);
    seconds = (new Date - date) / 1000;
    formats = [
        [-1, 'Recently'], // Deals with times in the future
        [60, 'seconds', 1],
        [120, '1 minute ago'],
        [3600, 'minutes', 60],
        [7200, '1 hour ago'],
        [86400, 'hours', 3600],
        [172800, 'Yesterday'],
        [604800, 'days', 86400],
        [1209600, '1 week ago'],
        [2678400, 'weeks', 604800]
    ];

    while (f = formats[i++]) {
        if (seconds < f[0]) {
            return f[2] ? Math.floor(seconds / f[2]) + ' ' + f[1] + ' ago' : f[1];
        }
        // Crude fix for feed items with incorrect pubDate (i.e. 01 Dec 1999)
        // look for anything over 10 years old
        if (seconds > 315569260) {
            return 'Recently';
        }
    }

    return dateFormat(date, 'longDate');
};


/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 *
 * http://blog.stevenlevithan.com/archives/date-time-format
 */
var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    function finalDate(date, mask, utc) {
        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dateFormat.i18n.dayNames[D],
                dddd: dateFormat.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dateFormat.i18n.monthNames[m],
                mmmm: dateFormat.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };

    return finalDate;
}();


// Some common format strings
dateFormat.masks = {
    "default": "HH:MM:ss dd mmm yyyy ", // 17:46:21 09 Jun 2007
    shortDate: "m/d/yy", // 6/9/07
    mediumDate: "d mmm yyyy", // 9 Jun 2007
    longDate: "d mmmm yyyy", // 9 June 2007
    fullDate: "dddd, mmmm d, yyyy", // Saturday, June 9, 2007
    shortTime: "h:MM TT", // 5:46 PM
    mediumTime: "h:MM:ss TT", // 5:46:21 PM
    longTime: "h:MM:ss TT Z", // 5:46:21 PM EST
    isoDate: "yyyy-mm-dd", // 2007-06-09
    isoTime: "HH:MM:ss", // 17:46:21
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss", // 2007-06-09T17:46:21
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'", // 2007-06-09T22:46:21Z

    timeDate: "dd mmm; h:MM TT" // 09 Jun; 5:46:21 PM
};


// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};


// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};


//Get padding size for an element
function getVerticalPadding(el) {
    var pt = parseInt($(el).css("padding-top").replace("px", ""));
    var pb = parseInt($(el).css("padding-bottom").replace("px", ""));

    return (pt + pb);
}


//Get margin size for an element
function getVerticalMargins(el) {
    var mt = parseInt($(el).css("margin-top").replace("px", ""));
    var mb = parseInt($(el).css("margin-bottom").replace("px", ""));

    return (mt + mb);
}


//Find jQuery event handlers attached to an html element
function getJQEvents(element) {
    var elemEvents = $._data(element, "events");
    var allDocEvnts = $._data(document, "events");
    for (var evntType in allDocEvnts) {
        if (allDocEvnts.hasOwnProperty(evntType)) {
            var evts = allDocEvnts[evntType];
            for (var i = 0; i < evts.length; i++) {
                if ($(element).is(evts[i].selector)) {
                    if (elemEvents == null) {
                        elemEvents = {};
                    }
                    if (!elemEvents.hasOwnProperty(evntType)) {
                        elemEvents[evntType] = [];
                    }
                    elemEvents[evntType].push(evts[i]);
                }
            }
        }
    }
    return elemEvents;
}

//Returns true if the entire string is only alpha numeric characters, otherwise
//returns false
function isAlphaNumeric(str) {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && !(code > 64 && code < 91) && !(code > 96 && code < 123)) {
            return false;
        }
    }
    return true;
};

function incGlobalCounter() {
    gGlobalCounter = gGlobalCounter + 1;
}

function decGlobalCounter() {
    gGlobalCounter = gGlobalCounter - 1;
}

function resetGlobalCounter() {
    gGlobalCounter = 0;
}

/**
 * Function that will redirect to a new page & pass data using submit
 * @param {type} path -> new url
 * @param {type} params -> JSON data to be posted
 * @param {type} method -> GET or POST
 * @returns {undefined} -> NA
 */
//https://stackoverflow.com/questions/2367594/open-url-while-passing-post-data-with-jquery
function gotoUrl(path, params, method, target) {
    //Null check
    method = method || "post"; // Set method to post by default if not specified.
    target = target || "";

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("id", "flyform");
    if (target != "") {
        form.setAttribute("target", target);
    }

    //Fill the hidden form
    if (typeof params === 'string') {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", 'data');
        hiddenField.setAttribute("value", params);
        form.appendChild(hiddenField);
    } else {
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                if (typeof params[key] === 'object' || typeof params[key] === 'array') {
                    hiddenField.setAttribute("value", JSON.stringify(params[key]));
                } else {
                    hiddenField.setAttribute("value", params[key]);
                }
                form.appendChild(hiddenField);
            }
        }
    }

    document.body.appendChild(form);
    form.submit();

}

/** https://stackoverflow.com/questions/8548126/make-span-element-editable */
$.fn.extend({
    editable: function () {
        var parentel = this;
        var that = this;
        var $edittextbox = $('<input type="text" class="editable"></input>').css('min-width', that.width());
        var submitChanges = function () {
            that.html($edittextbox.val());
            that.show();
            that.trigger('editsubmit', [that.html()]);
            $(document).off('click', submitChanges);
            $edittextbox.detach();
        };
        var tempVal;
        $edittextbox.click(function (event) {
                event.stopPropagation();
            }
        );

        that.dblclick(function (e) {
            tempVal = that.html();
            $edittextbox.val(tempVal).insertBefore(that).off("keypress").on('keypress blur', function (e) {
                //console.log(e);
                if ($(this).val() !== '') {
                    if (e.type == "blur") {
                        submitChanges();
                    }
                    if (e.type == "keypress") {
                        var code = (e.keyCode ? e.keyCode : e.which);
                        if (code == 13) {
                            submitChanges();
                        }
                    }
                }
            });
            that.hide();
            $(document).one("click", submitChanges);

            parentel.parent().find('input.editable').focus();
            parentel.parent().find('input.editable')[0].setSelectionRange(0, parentel.parent().find('input.editable').val().lastIndexOf('.'));
        });

        return that;
    }
});

function getTimeMilliseconds() {
    return (new Date).getTime();
}

function sortUnorderedList(ul, sortDescending) {
    if (typeof ul == "string")
        ul = document.getElementById(ul);

    // Idiot-proof, remove if you want
    if (!ul) {
        alert("The UL object is null!");
        return;
    }

    // Get the list items and setup an array for sorting
    var lis = ul.getElementsByTagName("LI");
    var vals = [];

    // Populate the array
    for (var i = 0, l = lis.length; i < l; i++)
        vals.push(lis[i].innerHTML);

    // Sort it
    vals.sort();

    // Sometimes you gotta DESC
    if (sortDescending)
        vals.reverse();

    // Change the list on the page
    for (var i = 0, l = lis.length; i < l; i++)
        lis[i].innerHTML = vals[i];
}

$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}

//https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomGen() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

//https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}