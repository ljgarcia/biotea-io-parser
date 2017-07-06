var BiolinksModel = require('./BiolinksModel');
var AnnotationLoader = require('./AnnotationLoader');
var DistributionLoader = require('./DistributionLoader');
var SimilarityLoader = require('./SimilarityLoader');
var EventController = require('./EventController');
var _ = require('underscore');

var BiolinksParser = function(model){
    var parser = this;
    parser.model = new BiolinksModel();
    if (model) {
        parser.model.model = model;
    }
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

var calculateTotalTF = function(article, groupArray) {
    var totalTF = 0;
    _.each(article.annotations, function(annotation) {
        if (groupArray) {
            if (_.contains(groupArray, annotation.group)) {
                totalTF += annotation.tf;
            }
        } else {
            totalTF += annotation.tf;
        }
     });
     return totalTF;
};

var calculateTotalTFIDF = function(article, groupArray) {
    var totalTFIDF = 0;
    _.each(article.annotations, function(annotation) {
        if (groupArray) {
            if (_.contains(groupArray, annotation.group)) {
                totalTFIDF += annotation.tf * annotation.idf;
            }
        } else {
            totalTFIDF += annotation.tf * annotation.idf;
        }
     });
     return totalTFIDF;
};

var probAnnotation = function(parser, tf, totalTF) {
    return Math.pow(1 + (
        Math.pow(parser.model.pmra.miu / parser.model.pmra.lambda, tf - 1) *
        Math.pow(Math.E, -(parser.model.pmra.miu - parser.model.pmra.lambda) * totalTF)
    ), -1);
};

var calculateTotalDistribution = function(parser, distribution, useGroups, article, noLambda) {
    var totalScore = 0.0;
    var totalRanking = 0.0;

    var keys = _.keys(useGroups);
    var totalTFIDF = calculateTotalTFIDF(article, keys);
    var totalTF = calculateTotalTF(article, keys);

    _.each(useGroups, function(group, groupKey) {
        var distElem = {group: groupKey};

        var fRankingGroup = 0.0;
        var fTfIdfGroup = 0;

        _.each(article.annotations, function(annotation) {
            var frequency = annotation.tf * annotation.idf;
            if (groupKey === annotation.group) {
                fRankingGroup += probAnnotation(parser, frequency, totalTF);
                fTfIdfGroup += frequency;
            }
        });

        if (fTfIdfGroup !== 0) {
            var valueRanking = Math.pow(Math.E, fRankingGroup * fTfIdfGroup/totalTFIDF);
            totalRanking += valueRanking;
            distElem.rankingScore = valueRanking;

            var valueTfIdf = noLambda === true ? fTfIdfGroup : group.lambda * fTfIdfGroup;
            totalScore += valueTfIdf;
            distElem.score = valueTfIdf;
        } else {
            distElem.rankingScore = 0;
            distElem.score = 0;
        }

        distribution.data.push(distElem);
    });

    return {totalScore: totalScore, totalRanking: totalRanking};
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

BiolinksParser.prototype.calculateDistribution = function(annotatedArticles, includeGroups, noLambda) {
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
            altId: article.altId,
            display: article.display ? article.display : article.id,
            data: []
        };

        var calculation = calculateTotalDistribution(parser, distribution, useGroups, article, noLambda);

        _.each(distribution.data, function(distElem) {
            distElem.score = distElem.score / calculation.totalScore;
            distElem.rankingScore = distElem.rankingScore / calculation.totalRanking;
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
                numerator += Math.pow(probAnnotation(parser, annotation.tf, frequencyQuery), 2) *
                    annotation.idf;
            } else {
                var comparedAnnot = _.find(comparedArticle.annotations, function(annot) {
                    return annotation.cui === annot.cui;
                });
                if (comparedAnnot) {
                    terms.push(annotation.cui);
                    numerator += probAnnotation(parser, annotation.tf, frequencyQuery) *
                        probAnnotation(parser, comparedAnnot.tf, frequencyCompared) * annotation.idf;
                } else {
                    numerator += probAnnotation(parser, annotation.tf, frequencyQuery) *
                        probAnnotation(parser, 0, frequencyCompared) * annotation.idf;
                }
            }
        }
    });
    return numerator;
};

BiolinksParser.prototype.calculateSimilarity = function(queryArticle, allRelatedArticles, includeGroups) {
    var parser = this;
    var useGroups = narrowGroups(parser, includeGroups);
    var groupArray;
    if ((includeGroups !== undefined) && (includeGroups.length !== 0)) {
        groupArray = _.keys(useGroups);
    }
    var similarities = [];

    var totalFrequencyQuery = groupArray ? calculateTotalTF(queryArticle, groupArray)
        : calculateTotalTF(queryArticle, undefined);

    var divisor = calculatePartialSimilarity(parser, queryArticle, totalFrequencyQuery,
        queryArticle, totalFrequencyQuery, groupArray);
    var distQuery = 0;
    if (groupArray) {
        _.each(queryArticle.distribution, function(dist) {
            if (_.contains(groupArray, dist.group)) {
                distQuery += dist.score;
            }
        });
    }

    _.each(allRelatedArticles, function(article) {
        if (article.id !== queryArticle.id) {
            var similarity = {
                queryId: queryArticle.id,
                relatedId: article.id,
                altId: article.altId,
                display: article.display,
                terms: []
                //score
            };

            var totalFrequencyCompared = groupArray ? calculateTotalTF(article, groupArray)
                : calculateTotalTF(article, undefined);
            var totalTFIDFCompared = calculateTotalTFIDF(article, undefined);
            var groupTotalTFIDFCompared = calculateTotalTFIDF(article, groupArray);

            var dividend = calculatePartialSimilarity(parser, queryArticle, totalFrequencyQuery,
                article, totalFrequencyCompared, groupArray, similarity.terms);

            if (groupArray) {
                var distComp = 0;
                /*_.each(article.distribution, function(dist) {
                    if (_.contains(groupArray, dist.group)) {
                        distComp += dist.score;
                    }
                });*/
                var alpha = 1;
                similarity.score = divisor === 0 ? 0
                    : ((alpha * distQuery) + ((1 - alpha) * distComp)) *(dividend / divisor);
            } else {
                similarity.score = divisor === 0 ? 0 : dividend / divisor;
            }

            similarities.push(similarity);
        }
    });

    return similarities;
};

module.exports = BiolinksParser;