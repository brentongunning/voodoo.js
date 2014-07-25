:: ------------------------------------------------------------------------------------------------
:: File: build.cmd
::
:: Desc: A general build engine. This script is capable of compiling source and documentation,
::       cleaning drop folders, and running tests.
::
:: Usage: build [op] [project] [version] [optlevel]
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
::                  testdebug - Runs tests on the debug build
::    project   Name of the project to build.
::    version   Version of the project to build.
::    optlevel  Closure compiler max optimization level. Either:
::                  WHITESPACE_ONLY
::                  SIMPLE_OPTIMIZATIONS
::                  ADVANCED_OPTIMIZATIONS
::
:: Copyright (c) 2014 VoodooJs Authors
:: ------------------------------------------------------------------------------------------------

@echo off

:: GLOBALS
set max_line_length=100

:: Load system paths
call %~dp0user

:: Check for correct number of arguments
set invalidNumberOfArguments=0
if "%5"=="" (
  set invalidNumberOfArguments=1
)
if not "%5"=="" (
if not "%6"=="" (
  set invalidNumberOfArguments=1
))
if %invalidNumberOfArguments%==1 (
    call :error "Invalid number of arguments. See build.cmd for usage."
)

:: Get arguments
set op=%~1
set project=%~2
set namespace=%~3
set version=%~4
set optlevel=%~5

echo ------------------------------------------------------------
echo Building %project%
echo ------------------------------------------------------------
echo.

:: Create locations from project argument
set root=%~dp0
set project_root=%root%..\%project%
set project_src=%project_root%\src
set project_test=%project_root%\test
set project_lib=%project_root%\lib
set project_build=%project_root%\build
set project_config=%project_root%\config
set project_docs=%project_root%\docs
set project_docs_user=%project_docs%\user
set project_docs_dev=%project_docs%\dev
set project_docs_test=%project_docs%\test
set drop=%root%..\drop
set drop_staging=%root%..\drop\staging

:: Create build filenames
set build_merged=%project_build%\%project%-%version%.merged.js
set build_debug=%project_build%\%project%-%version%.debug.js
set build_min=%project_build%\%project%-%version%.min.js
set build_mindebug=%project_build%\%project%-%version%.min.debug.js

:: Validate op argument
if not "%op%"=="all" (
if not "%op%"=="clean" (
if not "%op%"=="debug" (
if not "%op%"=="docs" (
if not "%op%"=="drop" (
if not "%op%"=="min" (
if not "%op%"=="min.debug" (
if not "%op%"=="source" (
if not "%op%"=="test" (
if not "%op%"=="testdebug" (
  call :error "Invalid operation: %op%. See build.cmd for usage."
))))))))))

:: Validate project location
if not exist "%project_root%" (
  call :error "Project %project_root% does not exist. See build.cmd for usage."
)

:: Lint
set lint=0
if "%op%"=="all" set lint=1
if "%op%"=="debug" set lint=1
if "%op%"=="min" set lint=1
if "%op%"=="min.debug" set lint=1
if "%op%"=="source" set lint=1
if %lint%==1 (
  echo [Build] Running Linter on Source Code
  %gjslint% --strict --max_line_length %max_line_length% --custom_jsdoc_tags ignore,function --jsdoc --recurse "%project_src%"
  echo.
  if errorlevel 1 call :error "Linting failed"
  echo [Build] Running Linter on Test Code
  %gjslint% --strict --custom_jsdoc_tags ignore,function --jsdoc --recurse "%project_test%"
  echo.
  if errorlevel 1 call :error "Linting failed"
)

:: Merge
set header=%root%config\MergedSourceHeader.js
set footer=%root%config\MergedSourceFooter.js
set merge=0
if "%op%"=="all" set merge=1
if "%op%"=="debug" set merge=1
if "%op%"=="min" set merge=1
if "%op%"=="min.debug" set merge=1
if "%op%"=="source" set merge=1
if %merge%==1 (
  echo [Build] Merging sources
  call :delete "%build_merged%"
  call :mkdir "%project_build%"
  call :append "%header%" "%build_merged%"
  for /f "usebackq delims=*" %%A in ("%project_config%\sources.txt") do (
    call :append "%project_src%\%%A" "%build_merged%"
  )
  call :append "%footer%" "%build_merged%"
  echo.
  if errorlevel 1 (
    call :error "Merging failed"
  )
)

