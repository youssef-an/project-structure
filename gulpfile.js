// Gulp loader
const { src, dest, task, watch, series, parallel } = require("gulp");

// Dependencies
// --------------------------------------------
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const plumber = require("gulp-plumber");
const pug = require("gulp-pug");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");

// --------------------------------
// Project Variables
const PATHS = {
  pug: ["src/*.pug", "build/"],
  js: ["src/js/*.js", "build/js/"],
  jsVendors: ["src/js/vendors/*.js", "build/js/"],
  sass: ["src/sass/**/*.scss", "build/css/"],
  imgs: ["src/images/*", "build/img/"]
};

// --------------------------------
// Compile pug to html
const compilePug = function(cb) {
  src(PATHS["pug"][0])
    .pipe(plumber())
    .pipe(pug())
    .pipe(dest(PATHS["pug"][1]));

  cb();
};

// --------------------------------
// Compile Sass/Scss to css
const compileSass = function(cb) {
  src(PATHS["sass"][0])
    .pipe(plumber())
    .pipe(
      sass({
        style: "compressed"
      })
    )
    .pipe(
      rename({
        basename: "main",
        suffix: ".min"
      })
    )
    .pipe(dest(PATHS["sass"][1]));

  cb();
};

// --------------------------------
// Minimize .js files
const minifyJs = function(cb) {
  src(PATHS["js"][0])
    .pipe(plumber())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(dest(PATHS["js"][1]));

  cb();
};

// --------------------------------
// Concat vendors into 1file
const concatVendors = function(cb) {
  src(PATHS["jsVendors"][0])
    .pipe(plumber())
    .pipe(concat("vendors.min.js"))
    .pipe(uglify())
    .pipe(dest(PATHS["jsVendors"][1]));

  cb();
};

// --------------------------------
// Minimize images
const minifyImgs = function(cb) {
  src(PATHS["imgs"][0])
    .pipe(imagemin())
    .pipe(dest(PATHS["imgs"][1]));

  cb();
};

// --------------------------------
// watch changes and reload server
const WatchForChanges = function(cb) {
  // Launch Server
  browserSync.init({
    server: {
      baseDir: "./build",
      port: 5000
    },
    notify: false
  });

  // Launch tasks on file change
  watch(PATHS["pug"][0], series(compilePug));
  watch(PATHS["sass"][0], series(compileSass));
  watch(PATHS["js"][0], series(minifyJs));
  watch(PATHS["jsVendors"][0], series(concatVendors));

  // Reload Server On File Change
  watch([
    PATHS["pug"][1],
    PATHS["sass"][1],
    PATHS["js"][1],
    PATHS["jsVendors"][1]
  ]).on("change", browserSync.reload);

  cb();
};

const build = parallel(WatchForChanges);
task("default", build);
task("images", minifyImgs);
