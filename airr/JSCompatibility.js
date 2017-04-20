if (NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback) {
        for (var i = 0; i < this.length; i++) {
            callback(this.item(i));
        }
    };
}