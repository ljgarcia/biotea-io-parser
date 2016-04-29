var jQuery = require('jquery');
var _ = require('underscore');

var DistributionLoader = function(dispatcher) {
    return {
        get: function(path, id, display) {
            return jQuery.ajax({
                url: path + id + '_distribution.json',
                dataType: 'json'
            }).done(function(d) {
                d.data = [];
                _.each(d['@graph'], function(elem) {
                    if (elem['@type'] === 'biotea:Topic') {
                        d.data.push({
                            id: id,
                            display: display ? display : id,
                            group: elem['rdfs:label'],
                            score: elem['biotea:score']
                        });
                    }
                });
                dispatcher.ready({
                    type: 'distribution',
                    request: path + id + '_distribution.json',
                    data: d.data
                });
                return d;
            }).fail(function(e) {
                console.log('Error loading distribution for: ' + id);
                dispatcher.failed({
                    type: 'distribution',
                    request: path + id + '_distribution.json'
                });
                return e;
            });
        }
    };
};

module.exports = DistributionLoader;