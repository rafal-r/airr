Airr.utils = (function () {
    this.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    this.objectSize = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key))
                size++;
        }
        return size;
    };
    
    this.inherit = (function () {
        var F = function() {};
        return function(Child, Parent){
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.uber = Parent.prototype;
            Child.prototype.constructor = Child;
        };
    })();

    this.mergeObjects = function (obj1, obj2) {
        var obj3 = {};
        for (var attrname in obj1) {
            if (obj1.hasOwnProperty(attrname)) {
                obj3[attrname] = obj1[attrname];
            }
        }
        
        for (var attrname in obj2) {
            if (obj2.hasOwnProperty(attrname)) {
                obj3[attrname] = obj2[attrname];
            }
        }
        
        return obj3;
    };
    
    return this;
})();