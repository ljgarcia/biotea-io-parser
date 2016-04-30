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

var calculateTotalTF = function(article, groupArray, onlyTF) {
    var totalTF = 0;
    _.each(article.annotations, function(annotation) {
        if (groupArray) {
            if (_.contains(groupArray, annotation.group)) {
                totalTF += onlyTF === true ? annotation.tf : annotation.tf * annotation.idf;
            }
        } else {
            totalTF += onlyTF === true ? annotation.tf : annotation.tf * annotation.idf;
        }
     });
     return totalTF;
};

var probAnnotation = function(parser, tf, totalTF) {
    return Math.pow(1 + (
        Math.pow(parser.model.pmra.miu / parser.model.pmra.lambda, tf - 1) *
        Math.pow(Math.E, -(parser.model.pmra.miu - parser.model.pmra.lambda) * totalTF)
    ), -1);
};

var calculateTotalEntropy = function(parser, distribution, useGroups, article, totalTF, onlyTF) {
    var totalEntropy = 0.0;
    _.each(useGroups, function(group, groupKey) {
        var distElem = {group: groupKey};
        var fGroup = 0.0;
        _.each(article.annotations, function(annotation) {
            var frequency = onlyTF === true ? annotation.tf : annotation.tf * annotation.idf;
            if (groupKey === annotation.group) {
                fGroup += probAnnotation(parser, frequency, totalTF);
            }
        });
        var value = Math.pow(Math.E, group.lambda * fGroup);
        totalEntropy += value;
        distElem.score = value;
        distribution.data.push(distElem);
    });
    return totalEntropy;
};

var narrowGroups = function(parser, includeGroups) {
    var useGroups = {};
    if ((includeGroups !== undefined) && (includeGroups.length !== 0)) {
        _.each(parser.getModel().model, function(group, groupKey) {
            if (_.contains(includeGroups, groupKey)) {
                useGroups[groupKey] = group;
            }
        });
    } else {
        useGroups = parser.getModel().model;
    }
    return useGroups;
};

BiolinksParser.prototype.calculateDistribution = function(annotatedArticles, onlyTF, includeGroups) {
    var parser = this;
    var allDistribution = [];
    var useGroups = narrowGroups(parser, includeGroups);
    var groupArray;
    if ((includeGroups !== undefined) && (includeGroups.length !== 0)) {
        groupArray = _.keys(useGroups);
    }
    _.each(annotatedArticles, function(article) {
        var distribution = {
            id: article.id,
            display: article.display ? article.display : article.id,
            data: []
        };
        var totalTF = calculateTotalTF(article, groupArray, true);
        var totalEntropy = calculateTotalEntropy(parser, distribution, useGroups, article, totalTF, onlyTF);
        _.each(distribution.data, function(distElem) {
            var entValue = distElem.score / totalEntropy;
            distElem.score = entValue !== 1 ? entValue : undefined;
        });
        allDistribution.push(distribution);
    });
    return allDistribution;
 };

var calculatePartialSimilarity = function(parser, queryArticle, frequencyQuery, comparedArticle,
    frequencyCompared, groupArray, terms) {
    var numerator = 0.0;
    _.each(queryArticle.annotations, function(annotation) {
        if ((groupArray === undefined) || _.contains(groupArray, annotation.group)) {
            if (queryArticle.id === comparedArticle.id) {
                numerator += Math.pow(probAnnotation(parser, annotation.tf * annotation.idf, frequencyQuery), 2) *
                    annotation.idf;
            } else {
                var comparedAnnot = _.find(comparedArticle.annotations, function(annot) {
                    return annotation.cui === annot.cui;
                });
                if (comparedAnnot) {
                    terms.push(annotation.id);
                    numerator += probAnnotation(parser, annotation.tf * annotation.idf, frequencyQuery) *
                        probAnnotation(parser, comparedAnnot.tf * annotation.idf, frequencyCompared) * annotation.idf;
                }
            }
        }
    });
    return numerator;
};

BiolinksParser.prototype.calculateSimilarity = function(queryArticle, allRelatedArticles, onlyTF, includeGroups) {
    var parser = this;
    var useGroups = narrowGroups(parser, includeGroups);
    var groupArray;
    if ((includeGroups !== undefined) && (includeGroups.length !== 0)) {
        groupArray = _.keys(useGroups);
    }
    var similarities = [];

    var fullTotalFrequencyQuery = calculateTotalTF(queryArticle, undefined, true);
    var groupsTotalFrequencyQuery = groupArray ? calculateTotalTF(queryArticle, groupArray, true)
        : fullTotalFrequencyQuery;

    var ratio = calculatePartialSimilarity(parser, queryArticle, groupsTotalFrequencyQuery,
        queryArticle, groupsTotalFrequencyQuery, groupArray);
    var weight = (1.0 * groupsTotalFrequencyQuery) / fullTotalFrequencyQuery;

    _.each(allRelatedArticles, function(article) {
        var similarity = {
            queryId: queryArticle.id,
            relatedId: article.id,
            altId: article.altId,
            display: article.display,
            terms: []
            //score
        };

        var fullTotalFrequencyCompared = calculateTotalTF(article, undefined, true);
        var groupsTotalFrequencyCompared = groupArray ? calculateTotalTF(article, groupArray, true)
            : fullTotalFrequencyCompared;

        var numerator = calculatePartialSimilarity(parser, queryArticle, groupsTotalFrequencyQuery,
            article, groupsTotalFrequencyCompared, groupArray, similarity.terms);

        if (groupArray) {
            var weightCompared = (1.0 * groupsTotalFrequencyCompared) / fullTotalFrequencyCompared;
            similarity.score = ratio === 0 ? 0 : weight * weightCompared * (numerator / ratio);
        } else {
            similarity.score = ratio === 0 ? 0 : numerator / ratio;
        }

        similarities.push(similarity);
    });

    return similarities;
};

module.exports = BiolinksParser;