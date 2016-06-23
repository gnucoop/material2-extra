/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/

System.defaultJSExtensions = true;

const components = [
  'calendar'
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


////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const barrels: string[] = [
  // Angular specific barrels.
  '@angular/core',
  '@angular/common',
  '@angular/compiler',
  '@angular/http',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular2-material/core',
  '@angular2-material/button',

  // Thirdparty barrels.
  'rxjs',
  'moment',

  // App specific barrels.
  'demo-app',
  ...components
  /** @cli-barrel */
];

const _cliSystemConfig = {};
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
