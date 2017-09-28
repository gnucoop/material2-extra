import {task} from 'gulp';
import {execNodeTask} from '../util/task_helpers';
import {join} from 'path';
import {m2ePackages, buildConfig, sequenceTask} from 'm2e-build-tools';
import {red} from 'chalk';

// These types lack of type definitions
const madge = require('madge');

/** Glob that matches all SCSS or CSS files that should be linted. */
const stylesGlob = '+(tools|src)/**/*.+(css|scss)';

/** List of flags that will passed to the different TSLint tasks. */
const tsLintBaseFlags = [
  '-c', 'tslint.json', '+(src|e2e|tools)/**/*.ts', '--exclude', '**/node_modules/**/*'
];

/** Path to the output of the Material package. */
const m2eOutPaths = m2ePackages.map((p) => join(buildConfig.outputDir, 'packages', `${p}`));

task('lint', ['tslint', 'stylelint', 'madge']);

/** Task to lint Angular Material's scss stylesheets. */
task('stylelint', execNodeTask(
  'stylelint', [stylesGlob, '--config', 'stylelint-config.json', '--syntax', 'scss']
));

/** Task to run TSLint against the e2e/ and src/ directories. */
task('tslint', execNodeTask('tslint', tsLintBaseFlags));

/** Task that automatically fixes TSLint warnings. */
task('tslint:fix', execNodeTask(
  'tslint', [...tsLintBaseFlags, '--fix'])
);

/** Task that runs madge to detect circular dependencies. */
task('madge', m2ePackages.map(p => `${p}:clean-build`), () => {
  madge(m2eOutPaths).then((res: any) => {
    const circularModules = res.circular();

    if (circularModules.length) {
      console.error();
      console.error(red(`Madge found modules with circular dependencies.`));
      console.error(formatMadgeCircularModules(circularModules));
      console.error();
    }
  });
});

/** Returns a string that formats the graph of circular modules. */
function formatMadgeCircularModules(circularModules: string[][]): string {
  return circularModules.map((modulePaths: string[]) => `\n - ${modulePaths.join(' > ')}`).join('');
}
