/*global define*/
define([
    'jscore/core',
    './SettingsView',
    'layouts/DashboardSettings'
], function (core, View, DashboardSettings) {
    'use strict';

    return core.Widget.extend({

        view: function () {
            return new View(this.options);
        },
        onViewReady: function () {
            this.dashboardSettings = new DashboardSettings();
            this.dashboardSettings.attachTo(this.view.getContent());

            this.view.getApplyButton().addEventHandler('click', onApply.bind(this));
            this.view.getCancelButton().addEventHandler('click', onCancel.bind(this));
        },
        setSelected: function (selected) {
            this.dashboardSettings.select(selected, true);
        }
    });

    //---------------------------------------------------------------
    //---------------------------------------------------------------

    function onApply() {
        /*jshint validthis:true */
        this.trigger('apply', this.dashboardSettings.getSelected());
    }

    //-----------------------------------------------
    function onCancel() {
        /*jshint validthis:true */
        this.trigger('cancel');
    }

});
