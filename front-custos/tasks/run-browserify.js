/**
 * Created by krimeshu on 2016/5/14.
 */

var _path = require('path'),

    PluginLoader = require('../script/plugin-loader.js'),
    plugins = PluginLoader.plugins,

    Utils = require('../script/utils.js'),
    Timer = require('../script/timer.js');

PluginLoader.add({'BrowserifyProxy': ()=> require('../script/browserify-proxy.js')});

// 使用Browserify打包JS:
// - 内容中存在某行 'browserify entry'; 标记的脚本将被识别为入口进行打包
module.exports = function (console, gulp, params, errorHandler) {
    return function (done) {
        var workDir = params.workDir,
            pattern = _path.resolve(workDir, '**/*@(.js)');

        var browserify = new plugins.BrowserifyProxy(errorHandler);

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), 'run_browserify 任务开始……');
        gulp.src(pattern)
            .pipe(plugins.plumber({'errorHandler': errorHandler}))
            .pipe(browserify.findEntryFiles())
            .pipe(browserify.handleFile())
            .pipe(gulp.dest(workDir))
            .on('end', function () {
                logId && console.useId && console.useId(logId);
                console.log(Utils.formatTime('[HH:mm:ss.fff]'), 'run_browserify 任务结束。（' + timer.getTime() + 'ms）');
                done();
            });
    };
};