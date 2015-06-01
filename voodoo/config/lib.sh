# ----------------------------------------------------------------------------
# File: lib.sh
#
# Desc: Copies project dependencies into the lib folder.
#
# Copyright (c) 2014 VoodooJs Authors
# ----------------------------------------------------------------------------

mydir=`dirname $0`

rm -rf $mydir/../lib/*.*
mkdir $mydir/../lib

cp $mydir/../../tools/lib/three.min.js $mydir/../lib
cp $mydir/../build/voodoo-*.min.debug.js $mydir/../lib/voodoo.min.debug.js

cp $mydir/../build/voodoo-*.min.js $mydir/../../tools/lib/voodoo.min.js
