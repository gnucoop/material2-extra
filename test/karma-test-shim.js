/*global jasmine, __karma__, window*/
Error.stackTraceLimit = Infinity;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

__karma__.loaded = function () {};

var baseDir = '/base';
var specFiles = Object.keys(window.__karma__.files).filter(isM2ESpecFile);

// Configure the base path for dist/
System.config({
  baseURL: baseDir,
  paths: {
    'node:*': 'node_modules/*'
  },
  map: {
    'rxjs': 'node:rxjs',
    'main': 'main.js',

    // Angular specific mappings.
    '@angular/core': 'node:@angular/core/bundles/core.umd.js',
    '@angular/core/testing': 'node:@angular/core/bundles/core-testing.umd.js',
    '@angular/common': 'node:@angular/common/bundles/common.umd.js',
    '@angular/common/testing': 'node:@angular/common/bundles/common-testing.umd.js',
    '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
    '@angular/compiler/testing': 'node:@angular/compiler/bundles/compiler-testing.umd.js',
    '@angular/http': 'node:@angular/http/bundles/http.umd.js',
    '@angular/http/testing': 'node:@angular/http/bundles/http-testing.umd.js',
    '@angular/forms': 'node:@angular/forms/bundles/forms.umd.js',
    '@angular/forms/testing': 'node:@angular/forms/bundles/forms-testing.umd.js',
    '@angular/animations': 'node:@angular/animations/bundles/animations.umd.js',
    '@angular/animations/browser': 'node:@angular/animations/bundles/animations-browser.umd.js',
    '@angular/platform-browser/animations':
      'node:@angular/platform-browser/bundles/platform-browser-animations.umd',
    '@angular/platform-browser':
      'node:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser/testing':
      'node:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
    '@angular/platform-browser-dynamic':
      'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
    '@angular/platform-browser-dynamic/testing':
      'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
    '@angular/material': 'node:@angular/material/bundles/material.umd.js',
    '@angular/cdk': 'node:@angular/cdk/bundles/cdk.umd.js',
    'moment': 'node:moment/min/moment.min.js',

    '@material2-extra/calendar': 'dist/packages/calendar/public_api.js',
    '@material2-extra/masonry': 'dist/packages/masonry/public_api.js'
  },
  packages: {
    // Thirdparty barrels.
    'rxjs': {main: 'index'},

    // Set the default extension for the root package, because otherwise the demo-app can't
    // be built within the production mode. Due to missing file extensions.
    '.': {
      defaultExtension: 'js'
    }
  }
});

// Load the spec SystemJS configuration file.
configureTestBed()
  .then(runM2ESpecs)
  .then(__karma__.start, __karma__.error);


/** Runs the M2E specs in Karma. */
function runM2ESpecs() {
  // By importing all spec files, Karma will run the tests directly.
  return Promise.all(specFiles.map(function(fileName) {
    return System.import(fileName);
  }));
}

/** Whether the specified file is part of M2E. */
function isM2ESpecFile(path) {
  return path.slice(-8) === '.spec.js' && path.indexOf('node_modules') === -1;
}

/** Configures Angular's TestBed. */
function configureTestBed() {
  return Promise.all([
    System.import('@angular/core/testing'),
    System.import('@angular/platform-browser-dynamic/testing')
  ]).then(function (providers) {
    var testing = providers[0];
    var testingBrowser = providers[1];

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    var testBed = testing.TestBed.initTestEnvironment(
      testingBrowser.BrowserDynamicTestingModule,
      testingBrowser.platformBrowserDynamicTesting()
    );

    patchTestBedToDestroyFixturesAfterEveryTest(testBed);
  });
}

  /**
 * Monkey-patches TestBed.resetTestingModule such that any errors that occur during component
 * destruction are thrown instead of silently logged. Also runs TestBed.resetTestingModule after
 * each unit test.
 *
 * Without this patch, the combination of two behaviors is problematic for Angular Material:
 * - TestBed.resetTestingModule catches errors thrown on fixture destruction and logs them without
 *     the errors ever being thrown. This means that any component errors that occur in ngOnDestroy
 *     can encounter errors silently and still pass unit tests.
 * - TestBed.resetTestingModule is only called *before* a test is run, meaning that even *if* the
 *    aforementioned errors were thrown, they would be reported for the wrong test (the test that's
 *    about to start, not the test that just finished).
 */
function patchTestBedToDestroyFixturesAfterEveryTest(testBed) {
  // Original resetTestingModule function of the TestBed.
  var _resetTestingModule = testBed.resetTestingModule;

  // Monkey-patch the resetTestingModule to destroy fixtures outside of a try/catch block.
  // With https://github.com/angular/angular/commit/2c5a67134198a090a24f6671dcdb7b102fea6eba
  // errors when destroying components are no longer causing Jasmine to fail.
  testBed.resetTestingModule = function() {
    try {
      this._activeFixtures.forEach(function (fixture) { fixture.destroy(); });
    } finally {
      this._activeFixtures = [];
      // Regardless of errors or not, run the original reset testing module function.
      _resetTestingModule.call(this);
    }
  };

  // Angular's testing package resets the testing module before each test. This doesn't work well
  // for us because it doesn't allow developers to see what test actually failed.
  // Fixing this by resetting the testing module after each test.
  // https://github.com/angular/angular/blob/master/packages/core/testing/src/before_each.ts#L25
  afterEach(function() {
    testBed.resetTestingModule();
  });
}
