/**
 * Created by krimeshu on 2016/5/14.
 */

var _path = require('path'),

    Utils = require('../script/utils.js'),
    Timer = require('../script/timer.js'),
    DependencyInjector = require('../script/dependency-injector.js'),
    FileLinker = require('../script/file-linker.js');

// 发布：
// - 清理发布目录
// - 将构建目录中的文件输出到发布目录
// - 工作目录转到发布目录
module.exports = function (console, gulp, plugins, params, config, errorHandler) {
    return function (done) {
        var workDir = params.workDir,
            distDir = params.distDir,
            usedFiles = params.usedFiles,

            htmlEnhanced = config.htmlEnhanced,
            delUnusedFiles = config.delUnusedFiles;

        var timer = new Timer();
        var logId = console.genUniqueId && console.genUniqueId();
        logId && console.useId && console.useId(logId);
        console.log(Utils.formatTime('[HH:mm:ss.fff]'), 'do_dist 任务开始……');

        var linker = new FileLinker({
            // php代码处理异常时，请关闭 cheerio 解析
            htmlEnhanced: htmlEnhanced
        }, errorHandler);

        //console.log('usedFiles:', usedFiles);
        if (delUnusedFiles) {
            if (!usedFiles) {
                usedFiles = params.usedFiles = linker.analyseDepRelation(workDir);
            }
        } else {
            usedFiles = null;
        }

        var afterClean = function () {
            gulp.src(_path.resolve(workDir, '**/*'))
                .pipe(plugins.plumber({'errorHandler': errorHandler}))
                .pipe(linker.excludeUnusedFiles(usedFiles))
                .pipe(linker.excludeEmptyDir())
                .pipe(gulp.dest(distDir))
                .on('end', function () {
                    // 工作目录转移到发布目录
                    params.workDir = distDir;

                    // 后处理脚本
                    var postprocessing;
                    try {
                        postprocessing = Utils.tryParseFunction(params.postprocessing);
                    } catch (e) {
                        console.error(Utils.formatTime('[HH:mm:ss.fff]'), '项目的后处理脚本格式有误，请检查相关配置。');
                    }
                    try {
                        var injector = new DependencyInjector(params);
                        injector.registerMap({
                            params: params,
                            console: console
                        });
                        postprocessing && injector.invoke(postprocessing);
                    } catch (e) {
                        console.error(Utils.formatTime('[HH:mm:ss.fff]'), '项目的后处理将本执行异常：', e);
                    }
                    logId && console.useId && console.useId(logId);
                    console.log(Utils.formatTime('[HH:mm:ss.fff]'), 'do_dist 任务结束。（' + timer.getTime() + 'ms）');

                    done();
                });
        };
        var cleanFailed = function (e) {
            var err = new Error('输出目录清理失败，请检查浏览器是否占用目录');
            err.detail = e;
            errorHandler(err);

            afterClean();
        };
        plugins.del([_path.resolve(distDir, '**/*')], {force: true}).then(afterClean).catch(cleanFailed);
    };
};