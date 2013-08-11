:: ----------------------------------------------------------------------------
:: File: user.cmd
::
:: Desc: Contains user-defined settings and paths for the build system. The
::		 developer attempting to build should change the paths here to match
:: 		 the paths on their system.
::
:: Copyright (c) 2013 VoodooJs Authors
:: ----------------------------------------------------------------------------


:: Java Path

set java=java


:: Google Linter Path

:: See https://developers.google.com/closure/utilities/docs/linter_howto
:: for instructions on installing.

set gjslint=C:\Python27\scripts\gjslint


:: 7Zip Path

set sevenzip=C:\Program Files\7-Zip\7z


:: Browsers to test, separated by commas

-set chrome=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
-set firefox=C:\Program Files (x86)\Mozilla Firefox\firefox.exe


set browsersToTest=%chrome%,%firefox%