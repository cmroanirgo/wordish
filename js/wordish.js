(function t(r, e, i) {
    function n(a, s) {
        if (!e[a]) {
            if (!r[a]) {
                var u = typeof require == "function" && require;
                if (!s && u) return u(a, !0);
                if (o) return o(a, !0);
                var h = new Error("Cannot find module '" + a + "'");
                throw h.code = "MODULE_NOT_FOUND", h;
            }
            var f = e[a] = {
                exports: {}
            };
            r[a][0].call(f.exports, function(t) {
                var e = r[a][1][t];
                return n(e ? e : t);
            }, f, f.exports, t, r, e, i);
        }
        return e[a].exports;
    }
    var o = typeof require == "function" && require;
    for (var a = 0; a < i.length; a++) n(i[a]);
    return n;
})({
    1: [ function(t, r, e) {
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
    2: [ function(t, r, e) {
        /**
 * @license GPLv3
 * Copyright (c) 2017 Craig Monro (cmroanirgo). All rights reserved.
 * Please refer to https://github.com/cmroanirgo/wordish for the licensing and unobfuscated source
 **/
        r.exports = t("./lib/dict");
    }, {
        "./lib/dict": 3
    } ],
    3: [ function(t, r, e) {
        "use strict";
        var i = typeof window !== "undefined";
        if (!i) var n = t("crypto");
        function o(t) {
            for (var r = 1; r < arguments.length; r++) {
                var e = arguments[r];
                if (e === null || typeof e !== "object") continue;
                var i = Object.keys(e);
                var n = i.length;
                while (n--) {
                    t[i[n]] = e[i[n]];
                }
            }
            return t;
        }
        var a = {
            numWords: 8,
            randomizeNumWords: 0,
            minWordLen: 3,
            maxWordLen: 10,
            randomizer: new d()
        };
        function s() {
            this.a = 0;
            this.b = {};
            this.c = 0;
        }
        s.prototype.d = function(t) {
            var r = this.b[t];
            if (!r) {
                r = new f(t);
                this.b[t] = r;
            }
            r.usage++;
            this.a++;
            return r;
        };
        s.prototype.e = function(t, r) {
            var e = this;
            for (var i = 0; i < t.length; i++) {
                var n = e.d(t[i]);
                if (t[i] == " ") e = r; else if (e.c >= r.f) {
                    e = e.parent || r;
                    if (i > 0) {
                        var n = r.get(t[i]);
                        if (n) e = n.g(r);
                    }
                } else e = n.g(e);
            }
        };
        s.prototype.h = function(t) {
            t = Math.floor(t);
            var r = 0;
            var e = null;
            for (var i in this.b) {
                e = this.b[i];
                r += e.usage;
                if (t <= r) return e;
            }
            return e;
        };
        s.prototype.get = function(t) {
            return this.b[t];
        };
        s.prototype.i = function(t, r, e) {
            var i = r.generate(0, this.a);
            var n = this.h(i);
            if (!n) {
                var o = e;
                n = o.get(t);
                if (!!n) {
                    o = n.g(o);
                    if (o == this) return e.i(t, r, e);
                    return o.i(t, r, e);
                }
                return "";
            }
            if (!n || n.char == " ") return "";
            var a = n.g(this).i(n.char, r, e);
            return n.char + a;
        };
        function u(t) {
            s.call(this);
            this.f = t || 5;
        }
        o(u.prototype, s.prototype);
        u.prototype.reset = function() {
            this.a = 0;
            this.b = {};
        };
        u.prototype.createWord = function(t) {
            t = o({}, a, t);
            if (t.minWordLen >= t.maxWordLen) throw new Error("Minimum word length (" + t.minWordLen + ") should be shorter than the maximum word length (" + t.maxWordLen + ")");
            var r;
            do {
                r = this.i(" ", t.randomizer, this).trim();
            } while (r.length < t.minWordLen || r.length > t.maxWordLen);
            return r;
        };
        u.prototype.createWords = function(t) {
            t = o({}, a, t);
            var r = [];
            var e = t.numWords + (t.randomizeNumWords > 0 ? c(0, t.randomizeNumWords) : 0);
            while (e-- > 0) {
                var i = 100;
                do {
                    var n = this.createWord(t);
                } while (r.indexOf(n) >= 0 && i-- > 0);
                r.push(n);
            }
            return r;
        };
        function h(t) {
            var t = t.toLowerCase().replace(/[^a-z]/gi, " ").replace(/(?:and|an|or|the)/gi, " ").replace(/  /g, " ").trim();
            return t;
        }
        u.prototype.learn = function(t, r) {
            if (!r) r = h;
            t = r.call(this, t);
            this.e(t, this);
        };
        function f(t) {
            this.char = t;
            this.usage = 0;
        }
        f.prototype.g = function(t) {
            if (!this.b) {
                this.b = new s();
                this.b.parent = t;
                this.b.c = t.c + 1;
            }
            return this.b;
        };
        function c(t, r) {
            var e = new d(1);
            return e.generate(t, r);
        }
        function d(t) {
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
        d.prototype.generate = function(t, r) {
            if (this.at >= this.values.length) {
                if (i) window.crypto.getRandomValues(this.values); else this.values = n.randomBytes(this.values.length);
                this.at = 0;
            }
            var e = this.values[this.at++] | this.values[this.at++] << 8 | this.values[this.at++] << 16 | this.values[this.at++] << 24;
            e = e >>> 0;
            var o = 4294967295 >>> 0;
            e = e * (r - t) / o + t;
            if (e > r) e = r;
            return e;
        };
        r.exports = u;
    }, {
        crypto: undefined
    } ]
}, {}, [ 1 ]);
