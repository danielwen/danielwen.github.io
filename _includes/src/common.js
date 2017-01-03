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
