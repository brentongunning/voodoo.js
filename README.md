Voodoo.js
======

Voodoo is a Javascript framework for creating 3D WebGL controls that integrate seamlessly with 2D HTML.

## Introduction

Folder structure:

  * /voodoo - Voodoo project
  * /tools - Build engine

Within the voodoo project folder:

  * /config - Build settings
  * /samples - Examples
  * /src - Source code
  * /test - Unit tests

In addition, after building there will be these new folders:

  * /drop - Zip files for public sharing
  * /voodoo/build - Compiled Voodoo source
  * /voodoo/docs - Voodoo documentation
  * /voodoo/lib - Voodoo dependencies

### How to Build

Voodoo builds on Windows, Mac, and Linux.

#### Step 1: Install Python 2.7

  http://www.python.org/download/
  
#### Step 2: Install Closure Linter

  https://developers.google.com/closure/utilities/docs/linter_howto

#### Step 3: Install 7zip (Windows) or Zip (Mac/Linux)

  http://www.7-zip.org/
  
#### Step 4: Install Java 1.7 Runtime

  http://www.java.com/en/

#### Step 5: Update tools\user.cmd (Windows)

  Update this script with paths to your installations and browsers to test.

#### Step 6: Build

  Run build.cmd (Windows) or build.sh (Mac/Linux) in the root folder.

## License
  
This software is released under the MIT License. (http://opensource.org/licenses/MIT)
