'use strict'

const { series, parallel, task, src, dest, watch } = require('gulp')
const webp = require('gulp-webp')
const imagemin = require('gulp-imagemin')
const pngquant = require('imagemin-pngquant')
const mozjpeg = require('imagemin-mozjpeg')
const sourcemaps = require('gulp-sourcemaps')
const eslint = require('gulp-eslint')
const postcss = require('gulp-postcss')
const frontMatter = require('gulp-front-matter')
const filter = require('gulp-filter')
const gulpIf = require('gulp-if')
const inlineSource = require('gulp-inline-source')
const cached = require('gulp-cached')
const uglifyes = require('uglify-es')
const composer = require('gulp-uglify/composer')
const minify = composer(uglifyes, console)
const plumber = require('gulp-plumber')

const isProduction = process.env.NODE_ENV === 'production'

task('build:css', () => {
  return src('src/assets/css/**/*.css')
    .pipe(plumber())
    .pipe(postcss({ modules: true }))
    .pipe(filter(['**', '!**/_*.css']))
    .pipe(dest('docs/assets/css'))
})

task('build:js', () => {
  return src('src/sw.js')
    .pipe(plumber())
    .pipe(gulpIf(!isProduction, sourcemaps.init()))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(minify())
    .pipe(gulpIf(!isProduction, sourcemaps.write()))
    .pipe(dest('docs'))
})

task('build:image', () => {
  return src([
    'src/+(assets)/**/*.+(png|jpg|svg)',
    'src/html/**/*.+(png|jpg|svg)'
  ])
    .pipe(
      imagemin([
        pngquant({ quality: '70-80', speed: 1 }),
        mozjpeg({ quality: 70, progressive: true }),
        imagemin.svgo(),
        imagemin.optipng()
      ])
    )
    .pipe(dest('docs'))
    .pipe(filter(['**', '!**/*.svg']))
    .pipe(webp())
    .pipe(dest('docs'))
})

task('build:html', () => {
  return src('src/htdocs/**/*')
    .pipe(
      frontMatter({
        property: 'frontMatter'
      }).on('data', file => {
        Object.assign(file, file.frontMatter)
        delete file.frontMatter
      })
    )
    .pipe(require('./build/metalsmith')())
    .pipe(inlineSource({ rootpath: 'docs' }))
    .pipe(dest('docs'))
})

task('copy', () => {
  return src([
    'src/+(assets)/**/*.+(txt|xml|json)',
    'src/*.+(html|txt|xml|json)',
    'src/README.md'
  ]).pipe(dest('docs'))
})

task(
  'watch',
  series(task('build:css'), () => {
    watch('src/htdocs/**/*', task('build:html'))
    watch('src/layouts/**/*', task('build:html'))
    watch('src/assets/css/**/*.css', task('build:css'))
    watch('src/sw.js', task('build:js'))
  })
)

task(
  'build',
  series(
    parallel('build:image', 'copy', 'build:css', 'build:js'),
    task('build:html')
  )
)

task('default', task('build'))
