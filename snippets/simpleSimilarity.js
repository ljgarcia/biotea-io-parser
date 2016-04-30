// if you don't specify a html file, the sniper will generate a div
var appDiv = document.createElement('div');
yourDiv.appendChild(appDiv);

var app = require("biotea-io-parser");
var instance = new app();

var ids = ['117238', '55328'];
var annotations = [];
instance.loadAnnotations('http://localhost:9090/snippets/data/', '117238')
    .done(function(loadedData) {
        console.log('annotations');
        console.log(loadedData);
    })
    .fail( function(e) {
        console.log('annotations');
        console.log(e);
    });

instance.loadAnnotations('http://localhost:9090/snippets/data/', '55328')
    .done(function(loadedData) {
        console.log('annotations');
        console.log(loadedData);
    })
    .fail( function(e) {
        console.log('annotations');
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
            annotations.push({annotations: obj.data, id: obj.id})
            ids.splice(index, 1);
        }
        if (ids.length === 0) {
            console.log('calculated similarity');
            var query = annotations[0].id === '117238' ? annotations[0] : annotations[1];
            var compared = annotations[0].id === '55328' ? annotations[0] : annotations[1];
            var similarity = instance.calculateSimilarity(query, [compared], false);
            console.log(similarity);
            //console.log(JSON.stringify(similarity));
        }
    }
});