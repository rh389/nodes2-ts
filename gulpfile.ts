import * as gulp from "gulp";
import {Gulpclass, Task,SequenceTask} from "gulpclass/Decorators";
const mocha = require('gulp-spawn-mocha');
const watch = require('gulp-watch');
gulp.task('test', () => {
  return gulp.src(['test/*.test.ts'])
      .pipe(mocha());
});

gulp.task('wtest',  () => {
  gulp.watch('{src,test}/*.ts', ['test']);
});