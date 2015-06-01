# ----------------------------------------------------------------------------
# File: build.sh
#
# Desc: A general build engine. This script is capable of compiling source
#       and documentation, cleaning drop folders, and running tests.
#
# Usage: build [op] [project] [version] [optlevel]
#    op        Op must be one of the following values:
#                  all       - Compiles source and docs, tests, and drops.
#                              Equivalent to source|docs|test|drop.
#                  clean     - Deletes all builds and documentation
#                  debug     - Create internal debug build.
#                  docs      - Builds user and dev docs.
#                  drop      - Creates zip drop for project.
#                  min       - Create minified released build.
#                  min.debug - Create minified release debug build.
#                  source    - Compiles source for all builds.
#                              Equivalent to debug|min|min.debug.
#                  test      - Runs tests
#                  testdebug - Runs tests on the debug build
#    project   Name of the project to build.
#    version   Version of the project to build.
#    optlevel  Closure compiler max optimization level. Either:
#                  WHITESPACE_ONLY
#                  SIMPLE_OPTIMIZATIONS
#                  ADVANCED_OPTIMIZATIONS
#
# Copyright (c) 2014 VoodooJs Authors
# ----------------------------------------------------------------------------

set -u
set -e

mydir=`dirname $0`

function error_exit() {
  echo "[Error] $1" 1>&2
  trap '' EXIT
  exit 1
}

trap '[ "$?" -eq 0 ] || error_exit "There was an error in the last command"' EXIT

function append() {
  if [ -f "$1" ]; then
    echo [Build]    Appending $1
    cat "$1" >> "$2"
  fi
}

