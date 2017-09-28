import {join, dirname} from 'path';
import {ScriptTarget, ModuleKind, NewLineKind} from 'typescript';
import {uglifyJsFile} from './minify-sources';
import {remapSourcemap} from './sourcemap-remap';
import {transpileFile} from './typescript-transpile';
import {buildConfig} from './build-config';
import {BuildPackage} from './build-package';
import {rollupRemoveLicensesPlugin} from './rollup-remove-licenses';
import {rollupGlobals} from './rollup-globals';

// There are no type definitions available for these imports.
const rollup = require('rollup');
const rollupNodeResolutionPlugin = require('rollup-plugin-node-resolve');
const sorcery = require('sorcery');
const rollupAlias = require('rollup-plugin-alias');

/** Directory where all bundles will be created in. */
const bundlesDir = join(buildConfig.outputDir, 'bundles');

/** Utility for creating bundles from raw ngc output. */
export class PackageBundler {
  constructor(private buildPackage: BuildPackage) {}

  /** Creates all bundles for the package and all associated entry points (UMD, ES5, ES2015). */
  async createBundles() {
    for (const entryPoint of this.buildPackage.secondaryEntryPoints) {
      await this.bundleSecondaryEntryPoint(entryPoint);
    }

    await this.bundlePrimaryEntryPoint();
  }

  /** Bundles the primary entry-point w/ given entry file, e.g. @angular/cdk */
  private async bundlePrimaryEntryPoint() {
    const packageName = this.buildPackage.name;

    return this.bundleEntryPoint({
      entryFile: this.buildPackage.entryFilePath,
      moduleName: `ng.${this.buildPackage.name}`,
      esm2015Dest: join(bundlesDir, `${packageName}.js`),
      esm5Dest: join(bundlesDir, `${packageName}.es5.js`),
      umdDest: join(bundlesDir, `${packageName}.umd.js`),
      umdMinDest: join(bundlesDir, `${packageName}.umd.min.js`),
    });
  }

  /** Bundles a single secondary entry-point w/ given entry file, e.g. @angular/cdk/a11y */
  private async bundleSecondaryEntryPoint(entryPoint: string) {
    const packageName = this.buildPackage.name;
    const entryFile = join(this.buildPackage.outputDir, entryPoint, 'index.js');

    return this.bundleEntryPoint({
      entryFile,
      moduleName: `ng.${packageName}.${entryPoint}`,
      esm2015Dest: join(bundlesDir, `${packageName}`, `${entryPoint}.js`),
      esm5Dest: join(bundlesDir, `${packageName}`, `${entryPoint}.es5.js`),
      umdDest: join(bundlesDir, `${packageName}-${entryPoint}.umd.js`),
      umdMinDest: join(bundlesDir, `${packageName}-${entryPoint}.umd.min.js`),
    });
  }

  /**
   * Creates the ES5, ES2015, and UMD bundles for the specified entry-point.
   * @param config Configuration that specifies the entry-point, module name, and output
   *     bundle paths.
   */
  private async bundleEntryPoint(config: BundlesConfig) {
    // Build FESM-2015 bundle file.
    await this.createRollupBundle({
      name: config.moduleName,
      input: config.entryFile,
      file: config.esm2015Dest,
      format: 'es',
    });

    await remapSourcemap(config.esm2015Dest);

    // Downlevel ES2015 bundle to ES5.
    transpileFile(config.esm2015Dest, config.esm5Dest, {
      importHelpers: true,
      target: ScriptTarget.ES5,
      module: ModuleKind.ES2015,
      allowJs: true,
      newLine: NewLineKind.LineFeed
    });

    await remapSourcemap(config.esm5Dest);

    // Create UMD bundle of ES5 output.
    await this.createRollupBundle({
      name: config.moduleName,
      input: config.esm5Dest,
      file: config.umdDest,
      format: 'umd'
    });

    await remapSourcemap(config.umdDest);

    // Create a minified UMD bundle using UglifyJS
    uglifyJsFile(config.umdDest, config.umdMinDest);

    await remapSourcemap(config.umdMinDest);
  }

  /** Creates a rollup bundle of a specified JavaScript file.*/
  private async createRollupBundle(config: RollupBundleConfig) {
    const bundleOptions = {
      context: 'this',
      external: Object.keys(rollupGlobals),
      input: config.input,
      onwarn: (message: string) => {
        // TODO(jelbourn): figure out *why* rollup warns about certain symbols not being found
        // when those symbols don't appear to be in the input file in the first place.
        if (/but never used/.test(message)) {
          return false;
        }

        console.warn(message);
      },
      plugins: [
        rollupRemoveLicensesPlugin,
      ]
    };

    const writeOptions = {
      // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
      moduleId: '',
      name: config.name || 'm2e',
      banner: buildConfig.licenseBanner,
      format: config.format,
      file: config.file,
      globals: rollupGlobals,
      sourcemap: true
    };

    // For UMD bundles, we need to adjust the `external` bundle option in order to include
    // all necessary code in the bundle.
    if (config.format === 'umd') {
      bundleOptions.plugins.push(rollupNodeResolutionPlugin());

      // For all UMD bundles, we want to exclude tslib from the `external` bundle option so that
      // it is inlined into the bundle.
      let external = Object.keys(rollupGlobals);
      external.splice(external.indexOf('tslib'), 1);

      // If each secondary entry-point is re-exported at the root, we want to exlclude those
      // secondary entry-points from the rollup globals because we want the UMD for this package
      // to include *all* of the sources for those entry-points.
      if (this.buildPackage.exportsSecondaryEntryPointsAtRoot) {
        const importRegex = new RegExp(`@angular/${this.buildPackage.name}/.+`);
        external = external.filter(e => !importRegex.test(e));

        // Use the rollup-alias plugin to map imports of the form `@angular/material/button`
        // to the actual file location so that rollup can resolve the imports (otherwise they
        // will be treated as external dependencies and not included in the bundle).
        bundleOptions.plugins.push(
            rollupAlias(this.getResolvedSecondaryEntryPointImportPaths(config.file)));
      }

      bundleOptions.external = external;
    }

    return rollup.rollup(bundleOptions).then((bundle: any) => bundle.write(writeOptions));
  }

  /**
   * Gets mapping of import aliases (e.g. `@angular/material/button`) to the path of the es5
   * bundle output.
   * @param bundleOutputDir Path to the bundle output directory.
   * @returns Map of alias to resolved path.
   */
  private getResolvedSecondaryEntryPointImportPaths(bundleOutputDir: string) {
    return this.buildPackage.secondaryEntryPoints.reduce((map, p) => {
      map[`@angular/${this.buildPackage.name}/${p}`] =
          join(dirname(bundleOutputDir), this.buildPackage.name, `${p}.es5.js`);
      return map;
    }, {} as {[key: string]: string});
  }
}


/** Configuration for creating library bundles. */
interface BundlesConfig {
  entryFile: string;
  moduleName: string;
  esm2015Dest: string;
  esm5Dest: string;
  umdDest: string;
  umdMinDest: string;
}

/** Configuration for creating a bundle via rollup. */
interface RollupBundleConfig {
  input: string;
  file: string;
  format: string;
  name: string;
}
