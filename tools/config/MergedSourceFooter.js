// ----------------------------------------------------------------------------
// File: MergedSourceFooter.js
//
// Copyright (c) 2013 VoodooJs Authors
// ----------------------------------------------------------------------------

};

// Expose the project's namespace. If NAMESPACE = voodoo.elements, then
// after looping currentNamespace will equal window['voodoo'] and then
// we assign the new project() namespace to window['voodoo']['ads'].
var namespaceParts = NAMESPACE.split('.');
var currentNamespace = window;
for (var i = 0; i < namespaceParts.length - 1; ++i) {
  var part = namespaceParts[i];
  currentNamespace = currentNamespace[part];
}
currentNamespace[namespaceParts[namespaceParts.length - 1]] = new project();


/**
 * The exposed version of this library.
 *
 * @type {string}
 */
currentNamespace[namespaceParts[namespaceParts.length - 1]]['version'] = VERSION;

})(window, document, void(0));
