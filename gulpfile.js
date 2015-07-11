var gulp = require('gulp'),
	bs = require('browser-sync').create(),
	bg = require("gulp-bg"),
	ps = require('ps-node');
var git = require('gulp-git');
var bump = require('gulp-bump');
var tag_version = require('gulp-tag-version');
var filter = require('gulp-filter');

var POLYSERVE_PORT = 8080,
    elementName = 'wid-toolbar-menu';

var browserSyncConfig = function(path, cb) {
  bs.init({
    proxy: 'localhost:' + POLYSERVE_PORT,
    startPath: path
  });

  bs.reload;

  process.on('exit', function() {
    bs.exit();
  });
};

var watchComponent = function() {
  gulp.watch(['./*.html', 'demo/**/*.html', 'test/**/*.html'], bs.reload);
};

gulp.task('polyserve', function(cb) {
  ps.lookup({
    command: 'polyserve',
    psargs: '-f'
  }, function(err, resultList) {
    if (err) {
      throw new Error(err);
    }
 
    if (!resultList.length) {
      bg('./node_modules/polyserve/bin/polyserve', '-p ' + POLYSERVE_PORT)();
    }
    cb();
  }); 
});
	
gulp.task('serve', ['polyserve'], function(cb) {
  browserSyncConfig('/components/' + elementName + '/demo/', cb);
  watchComponent();
});

gulp.task('serve:doc', ['polyserve'], function(cb) {
  browserSyncConfig('/components/' + elementName + '/', cb);
  watchComponent();
});

gulp.task('test:watch', ['polyserve'], function(cb) {
  browserSyncConfig('/components/' + elementName + '/test/', cb);
  watchComponent();
});

try { require('web-component-tester').gulp.init(gulp); } catch (err) {}

function inc(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json', './bower.json'])
    // bump the version number in those files
    .pipe(bump({type: importance}))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    .pipe(git.commit('bumps package version'))
    // read only one file to get the version number 
    .pipe(filter('bower.json'))
    // **tag it in the repository**
    .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); });
gulp.task('feature', function() { return inc('minor'); });
gulp.task('release', function() { return inc('major'); });