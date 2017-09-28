import {task, watch, src, dest} from 'gulp';
import {join} from 'path';
import {main as tsc} from '@angular/tsc-wrapped';
import {buildConfig} from '../build-config';
import {composeRelease} from '../build-release';
import {inlineResourcesForDirectory} from '../inline-resources';
import {buildScssTask} from './build-scss-task';
import {sequenceTask} from './sequence-task';
import {watchFiles} from './watch-files';
import {BuildPackage} from '../build-package';

// There are no type definitions available for these imports.
const htmlmin = require('gulp-htmlmin');

const {packagesDir, outputDir} = buildConfig;

const htmlMinifierOptions = {
  collapseWhitespace: true,
  removeComments: true,
  caseSensitive: true,
  removeAttributeQuotes: false
};

/**
 * Creates a set of gulp tasks that can build the specified package.
 * @param packageName Name of the package. Needs to be similar to the directory name in `src/`.
 * @param requiredPackages Required packages that will be built before building the current package.
 */
export function createPackageBuildTasks(buildPackage: BuildPackage) {
  // Name of the package build tasks for Gulp.
  const taskName = buildPackage.name;

  // Name of all dependencies of the current package.
  const dependencyNames = buildPackage.dependencies.map(p => p.name);

  // Glob that matches all style files that need to be copied to the package output.
  const stylesGlob = join(buildPackage.sourceDir, '**/**/*.+(scss|css)');

  // Glob that matches every HTML file in the current package.
  const htmlGlob = join(buildPackage.sourceDir, '**/*.html');

  // List of watch tasks that need run together with the watch task of the current package.
  const dependentWatchTasks = buildPackage.dependencies.map(p => `${p.name}:watch`);

  task(`${taskName}:clean-build`, sequenceTask('clean', `${taskName}:build`));

  task(`${taskName}:build`, sequenceTask(
    // Build all required packages before building.
    ...dependencyNames.map(pkgName => `${pkgName}:build`),
    // Build ESM and assets output.
    [`${taskName}:build:esm`, `${taskName}:assets`],
    // Inline assets into ESM output.
    `${taskName}:assets:inline`,
    // Build bundles on top of inlined ESM output.
    `${taskName}:build:bundles`,
  ));

  task(`${taskName}:build-tests`, sequenceTask(
    // Build all required tests before building.
    ...dependencyNames.map(pkgName => `${pkgName}:build-tests`),
    // Build the ESM output that includes all test files. Also build assets for the package.
    [`${taskName}:build:esm:tests`, `${taskName}:assets`],
    // Inline assets into ESM output.
    `${taskName}:assets:inline`
  ));

  /**
   * Release tasks for the package. Tasks compose the release output for the package.
   */

  task(`${taskName}:build-release:clean`, sequenceTask('clean', `${taskName}:build-release`));
  task(`${taskName}:build-release`, [`${taskName}:build`], () => composeRelease(buildPackage));

  /**
   * TypeScript compilation tasks. Tasks are creating ESM, FESM, UMD bundles for releases.
   */

  task(`${taskName}:build:esm`, () => buildPackage.compile());
  task(`${taskName}:build:esm:tests`, () => buildPackage.compileTests());

  task(`${taskName}:build:bundles`, () => buildPackage.createBundles());

  /**
   * Asset tasks. Building SASS files and inlining CSS, HTML files into the ESM output.
   */
  task(`${taskName}:assets`, [
    `${taskName}:assets:scss`,
    `${taskName}:assets:copy-styles`,
    `${taskName}:assets:html`
  ]);

  task(`${taskName}:assets:scss`, buildScssTask(
    buildPackage.outputDir, buildPackage.sourceDir, true)
  );

  task(`${taskName}:assets:copy-styles`, () => {
    return src(stylesGlob).pipe(dest(buildPackage.outputDir));
  });
  task(`${taskName}:assets:html`, () => {
    return src(htmlGlob).pipe(htmlmin(htmlMinifierOptions)).pipe(dest(buildPackage.outputDir));
  });

  task(`${taskName}:assets:inline`, () => inlineResourcesForDirectory(buildPackage.outputDir));

  /**
   * Watch tasks, that will rebuild the package whenever TS, SCSS, or HTML files change.
   */
  task(`${taskName}:watch`, dependentWatchTasks, () => {
    watchFiles(join(buildPackage.sourceDir, '**/*.+(ts|scss|html)'), [`${taskName}:build`]);
  });
}
