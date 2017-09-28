import {join} from 'path';
import {getSubdirectoryNames} from './secondary-entry-points';
import {m2ePackages, buildConfig} from './build-config';

/** Method that converts dash-case strings to a camel-based string. */
const dashCaseToCamelCase = (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

/** List of potential secondary entry-points for the cdk package. */
const secondaryEntryPoints: {[p: string]: string[]} = m2ePackages
  .reduce((secondary: {[p: string]: string[]}, p: string) => {
    secondary[p] = getSubdirectoryNames(join(buildConfig.packagesDir, `${p}`));
    return secondary;
  }, {});

const rollupSecondaryEntryPoints = m2ePackages
  .reduce((g: any, p: string) => {
    return Object.assign(
      {}, g, secondaryEntryPoints[p].reduce((globals: any, entryPoint: string) => {
        globals[`@material2-extra/${p}/${entryPoint}`] =
          `m2e.${p}.${dashCaseToCamelCase(entryPoint)}`;
        return globals;
      }, {})
    );
  }, {});

// There are no type definitions available for these imports.
const rollup = require('rollup');
const rollupNodeResolutionPlugin = require('rollup-plugin-node-resolve');

export const rollupGlobals = {
  // Import tslib rather than having TypeScript output its helpers multiple times.
  // See https://github.com/Microsoft/tslib
  'tslib': 'tslib',

  // Angular dependencies
  '@angular/animations': 'ng.animations',
  '@angular/core': 'ng.core',
  '@angular/core/testing': 'ng.core.testing',
  '@angular/common': 'ng.common',
  '@angular/forms': 'ng.forms',
  '@angular/http': 'ng.http',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
  '@angular/platform-browser/testing/src/browser_util':
    'ng.platformBrowser.testing.src.browserUtil',

  // Local Angular packages inside of Material.
  '@angular/material': 'ng.material',
  '@angular/cdk': 'ng.cdk',

  // Rxjs dependencies
  'rxjs/BehaviorSubject': 'Rx',
  'rxjs/Observable': 'Rx',
  'rxjs/ReplaySubject': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/Subscriber': 'Rx',
  'rxjs/Subscription': 'Rx',
  'rxjs/observable/combineLatest': 'Rx.Observable',
  'rxjs/observable/forkJoin': 'Rx.Observable',
  'rxjs/observable/fromEvent': 'Rx.Observable',
  'rxjs/observable/merge': 'Rx.Observable',
  'rxjs/observable/of': 'Rx.Observable',
  'rxjs/observable/throw': 'Rx.Observable',
  'rxjs/add/observable/timer': 'Rx.Observable',
  'rxjs/add/operator/auditTime': 'Rx.Observable.prototype',
  'rxjs/add/operator/catch': 'Rx.Observable.prototype',
  'rxjs/add/operator/combineLatest': 'Rx.Observable.prototype',
  'rxjs/add/operator/debounceTime': 'Rx.Observable.prototype',
  'rxjs/add/operator/distinctUntilChanged': 'Rx.Observable.prototype',
  'rxjs/add/operator/do': 'Rx.Observable.prototype',
  'rxjs/add/operator/filter': 'Rx.Observable.prototype',
  'rxjs/add/operator/finally': 'Rx.Observable.prototype',
  'rxjs/add/operator/first': 'Rx.Observable.prototype',
  'rxjs/add/operator/let': 'Rx.Observable.prototype',
  'rxjs/add/operator/map': 'Rx.Observable.prototype',
  'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
  'rxjs/add/operator/pairwise': 'Rx.Observable.prototype',
  'rxjs/add/operator/publishReplay': 'Rx.Observable.prototype',
  'rxjs/add/operator/sample': 'Rx.Observable.prototype',
  'rxjs/add/operator/scan': 'Rx.Observable.prototype',
  'rxjs/add/operator/share': 'Rx.Observable.prototype',
  'rxjs/add/operator/startWith': 'Rx.Observable.prototype',
  'rxjs/add/operator/switchMap': 'Rx.Observable.prototype',
  'rxjs/add/operator/takeUntil': 'Rx.Observable.prototype',
  'rxjs/add/operator/toPromise': 'Rx.Observable.prototype',
  'rxjs/add/operator/withLatestFrom': 'Rx.Observable.prototype',

  'moment': 'moment',

  '@material2-extra/calendar': 'm2e.calendar',
  '@material2-extra/masonry': 'm2e.masonry',

  ...rollupSecondaryEntryPoints
};
