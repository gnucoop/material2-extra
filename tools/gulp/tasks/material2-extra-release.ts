import {task, src, dest} from 'gulp';
import {join} from 'path';
import {copySync} from 'fs-extra';
import {writeFileSync, mkdirpSync} from 'fs-extra';
import {Bundler} from 'scss-bundle';
import {m2ePackages, composeRelease, buildConfig, sequenceTask} from 'm2e-build-tools';
import {calendarPackage, masonryPackage} from '../packages';
import {execTask} from '../util/task_helpers';

// There are no type definitions available for these imports.
const gulpRename = require('gulp-rename');

const {packagesDir, outputDir} = buildConfig;

/** Path to the directory where all releases are created. */
const releasesDir = join(outputDir, 'releases');

/** Path to the output of the Ajf packages. */
const m2eOutputPaths = m2ePackages.map((p) => join(outputDir, 'packages', `${p}`));

// Path to the sources of the Ajf package.
const m2ePaths = m2ePackages.map((p) => join(packagesDir, `${p}`));
// Path to the release output of m2e.
const releasePaths = m2ePackages.map((p) => join(releasesDir, `${p}`));
// Matches all SCSS files in the library.
const allScssGlobs = m2ePaths.map((p) => join(p, '**/*.scss'));

[calendarPackage, masonryPackage].forEach((p) => {
  task(`m2e-${p.name}:build-release`, () => composeRelease(p));
});
/**
 * Overwrite the release task for the m2e package.
 */
task('m2e:build-release', ['m2e:prepare-release'], sequenceTask(
  ...m2ePackages.map((p) => `${p}:build-release`)
));

/**
 * Task that will build the material package. It will also copy all prebuilt themes and build
 * a bundled SCSS file for theming
 */
task('m2e:prepare-release', sequenceTask(
  ...m2ePackages.map((p) => `${p}:build`)
));


m2ePackages.forEach((m) => {
  task(`update-package-version:${m}`,
    execTask(join(packagesDir, '..', 'publish.sh'), ['-v', `-p ${m}`]));
});
task('update-package-version',
  execTask(join(packagesDir, '..', 'publish.sh'), ['-v']));