:: Compile
set copy_libs=0
set compile_debug=0
set compile_min=0
set compile_mindebug=0
set debug_optlevel=0
set min_optlevel=0
set mindebug_optlevel=0
if "%op%"=="all" (
  set compile_debug=1
  set compile_min=1
  set compile_mindebug=1
  set copy_libs=1
)
if "%op%"=="source" (
  set compile_debug=1
  set compile_min=1
  set compile_mindebug=1
  set copy_libs=1
)
if "%op%"=="debug" (
  set compile_debug=1
  set copy_libs=1
)
if "%op%"=="min" (
  set compile_min=1
  set copy_libs=1
)
if "%op%"=="min.debug" (
  set compile_mindebug=1
  set copy_libs=1
)
if "%optlevel%"=="WHITESPACE_ONLY" (
  set debug_optlevel=WHITESPACE_ONLY
  set min_optlevel=WHITESPACE_ONLY
  set mindebug_optlevel=WHITESPACE_ONLY
)
if "%optlevel%"=="SIMPLE_OPTIMIZATIONS" (
  set debug_optlevel=SIMPLE_OPTIMIZATIONS
  set min_optlevel=SIMPLE_OPTIMIZATIONS
  set mindebug_optlevel=SIMPLE_OPTIMIZATIONS
)
if "%optlevel%"=="ADVANCED_OPTIMIZATIONS" (
  set debug_optlevel=SIMPLE_OPTIMIZATIONS
  set min_optlevel=ADVANCED_OPTIMIZATIONS
  set mindebug_optlevel=ADVANCED_OPTIMIZATIONS
)
if "%debug_optlevel"=="0" (
  call :error "Unrecognized closure compiler optimization level: %optlevel%"
)
if %compile_debug%==1 call :compile "debug" "%build_debug%" %debug_optlevel% true
if %compile_min%==1 call :compile "min" "%build_min%" %min_optlevel% false
if %compile_mindebug%==1 call :compile "min.debug" "%build_mindebug%" %mindebug_optlevel% true
if %copy_libs%==1 (
  echo [Build] Copying dependencies
  call "%project_config%\lib.cmd"
)

:: Generate documentation
set jsdoc=%root%jsdoc-master\jsdoc
set user_cfg=%root%config\jsdoc-public-conf.json
set generate_documentation=0
set user_readme=%project_config%\docs-user-readme.md
set dev_readme=%project_config%\docs-dev-readme.md
set test_readme=%project_config%\docs-test-readme.md
if "%op%"=="all" set generate_documentation=1
if "%op%"=="docs" set generate_documentation=1
if %generate_documentation%==1 (
  echo [Build] Generating documentation
  call :delete "%project_docs_user%\*.*"
  call :rmdir "%project_docs_user%"
  call :delete "%project_docs_dev%\*.*"
  call :rmdir "%project_docs_dev%"
  call :delete "%project_docs_test%\*.*"
  call :rmdir "%project_docs_test%"
  call :mkdir "%project_docs%"
  call :mkdir "%project_docs_user%"
  call :mkdir "%project_docs_dev%"
  call :mkdir "%project_docs_test%"
  call "%jsdoc%" --destination "%project_docs_user%" --recurse "%project_src%" --template templates\voodoo --configure "%user_cfg%" "%user_readme%"
  if errorlevel 1 call :error "Failed to generate user documentation"
  call "%jsdoc%" --destination "%project_docs_dev%" --private --recurse "%project_src%" --template templates\voodoo "%dev_readme%"
  if errorlevel 1 call :error "Failed to generate developer documentation"
  call "%jsdoc%" --destination "%project_docs_test%" --private --recurse "%project_test%" --template templates\voodoo "%test_readme%"
  if errorlevel 1 call :error "Failed to generate test documentation"
  echo.
)

