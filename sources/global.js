define(function () {
    'use strict';

    // Calling eval indirectly, to obtain global object (http://ecma-international.org/ecma-262/5.1/#sec-10.4.2).
    // We are making this code portable across different execution environments by not having direct reference to 'window'.
    var global = (0, eval)('this');



    /**
     * Traverses property access expression in order to obtain a value without executing this expression.
     *
     * @function
     * @param {string} expression - Property access expression in dot notation.
     * @returns Object obtained as the result of traversal of property access expression.
     */
    function resolveExpression(expression) {
        var referenceTarget;
        var propertyNames = parseExpression(expression);
        
        for (var propertyIndex = 0;
            propertyIndex < propertyNames.length;
            propertyIndex++) {
            
            var propertyName = propertyNames[propertyIndex];
            referenceTarget = resolveReference(referenceTarget, propertyName, propertyIndex);
        }

        checkReferentialSafety(referenceTarget);

        return referenceTarget;
    }

    /**
     * Parses property access expression in dot notation into individual components.
     * 
     * @function
     * @param {string} expression - Property access expression in dot notation.
     * @returns {string[]} Array of a property access expression components.
     */
    function parseExpression(expression) {
        return expression.split('.');
    }


    /**
     * Follows a reference specified with components similar to ECMAScript 5 reference components.
     *
     * @function
     * @param referenceTarget - Object to follow when resolving a reference.
     * @param {string} propertyName - Name of a property to resolve.
     * @param {number} propertyIndex - Index of a component of a property access expression.
     * @returns Object obtained as the result of reference resolution.
     */
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

    /**
     * Deduces base component of a reference.
     * 
     * @function
     * @param referenceTarget - Object to follow when resolving a reference.
     * @param {string} propertyName - Name of a property to resolve.
     * @param {number} propertyIndex - Index of a component of a property access expression.
     * @returns Base component of a reference.
     */
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
    
    /**
     * Determines whether reference can be resolved.
     *      Note: Algorithm is based on (http://ecma-international.org/ecma-262/5.1/#sec-8.7).
     * 
     * @function
     * @param referenceBase - Base component of a reference.
     * @returns {boolean} Is reference can't be resolved.
     */
    function isUnresolvableReference(referenceBase) {
        return (referenceBase == null);
    }

    /**
     * Checks for undesirable or surprising behavior of required object and if so, produces warnings.
     * 
     * @function
     * @param referenceTarget - Object obtained with expression resolution.
     */
    function checkReferentialSafety(referenceTarget) {
        if (referenceTarget === global.eval) {
            printWarning('Indirect eval calls have unobvious runtime behavior (http://www.ecma-international.org/ecma-262/5.1/#sec-10.4.2).');
        }
    }


    /**
     * Prints a message to console in a cross-browser manner.
     * 
     * @function
     * @param {string} s - String to print.
     */
    function printWarning(s) {
        if (!global.console || !global.console.warn) {
            return;
        }

        global.console.warn(makeLibraryString(s));
    }

    /**
     * Amends string with library specific prefix.
     * 
     * @function
     * @param {string} s - String to amend.
     */
    function makeLibraryString(s) {
        return ('Require Global: ' + s);
    }



    function load(name, localRequire, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        }
        else {
            try {
                var value = resolveExpression(name);
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