function compile() {
  compiletype=$1
  outfile=$2
  optimizations=$3
  compiledebug=$4
  externs_dir=$root/externs
  externs=
  for filename in $externs_dir/*.js; do
    # Only include externs that are not this project
    file=`echo $(basename $filename) | cut -f1 -d'.'`
    if [ ! "$file" = "$project" ]; then
      externs="$externs --externs $filename"
    fi
  done
  echo [Build] Compiling $compiletype build
  java -jar "$root/compiler-latest/compiler.jar" \
    --compilation_level "$optimizations" \
    --js_output_file "$outfile" \
    --warning_level VERBOSE \
    --js "$build_merged" \
    $externs \
    --define="'DEBUG='$compiledebug''" \
    --define="'VERSION='$version.$compiletype''" \
    --define="'NAMESPACE='$namespace''" \
    --language_in=ECMASCRIPT5_STRICT
  echo
}

# Check for correct number of arguments
[ "$#" -eq 5 ] || error_exit "Invalid number of arguments"

# Get arguments
op=$1
project=$2
namespace=$3
version=$4
optlevel=$5

echo ------------------------------------------------------------
echo Building $project
echo ------------------------------------------------------------
echo

# Create locations from project argument
root=$mydir
project_root=$root/../$project
project_src=$root/../$project/src
project_test=$root/../$project/test
project_lib=$root/../$project/lib
project_build=$root/../$project/build
project_config=$root/../$project/config
project_docs=$root/../$project/docs
project_docs_user=$root/../$project/docs/user
project_docs_dev=$root/../$project/docs/dev
project_docs_test=$root/../$project/docs/test
drop=$root/../drop
drop_staging=$drop/staging

# Create build filenames
build_merged=$project_build/$project-$version.merged.js
build_debug=$project_build/$project-$version.debug.js
build_min=$project_build/$project-$version.min.js
build_mindebug=$project_build/$project-$version.min.debug.js

# Validate op argument
[ "$op" = "all" ] || \
[ "$op" = "clean" ] || \
[ "$op" = "debug" ] || \
[ "$op" = "docs" ] || \
[ "$op" = "drop" ] || \
[ "$op" = "min" ] || \
[ "$op" = "min.debug" ] || \
[ "$op" = "source" ] || \
[ "$op" = "test" ] || \
[ "$op" = "testdebug" ] || \
error_exit "Invalid operation $op. See build.sh for usage."

# Validate project location
[ -d "$project_root" ] || error_exit "Project $project_root does not exist. See build.sh for usage."

# Lint
if [ "$op" = "all" ] || \
   [ "$op" = "debug" ] || \
   [ "$op" = "min" ] || \
   [ "$op" = "min.debug" ] || \
   [ "$op" = "source" ]; then
  lint=1
else
  lint=0
fi
if [ "$lint" = 1 ]; then
  echo [Build] Running linter on source code
  gjslint --strict --custom_jsdoc_tags ignore,function --jsdoc --recurse "$project_src"
  echo
  echo [Build] Running linter on test code
  gjslint --strict --custom_jsdoc_tags ignore,function --jsdoc --recurse "$project_test"
  echo
fi

# Merge
header=$root/config/MergedSourceHeader.js
footer=$root/config/MergedSourceFooter.js
if [ "$op" = "all" ] || \
   [ "$op" = "debug" ] || \
   [ "$op" = "min" ] || \
   [ "$op" = "min.debug" ] || \
   [ "$op" = "source" ]; then
  merge=1
else
  merge=0
fi
if [ "$merge" -eq 1 ]; then
  echo [Build] Merging sources
  rm -rf "$project_build"
  mkdir "$project_build"
  append "$header" "$build_merged"
  cat "$project_config/sources.txt" | while read in; do append "$project_src/$in" "$build_merged"; done
  append "$footer" "$build_merged"
  echo
fi

# Compile
if [ "$op" = "all" ] || \
   [ "$op" = "source" ] || \
   [ "$op" = "debug" ] || \
   [ "$op" = "min" ] || \
   [ "$op" = "min.debug" ]; then
  copy_libs=1
else
  copy_libs=0
fi
if [ "$op" = "all" ] || \
   [ "$op" = "source" ] || \
   [ "$op" = "debug" ]; then
  compile_debug=1
else
  compile_debug=0
fi
if [ "$op" = "all" ] || \
   [ "$op" = "source" ] || \
   [ "$op" = "min" ]; then
  compile_min=1
else
  compile_min=0
fi
if [ "$op" = "all" ] || \
   [ "$op" = "source" ] || \
   [ "$op" = "min.debug" ]; then
  compile_mindebug=1
else
  compile_mindebug=0
fi
if [ "$optlevel" = "WHITESPACE_ONLY" ]; then
  debug_optlevel=WHITESPACE_ONLY
  min_optlevel=WHITESPACE_ONLY
  mindebug_optlevel=WHITESPACE_ONLY
elif [ "$optlevel" = "SIMPLE_OPTIMIZATIONS" ]; then
  debug_optlevel=SIMPLE_OPTIMIZATIONS
  min_optlevel=SIMPLE_OPTIMIZATIONS
  mindebug_optlevel=SIMPLE_OPTIMIZATIONS
elif [ "$optlevel" = "ADVANCED_OPTIMIZATIONS" ]; then
  debug_optlevel=SIMPLE_OPTIMIZATIONS
  min_optlevel=ADVANCED_OPTIMIZATIONS
  mindebug_optlevel=ADVANCED_OPTIMIZATIONS
else
  error_exit "Unrecognized closure compiler optimization level: $optlevel"
fi
[ "$compile_debug" -ne 1 ] || compile "debug" "$build_debug" "$debug_optlevel" true
[ "$compile_min" -ne 1 ] || compile "min" "$build_min" "$min_optlevel" false
[ "$compile_mindebug" -ne 1 ] || compile "min.debug" "$build_mindebug" "$mindebug_optlevel" true
if [ "$copy_libs" -eq 1 ]; then
  echo [Build] Copying dependencies
  sh "$project_config/lib.sh"
  echo
fi

# Generate documentation
jsdoc=$root/jsdoc-master/jsdoc
user_cfg=$root/config/jsdoc-public-conf.json
user_readme=$project_config/docs-user-readme.md
dev_readme=$project_config/docs-dev-readme.md
test_readme=$project_config/docs-test-readme.md
if [ "$op" = "all" ] || \
   [ "$op" = "docs" ]; then
  generate_documentation=1
else
  generate_documentation=0
fi
if [ $generate_documentation -eq 1 ]; then
  echo [Build] Generating documentation
  rm -rf "$project_docs_user"
  rm -rf "$project_docs_dev"
  rm -rf "$project_docs_test"
  mkdir "$project_docs" || true
  mkdir "$project_docs_user" || true
  mkdir "$project_docs_dev" || true
  mkdir "$project_docs_test" || true
  sh $jsdoc --destination "$project_docs_user" --recurse "$project_src" --template templates/voodoo --configure "$user_cfg" "$user_readme"
  sh $jsdoc --destination "$project_docs_dev" --private --recurse "$project_src" --template templates/voodoo "$dev_readme"
  sh $jsdoc --destination "$project_docs_test" --private --recurse "$project_test" --template templates/voodoo "$test_readme"
fi

# Drop
if [ "$op" = "all" ] || \
   [ "$op" = "drop" ]; then
  dropping=1
else
  dropping=0
fi
drop_filename=$project-$version.zip
drop_file=$drop/$drop_filename
if [ $dropping -eq 1 ]; then
  echo [Build] Dropping
  rm -rf "$drop_staging"
  rm -rf "$drop_file"
  mkdir "$drop" || true
  mkdir "$drop_staging" || true
  mkdir "$drop_staging/build" || true
  mkdir "$drop_staging/docs" || true
  mkdir "$drop_staging/samples" || true
  mkdir "$drop_staging/lib" || true

  cp "$build_min" "$drop_staging/build"
  cp "$build_mindebug" "$drop_staging/build"
  cp "$root/externs/$project.js" "$drop_staging/build/$project-$version.externs.js"
  cp -r "$project_docs_user/." "$drop_staging/docs"
  cp -r "$project_root/samples/." "$drop_staging/samples"
  cp -r "$project_root/lib/." "$drop_staging/lib"
  cp "$project_config/README" "$drop_staging"
  cp "$project_config/LICENSE" "$drop_staging"

  (cd "$drop_staging" && zip -r "../$drop_filename" .)
  rm -rf "$drop_staging"
  echo
fi

# Clean
rm -rf "$build_merged"
if [ "$op" = "clean" ]; then
  echo [Build] Cleaning
  rm -rf "$project_build"
  rm -rf "$project_docs"
  rm -rf "$project_lib"
  rm -rf "$drop"
  echo
fi

# Test
if [ "$op" = "all" ] || \
   [ "$op" = "test" ] || \
   [ "$op" = "testdebug" ]; then
  test=1
else
  test=0
fi
port=46576
server=http://localhost:46576
#browsersToTest="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
browsersToTest="/Applications/Safari.app/Contents/MacOS/Safari"
if [ "$op" = "testdebug" ]; then
  testconf=$project_config/jsTestDriver-debug.conf
  captureConsole=--captureConsole
else
  testconf=$project_config/jsTestDriver.conf
  captureConsole=
fi
if [ $test -eq 1 ]; then
  echo [Build] Testing
  # This is not working yet...
  #java -jar "$root/js-test-driver/JsTestDriver.jar" \
  #  --port "$port" \
  #  %captureConsole% \
  #  --config "$testconf" \
  #  --browser "$browsersToTest" \
  #  --preloadFiles \
  #  --reset \
  #  --server "$server" \
  #  --tests all \
  #  --verbose \
  #  --raiseOnFailure true \
  echo
fi

# Success
echo [Build] Build succeeded
