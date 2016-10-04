import {join} from 'path';

export const PROJECT_ROOT = join(__dirname, '../..');
export const SOURCE_ROOT = join(PROJECT_ROOT, 'src');

export const DIST_ROOT = join(PROJECT_ROOT, 'dist');
export const DIST_COMPONENTS_ROOT = join(DIST_ROOT, '@material2-extra');


export const NPM_VENDOR_FILES = [
  '@angular',
  '@angular2-material',
  'core-js/client',
  'hammerjs',
  'ionic-angular',
  'moment',
  'rxjs',
  'systemjs/dist',
  'zone.js/dist'
];
