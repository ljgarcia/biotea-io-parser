var BiolinksModel = require('./BiolinksModel');
var AnnotationLoader = require('./AnnotationLoader');
var DistributionLoader = require('./DistributionLoader');
var SimilarityLoader = require('./SimilarityLoader');
var EventController = require('./EventController');

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

module.exports = BiolinksParser;