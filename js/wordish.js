(function t(e, r, i) {
    function n(a, s) {
        if (!r[a]) {
            if (!e[a]) {
                var h = typeof require == "function" && require;
                if (!s && h) return h(a, !0);
                if (o) return o(a, !0);
                var u = new Error("Cannot find module '" + a + "'");
                throw u.code = "MODULE_NOT_FOUND", u;
            }
            var f = r[a] = {
                exports: {}
            };
            e[a][0].call(f.exports, function(t) {
                var r = e[a][1][t];
                return n(r ? r : t);
            }, f, f.exports, t, e, r, i);
        }
        return r[a].exports;
    }
    var o = typeof require == "function" && require;
    for (var a = 0; a < i.length; a++) n(i[a]);
    return n;
})({
    1: [ function(t, e, r) {
        /**
 * @license GPLv3
 * Copyright (c) 2017 Craig Monro (cmroanirgo). All rights reserved.
 *
 * This file is for browser consumption
 **/
        window.Wordish = t("./index");
    }, {
        "./index": 2
    } ],
    2: [ function(t, e, r) {
        /**
 * @license GPLv3
 * Copyright (c) 2017 Craig Monro (cmroanirgo). All rights reserved.
 **/
        e.exports = t("./lib/dict");
    }, {
        "./lib/dict": 3
    } ],
    3: [ function(t, e, r) {
        "use strict";
        var i = typeof window !== "undefined";
        if (!i) var n = t("crypto");
        function o(t) {
            for (var e = 1; e < arguments.length; e++) {
                var r = arguments[e];
                if (r === null || typeof r !== "object") continue;
                var i = Object.keys(r);
                var n = i.length;
                while (n--) {
                    t[i[n]] = r[i[n]];
                }
            }
            return t;
        }
        var a = {
            numWords: 8,
            minWordLen: 3,
            maxWordLen: 10,
            randomizer: new c()
        };
        function s() {
            this.totalUsage = 0;
            this.items = {};
            this.depth = 0;
        }
        s.prototype.a = function(t) {
            var e = this.items[t];
            if (!e) {
                e = new f(t);
                this.items[t] = e;
            }
            e.usage++;
            this.totalUsage++;
            return e;
        };
        s.prototype.b = function(t, e) {
            var r = this;
            for (var i = 0; i < t.length; i++) {
                var n = r.a(t[i]);
                if (t[i] == " ") r = e; else if (r.depth >= e.maxDepth) {
                    r = r.parent || e;
                    if (i > 0) {
                        var n = e.get(t[i]);
                        if (n) r = n.c(e);
                    }
                } else r = n.c(r);
            }
        };
        s.prototype.d = function(t) {
            t = Math.floor(t);
            var e = 0;
            var r = null;
            for (var i in this.items) {
                r = this.items[i];
                e += r.usage;
                if (t <= e) return r;
            }
            return r;
        };
        s.prototype.get = function(t) {
            return this.items[t];
        };
        s.prototype.e = function(t, e, r) {
            var i = e.generate(0, this.totalUsage);
            var n = this.d(i);
            if (!n) {
                var o = r;
                n = o.get(t);
                if (!!n) {
                    o = n.c(o);
                    if (o == this) return r.e(t, e, r);
                    return o.e(t, e, r);
                }
                return "";
            }
            if (!n || n.char == " ") return "";
            var a = n.c(this).e(n.char, e, r);
            return n.char + a;
        };
        function h(t) {
            s.call(this);
            this.maxDepth = t || 5;
        }
        o(h.prototype, s.prototype);
        h.prototype.reset = function() {
            this.totalUsage = 0;
            this.items = {};
        };
        h.prototype.createWord = function(t) {
            t = o({}, a, t);
            if (t.minWordLen >= t.maxWordLen) throw new Error("Minimum word length (" + t.minWordLen + ") should be shorter than the maximum word length (" + t.maxWordLen + ")");
            var e;
            do {
                e = this.e(" ", t.randomizer, this).trim();
            } while (e.length < t.minWordLen || e.length > t.maxWordLen);
            return e;
        };
        h.prototype.createWords = function(t) {
            t = o({}, a, t);
            var e = [];
            var r = t.numWords;
            while (r-- > 0) {
                var i = 100;
                do {
                    var n = this.createWord(t);
                } while (e.indexOf(n) >= 0 && i-- > 0);
                e.push(n);
            }
            return e;
        };
        function u(t) {
            var t = t.toLowerCase().replace(/[^a-z]/gi, " ").replace(/(?:and|an|or|the)/gi, " ").replace(/  /g, " ").trim();
            return t;
        }
        h.prototype.learn = function(t, e) {
            if (!e) e = u;
            t = e.call(this, t);
            this.b(t, this);
        };
        function f(t) {
            this.char = t;
            this.usage = 0;
        }
        f.prototype.c = function(t) {
            if (!this.items) {
                this.items = new s();
                this.items.parent = t;
                this.items.depth = t.depth + 1;
            }
            return this.items;
        };
        function c(t) {
            this.rand = [];
            this.at = 0;
            t = t || 40;
            t += 4 - t % 4;
            if (i) {
                this.values = new Uint8Array(t);
                window.crypto.getRandomValues(this.values);
            } else {
                this.values = n.randomBytes(t);
            }
        }
        c.prototype.generate = function(t, e) {
            if (this.at >= this.values.length) {
                if (i) window.crypto.getRandomValues(this.values); else this.values = n.randomBytes(this.values.length);
                this.at = 0;
            }
            var r = this.values[this.at++] | this.values[this.at++] << 8 | this.values[this.at++] << 16 | this.values[this.at++] << 24;
            r = r >>> 0;
            var o = 4294967295 >>> 0;
            r = r * (e - t) / o + t;
            if (r > e) r = e;
            return r;
        };
        e.exports = h;
    }, {
        crypto: undefined
    } ]
}, {}, [ 1 ]);
