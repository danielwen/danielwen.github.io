---
---

"use strict";

{% include src/common.js %}

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

{% include src/history.js %}