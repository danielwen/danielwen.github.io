"use strict";

function strToFinite(s) {
    if (!Number.isNaN(parseFloat(s))) {
        var n = Number(s);
        if (Number.isFinite(n)) return n;
    }
    return NaN;
}

function round(n, decimals) {
    if (typeof(decimals) === "undefined") decimals = 0;
    var tens = Math.pow(10, decimals);
    return Math.round(n*tens)/tens;
}

function load(path, callback, type) {
    if (typeof(type) === "undefined") type = "";
    var req = new XMLHttpRequest();
    req.addEventListener("load", function () {
        if (this.status === 200)
            callback(this);
        else
            callback(false);
    });
    req.addEventListener("error", function () {
        callback(false);
    });
    req.open("get", path, true);
    req.responseType = type;
    req.send();
    return req;
}

function id(string) {
    var ids = string.replace(/ /g, "").split(",");
    if (ids.length > 1) {
        var elements = [];
        for (var i = 0; i < ids.length; i++)
            elements.push(document.getElementById(ids[i]));
        return elements;
    } else return document.getElementById(string);
}

function listen(elements, event, f) {
    for (var i = 0; i < elements.length; i++)
        elements[i]["on" + event] = f;
}


var Lane = {

param : {
    content : "page-content",
    transitionDuration : 500,
    visibleClass : "visible"
},

init : function () {
    highStory.init();
},

loadStatus : function (bool) {
    return false;
},

transitionOut : function (callback) {
    var t = setTimeout(callback, Lane.param.transitionDuration);
    document.getElementById(Lane.param.content)
        .classList.remove(Lane.param.visibleClass);
},

transitionIn : function () {
    document.getElementById(Lane.param.content)
        .classList.add(Lane.param.visibleClass);
}

};

document.addEventListener("DOMContentLoaded", Lane.init);

var highStory = {

param : {
    content : Lane.param.content,
    errorTitle : "Error occurred",
    errorContent : '<p>An error has occured. Please return to the <a href="/">home page</a> or try again later.</p>',
    loadStatus : function (bool) {
        highStory.temp.loadStatus = bool;
        Lane.loadStatus(bool);
    },
    transitionOut : function (callback) { Lane.transitionOut(callback); },
    transitionIn : Lane.transitionIn
},

state : {
    entries : [],
    index : -1
},

temp : {
    transitionOut : false,
    loadStatus : false,
    content : null,
    req : {}
},

init : function () {
    if (!history.pushState)
        return false;
    window.addEventListener("popstate", highStory.popstate);
    highStory.jsLinks(document.links);
    if (history.state === null) {
        highStory.populate(location.pathname);
        history.replaceState(highStory.state, "");
    } else {
        highStory.state.entries = history.state.entries.slice(0);
        highStory.state.index = history.state.index;
    }
},

jsLinks : function (links) {
    for (var i = 0; i < links.length; i++) {
        if (links[i].target === "_blank") {
            continue;
        } else {
            links[i].addEventListener("click", function (e) {
                highStory.click(e);
            });
        }
    }
},

preLoad : function (path) {
    var index = highStory.state.entries.indexOf(path);
    if (index >= 0) {
        var difference = index - history.state.index;
        history.go(difference);
    } else {
        highStory.populate(path);
        history.pushState(highStory.state, "", path);
        highStory.load(path);
    }
},

load : function (path) {
    highStory.param.loadStatus(true);
    if (highStory.temp.req.abort) {
        highStory.temp.req.abort();
    }
    highStory.temp.content = null;
    highStory.temp.transitionOut = false;
    highStory.param.transitionOut(function () {
        highStory.temp.transitionOut = true;
        highStory.asyncCheck();
    });
    highStory.temp.req = load(path, highStory.postLoad, "document");
},

postLoad : function (req) {
    var temp = highStory.temp;
    if (req && req.responseXML) {
        var newDoc = req.responseXML;
        document.title = newDoc.title;
        temp.content = newDoc.getElementById(highStory.param.content).firstElementChild;
    } else {
        document.title = highStory.param.errorTitle;
        temp.content = document.createElement("div");
        temp.content.innerHTML = '<header class="post-header"><h1 class="post-title">' + highStory.param.errorTitle + '</h1></header>' + highStory.param.errorContent;
    }
    var links = temp.content.getElementsByTagName("a");
    highStory.jsLinks(links);
    highStory.param.loadStatus(false);
    highStory.asyncCheck();
},

execScripts : function () {
    var script, source, i, math = false;
    for (i = 1; i < document.scripts.length; i++) {
        source = document.scripts[i];
        if (source.type === "" || source.type === "text/javascript") {
            if (source.id === "loadMath") math = true;
            script = document.createElement("script");
            if (source.src === "")
                script.innerHTML = source.innerHTML;
            else
                script.src = source.src;
            document.head.appendChild(script);
            document.head.removeChild(script);
        }
    }
    if (math && typeof(MathJax) !== "undefined")
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
},

populate : function (path) {
    var local = highStory.state;
    local.index += 1;
    local.entries = local.entries.slice(0, local.index);
    local.entries.push(path);
},

click : function (e) {
    e.preventDefault();
    if (e.currentTarget.pathname !== location.pathname && !highStory.temp.loadStatus)
        highStory.preLoad(e.currentTarget.pathname);
},

popstate : function () {
    if (history.state && highStory.state.index !== history.state.index) {
        highStory.state.index = history.state.index;
        history.replaceState(highStory.state, "");
        highStory.load(location.pathname);
    }
},

asyncCheck : function () {
    if (highStory.temp.transitionOut && highStory.temp.content) {
        var content = document.getElementById(highStory.param.content);
        content.replaceChild(highStory.temp.content, content.firstElementChild);
        highStory.execScripts();
        highStory.param.transitionIn();
    }
}

};

