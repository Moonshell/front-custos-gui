/**
 * Created by shu on 2016/2/19.
 */

var gulp = require('gulp'),

    frontCustos = require('./'),
    fcOptions = require('./example/package.json').fcOpt;

frontCustos.registerTasks(gulp);
frontCustos.config({
    outputDir: './example/dist',
    htmlEnhanced: false,
    delUnusedFiles: true,
    uploadCallback: function (response) {
        return /^上传成功/.test(response);
    },
    flattenMap: {
        page: '',
        style: 'css',
        script: 'js',
        image: 'images',
        font: 'font',
        audio: 'audio',
        other: 'raw'
    },
    concurrentLimit: 1
});

frontCustos.process(fcOptions);


