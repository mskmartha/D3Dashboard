/*global define*/
define([
    'jscore/core',
    'widgets/SelectBox',
    'widgets/MultiSelectBox',
    './AddWidgetView'
], function (core, SelectBox, MultiSelectBox, View) {
    'use strict';

    return core.Widget.extend({

        View: View,

        //-----------------------------------------------
        onViewReady: function () {
            // instantiate the widgets
            this._widgetMultiSelect = new MultiSelectBox();
            this._columnSelect = new SelectBox();

            // attach the widgets to the UI
            this._widgetMultiSelect.attachTo(this.view.getWidgetSelect());
            this._columnSelect.attachTo(this.view.getColumnSelect());

            // form event handling
            this.view.getApplyButton().addEventHandler('click', onApply.bind(this));
            this.view.getCancelButton().addEventHandler('click', onCancel.bind(this));
        },
        //-----------------------------------------------
        setAvailableWidgets: function (availableWidgets) {
            var items = Object.keys(availableWidgets).map(function (wType) {
                return {
                    name: availableWidgets[wType].header,
                    value: availableWidgets[wType].type
                };
            });

            this._widgetMultiSelect.setItems(items);
        },
        //-----------------------------------------------
        setNumberOfColumns: function (numberOfColumns) {
            var columnSelectItems = [];

            for (var i = 0; i < numberOfColumns; i++) {
                columnSelectItems.push({name: '' + (i + 1), value: i});
            }

            this._columnSelect.setItems(columnSelectItems);
        },
        //-----------------------------------------------
        getConfig: function () {
            return {
                widgets: this._widgetMultiSelect.getValue().map(function (i) {
                    return i.value;
                }),
                column: this._columnSelect.getValue().value
            };
        }
    });

    //---------------------------------------------------------------
    //---------------------------------------------------------------

    function onApply() {
        /*jshint validthis:true */
        this.trigger('add', this.getConfig());
    }

    //-----------------------------------------------
    function onCancel() {
        /*jshint validthis:true */
        this.trigger('cancel');
    }
});