:: Drop
set dropping=0
if "%op%"=="all" set dropping=1
if "%op%"=="drop" set dropping=1
set drop_file=%drop%\%project%-%version%.zip
if %dropping%==1 (
  echo [Build] Dropping
  call :delete "%drop_staging%\*.*"
  call :delete "%drop_file%"
  call :rmdir "%drop_staging%"
  call :mkdir "%drop%"
  call :mkdir "%drop_staging%"
  call :mkdir "%drop_staging%\build"
  call :mkdir "%drop_staging%\docs"
  call :mkdir "%drop_staging%\samples"
  call :mkdir "%drop_staging%\lib"
  
  copy /B /Y "%build_min%" "%drop_staging%\build"
  copy /B /Y "%build_mindebug%" "%drop_staging%\build"
  call :copy "%root%externs\%project%.js" "%drop_staging%\build\%project%-%version%.externs.js"
  xcopy /S "%project_docs_user%" "%drop_staging%\docs"
  xcopy /S "%project_root%\samples" "%drop_staging%\samples"
  xcopy /S "%project_root%\lib" "%drop_staging%\lib"
  copy /B /Y "%project_config%\README" "%drop_staging%"
  copy /B /Y "%project_config%\LICENSE" "%drop_staging%"
  
  "%sevenzip%" a -tzip "%drop_file%" "%drop_staging%\*"
  if errorlevel 1 call :error "Failed to zip"
  call :rmdir "%drop_staging%"
)

:: Clean
call :delete "%build_merged%"
if "%op%"=="clean" (
  echo [Build] Cleaning
  call :delete "%project_build%\*.*"
  call :rmdir "%project_build%"
  call :delete "%project_docs%\*.*"
  call :rmdir "%project_docs%"
  call :delete "%project_lib%\*.*"
  call :rmdir "%project_lib%"
  call :delete "%drop_staging%\*.*"
  call :delete "%drop_file%"
  call :rmdir "%drop_staging%"
  call :rmdir "%drop%"
  echo.
)

:: Test
set test=0
if "%op%"=="all" set test=1
if "%op%"=="test" set test=1
if "%op%"=="testdebug" set test=1
set jstest="%java%" -jar "%root%js-test-driver\JsTestDriver.jar"
set port=46576
set server=http://localhost:46576
set testconf=%project_config%\jsTestDriver.conf
if "%op%"=="testdebug" set testconf=%project_config%\jsTestDriver-debug.conf
set captureConsole=
if "%op%"=="testdebug" set captureConsole=--captureConsole

if %test%==1 (
  echo [Build] Testing
  %jstest% --port "%port%" --browser "%browsersToTest%" %captureConsole% --config "%testconf%" -preloadFiles --reset --server "%server%" --tests all --verbose --raiseOnFailure true --basePath "%project_root%"
  if errorlevel 1 call :error "Testing failed"
  echo.
)

:: Success
echo [Build] Build Succeeded
goto :EOF

:: Compile function
:compile
set compiletype=%~1
set outfile=%~2
set optimizations=%~3
set compiledebug=%~4
set externs_dir=%root%externs
setlocal enabledelayedexpansion
set externs=
for /r "%externs_dir%" %%F in (*.js) do (
  set file=%%F

  for %%I in (!file!) do set filename=%%~nI
  if not "!filename!"=="%project%" set externs=!externs! --externs "!file!"
)
echo [Build] Compiling %compiletype% build
call :delete "%outfile%"
"%java%" -jar "%root%compiler-latest\compiler.jar" --compilation_level %optimizations% --js_output_file "%outfile%" --warning_level VERBOSE --js "%build_merged%" %externs% --define='DEBUG=%compiledebug%' --define='VERSION='%version%.%compiletype%'' --define='NAMESPACE='%namespace%'' --language_in=ECMASCRIPT5_STRICT
echo.
endlocal
if errorlevel 1 call :error "Compilation failed"
goto :EOF

:: Delete file(s) function
:delete
set files=%~1
if exist "%files%" (
  del /S /Q "%files%"
)
goto :EOF

:: Create directory function
:mkdir
set dir=%~1
if not exist "%dir%" (
  mkdir "%dir%"
)
goto :EOF

:: Delete directory function
:rmdir
set dir=%~1
if exist "%dir%" (
  rmdir /S /Q "%dir%"
)
goto :EOF

:: Copy file function
:copy
set src=%~1
set dest=%~2
if exist "%src%" copy /B /Y "%src%" "%dest%"
goto :EOF

:: Append file function
:append
set src=%~1
set dest=%~2
echo [Build]    Appending %src%
type "%src%" >> "%dest%"
echo. >> "%dest%"
goto :EOF

:: Failure function
:error
echo [Error] %~1
set errorlevel=1
call :errorexit 2>nul
:errorexit
()