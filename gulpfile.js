const {src, dest, series, parallel, watch} = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sourcemaps = require('gulp-sourcemaps');

const path = {
    source: {
        html: "app/index.html",
        styles: [
            "app/styles/main.scss",
        ],
        js: [
            "app/js/jquery-3.5.1.min.js",
            "app/js/slick.min.js",
            "app/js/ofi.min.js",
            "app/js/script.js"
        ],
        image: "app/img/**/*",
        fonts: "app/fonts/**/*"
    },
    build: {
        html: "build/",
        css: "build/css/",
        js: "build/js/",
        image: "build/img/",
        fonts: "build/fonts/"
    }
};

const html = () => {
    return src(path.source.html)
        .pipe(dest(path.build.html))
        .pipe(reload({stream: true}));
}

const css = () => {
    return src(path.source.styles)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(dest(path.build.css))
        .pipe(reload({
            stream: true
        }));
}
const cssProd = () => {
    return src(path.source.styles)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(cleanCSS())
        .pipe(dest(path.build.css))
}

const script = () => {
    return src(path.source.js)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(dest(path.build.js))
        .pipe(reload({
            stream: true
        }));
}
const scriptProd = () => {
    return src(path.source.js)
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest(path.build.js))
}

const images = () => {
    return src(path.source.image)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ], {
            verbose: true
        }))
        .pipe(dest(path.build.image));
};

const fonts =() => {
    return src(path.source.fonts)
        .pipe(dest(path.build.fonts));
}

const docs =() => {
    return src('./build/**/*')
        .pipe(dest('./docs'));
} //for gh-pages

const cleanFolder =() => {
    return del(['build/**', 'docs/**']);
};

const browser_Sync = () => {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    });
};

const watcher = () => {
    watch('app/index.html', series(html, docs));
    watch('app/styles/**/*.scss', series(css, docs));
    watch('app/js/*.js', series(script, docs));
};

exports.html = html;
exports.css = css;
exports.script = script;
exports.img = images;
exports.clean = cleanFolder;
exports.docs = docs;
exports.build = series(cleanFolder, parallel(html, css, script, images, fonts), docs);
exports.server = series(series(cleanFolder, parallel(html, css, script, images, fonts), docs), parallel(watcher, browser_Sync));
exports.prod = series(cleanFolder, parallel(html, cssProd, scriptProd, images, fonts), docs);

exports.default = series(
    series(cleanFolder, parallel(html, css, script, images, fonts), docs),
    parallel(watcher, browser_Sync)
);