import {readFileSync, writeFileSync} from 'fs';
import {basename} from 'path';

// There are no type definitions available for these imports.
const uglify = require('uglify-js');

/** Minifies a JavaScript file by using UglifyJS2. Also writes sourcemaps to the output. */
export function uglifyJsFile(inputPath: string, outputPath: string) {
  const sourcemapOut = `${outputPath}.map`;
  const inputFile = readFileSync(inputPath).toString();
  const sourceFilename = basename(inputPath);
  const filename = basename(outputPath);
  const sourcemapUrl = basename(sourcemapOut);
  let contents: any = {};
  contents[sourceFilename] = inputFile;
  const result = uglify.minify(contents, {
    sourceMap: {
      filename: filename,
      url: sourcemapUrl
    },
    output: {
      comments: 'some'
    }
  });

  writeFileSync(outputPath, result.code);
  writeFileSync(sourcemapOut, result.map);
}
