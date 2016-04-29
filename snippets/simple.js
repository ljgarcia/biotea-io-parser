// if you don't specify a html file, the sniper will generate a div
var appDiv = document.createElement('div');
yourDiv.appendChild(appDiv);

var app = require("biotea-io-parser");
var instance = new app();

instance.loadAnnotations('http://localhost:9090/snippets/data/', '1669719')
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