const gulp = require('gulp');
const batch = require('gulp-batch');
const concat = require('gulp-concat');
const cssClean = require('gulp-clean-css');
const font2css = require('gulp-font2css').default;
const imageMin = require('gulp-imagemin');
const minify = require('gulp-minify');
const mocha = require('gulp-mocha');
const sass = require('gulp-sass');

gulp.task('files', () => {
    gulp.src('static/documents/**/*.pdf')
        .pipe(gulp.dest('public/documents'));
});

gulp.task('fonts', () => {
    gulp.src('static/fonts/**/*.{otf,ttf,TTF,woff,woff2}')
          .pipe(font2css())
          .pipe(concat('fonts.css'))
          .pipe(gulp.dest('public/'));
});

gulp.task('images', () => {
    gulp.src('./static/images/**/*.{jpg,gif,png}')
        .pipe(imageMin({
            progressive: true,
            verbose: true,
        }))
        .pipe(gulp.dest('./public/images'));
});

gulp.task('images:watch', () => {
    gulp.watch('./static/images/**/*', ['images']);
});

gulp.task('styles', () => {
    gulp.src('./static/styles/**/*.{scss,css}')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(cssClean())
        .pipe(gulp.dest('./public'));
});

gulp.task('styles:watch', () => {
    gulp.watch('./static/styles/**/*.scss', ['styles']);
});

gulp.task('scripts', () => {
    gulp.src('./static/js/**/*.js')
        .pipe(concat('script.js'))
        .pipe(minify())
        .pipe(gulp.dest('./public'));
});

gulp.task('scripts:watch', () => {
    gulp.watch('./static/js/**/*.js', ['scripts']);
});

gulp.task('tests:watch', () => {
    gulp.watch(['./test/**', './src/**'], batch(function(events, cb) {
        return gulp.src(['./test/**/*.test.js'])
            .pipe(mocha({ reporter: 'nyan' })
        );
    }));
});


gulp.task('default',
    ['images', 'styles', 'scripts', 'styles:watch',
    'scripts:watch', 'tests:watch', 'images:watch']);

gulp.task('build', ['fonts', 'styles', 'scripts', 'images', 'files']);
