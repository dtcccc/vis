        function sleep(sleepTime) {
            for (var start = Date.now() ; Date.now() - start <= sleepTime;) {
            }
        }

        Array.prototype.unique = function () {
            if (this.length === 0) return this;
            this.sort();
            var re = [this[0]];
            var len = this.length;
            var relen = 1;
            for (var i = 1; i < len; i++) {
                if (this[i] !== re[relen - 1]) {
                    ++relen;
                    re.push(this[i]);
                }
            }
            return re;
        }

        if (!Array.prototype.includes) {
            Array.prototype.includes = function (searchElement /*, fromIndex*/) {
                'use strict';
                var O = Object(this);
                var len = parseInt(O.length) || 0;
                if (len === 0) {
                    return false;
                }
                var n = parseInt(arguments[1]) || 0;
                var k;
                if (n >= 0) {
                    k = n;
                } else {
                    k = len + n;
                    if (k < 0) {
                        k = 0;
                    }
                }
                var currentElement;
                while (k < len) {
                    currentElement = O[k];
                    if (searchElement === currentElement ||
                        (searchElement !== searchElement && currentElement !== currentElement)) {
                        return true;
                    }
                    k++;
                }
                return false;
            };
        }

        function intersection(a, b) {
            var int = a.filter(v => b.includes(v));
            return int;
        }

        function difference(a, b) {
            var dif = a.concat(b).filter(v => !b.includes(v));
            return dif;
        }

        function timestampToString(timestamp) {
            var d = new Date();
            d.setTime(timestamp);
            return d.toLocaleString();
        }