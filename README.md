Voodoo.js
======

# Introduction

Folder structure:

  * /config - Build settings
  * /samples - Examples
  * /src - Source code
  * /test - Unit tests
  * /tools - Build engine
  
In addition, after building there will be these new folders:

  * /build - Compiled source
  * /docs - Documentation
  * /drop - Zip file for public sharing

# How to Build

Voodoo currently builds on Windows. It would be great if someone ported the build engine to Unix and Python.

## Step 1: Install Python 2.7

  http://www.python.org/download/
  
## Step 2: Install Closure Linter

  https://developers.google.com/closure/utilities/docs/linter_howto

## Step 3: Install 7zip

  http://www.7-zip.org/
  
## Step 4: Install Java 1.7 Runtime

  http://www.java.com/en/

## Step 4: Update tools\user.cmd

  Update this script with paths to your installations and browsers to test.

## Step 5: Build

  Run build.cmd in the root folder.
