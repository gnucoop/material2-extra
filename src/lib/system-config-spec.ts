/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/

System.defaultJSExtensions = true;

const components = [
  'calendar',
  'masonry'
];

const map: any = {
};
components.forEach(name => map[`@material2-extra/${name}`] = `components/${name}`);


/** User packages configuration. */
const packages: any = {
  'moment': {
    format: 'cjs',
    defaultExtension: 'js',
    main: 'min/moment.min'
  }
};
components.forEach(name => {
  packages[`@material2-extra/${name}`] = {
    format: 'cjs',
    defaultExtension: 'js'
  };
});

const angularPackages = {
  // Angular specific barrels.
  '@angular/core': { main: 'bundles/core.umd.js'},
  '@angular/core/testing': { main: '../bundles/core-testing.umd.js'},
  '@angular/common': { main: 'bundles/common.umd.js'},
  '@angular/compiler': { main: 'bundles/compiler.umd.js'},
  '@angular/compiler/testing': { main: '../bundles/compiler-testing.umd.js'},
  '@angular/http': { main: 'bundles/http.umd.js'},
  '@angular/http/testing': { main: '../bundles/http-testing.umd.js'},
  '@angular/forms': { main: 'bundles/forms.umd.js'},
  '@angular/router': { main: 'bundles/router.umd.js'},
  '@angular/platform-browser': { main: 'bundles/platform-browser.umd.js'},
  '@angular/platform-browser/testing': { main: '../bundles/platform-browser-testing.umd.js'},
  '@angular/platform-browser-dynamic': { main: 'bundles/platform-browser-dynamic.umd.js'},
  '@angular/platform-browser-dynamic/testing': {
    main: '../bundles/platform-browser-dynamic-testing.umd.js',
  },
  'moment': { main: 'min/moment.min.js' },
  '@angular2-material/core': { main: 'core.umd.js' },
  '@angular2-material/button': { main: 'button.umd.js' }
};


////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const barrels: string[] = [
  // Thirdparty barrels.
  'rxjs',
  'moment',

  // App specific barrels.
  'demo-app',
  ...components
  /** @cli-barrel */
];

const _cliSystemConfig = angularPackages;
barrels.forEach((barrelName: string) => {
  (<any> _cliSystemConfig)[barrelName] = { main: 'index' };
});

/** Type declaration for ambient System. */
declare var System: any;

// Apply the CLI SystemJS configuration.
System.config({
  map: {
    '@angular': 'vendor/@angular',
    '@angular2-material': 'vendor/@angular2-material',
    'rxjs': 'vendor/rxjs',
    'moment': 'vendor/moment',
    'main': 'main.js'
  },
  packages: _cliSystemConfig
});

// Apply the user's configuration.
System.config({ map, packages });
