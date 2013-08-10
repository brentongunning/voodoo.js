:: ----------------------------------------------------------------------------
:: File: lib.cmd
::
:: Desc: Copies project dependencies into the libs folder.
::
:: Copyright (c) 2013 VoodooJs Authors
:: ----------------------------------------------------------------------------

@echo off

del /S /Q "%~dp0..\lib\*.*"
mkdir "%~dp0..\lib"
copy /B /Y "%~dp0..\tools\lib\three.min.js" "%~dp0..\lib"