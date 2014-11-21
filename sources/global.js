define(function () {
    'use strict';


    function load(name, localRequire, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        }
        else {
            var value = eval(name);
            onLoad(value);
        }
    }


    return {
        load: load
    };
});