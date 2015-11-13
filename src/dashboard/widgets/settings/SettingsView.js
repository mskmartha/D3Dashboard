/*global define*/
define([
    "jscore/core",
    "template!./settings.html",
    'styles!./settings.less'
], function (core, template, styles) {
    'use strict';

    var _prefix = '.eaDashboard-wSettings';

    return core.View.extend({

        getTemplate: function () {
            return template(this.options);
        },
        getStyle: function () {
            return styles;
        },
        getContent: function () {
            return this.getElement().find(_prefix + '-content');
        },
        getApplyButton: function () {
            return this.getElement().find(_prefix + '-apply');
        },
        getCancelButton: function () {
            return this.getElement().find(_prefix + '-cancel');
        }
    });
});
