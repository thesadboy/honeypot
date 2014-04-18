var cloneObject = exports.cloneObject = function (obj, spes) {
  spes = spes || [];
  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;
  // Handle Date
  if (obj instanceof Date) {
    var copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  // Handle Array
  if (obj instanceof Array) {
    var copy = [];
    for (var i = 0, len = obj.length; i < len; ++i) {
      copy[i] = cloneObject(obj[i], spes);
    }
    return copy;
  }
  // Handle Object
  if (obj instanceof Object) {
    var copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr) && spes.indexOf(attr) < 0) copy[attr] = cloneObject(obj[attr], spes);
    }
    return copy;
  }
  throw new Error("Unable to copy obj! Its type isn't supported.");
}