// if you don't specify a html file, the sniper will generate a div
var appDiv = document.createElement('div');
yourDiv.appendChild(appDiv);

var app = require("biotea-io-parser");
var instance = new app();

var ids = ['13914', '32300'];
var annotations = [];
instance.loadAnnotations('http://localhost:9090/snippets/data/', '13914')
    .done(function(loadedData) {
        console.log('annotations');
        console.log(loadedData);
    })
    .fail( function(e) {
        console.log('annotations');
        console.log(e);
    });

instance.loadAnnotations('http://localhost:9090/snippets/data/', '32300')
    .done(function(loadedData) {
        console.log('annotations');
        console.log(loadedData);
    })
    .fail( function(e) {
        console.log('annotations');
        console.log(e);
    });

instance.loadDistribution('http://localhost:9090/snippets/data/', '32300')
    .done(function(loadedData) {
        console.log('distribution');
        console.log(loadedData);
    })
    .fail( function(e) {
        console.log('distribution');
        console.log(e);
    });

instance.loadSimilarity('http://localhost:9090/snippets/data/', '117238', '55328')
    .done(function(loadedData) {
        console.log('similarity');
        console.log(loadedData);
    })
    .fail( function(e) {
        console.log('similarity');
        console.log(e);
    });

instance.getDispatcher().on('ready', function(obj) {
    if (obj.type === 'annotation') {
        var index = ids.indexOf(obj.id);
        if (index !== -1) {
            annotations.push({annotations: obj.data, id: obj.id, display: 'art PMC:' + obj.id})
            ids.splice(index, 1);
        }
        if (ids.length === 0) {
            var dist = instance.calculateDistribution(annotations, true);
            console.log(dist);
            console.log(JSON.stringify(dist));
        }
    }
});