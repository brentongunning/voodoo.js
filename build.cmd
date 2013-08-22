:: ----------------------------------------------------------------------------
:: File: build.cmd
::
:: Desc: Voodoo project build script.
::
:: Usage: build [op]
::    op        Op must be one of the following values:
::                  all       - Compiles source and docs, tests, and drops.
::                              Equivalent to source|docs|test|drop.
::                  clean     - Deletes all builds and documentation
::                  debug     - Create internal debug build.
::                  docs      - Builds user and dev docs.
::                  drop      - Creates zip drop for project.
::                  min       - Create minified released build.
::                  min.debug - Create minified release debug build.
::                  source    - Compiles source for all builds.
::                              Equivalent to debug|min|min.debug.
::                  test      - Runs tests
::                  testdebug - Runs tests on the debug build.
::
:: Copyright (c) 2013 VoodooJs Authors
:: ----------------------------------------------------------------------------

@echo off

:: Default op
set op=%~1
if "%op%"=="" set op=all

:: Version
set version=0.8.6
set project=voodoo

:: Build
call "%~dp0tools\build" "%op%" "%project%" "%version%"