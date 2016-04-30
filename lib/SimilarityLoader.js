var jQuery = require('jquery');
var _ = require('underscore');

var SimilarityLoader = function(dispatcher) {
    return {
        get: function(path, queryId, relatedId, alternative, altId) {
            return jQuery.ajax({
                url: path + queryId + '_' + relatedId + '.json',
                dataType: 'json'
            }).done(function(d) {
                d.data = {};
                terms = [];
                _.each(d['@graph'], function(elem) {
                    if (elem['@type'] === 'biotea:Biolink') {
                        d.data = {
                            queryId: queryId,
                            relatedId: relatedId,
                            altId: (alternative === true) ? altId : '',
                            score: elem['biotea:score'],
                            terms: []
                        };
                    } else if (elem['@type'] === 'biotea:SemanticAnnotation') {
                        terms.push(elem.references);
                    }
                });
                d.data.terms = terms;
                dispatcher.ready({
                    type: 'similarity',
                    request: path + queryId + '_' + relatedId + '.json',
                    data: d.data
                });
                return d;
            }).fail(function(e) {
                console.log('Error loading: ' + queryId + '-' + relatedId);
                dispatcher.failed({
                    type: 'similarity',
                    request: path + queryId + '_' + relatedId + '.json',
                });
                return e;
            });
        }
    };
};

module.exports = SimilarityLoader;
