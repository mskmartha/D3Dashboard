/*global define*/
define([
    'jscore/core',
    'jquery/main',
    'layouts/TopSection',
    './regions/main/Main',
    './extensions/ext/elasticsearch/base/ES'
], function (core, $, TopSection, Main, ES) {
    'use strict';

    return core.App.extend({
        onStart: function () {
            var queryBody;
            var topLevelMetricsConfig = {
                "operators": {"name":"Total Operators","query":{"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}}},{"range":{"StartTime":{"gte":"","lte":""}}}],"must_not":[]}}}},"size":0,"aggs":{"1":{"cardinality":{"field":"Operator"}}}}},
                "households":{"name":"Total Households","query":{"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}}},{"range":{"StartTime":{"gte":"","lte":""}}}],"must_not":[]}}}},"size":0,"aggs":{"1":{"cardinality":{"field":"AccountId"}}}}},
                "users":{"name":"Total Active Users","query":{"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}}},{"range":{"StartTime":{"gte":"","lte":""}}}],"must_not":[]}}}},"size":0,"aggs":{"1":{"cardinality":{"field":"UserId"}}}}} ,
                "stb":{"name":"Connected Devices - Only STB","query":{"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}}},{"range":{"StartTime":{"gte":"","lte":""}}}],"must_not":[]}}}},"size":0,"aggs":{"1":{"cardinality":{"field":"DeviceId"}}}}}
            };

            this.topSection = new TopSection({
                context: this.getContext(),
                title: 'Playback Dashboard',
                breadcrumb: this.options.breadcrumb,
                defaultActions: [
                    {
                        name: 'Reset',
                        type: 'dropdown',
                        action: function () {
                            //this.getEventBus().publish('wipeConfig');
                        }.bind(this)
                    },
                    {
                        name: '1H',
                        type: 'button',
                        disabled: 'disabled',
                        action: function () {
                            //this.getEventBus().publish('wipeConfig');
                        }.bind(this)
                    },
                    {
                        name: '12H',
                        type: 'button',
                        disabled: 'disabled',
                        action: function () {
                            //this.getEventBus().publish('saveConfig');
                        }.bind(this)
                    },
                    {
                        name: '1D',
                        type: 'button',
                        disabled: 'disabled',
                        action: function () {
                            //this.getEventBus().publish('addWidget');
                        }.bind(this)
                    },
                    {
                        name: '1W',
                        type: 'button',
                        action: function () {
                            //this.getEventBus().publish('settings');
                        }.bind(this)
                    },
                    {
                        name: 'Mo',
                        type: 'button',
                        action: function () {
                            //this.getEventBus().publish('settings');
                        }.bind(this)
                    }
                ]
            });
            this.topSection.setContent(new Main({context: this.getContext()}));
            this.topSection.attachTo(this.getElement());

            $('<div/>', {
                id: 'topLevelMetricsWrapper',
                style:'clear:both;'
            }).insertAfter('.elLayouts-QuickActionBarWrapper');

            $('<ul/>', {
                id: 'topLevelMetricsList',
                class: 'nice-items',
                text: ''
            }).appendTo('#topLevelMetricsWrapper');

            $.each(topLevelMetricsConfig, function( id, obj ) {
                queryBody = obj.query;
                queryBody.query.filtered.filter.bool.must[1].range.StartTime.gte= "now-1w";
                queryBody.query.filtered.filter.bool.must[1].range.StartTime.lte= "now";

                ES.getData({
                    hosts: "https://temp_user:tempEla5tic@data.mres.tv3cloud.net:9200",
                    index : 'clientactivity-*',
                    queryBody : queryBody,
                    itemObj: {
                        id: id,
                        obj: obj
                    }
                },renderTopLevelMetrics);
            });

            function renderTopLevelMetrics(resp,itemObj) {
                var string = '<li><div class="aggregate_header_info" id="agg_info_btn">i'+
                    '<div class="nice-aggregate-legend" id="agg_legend">'+
                    '<div class="green_circle"></div><div class="red_circle"></div> <span id="color_ball_1">current day: 22/Oct/2015</span>'+
                    '<br>'+
                    '<div class="blue_circle"></div> <span id="color_ball_2">yesterday: 21/Oct/2015</span>'+
                    '</div>'+
                    '</div>'+
                    '<div class="nice-items-left">'+
                    '<label style="margin-left: -1px;"><b>'+itemObj.obj.name+'</b></label>'+
                    '<div class="center_cell" id="center_cell_'+itemObj.id+'">'+
                    '/ <div class="old_data" id="old_'+itemObj.id+'">'+resp.aggregations['1'].value+'</div>'+
                    '</div>'+
                    '<div id="'+itemObj.id+'_percent" class="nice-items-right">'+
                    '</div>'+
                    '</div>'+
                    '</li>';
                $('#topLevelMetricsList').append(string);
            }
            //test comment
            
            $.each(topLevelMetricsConfig, function( id, obj ) {
                var xyz;
                queryBody = obj.query;
                queryBody.query.filtered.filter.bool.must[1].range.StartTime.gte= "now-2w";
                queryBody.query.filtered.filter.bool.must[1].range.StartTime.lte= "now";
                ES.getData({
                    hosts: "https://temp_user:tempEla5tic@data.mres.tv3cloud.net:9200",
                    index : 'clientactivity-*',
                    queryBody : queryBody,
                    itemObj: {
                        id: id,
                        obj: obj
                    }
                },renderTopLevelMetricsTrend);
            });

            function renderTopLevelMetricsTrend(resp,itemObj) {
                var old = $('#old_'+itemObj.id).html();
                var mi_class, mi_oper;
                if(resp.aggregations['1'].value > old){
                    mi_class = "mi_green";
                    mi_oper = "+";
                }else{
                    mi_class = "mi_red";
                    mi_oper = "-";
                }
                var string2 =  '<div class="'+mi_class+'" id="old_'+itemObj.id+'">'+resp.aggregations['1'].value+ '</div>';
                $("#center_cell_"+itemObj.id).prepend(string2);
                var nw = resp.aggregations['1'].value;
                var per =  nw/old*100;
                var string3 =  '<div id="fails_percent" class="nice-items-right">'+
                    '<div class="element_middle '+mi_class+'">'+mi_oper+' '+per.toFixed(2)+'%</div> </div>';
                $("#center_cell_"+itemObj.id).append(string3);

            }

        }
    });
});




