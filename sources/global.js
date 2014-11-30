define(function () {
    'use strict';

    // Calling eval indirectly, to obtain global object (http://ecma-international.org/ecma-262/5.1/#sec-10.4.2).
    // We are making this code portable across different execution environments by not having direct reference to 'window'.
    var global = (0, eval)('this');


    function resolve(expression) {
        var referenceTarget;
        var propertyNames = expression.split('.');
        
        for (var propertyIndex = 0;
            propertyIndex < propertyNames.length;
            propertyIndex++) {
            
            var propertyName = propertyNames[propertyIndex];
            referenceTarget = resolveReference(referenceTarget, propertyName, propertyIndex);
        }

        checkReferentialSafity(propertyNames);

        return referenceTarget;
    }


    function resolveReference(referenceTarget, propertyName, propertyIndex) {
        var referenceBase = getReferenceBase(referenceTarget, propertyName, propertyIndex);

        if (isUnresolvableReference(referenceBase)) {
            if (propertyIndex === 0) {
                throw new ReferenceError(makeLibraryString(propertyName + ' is not defined.'));
            }
            else {
                throw new TypeError(makeLibraryString('Can\'t read ' + propertyName + ' of ' + referenceTarget + '.'));
            }
        }

        return referenceBase[propertyName];
    }

    function getReferenceBase(referenceTarget, propertyName, propertyIndex) {
        if (propertyIndex === 0) {
            // Emulate behavior of unresolvable references (http://ecma-international.org/ecma-262/5.1/#sec-8.7),
            // thus minimazing impact on semantics of a program when switching from global variables to Require Global.
            if (propertyName in global) {
                return global;
            }

            return;
        }

        return referenceTarget;
    }

    function isUnresolvableReference(referenceBase) {
        return (referenceBase == null);
    }


    function checkReferentialSafity(propertyNames) {
        var lastPropertyName = propertyNames[propertyNames.length - 1];

        if (lastPropertyName === 'eval') {
            printWarning('Indirect eval calls have different runtime bahvior (http://www.ecma-international.org/ecma-262/5.1/#sec-10.4.2).');
        }
    }


    function printWarning(s) {
        if (!global.console || !global.console.warn) {
            return;
        }

        global.console.warn(makeLibraryString(s));
    }

    function makeLibraryString(s) {
        return ('Require Global: ' + s);
    }



    function load(name, localRequire, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        }
        else {
            try {
                var value = resolve(name);
                onLoad(value);
            }
            catch (e) {
                onLoad.error(e);
            }
        }
    }


    return {
        load: load
    };
});