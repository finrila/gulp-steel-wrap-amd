/**
 * define transport
 * @author Finrila finrila@gmail.com 
 */
'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function(options) {


    options = options || {};

    function replace_STKImport(src) {
        return src.replace(/\$Import\s*\(\s*(['|"])([a-zA-Z0-9\-\.\_]*)\1\s*\)\s*\;?/g, function(a, b, importName) {
            return 'require("' + importName.replace(/\./g, '/') + '");';
        });
    }
    function getDeps(src) {
        var deps = [];
        removeComment(src).replace(/\brequire\([ \t\n\r]*['"](.*?)['"][ \t\n\r]*\)/g, function(_, moduleId) {
            deps.push(moduleId);
        });
        return deps;
    }
    var DefinePrefix = 'steel.d';
    var definePrefix = options.definePrefix || DefinePrefix;
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-steel-wrap-adm', 'Streaming not supported'));
            cb();
            return;
        }

        var filepath = file.relative.replace(/\\/g, '/');;
        var moduleId = filepath.replace(/\.\w+$/, '');
        var contents = file.contents.toString('utf8');
        
        contents = replace_STKImport(contents);
        var deps = getDeps(contents);
        contents = definePrefix + '("' + moduleId + '", ' + JSON.stringify(deps) + ',function(require, exports, module) {\n' +  contents + '\n});';
        file.contents = new Buffer(contents);
        this.push(file);
        cb();
    });
};


/**
 * È¥×¢ÊÍ
 */
function removeComment(src, options) {
    options = options || {
        line: true,
        block: true
    };
    
    if (options.line) {
        src = src.replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/gm, '\n');
    }
    if (options.block) {
        src = src.replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n'); 
    }
    return src;
};
    