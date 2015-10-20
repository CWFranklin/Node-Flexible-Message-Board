function Plugin(s) {
    var dir = './plugins/';
    var registered = [];
    
    s.fs.readdir(dir, function(err, files) {
        if (err) throw err;
        var c = 0;
        files.forEach(function(file) {
            var pluginName = file.substring(0, file.length - 3);
            var pluginInit = require(dir+file).initialise(s);
            
            registered.push(pluginName, pluginInit);
            console.log('Registered Plugin: ' + pluginName);
        });
    });
}

module.exports = {
    Plugin: Plugin
};