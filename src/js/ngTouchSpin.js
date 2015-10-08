angular.module('jkuri.touchspin', [])

.directive('ngTouchSpin', ['$timeout', '$interval', '$document', function($timeout, $interval, $document) {
    'use strict';

    var key_codes = {
        left  : 37,
        right : 39
    };

    var setScopeValues = function (scope, initval) {
        scope.min = scope.min || 0;
        scope.max = scope.max || 100;
        scope.step = scope.step || 1;
        scope.prefix = scope.prefix || undefined;
        scope.postfix = scope.postfix || undefined;
        scope.decimals = scope.decimals || 0;
        scope.stepInterval = scope.stepInterval || 100;
        scope.stepIntervalDelay = scope.stepIntervalDelay || 500;
        scope.val = scope.value || parseFloat(scope.initval).toFixed(scope.decimals);
    };

    return {
        restrict: 'EA',
        require: '?ngModel',
        scope: { min: '@?', max: '@?', step: '@?', prefix: '@?', postfix: '@?', decimals: '@?', stepInterval: '@?', stepIntervalDelay: '@?', initval: '@?', value: '@?' },
        replace: true,
        link: function (scope, element, attrs, ngModel) {
            var $body = $document.find('body');
            var timeout, timer, helper = true, oldval, clickStart;

            scope.decrement = function () {
                oldval = scope.val;
                var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(scope.step)).toFixed(scope.decimals);

                if (value < scope.min) {
                    value = parseFloat(scope.min).toFixed(scope.decimals);
                    scope.val = value;
                    ngModel.$setViewValue(value);
                    return;
                }

                scope.val = value;
                ngModel.$setViewValue(value);
            };

            scope.increment = function () {
                oldval = scope.val;
                var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);

                if (value > scope.max) return;

                scope.val = value;
                ngModel.$setViewValue(value);
            };

            scope.startSpinUp = function () {
                scope.checkValue();
                scope.increment();

                clickStart = Date.now();
                scope.stopSpin();

                $timeout(function() {
                    timer = $interval(function() {
                        scope.increment();
                    }, scope.stepInterval);
                }, scope.stepIntervalDelay);
            };

            scope.startSpinDown = function () {
                scope.checkValue();
                scope.decrement();

                clickStart = Date.now();

                var timeout = $timeout(function() {
                    timer = $interval(function() {
                        scope.decrement();
                    }, scope.stepInterval);
                }, scope.stepIntervalDelay);
            };

            scope.stopSpin = function () {
                if (Date.now() - clickStart > scope.stepIntervalDelay) {
                    $timeout.cancel(timeout);
                    $interval.cancel(timer);
                } else {
                    $timeout(function() {
                        $timeout.cancel(timeout);
                        $interval.cancel(timer);
                    }, scope.stepIntervalDelay);
                }
            };

            scope.checkValue = function () {
                var val;

                if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
                    val = oldval !== '' ? parseFloat(oldval).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
                    scope.val = val;
                    ngModel.$setViewValue(val);
                }

                scope.focused = false;
            };

            scope.focus = function () {
                scope.focused = true;
            };

            ngModel.$render = function () {
                scope.val = ngModel.$viewValue;
            };

            scope.$watch('initval', function(newValue) {
                if (newValue !== undefined && !isNaN(parseFloat(newValue))) {
                    setScopeValues(scope, newValue);
                    oldval = scope.val;
                    ngModel.$setViewValue(scope.val);
                    scope.focused = false;
                }
            });

            /*$body.bind('keydown', function(event) {
                if (!scope.focused) {
                    return;
                }

                event.preventDefault();

                var which = event.which;

                if (which === key_codes.right) {
                    scope.increment();
                } else if (which === key_codes.left) {
                    scope.decrement();
                }

                scope.$apply();
            });*/

        },
        template: 
        '<div class="input-group">' +
        '  <span class="input-group-btn" ng-show="!verticalButtons">' +
        '    <button class="btn btn-default" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><i class="fa fa-minus"></i></button>' +
        '  </span>' +
        '  <span class="input-group-addon" ng-show="prefix" ng-bind="prefix"></span>' +
        '  <input type="text" ng-model="val" class="form-control" ng-blur="checkValue()" ng-focus="focus()">' +
        '  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
        '  <span class="input-group-btn" ng-show="!verticalButtons">' +
        '    <button class="btn btn-default" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><i class="fa fa-plus"></i></button>' +
        '  </span>' +
        '</div>'
    };

}]);
