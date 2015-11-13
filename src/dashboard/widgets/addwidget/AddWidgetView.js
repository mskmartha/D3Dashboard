/*global define*/
define([
    'jscore/core',
    'text!./_addWidget.html',
    'styles!./_addWidget.less'
], function (core, template, styles) {
    'use strict';

    var _prefix = '.eaDashboard-wAddWidget';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },
        getStyle: function () {
            return styles;
        },
        getWidgetSelect: function () {
            return this.getElement().find(_prefix + '-widgetSelect');
        },
        getColumnSelect: function () {
            return this.getElement().find(_prefix + '-columnSelect');
        },
        getApplyButton: function () {
            return this.getElement().find(_prefix + '-apply');
        },
        getCancelButton: function () {
            return this.getElement().find(_prefix + '-cancel');
        }
    });
});
