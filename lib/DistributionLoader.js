var jQuery = require('jquery');
var _ = require('underscore');

var DistributionLoader = function(dispatcher, groups) {
    return {
        get: function(path, id, display) {
            return jQuery.ajax({
                url: path + id + '_distribution.json',
                dataType: 'json'
            }).done(function(d) {
                d.dist = {
                    id: id,
                    display: display ? display : id,
                    data: []
                };
                _.each(groups, function(group, index) {
                    d.dist.data.push({group: group});
                });
                _.each(d['@graph'], function(elem) {
                    if (elem['@type'] === 'biotea:Topic') {
                        var index = _.findIndex(d.dist.data, function(el) {
                            return el.group === elem['rdfs:label'];
                        });
                        if (index !== -1) {
                            d.dist.data[index].score = elem['biotea:score'];
                        }
                    }
                });
                dispatcher.ready({
                    type: 'distribution',
                    request: path + id + '_distribution.json',
                    data: d.dist
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