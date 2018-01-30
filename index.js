"use strict";

// resources
const dirname = require("path").dirname;
const resolve = require("path").resolve;
const fs_read = require("fs").readFileSync;
//const putFile = require("fs").writeFileSync;


// load function
function load(script, {get:getFn="fs", file="", brackets=["<$","$>"]}={}) {

    script = script.toString();

    if ((getFn === "fs") || (getFn === "file")) {
        if (getFn === "file") {file = script; script = fs_read(file, "utf8");}
        getFn = fs_read;
    }

    file = (file) ? resolve(file) : process.cwd()+"/.";
    const dir = resolve(dirname(file));

    const get = path=>getFn(resolve(dir, path));


    // body
    var body = "";

    const [open, close] = brackets;
    const oln = open.length, cln = close.length;
    const length = script.length;

    var index = 0, brake = false, count = 1, start, stop;
    while (true) {
        start = script.indexOf(open, index);
        if (start === -1) {start = length; brake = true}
        body += "write(`"+script.slice(index, start).replace(/\\|`|\${/g, "\\$&")+"`);\n";

        if (brake) break;
        count++;
        index = start + oln;

        stop = script.indexOf(close, index);
        if (stop === -1) {stop = length; brake = true}
        body += script.slice(index, stop)+";\n";

        if (brake) break;
        index = stop + cln;
    }


    // execute, fast, error
    var reduce, execute;

    if (count === 1) {
        reduce = ()=>script;
        reduce.fast = script;
    }
    else {
        try {execute = new Function("write","include","get","_file","_dir", body)}
        catch (error) {
            error.file = file;
            const document = new String(error.toString());
            document.error = error;
            reduce = ()=>document;
            reduce.error = error;
            reduce.fast = document.toString();
        }
    }

    // reduce
    if (!reduce) reduce = function(scope={}) {
        var document = "", returnValue, error;

        const write = str=>document+=str;

        const include = (path, scope={}) => {
            var data = get(path);
            if (!data) throw new Error('file "'+file+'" not found');

            data = (typeof data === "function")
                ? data.fast || data(scope)
                : jsHP(data, scope, {get:getFn, file:resolve(dir, path), brackets});

            write(data);
            if (data.error) throw data.error;
            return data.return;
        }

        try {returnValue = execute.call(scope, write, include, get, file, dir)}
        catch (err) {
            error = err;
            error.file = file;
            write(err.toString());
        }

        document = new String(document);
        document.return = returnValue;
        document.error = error;

        return document;
    }

    reduce.script = script;

    return reduce;
}

// jsHP function
function jsHP(script, scope, config) {
    return load(script, config)(scope);
}

jsHP.load = load;

// exports
module.exports = jsHP;
