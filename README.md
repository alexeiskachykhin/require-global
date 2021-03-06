require-global
==============

[RequireJS](http://requirejs.org) loader plugin that allows to require global variables thus making dependencies on globals explicit.

[![browser support](https://ci.testling.com/alexeiskachykhin/require-global.png)
](https://ci.testling.com/alexeiskachykhin/require-global)

## Install

You can use [bower](http://bower.io/) to install it easily:

```
bower install --save require-global
```

## Example

```javascript
require.config({
    paths : {
        // Create alias to plugin (not needed if plugin is on the baseUrl)
        global: 'bower_components/require-global/sources/global'
    }
});

require([
    'global!window.alert',
    'global!setTimeout'
], function (alert, setTimeout) {
    setTimeout(function () {
      alert('Alerting through local variable!');
    }, 100);
});
```

Also `require-global` can be used as mocking mechanism for unit testing:

```javascript
require.config({
    paths : {
        // Create alias to plugin (not needed if plugin is on the baseUrl)
        global: 'bower_components/require-global/sources/global'
    },
    
    map: {
        '*': {
            'JSON': 'JSONMock'
        }
    }
});

var JSONMock = {
    stringify: function () {
        alert('Stringifying object!');
    }
};

require([
    'global!JSON'
], function (JSON) {
    JSON.stringify({
        hello: 'world'
    }); // It will call mocked implementation of JSON.
});
```

Check `examples` folder for more examples.


## Design

For now plugin supports property access expressions in dot notation only.

```javascript
require([
    'global!JSON', // OK
    'global!window.JSON', // OK
    'global!window["JSON"]' // Illegal
], function () {
});
```

Internaly plugin parses property access expression and resolves it by traversing object graph starting from global object. No `eval` is used. It also mimics behavior of native property resolution algorithm and throws ReferenceError and TypeError according to the spec, so change from using globals to `require-global` should be non-breaking in most of the cases. Some of the functions have different behavior when called `directly` or `indirectly`. For example indirect call to `eval` causes evaled expression to execute in a global scope (in both `strict` and `sloppy` modes). For this cases `require-global` prints out a message to a console.

Additionaly, plugin does not try to validate syntactic correctnes of an expression for two reasons. First, such process can become quite error prone due to excessive amount of rules the are needed to be checked against (explained in [this article](https://mathiasbynens.be/notes/javascript-identifiers)). Second, we are not defining variables here, we are referencing existing variables/properties so mistakes result in error or undefined values that are quite easy to identify.


## Roadmap

- Add error handling
- Add linting
