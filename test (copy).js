"use strict";

const jsHP = require("js-pre");

const assert = require("assert");


// some vars
var bsScript = 'Hi<$write(" you!")';
var bsResult = 'Hi you!';


// tests
const tests = {
    "basic & write": function () {
        assert(jsHP(bsScript)+"" === bsResult, "bad string result");
    },

    "load & write": function () {
        var load = jsHP.load(bsScript);

        assert(!load.error, "load has error");
        assert(load.script === bsScript);
        assert(load()+"" === bsResult, "bad string result");
    },

    "reduce fast": function () {
        var load = jsHP.load("reduce fast");

        assert(!load.error, "load has error");
        assert(load.script === "reduce fast");
        assert(load.fast === "reduce fast");
        assert(load()+"" === "reduce fast", "bad string result");
    },

    "return value": function () {
        assert(jsHP("<$return 7").return === 7);
        assert(jsHP("<$ write('hi')").return === undefined);
    },

    "run time error": function () {
        var result = jsHP("<$ return a");

        assert(result.error instanceof ReferenceError);
        assert(result+"" === 'ReferenceError: a is not defined');
    },

    "compile time error": function () {
        var load = jsHP.load("<$ 99(");

        assert(load.error instanceof SyntaxError);
        assert(load.script === "<$ 99(");
        assert(load.fast+"" === 'SyntaxError: Unexpected token ;');
        assert(load()+"" === 'SyntaxError: Unexpected token ;', "bad string result");
    },

    "different brackets": function () {
        assert(jsHP('Hi<#write(" you!")?>', null, {brackets: ["<#","?>"]})+""
            === 'Hi you!', "bad string result");
    },

    "variable bracket script numbers": function () {
        assert(jsHP("a<$$>a<$$>a")+"" === "aaa");
        assert(jsHP("a<$$>a<$")+"" === "aa");
        assert(jsHP("a$>a<$")+"" === "a$>a");
    },

    "script as Buffer": function () {
        assert(jsHP(Buffer.from(bsScript))+"" === bsResult, "bad string result");
    },

    "test _file, _dir, not given": function () {
        assert(jsHP("<$write(_file)")+"" === process.cwd()+"/.");
        assert(jsHP("<$write(_dir)")+"" === process.cwd());
    },

    "test _file, _dir, given": function () {
        var s = {file: "/hans/folder/script.js"};
        assert(jsHP("<$write(_file)", null, s)+"" === "/hans/folder/script.js");
        assert(jsHP("<$write(_dir)", null, s)+"" === "/hans/folder");
    }



}

Object.keys(tests).forEach(function (name, index) {
    var error;
    try {tests[name]()}
    catch (err) {error = err}
    console.log("Case", (index+1)+":", !error, "-", name);
    if (error) console.log(error);
});
