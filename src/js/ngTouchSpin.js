angular.module('jkuri.touchspin', [])

.directive('ngTouchSpin', ['$timeout', '$interval', function($timeout, $interval) {
    'use strict';

    var setScopeValues = function (scope, initval) {
        scope.min = parseFloat(scope.min) || 1;
        scope.max = parseFloat(scope.max) || 99;
        scope.step = parseFloat(scope.step) || 1;
        scope.prefix = scope.prefix || undefined;
        scope.postfix = scope.postfix || undefined;
        scope.tabIndex = scope.tabIndex || 1;
        scope.decimals = parseFloat(scope.decimals) || 0;
        scope.stepInterval = scope.stepInterval || 100;
        scope.stepIntervalDelay = scope.stepIntervalDelay || 500;
        scope.val = parseFloat(scope.initval).toFixed(scope.decimals);
        scope.oldval = parseFloat(scope.initval);
    };

    return {
        restrict: 'E',
        scope: { min: '@?', max: '@?', step: '@?', prefix: '@?', postfix: '@?', decimals: '@?', stepInterval: '@?', stepIntervalDelay: '@?', initval: '@?', value: '@?', tabIndex: '@?' },
        replace: true,
        link: function (scope, element, attrs, ngModel) {
            var timeout, timer, helper = true, clickStart;

            scope.decrement = function () {
                var newvalue = parseFloat(scope.val) - parseFloat(scope.step);

                if (newvalue < scope.min) {
                    scope.val = scope.min.toFixed(scope.decimals);
                    return;
                }

                scope.val = newvalue.toFixed(scope.decimals);
                scope.$emit('estimateEdit', newvalue);
            };

            scope.increment = function () {
                var newvalue = parseFloat(scope.val) + parseFloat(scope.step);

                if (newvalue > scope.max) {
                    scope.val = scope.max.toFixed(scope.decimals);
                    return;
                }

                scope.val = newvalue.toFixed(scope.decimals);
                scope.$emit('estimateEdit', newvalue);
            };

            scope.startSpinUp = function () {
                scope.increment();

                clickStart = Date.now();

                $timeout(function() {
                    timer = $interval(function() {
                        scope.increment();
                    }, scope.stepInterval);
                }, scope.stepIntervalDelay);
            };

            scope.startSpinDown = function () {
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
                if (!scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
                    scope.val = scope.oldval.toFixed(scope.decimals);
                } else {
                    var newvalue = parseFloat(scope.val);

                    if (newvalue < scope.min) {
                        newvalue = scope.min;
                    } else if (newvalue > scope.max) {
                        newvalue = scope.max;
                    } 
                    scope.val = newvalue.toFixed(scope.decimals);
                    scope.oldval = newvalue;
                    scope.$emit('estimateEdit', newvalue);
                }
            };

            scope.keyup = function(e) {
                if (scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
                    var currentval = parseFloat(scope.val);
                    if (scope.oldval != currentval && currentval >= scope.min && currentval <= scope.max) {
                        scope.$emit('estimateEdit', currentval);
                        scope.oldval = currentval;
                    }
                }
            };

            scope.$watch('initval', function(newValue, oldValue) {
                if (newValue !== undefined && !isNaN(parseFloat(newValue)) && (isNaN(parseFloat(oldValue)) || (parseFloat(oldValue) == parseFloat(newValue)))) {
                    setScopeValues(scope, newValue);
                }
            });
        },
        template: 
        '<div class="input-group">' +
        '  <span class="input-group-btn" ng-show="!verticalButtons">' +
        '    <button class="btn btn-default" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><i class="fa fa-minus" tabindex="{{tabIndex}}"></i></button>' +
        '  </span>' +
        '  <span class="input-group-addon" ng-show="prefix" ng-bind="prefix"></span>' +
        '  <input type="text" ng-model="val" class="form-control" ng-blur="checkValue()" ng-keyup="keyup($event)"  tabindex="{{tabIndex+1}}">' +
        '  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
        '  <span class="input-group-btn" ng-show="!verticalButtons">' +
        '    <button class="btn btn-default" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><i class="fa fa-plus"  tabindex="{{tabIndex+2}}"></i></button>' +
        '  </span>' +
        '</div>'
    };

}]);
