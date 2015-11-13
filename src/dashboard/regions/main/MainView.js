/*global define*/
define([
    'jscore/core',
    'text!./main.html',
    'styles!./main.less'
], function (core, template, styles) {
    'use strict';

    var _prefix = '.eaDashboard-rMain';

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },


        getTopDiv: function () {
            return this.getElement().find(_prefix + '-top');
        },
        getContentDiv: function () {
            return this.getElement().find(_prefix + '-content');
        },

        getTableDiv: function () {
            return this.getElement().find(_prefix + '-right-table');
        },
        getCarouselDiv: function () {
            return this.getElement().find(_prefix + '-left-carousel');
        }
    });

});
