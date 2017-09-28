import {task} from 'gulp';
import {copySync} from 'fs-extra';
import {execNodeTask} from '../util/task_helpers';
import {join} from 'path';
import {m2ePackages, buildConfig, sequenceTask} from 'm2e-build-tools';

const {outputDir} = buildConfig;

/** Path to the directory where all releases are living. */
const releasesDir = join(outputDir, 'releases');

/** Path to the demo-app output directory. */
const demoAppOut = join(outputDir, 'packages', 'demo-app');

/** Path to the tsconfig file that builds the AOT files. */
const tsconfigFile = join(demoAppOut, 'tsconfig-aot.json');

/** Builds the demo-app and m2e. To be able to run NGC, apply the metadata workaround. */
task('aot:deps', sequenceTask(
  'build:devapp',
  ['m2e:build-release'],
  'aot:copy-release'
));

// As a workaround for https://github.com/angular/angular/issues/12249, we need to
// copy the Material and CDK ESM output inside of the demo-app output.
task('aot:copy-release', () => {
  m2ePackages.forEach((p) => {
    copySync(join(releasesDir, `${p}`), join(demoAppOut, `${p}`));
  });
});

/** Build the demo-app and a release to confirm that the library is AOT-compatible. */
task('aot:build', sequenceTask('aot:deps', 'aot:compiler-cli'));

/** Build the demo-app and a release to confirm that the library is AOT-compatible. */
task('aot:compiler-cli', execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', tsconfigFile]
));
