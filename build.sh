# ----------------------------------------------------------------------------
# File: build.sh
#
# Desc: Voodoo project build script.
#
# Usage: build [op]
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
#                  testdebug - Runs tests on the debug build.
#
# Copyright (c) 2014 VoodooJs Authors
# ----------------------------------------------------------------------------

mydir=`dirname $0`

# Default op
op=${1-all}

# Build
sh $mydir/voodoo/build.sh $op
