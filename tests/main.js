describe('require-global', function () {
    'use strict';

    require.config({
        baseUrl: '../sources',
        urlArgs: 'now=' + Date.now()
    });

    var global = (0, eval)('this');


    it('should resolve references to existing objects', function (done) {
        require(['global!Math'], function (Math) {
            expect(Math).toEqual(global.Math);
            done();
        });
    });

    it('should resolve property access expressions in dot notation', function (done) {
        require(['global!Math.cos'], function (cos) {
            expect(cos).toEqual(global.Math.cos);
            done();
        });
    });

    it('should not execute expressions with eval', function (done) {
        var expectedValue = 0;
        var actualValue = expectedValue;

        require(['global!actualValue = 1'], null, function (error) {
            expect(error).toBeDefined();
            done();
        });
    });

    it('should not resolve property access expressions in bracket notation', function (done) {
        require(['global!Math["cos"]'], null, function (error) {
            expect(error).toBeDefined();
            done();
        });
    });

    it('should put a warning to the console if reference resolves to global object', function (done) {
        spyOn(console, 'warn');

        require(['global!window'], function () {
            expect(console.warn).toHaveBeenCalled();
            done();
        });
    });

    it('should put a warning to the console if reference resolves to eval function', function (done) {
        spyOn(console, 'warn');

        require(['global!eval'], function () {
            expect(console.warn).toHaveBeenCalled();
            done();
        });
    });

    it('should produce ReferenceError on unresolvable variable reference', function (done) {
        require(['global!doesNotExists'], null, function (error) {
            expect(error instanceof ReferenceError).toBe(true);
            done();
        });
    });

    it('should produce TypeError on unresolvable property reference', function (done) {
        require(['global!Math.doesNotExists.doesNotExists'], null, function (error) {
            expect(error instanceof TypeError).toBe(true);
            done();
        });
    });

    it('should not produce error if expression resolves to undefined', function (done) {
        require(['global!Math.doesNotExists'], function (doesNotExists) {
            expect(doesNotExists).toBeUndefined();
            done();
        });
    });
});
