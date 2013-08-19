-------------------------------------------------------------------------------
Voodoo Javascript Library - Version 0.8.5 (Public Beta)
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
Overview
-------------------------------------------------------------------------------

Voodoo is a Javascript library for developing reusable 3D web objects that
intermix freely among 2D content. A common framework is provided to create new
objects by extending Model and View base types. Also provided is a core engine
to draw these 3D objects together on a page. See documentation and samples
for more information.

-------------------------------------------------------------------------------
Contents
-------------------------------------------------------------------------------

./build - Official builds of the library

	voodoo-*.min.js       - The release version for public use
	voodoo-*.min.debug.js - The debug version for development
	voodoo-externs.js     - Closure compiler externs

./docs - User Documentation

	index.html                 - Documentation starting point

./lib - External libraries required for use

	three.min.js               - THREE.js graphics engine

./samples - Examples of usage

license.txt - The legally allowed use of this library.

-------------------------------------------------------------------------------
Legal
-------------------------------------------------------------------------------

See license.txt.

-------------------------------------------------------------------------------
Release Notes
-------------------------------------------------------------------------------

8-11-2013 - 0.8.5
Added seam layer for eliminating the seam between antialiased layers.
Added Cache to Model and View for sharing objects across different controls.
Simplified API - Passing an options object when creating an engine.
Simplified API - Replaced View.zMin/zMax with View.above/below.
Reduced jitteryness when scrolling.
Created options.stencils that's true by default.
Updated ThreeJs to r60.

8-10-2013 - 0.8.4
Bug Fix: Canvas size is now correct on Retina displays.

7-22-2013 - 0.8.3
Moving to MIT license.
Updating bundled ThreeJs to r59.

7-13-2013 - 0.8.2
Adding voodoo.version.
Using a standard lighting model by default.
Removing AmbientLight and CameraLight from public API.
Removing View.destroy from public API.
Adding options to control the canvases created and renaming others.

7-06-2013 - 0.8.1
License change so there is no expiration for non-commercial use.
Passing the view to triggers.add is no longer necessary.
Fixing bug on Firefox where canvas size was incorrect when zoomed.

6-23-2013 - 0.8.0
This is the first public pre-release. There are no release notes.