import {default as chalk} from 'chalk';
import {spawn} from 'child_process';
import {readFileSync, writeFileSync} from 'fs';
import {sync as glob} from 'glob';
import {join, resolve as resolvePath} from 'path';
import {PackageBundler} from './build-bundles';
import {buildConfig} from './build-config';
import {getSecondaryEntryPointsForPackage} from './secondary-entry-points';

const red = chalk.red;

const {packagesDir, outputDir} = buildConfig;

/** Name of the tsconfig file that is responsible for building a package. */
const buildTsconfigName = 'tsconfig-build.json';

/** Name of the tsconfig file that is responsible for building the tests. */
const testsTsconfigName = 'tsconfig-tests.json';

/** Incrementing ID counter. */
let nextId = 0;

export class BuildPackage {
  /** Path to the package sources. */
  sourceDir: string;

  /** Path to the package output. */
  outputDir: string;

  /** Whether this package will re-export its secondary-entry points at the root module. */
  exportsSecondaryEntryPointsAtRoot = false;

  /** Path to the entry file of the package in the output directory. */
  readonly entryFilePath: string;

  /** Path to the tsconfig file, which will be used to build the package. */
  private readonly tsconfigBuild: string;

  /** Path to the tsconfig file, which will be used to build the tests. */
  private readonly tsconfigTests: string;

  private _secondaryEntryPoints: string[];
  private _secondaryEntryPointsByDepth: string[][];

  /** Secondary entry-points partitioned by their build depth. */
  private get secondaryEntryPointsByDepth(): string[][] {
    this.cacheSecondaryEntryPoints();
    return this._secondaryEntryPointsByDepth;
  }

  private readonly bundler = new PackageBundler(this);

  /** Secondary entry points for the package. */
  get secondaryEntryPoints(): string[] {
    this.cacheSecondaryEntryPoints();
    return this._secondaryEntryPoints;
  }

  constructor(public readonly name: string, public readonly dependencies: BuildPackage[] = []) {
    this.sourceDir = join(packagesDir, name);
    this.outputDir = join(outputDir, 'packages', name);

    this.tsconfigBuild = join(this.sourceDir, buildTsconfigName);
    this.tsconfigTests = join(this.sourceDir, testsTsconfigName);

    this.entryFilePath = join(this.outputDir, 'index.js');
  }

  /** Compiles the package sources with all secondary entry points. */
  async compile() {
    // Compile all secondary entry-points with the same depth in parallel, and each separate depth
    // group in sequence. This will look something like:
    // Depth 0: coercion, platform, keycodes, bidi
    // Depth 1: a11y, scrolling
    // Depth 2: overlay
    for (const entryPointGroup of this.secondaryEntryPointsByDepth) {
      await Promise.all(entryPointGroup.map(p => this._compileEntryPoint(buildTsconfigName, p)));
    }

    // Compile the primary entry-point.
    await this._compileEntryPoint(buildTsconfigName);
  }

  /** Compiles the TypeScript test source files for the package. */
  async compileTests() {
    await this._compileTestEntryPoint(testsTsconfigName);
  }

  /** Creates all bundles for the package and all associated entry points. */
  async createBundles() {
    await this.bundler.createBundles();
  }

  /** Compiles the TypeScript sources of a primary or secondary entry point. */
  private async _compileEntryPoint(tsconfigName: string, secondaryEntryPoint = '') {
    const entryPointPath = join(this.sourceDir, secondaryEntryPoint);
    const entryPointTsconfigPath = join(entryPointPath, tsconfigName);

    return new Promise((resolve, reject) => {
      const ngcPath = resolvePath('./node_modules/.bin/ngc');
      const childProcess = spawn(ngcPath, ['-p', entryPointTsconfigPath], {shell: true});

      // Pipe stdout and stderr from the child process.
      childProcess.stdout.on('data', (data: any) => console.log(`${data}`));
      childProcess.stderr.on('data', (data: any) => console.error(red(`${data}`)));

      childProcess.on('exit', (exitCode: number) => exitCode === 0 ? resolve() : reject());
    })
    .catch(() => console.error(red(`Failed to compile ${secondaryEntryPoint}`)))
    .then(() => this.renamePrivateReExportsToBeUnique(secondaryEntryPoint));
  }

  /** Compiles the TypeScript sources of a primary or secondary entry point. */
  private async _compileTestEntryPoint(tsconfigName: string, secondaryEntryPoint = '') {
    const entryPointPath = join(this.sourceDir, secondaryEntryPoint);
    const entryPointTsconfigPath = join(entryPointPath, tsconfigName);

    return new Promise((resolve, reject) => {
      const ngcPath = resolvePath('./node_modules/.bin/ngc');
      const childProcess = spawn(ngcPath, ['-p', entryPointTsconfigPath], {shell: true});

      // Pipe stdout and stderr from the child process.
      childProcess.stdout.on('data', (data: any) => console.log(`${data}`));
      childProcess.stderr.on('data', (data: any) => console.error(red(`${data}`)));

      childProcess.on('exit', (exitCode: number) => exitCode === 0 ? resolve() : reject());
    })
    .catch(() => {
      const error = red(`Failed to compile ${secondaryEntryPoint} using ${entryPointTsconfigPath}`);
      console.error(error);
    });
  }

  /** Renames `ɵa`-style re-exports generated by Angular to be unique across compilation units. */
  private renamePrivateReExportsToBeUnique(secondaryEntryPoint = '') {
    // When we compiled the typescript sources with ngc, we do entry-point individually.
    // If the root-level module re-exports multiple of these entry-points, the private-export
    // identifiers (e.g., `ɵa`) generated by ngc will collide. We work around this by suffixing
    // each of these identifiers with an ID specific to this entry point. We make this
    // replacement in the js, d.ts, and metadata output.
    if (this.exportsSecondaryEntryPointsAtRoot && secondaryEntryPoint) {
      const entryPointId = nextId++;
      const outputPath = join(this.outputDir, secondaryEntryPoint);
      glob(join(outputPath, '**/*.+(js|d.ts|metadata.json)')).forEach(filePath => {
        let fileContent = readFileSync(filePath, 'utf-8');
        fileContent = fileContent.replace(/(ɵ[a-z]+)/g, `$1${entryPointId}`);
        writeFileSync(filePath, fileContent, 'utf-8');
      });
    }
  }

  /** Stores the secondary entry-points for this package if they haven't been computed already. */
  private cacheSecondaryEntryPoints() {
    if (!this._secondaryEntryPoints) {
      this._secondaryEntryPointsByDepth = getSecondaryEntryPointsForPackage(this);
      this._secondaryEntryPoints =
        this._secondaryEntryPointsByDepth.reduce((list, p) => list.concat(p), []);
    }
  }
}
