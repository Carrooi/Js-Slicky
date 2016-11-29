var gulp = require('gulp');
var gutil = require('gulp-util');
var ts = require('gulp-typescript');
var merge = require('merge2');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

var webpack = require('webpack');


gulp.task('build:source', function() {
	var project = ts.createProject('./tsconfig.json');

	var result = project.src()
		.pipe(project());

	return merge([
		result.dts.pipe(gulp.dest('.')),
		result.js.pipe(gulp.dest('.'))
	]);
});


gulp.task('build:tests', function(done) {
	var webpackConfig = require('./tests/webpack.config');

	webpack(webpackConfig, function(err, stats) {
		if(err) {
			throw new gutil.PluginError('webpack', err);
		}

		gutil.log('[webpack]', stats.toString({
			colors: true
		}));

		done();
	});
});


gulp.task('tests', function () {
	return gulp
		.src('./tests/index.html')
		.pipe(mochaPhantomJS());
});
