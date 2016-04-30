var BiolinksModel = require('./BiolinksModel');
var AnnotationLoader = require('./AnnotationLoader');
var DistributionLoader = require('./DistributionLoader');
var SimilarityLoader = require('./SimilarityLoader');
var EventController = require('./EventController');
var _ = require('underscore');

var BiolinksParser = function(){
    var parser = this;
    parser.model = new BiolinksModel();
    parser.dispatcher = new EventController().getDispatcher();
    parser.annotationLoader = new AnnotationLoader(parser.model, parser.dispatcher);
    parser.distributionLoader = new DistributionLoader(parser.dispatcher, parser.model.getGroups());
    parser.similarityLoader = new SimilarityLoader(parser.dispatcher);

    parser.getModel = function() {
        return parser.model;
    };

    parser.getDispatcher = function() {
        return parser.dispatcher;
    };

    parser.loadAnnotations = function(url, id) {
        return parser.annotationLoader.get(url, id);
    };

    parser.loadDistribution = function(url, id, display) {
        return parser.distributionLoader.get(url, id, display);
    };

    parser.loadSimilarity = function(url, queryId, relatedId, alternative, altId) {
        return parser.similarityLoader.get(url, queryId, relatedId, alternative, altId);
    };
};

var calculateTotalTF = function(article, onlyTF) {
    var totalTF = 0;
    _.each(article.annotations, function(annotation) {
         totalTF += onlyTF === true ? annotation.tf : annotation.tf * annotation.idf;
     });
     return totalTF;
};

var calculateTotalEntropy = function(parser, distribution, useGroups, article, totalTF, onlyTF) {
    var totalEntropy = 0.0;
    _.each(useGroups, function(group, groupKey) {
        var distElem = {group: groupKey};
        var fGroup = 0.0;
        _.each(article.annotations, function(annotation) {
            var frequency = onlyTF === true ? annotation.tf : annotation.tf * annotation.idf;
            if (groupKey === annotation.group) {
                fGroup += Math.pow(1 +
                    (
                        Math.pow(parser.model.pmra.miu / parser.model.pmra.lambda, frequency - 1) *
                        Math.pow(Math.E, -(parser.model.pmra.miu - parser.model.pmra.lambda) * totalTF)
                    ), -1
                );
            }
        });
        var value = Math.pow(Math.E, group.lambda * fGroup);
        totalEntropy += value;
        distElem.score = value === 1 ? undefined : value;
        distribution.data.push(distElem);
    });
    return totalEntropy;
};

BiolinksParser.prototype.calculateDistribution = function(annotatedArticles, onlyTF, includeGroups) {
    var parser = this;
    var allDistribution = [];
    var useGroups = parser.getModel().model;
    if ((includeGroups !== undefined) && (includeGroups.length !== 0)) {
        useGroups = _.filter(useGroups, function(group, groupKey) {
            return _.contains(includeGroups, groupKey);
        });
    }
    _.each(annotatedArticles, function(article) {
        var distribution = {
            id: article.id,
            display: article.display ? article.display : article.id,
            data: []
        };
        var totalTF = calculateTotalTF(article, onlyTF);
        var totalEntropy = calculateTotalEntropy(parser, distribution, useGroups, article, totalTF, onlyTF);
        _.each(distribution.data, function(distElem) {
            if (distElem.score !== undefined) {
                distElem.score =  distElem.score / totalEntropy;
            }
        });
        allDistribution.push(distribution);
    });
    return allDistribution;
 };

module.exports = BiolinksParser;