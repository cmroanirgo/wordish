(function r(t, e, n) {
    function i(a, s) {
        if (!e[a]) {
            if (!t[a]) {
                var h = typeof require == "function" && require;
                if (!s && h) return h(a, !0);
                if (o) return o(a, !0);
                var u = new Error("Cannot find module '" + a + "'");
                throw u.code = "MODULE_NOT_FOUND", u;
            }
            var f = e[a] = {
                exports: {}
            };
            t[a][0].call(f.exports, function(r) {
                var e = t[a][1][r];
                return i(e ? e : r);
            }, f, f.exports, r, t, e, n);
        }
        return e[a].exports;
    }
    var o = typeof require == "function" && require;
    for (var a = 0; a < n.length; a++) i(n[a]);
    return i;
})({
    1: [ function(r, t, e) {
        /**
 * @license GPLv3
 * Copyright (c) 2017 Craig Monro (cmroanirgo). All rights reserved.
 *
 * This file is for browser consumption
 **/
        window.Wordish = r("./index");
    }, {
        "./index": 2
    } ],
    2: [ function(r, t, e) {
        /**
 * @license GPLv3
 * Copyright (c) 2017 Craig Monro (cmroanirgo). All rights reserved.
 * Please refer to https://github.com/cmroanirgo/wordish for the licensing and unobfuscated source
 **/
        t.exports = r("./lib/dict");
    }, {
        "./lib/dict": 3
    } ],
    3: [ function(r, t, e) {
        "use strict";
        var n = typeof window !== "undefined";
        if (!n) var i = r("crypto");
        function o(r) {
            for (var t = 1; t < arguments.length; t++) {
                var e = arguments[t];
                if (e === null || typeof e !== "object") continue;
                var n = Object.keys(e);
                var i = n.length;
                while (i--) {
                    r[n[i]] = e[n[i]];
                }
            }
            return r;
        }
        var a = {
            minWordLen: 0,
            maxWordLen: 25,
            validator: f
        };
        var s = {
            numWords: 4,
            randomizeNumWords: 1,
            minWordLen: 5,
            maxWordLen: 10,
            randomizer: new c()
        };
        function h() {
            this.a = 0;
            this.b = {};
            this.c = 0;
        }
        h.prototype.d = function(r) {
            var t = this.b[r];
            if (!t) {
                t = new l(r);
                this.b[r] = t;
            }
            t.usage++;
            this.a++;
            return t;
        };
        h.prototype.e = function(r, t) {
            var e = this;
            for (var n = 0; n < r.length; n++) {
                var i = e.d(r[n]);
                if (r[n] == " ") e = t; else if (e.c >= t.f) {
                    e = e.parent || t;
                    if (n > 0) {
                        var i = t.get(r[n]);
                        if (i) e = i.g(t);
                    }
                } else e = i.g(e);
            }
        };
        h.prototype.h = function(r) {
            r = Math.floor(r);
            var t = 0;
            var e = null;
            for (var n in this.b) {
                e = this.b[n];
                t += e.usage;
                if (r < t) return e;
            }
            return e;
        };
        h.prototype.i = function(r, t) {
            t = t || 0;
            var e = this;
            var n = null;
            var i = null;
            do {
                i = e.b[r];
                if (t <= 0 && !!i) n = e;
                e = e.parent;
            } while ((t-- > 0 || !n) && !!e);
            return n;
        };
        h.prototype.get = function(r) {
            return this.b[r];
        };
        h.prototype.j = function(r, t, e, n) {
            var i = r.length ? r[r.length - 1] : "";
            var o = null;
            if (this.a > 0) {
                var a = t.generate(0, this.a - 1);
                o = this.h(a);
            }
            if ((!o || o.char == " ") && r.length < n.minWordLen) {
                if (i.length && this.parent != e) {
                    var s = this.i(i, 2);
                    if (s) {
                        var h = s.get(i);
                        return h.g(s).j(r, t, e, n);
                    }
                }
                return e.j(r, t, e, n);
            }
            if (!o || o.char == " ") return "";
            var u = o.g(this).j(r + o.char, t, e, n);
            return o.char + u;
        };
        function u(r) {
            h.call(this);
            this.f = r || 5;
        }
        o(u.prototype, h.prototype);
        u.prototype.reset = function() {
            this.a = 0;
            this.b = {};
        };
        u.prototype.createWord = function(r) {
            r = o({}, s, r);
            if (r.minWordLen >= r.maxWordLen) throw new Error("Minimum word length (" + r.minWordLen + ") should be shorter than the maximum word length (" + r.maxWordLen + ")");
            var t = null, e = 50;
            do {
                t = this.j("", r.randomizer, this, r).trim();
            } while ((t.length < r.minWordLen || t.length > r.maxWordLen) && e-- > 0);
            return t;
        };
        u.prototype.createWords = function(r) {
            r = o({}, s, r);
            var t = [];
            var e = r.numWords + (r.randomizeNumWords > 0 ? d(0, r.randomizeNumWords) : 0);
            while (e-- > 0) {
                var n = 50;
                do {
                    var i = this.createWord(r);
                    if (!i || !i.length) n = 0;
                } while (t.indexOf(i) >= 0 && n-- > 0);
                if (!n) throw new Error("Not enough source text to generate a word. Decrease accuracy &/or required word length or add more words");
                t.push(i);
            }
            return t;
        };
        function f(r) {
            var r = r.toLowerCase().replace(/[^a-z]/gi, " ").replace(/\b(?:and|an|or|the)\b/gi, " ").replace(/ {2,}/g, " ").trim();
            return r;
        }
        u.prototype.learn = function(r, t) {
            t = t || {};
            if (typeof t === "function") t = {
                validator: t
            };
            t = o({}, a, t);
            if (t.validator) r = t.validator.call(this, r);
            if (t.minWordLen > 0) {
                var e = "(?:^| )([^ ]{1," + Math.max(0, t.minWordLen - 1) + "})(?=$| )";
                var n = new RegExp(e, "gi");
                r = r.replace(n, " ");
            }
            if (t.maxWordLen > 0) {
                var i = "(?:^| )([^ ]{" + (t.maxWordLen + 1) + ",})(?=$| )";
                var s = new RegExp(i, "gi");
                r = r.replace(s, " ");
            }
            r = r.replace(/ {2,}/g, " ").trim();
            this.e(r, this);
            return r;
        };
        function l(r) {
            this.char = r;
            this.usage = 0;
        }
        l.prototype.g = function(r) {
            if (!this.b) {
                this.b = new h();
                this.b.parent = r;
                this.b.c = r.c + 1;
            }
            return this.b;
        };
        function d(r, t) {
            var e = new c(1);
            return e.generate(r, t);
        }
        function c(r) {
            this.rand = [];
            this.at = 0;
            r = r || 40;
            r += 4 - r % 4;
            if (n) {
                this.values = new Uint8Array(r);
                window.crypto.getRandomValues(this.values);
            } else {
                this.values = i.randomBytes(r);
            }
        }
        c.prototype.generate = function(r, t) {
            if (this.at >= this.values.length) {
                if (n) window.crypto.getRandomValues(this.values); else this.values = i.randomBytes(this.values.length);
                this.at = 0;
            }
            var e = this.values[this.at++] | this.values[this.at++] << 8 | this.values[this.at++] << 16 | this.values[this.at++] << 24;
            e = e >>> 0;
            var o = 4294967295 >>> 0;
            e = e * (t + 1 - r) / o + r;
            if (e > t) e = t;
            return Math.floor(e);
        };
        t.exports = u;
    }, {
        crypto: undefined
    } ]
}, {}, [ 1 ]);
