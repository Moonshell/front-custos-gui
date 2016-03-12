/**
 * Created by krimeshu on 2016/3/12.
 */

var _path = require('path');

var Data = require('./data.js'),
    Model = require('./model.js'),
    Utils = require('./utils.js');

module.exports = function HeaderMenuCtrl($scope, $mdDialog) {
    $scope.version = require(_path.resolve('./package.json')).version;

    var originatorEv;

    // 打开顶栏菜单
    $scope.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    // 关闭窗口
    $scope.closeWindow = function () {
        window.close();
    };

    // 显示配置对话框
    $scope.showConfig = function (ev) {
        $mdDialog.show({
            controller: function configDialogController($scope, $mdDialog) {
                $scope.config = Utils.deepCopy(Model.config);

                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.save = function (config) {
                    Data.saveConfig(config);
                    Model.config = config;
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            },
            parent: angular.element(document.querySelector('.window-box')),
            templateUrl: 'dialog-temp/dialog-config.html',
            clickOutsideToClose: true,
            targetEvent: ev
        });
    };

    // 显示关于对话框
    $scope.showAbout = function (ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('.window-box')))
                .title('关于')
                .textContent('本工具基于 electron 和 angular material 提供 front-custos 的图形界面，' +
                    '如不需要 GUI，也可以尝试直接基于 front-custos 编写脚本。使用过程中发现任何问题，欢迎联系 krimeshu。(^o^)/')
                .ariaLabel('About Dialog')
                .ok('好的')
                .clickOutsideToClose(true)
                .targetEvent(ev)
        );
    };
};