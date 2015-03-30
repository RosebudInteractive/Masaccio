/**
 * Created by staloverov on 30.03.2015.
 */

var Utils = {};

Utils.copyObject = function(obj)
{
    var copy = {};
    for (var key in obj)
    {
        copy[key] = obj[key];
    }
    return copy;
};

Utils.copyArray = function(array)
{
    var copy = [];
    for (var i=0, l=array.length; i<l; i++)
    {
        if (array[i] && typeof array[i] == "object")
            copy[i] = this.copyObject( array[i] );
        else
            copy[i] = array[i];
    }
    return copy;
};

Utils.deepCopy = function (obj) {
    if (typeof obj !== "object" || !obj)
        return obj;
    var cons = obj.constructor;
    if (cons === RegExp)
        return obj;
    var copy = cons();
    for (var key in obj) {
        if (typeof obj[key] === "object") {
            copy[key] = exports.deepCopy(obj[key]);
        } else {
            copy[key] = obj[key];
        }
    }
    return copy;
};

if (module) { module.exports = Utils; }