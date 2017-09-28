import {createPackageBuildTasks} from 'm2e-build-tools';
import {calendarPackage, masonryPackage} from './packages';

// Create gulp tasks to build the different packages in the project.
createPackageBuildTasks(calendarPackage);
createPackageBuildTasks(masonryPackage);

import './tasks/ci';
import './tasks/clean';
import './tasks/default';
import './tasks/development';
import './tasks/docs';
import './tasks/e2e';
import './tasks/lint';
import './tasks/publish';
import './tasks/screenshots';
import './tasks/unit-test';
import './tasks/aot';
import './tasks/payload';
import './tasks/coverage';
import './tasks/material2-extra-release';
import './tasks/universal';
import './tasks/validate-release';
