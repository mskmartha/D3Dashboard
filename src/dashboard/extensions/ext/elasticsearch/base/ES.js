/* Copyright (c) Ericsson 2015 */
define([
    'jscore/core',
    'jquery/main',
    './elasticsearch'
], function(core,$,ElasticSearch) {
    function getData(options,callback) {
        var client = new ElasticSearch.Client({
            hosts: options.hosts
        });
        client.search({
            index: options.index,
            type: '',
            body:options.queryBody
        }).then(function (resp) {
            options.successCallback || callback(resp,options.itemObj);

        }.bind(this), function (err) {
            console.log(err.message);
        });
    }
    return {
        getData: getData
    };

});