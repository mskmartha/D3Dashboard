/*global define*/
define([
    'jscore/core',
    './MainView',
    'layouts/Dashboard',
    '../../widgets/lineChart/LineChart',
    'widgets/Dropdown',
    '../../widgets/addwidget/AddWidget',
    '../../widgets/settings/Settings',
    'container/api'
], function (core, View, Dashboard, LineChart, Dropdown, AddWidget, Settings, container) {
    'use strict';
    return core.Region.extend({
        View: View,
        onStart: function () {
            var eventBus = this.getEventBus();

            eventBus.subscribe('wipeConfig', function () {
                this.wipeConfig();
                this.drawSimpleDashboard();
            }.bind(this));

            eventBus.subscribe('saveConfig', this.persistConfig.bind(this));
            eventBus.subscribe('dashboard:change', this.persistConfig.bind(this));
            eventBus.subscribe('addWidget', this.addWidgetScreen.bind(this));
            eventBus.subscribe('settings', this.settingsScreen.bind(this));

            // available widgets for the user to add to the dashboard
            this.availableWidgets = {
                //Line
                TotalPlaybacks: {header: 'Total Playbacks', type: 'LineChart', config: {chartName: 'playbacks'}, maximizable: true,iid: 'lineChart', settings: true},
                BitRate: {header: 'Bit Rate', type: 'LineChart', config: {chartName: 'bitrate'}, maximizable: true,iid: 'lineChart', settings: true},
                BufferRatio: {header: 'Buffer Ratio', type: 'LineChart', config: {chartName: 'bufferratio'}, maximizable: true,iid: 'lineChart', settings: true},
                PlaybackErrors: {header: 'Playback Errors', type: 'LineChart', config: {chartName: 'playbackerrors'}, maximizable: true,iid: 'lineChart', settings: true}

            };
            this.drawSimpleDashboard();
        },
        settingsScreen: function () {
            if (this.settings === undefined) {
                // the flyout does not destroy the widget,
                // keep the instance and update it
                this.settings = new Settings();

                // listen to the select event and change layout
                this.settings.addEventHandler('apply', onSettingsChange.bind(this));
                this.settings.addEventHandler('cancel', hideFlyout);
            }

            this.settings.setSelected(this.dashboard.getCurrentLayout());

            showFlyout('Dashboard Settings', this.settings);
        },
        //-----------------------------------------------
        addWidgetScreen: function () {
            if (this.addWidget === undefined) {
                // the flyout does not destroy the widget,
                // keep the instance and update it
                this.addWidget = new AddWidget();
                // listen to the add event and add the selected widget
                this.addWidget.addEventHandler('add', onWidgetAdd, this);
                this.addWidget.addEventHandler('cancel', hideFlyout);
            }

            // loop through the available widgets and create an array (using Array.map) containing the header and type name.
            var availableWidgets = Object.keys(this.availableWidgets).map(function (wName) {
                return {
                    header: this.availableWidgets[wName].header,   // user friendly, used for select item label
                    type: wName                                    // used for value
                };
            }.bind(this));

            this.addWidget.setAvailableWidgets(availableWidgets);
            this.addWidget.setNumberOfColumns(this.dashboard.getNumberOfColumns());

            // open the flyout panel to show the add widget screen
            showFlyout('Add Widget', this.addWidget);
        },

        persistConfig: function () {
            if (this.checkLocalStorage) {
                localStorage.setItem('DashboardChartConfig', JSON.stringify(this.dashboard.toJSON()));
            }
        },
        retrieveConfig: function () {
            return (localStorage.getItem('DashboardChartConfig')) ? JSON.parse(localStorage.getItem('DashboardChartConfig')) : false;
        },
        wipeConfig: function () {
            if (localStorage.getItem('DashboardChartConfig')) {
                localStorage.removeItem('DashboardChartConfig');
            }
        },
        checkLocalStorage: function () {
            return typeof(Storage) !== 'undefined';
        },

        drawSimpleDashboard: function () {

            if (this.dashboard) {
                this.dashboard.destroy();
            }

            var config;
            if (this.retrieveConfig()) {
                // load config... this object looks similar to the one below but has the exported state of the dashboard
                config = this.retrieveConfig();

            } else {
                config = {
                    items: [
                        [
                            this.availableWidgets.TotalPlaybacks,
                            this.availableWidgets.BufferRatio
                        ],
                        [
                            this.availableWidgets.BitRate,
                            this.availableWidgets.PlaybackErrors
                        ]

                    ],
                    layout: 'two-columns'
                };
            }
            config.context = this.getContext();
            config.references = [LineChart];
            this.dashboard = new Dashboard(config);
            this.dashboard.attachTo(this.view.getElement());
            this.persistConfig();

        }
    });

    //---------------------------------------------------------------
    //---------------------------------------------------------------

    function showFlyout(header, content) {

        // show flyout using container API
        container.getEventBus().publish('flyout:show', {
            header: header,
            content: content
        });
    }

    //-----------------------------------------------
    function hideFlyout() {

        // hide flyout using container API
        container.getEventBus().publish('flyout:hide');
    }

    //-----------------------------------------------

    function onWidgetAdd(options) {
        /*jshint validthis:true */
        if (options === undefined) {
            return;
        }

        options.widgets.forEach(function (wType) {
            if (this.availableWidgets[wType]) {
                this.dashboard.addItem(this.availableWidgets[wType], options.column || 0, 0);
            }
        }.bind(this));

        hideFlyout();
    }

    //-----------------------------------------------

    function onSettingsChange(newLayout) {
        /*jshint validthis:true */
        if (newLayout !== this.dashboard.getCurrentLayout()) {
            this.dashboard.changeLayout(newLayout);
        }
        hideFlyout();
    }

});
