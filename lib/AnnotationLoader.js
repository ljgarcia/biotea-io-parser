var jQuery = require('jquery');
var _ = require('underscore');

var findTopic = function(graph, cui) {
    return _.find(graph, function(elem) {
        return elem['@id'] === cui ? elem : undefined;
    });
};

var AnnotationLoader = function(model, dispatcher) {
    return {
        get: function(path, id, highlightedTermsId) {
            return jQuery.ajax({
                url: path + id + '.json',
                dataType: 'json'
            }).done(function(d) {
                d.data = [];
                _.each(d['@graph'], function(elem) {
                    if (elem['@type'] === 'ao:Annotation') {
                        var topic = findTopic(d['@graph'], elem.hasTopic);
                        var id = topic ? topic['@id'] : undefined;
                        var highlight = highlightedTermsId ? _.contains(highlightedTermsId, id) : false;
                        var cui = topic ? topic['umls:cui'] : undefined;
                        var sty = topic ? topic['umls:tui'] : undefined;
                        var group = sty ? model.findGroup(sty) : undefined;
                        var tf = +elem.tf;
                        var idf = +elem['biotea:idf'];
                        if (typeof(elem['ao:body']) === 'string') {
                            d.data.push({id: id, tf: tf, idf: idf, cui: cui, type: sty, highlight: highlight,
                                group: group, term: [elem['ao:body']]});
                        } else {
                            d.data.push({id: id, tf: tf, idf: idf, cui: cui, type: sty, highlight: highlight,
                                group: group, term: elem['ao:body'].sort()});
                        }
                    }
                });
                dispatcher.ready({
                    type: 'annotation',
                    id: id,
                    request: path + id + '.json',
                    data: d.data
                });
                return d;
            }).fail(function(e) {
                console.log('Error loading annotations for: ' + id);
                dispatcher.failed({
                    type: 'annotation',
                    request: path + id + '.json'
                });
                return e;
            });
        }
    };
};

module.exports = AnnotationLoader;
