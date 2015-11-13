/*global define*/
define([
    'jscore/core',
    'jquery/main',
    "jscore/ext/net",
    'layouts/TopSection',
    'tablelib/Table',
    'tablelib/plugins/SortableHeader',
    'chartlib/charts/Line',
    '../../extensions/ext/elasticsearch/base/ES'
], function (core, $, net, TopSection, Table, SortableHeader, Line, ES) {
    'use strict';
    var chartItmA, chartItmB, chartItmC, chartItmD;
    var queryObj = {
        "bitrate": {"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}}},{"range":{"LogTime":{"gte":"","lte":""}}}],"must_not":[]}}}},"size":0,"aggs":{"2":{"date_histogram":{"field":"LogTime","interval":"3h","pre_zone":"-07:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":"","max":""}},"aggs":{"3":{"terms":{"field":"EventType","size":5,"order":{"1":"desc"}},"aggs":{"1":null}}}}}},
        "bufferratio": {"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}}},{"range":{"StartTime":{"gte":"","lte":""}}}],"must_not":[]}}}},"size":0,"aggs":{"2":{"date_histogram":{"field":"StartTime","interval":"3h","pre_zone":"-07:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":"","max":""}},"aggs":{"3":{"terms":{"field":"EventType","size":5,"order":{"1":"desc"}},"aggs":{"1":null}}}}}},
        "playbackerrors": {"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}}},{"range":{"LogTime":{"gte":"","lte":""}}}],"must_not":[]}}}},"size":0,"aggs":{"2":{"date_histogram":{"field":"LogTime","interval":"30m","pre_zone":"-07:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":"","max":""}},"aggs":{"3":{"terms":{"field":"EventType","size":5,"order":{"1":"desc"}},"aggs":{"1":null}}}}}},
        "playbacks": {"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"query":{"query_string":{"analyze_wildcard":true,"query":"*"}}},{"range":{"LogTime":{"gte":"","lte":""}}}],"must_not":[]}}}},"size":0,"aggs":{"2":{"date_histogram":{"field":"LogTime","interval":"3h","pre_zone":"-07:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":"","max":""}},"aggs":{"3":null}}}}
    };

    var chartNames = [];

    return core.Widget.extend({
        id: 'LineChart',
        init: function (options) {
            chartNames.push(options.chartName);
            this.chartName = (options.chartName) ? options.chartName : 'line';
        },
        onViewReady: function () {
            var queryBody;
            this.getElement().setStyle('height', '300px');
            this.getElement().setStyle('overflow', 'hidden');
            this.getElement().setAttribute('class', 'graph');
            this.getElement().setAttribute('id',this.chartName);

            queryBody = queryBuilder(this.chartName);
            queryBody.aggs["2"].date_histogram.interval= "3h";
            queryBody.aggs["2"].date_histogram.extended_bounds.min= "now-1w";
            queryBody.aggs["2"].date_histogram.extended_bounds.max= "now";
            switch (this.chartName) {
                case 'playbacks':
                    queryBody.query.filtered.filter.bool.must[1].range.LogTime.gte= "now-1w";
                    queryBody.query.filtered.filter.bool.must[1].range.LogTime.lte= "now";
                    queryBody.aggs["2"].aggs["3"] = {
                        "terms": {
                            "field": "EventType",
                            "size": 5,
                            "order": {
                                "_count": "desc"
                            }
                        }
                    };
                    break;
                case 'bitrate':
                    queryBody.query.filtered.filter.bool.must[1].range.LogTime.gte= "now-1w";
                    queryBody.query.filtered.filter.bool.must[1].range.LogTime.lte= "now";
                    queryBody.aggs["2"].aggs["3"].aggs["1"] = {
                        "avg": {
                            "field": "BitRate"
                        }
                    };
                    break;
                case 'bufferratio':
                    queryBody.query.filtered.filter.bool.must[1].range.StartTime.gte= "now-1w";
                    queryBody.query.filtered.filter.bool.must[1].range.StartTime.lte= "now";
                    queryBody.aggs["2"].aggs["3"].aggs["1"] = {
                        "avg": {
                            "field": "BufferingRatio"
                        }
                    };
                    break;
                case 'playbackerrors':
                    queryBody.query.filtered.filter.bool.must[1].range.LogTime.gte= "now-1w";
                    queryBody.query.filtered.filter.bool.must[1].range.LogTime.lte= "now";
                    queryBody.aggs["2"].aggs["3"].aggs["1"] = {
                        "sum": {
                            "field": "ErrorCount"
                        }
                    };
                    break;
                default:
            }

            ES.getData({
                hosts: "https://temp_user:tempEla5tic@data.mres.tv3cloud.net:9200",
                index: 'playback-activity*',
                queryBody : queryBody
            },startChart.bind(this));

        },
        initChart: function (chartName,resp) {
            var chart;
            switch (chartName) {
                //---------------------------------------
                case 'playbacks':
                    chart = new Line({
                        element: this.getElement(),
                        data: playbacksArray(resp),
                        plotOptions: {

                            scaleType: {
                                x: 'time'
                            }
                        },
                        grid: {
                            gridPadding: {
                                left: 30,
                                right: 30
                            },
                            axisLabels: {
                                y: 'Count',
                                x: 'LogTime per 30 minutes'
                            }
                        },
                        tooltip:true,
                        legend: {
                            events:{
                                click: "toggle"
                            },
                            centered: false
                        }
                    });
                    break;

                //---------------------------------------
                case 'bitrate':
                    chart = new Line({
                        element: this.getElement(),
                        data: bitrateArray(resp),
                        plotOptions: {
                            scaleType: {
                                x: 'time'
                            }
                        },
                        grid: {
                            gridPadding: {
                                left: 30,
                                right: 30
                            },
                            axisLabels: {
                                y: 'Average BitRate',
                                x: 'LogTime per 30 minutes'
                            }
                        },
                        tooltip:true,
                        legend: true
                    });
                    break;
                //---------------------------------------
                case 'bufferratio':
                    chart = new Line({
                        element: this.getElement(),
                        data: bufferratioArray(resp),
                        plotOptions: {
                            scaleType: {
                                x: 'time'
                            }
                        },
                        legend: {
                            centered: false
                        },
                        grid: {
                            gridPadding: {
                                left: 30,
                                right: 30
                            },
                            axisLabels: {
                                y: 'Average BufferingRatio',
                                x: 'StartTime per 30 minutes'
                            }
                        }
                    });
                    break;
                //---------------------------------------
                case 'playbackerrors':
                    chart = new Line({
                        element: this.getElement(),
                        data: playbackErrorsArray(resp),
                        plotOptions: {
                            /*
                             line: {
                             //chartType: 'area',
                             //orderDataBySum: true,
                             interpolateMode: 'cardinal'
                             },*/
                            scaleType: {
                                x: 'time'
                            }
                        },
                        legend: {
                            centered: false
                        },
                        grid: {
                            gridPadding: {
                                left: 30,
                                right: 30
                            },
                            axisLabels: {
                                y: 'Sum of ErrorCount',
                                x: 'LogTime per 30 minutes'
                            }
                        }
                    });
                //---------------------------------------
            }

            if (chart) {
                this.interval = core.Window.setInterval(function () {
                    //chart.update(playbacksArray(resp));

                }, 4000);
            }
            return chart;
        },
        onDestroy: function () {
            if (this.interval !== undefined) {
                this.interval.stop();
            }
        }
    });

    //--------------------------------------------------------------
    function startChart(resp){
        switch (this.chartName) {
            case 'playbacks':
                chartItmA = this.initChart(this.chartName,resp);
                break;
            case 'bitrate':
                chartItmB = this.initChart(this.chartName,resp);
                break;
            case 'bufferratio':
                chartItmC = this.initChart(this.chartName,resp);
                break;
            case 'playbackerrors':
                chartItmD = this.initChart(this.chartName,resp);
                break;
            default:
        }
        var data = [];
        resp.aggregations["2"].buckets.forEach(function(d) {

            d["3"].buckets.forEach(function(m) {

                data.push({
                    firstName: new Date(d.key),
                    lastName: m.key,
                    occupation: m.doc_count
                });

            });
        });

    }

    //--------------------------------------------------------------
    function updateChart(resp){
        if(chartItmA !== undefined){
            chartItmA.update(playbacksArray(resp));
        }
        if(chartItmB !== undefined){
            chartItmB.update(bitrateArray(resp));
        }
        if(chartItmC !== undefined){
            chartItmC.update(bufferratioArray(resp));
        }
        if(chartItmD !== undefined){
            chartItmD.update(playbackErrorsArray(resp));
        }
    }

    //---------------------------------------------------------------

    function createSingleArray(esData,label) {
        var data = [];
        esData.aggregations["2"].buckets.forEach(function(d) {

            d["3"].buckets.forEach(function(m) {
                if(m.key === label){
                    data.push({
                        x: new Date(d.key),
                        y: m.doc_count
                    });
                }
            });
        });
        return data;
    }
    //---------------------------------------------------------------


    function createBitrateArray(esData,label) {
        var data = [];
        esData.aggregations["2"].buckets.forEach(function(d) {

            d["3"].buckets.forEach(function(m) {
                if(m.key === label){
                    data.push({
                        x: new Date(d.key),
                        y: m["1"].value
                    });
                }
            });
        });
        return data;
    }

    //---------------------------------------------------------------


    function createBufferratioArray(esData,label) {
        var data = [];
        esData.aggregations["2"].buckets.forEach(function(d) {

            d["3"].buckets.forEach(function(m) {
                if(m.key === label && m["1"].value !== null){
                    data.push({
                        x: new Date(d.key),
                        y: m["1"].value
                    });
                }
            });
        });
        return data;
    }

    //---------------------------------------------------------------


    function createPlaybackErrorsArray(esData,label) {
        var data = [];
        esData.aggregations["2"].buckets.forEach(function(d) {

            d["3"].buckets.forEach(function(m) {
                if(m.key === label){
                    data.push({
                        x: new Date(d.key),
                        y: m["1"].value
                    });
                }
            });
        });
        return data;
    }

    //---------------------------------------------------------------
    function playbacksArray(resp) {
        var labelsArr = ['LiveTvPlaybackMetrics', 'PlaybackMetrics'];
        return labelsArr.map(function (label) {
            return {
                label: label,
                data: createSingleArray(resp,label)
            };
        });
    }

    //---------------------------------------------------------------
    function bitrateArray(resp) {
        var labelsArr = ['LiveTvPlaybackMetrics', 'PlaybackMetrics'];
        return labelsArr.map(function (label) {
            return {
                label: label,
                data: createBitrateArray(resp,label)
            };
        });
    }

    //---------------------------------------------------------------
    function bufferratioArray(resp) {
        var labelsArr = ['Play','LiveTvPlay','PerformanceAction'];
        return labelsArr.map(function (label) {
            return {
                label: label,
                data: createBufferratioArray(resp,label)
            };
        });
    }

    //---------------------------------------------------------------

    function playbackErrorsArray(resp) {
        var labelsArr = ['LiveTvPlaybackMetrics', 'PlaybackMetrics'];
        return labelsArr.map(function (label) {
            return {
                label: label,
                data: createPlaybackErrorsArray(resp,label)
            };
        });
    }

    //---------------------------------------------------------------

    function queryBuilder(chartName) {
        for (var key in queryObj) {
            if (key === chartName) {
                break;
            }
        }
        return (queryObj[key]);
    }

    //---------------------------------------------------------------
});