// ----------------------------------------------------------------------------
// File: MergedSourceFooter.js
//
// Copyright (c) 2014 VoodooJs Authors
// ----------------------------------------------------------------------------

};

// Expose the project's namespace. If NAMESPACE = voodoo.elements, then
// after looping currentNamespace will equal window['voodoo'] and then
// we assign the new project() namespace to window['voodoo']['elements'].
var namespaceParts = NAMESPACE.split('.');
var currentNamespace = window;
for (var i = 0; i < namespaceParts.length - 1; ++i) {
  var part = namespaceParts[i];
  currentNamespace = currentNamespace[part];
}

if (!currentNamespace[namespaceParts[namespaceParts.length - 1]]) {
  // The namespace does not exist. Create it.
  currentNamespace[namespaceParts[namespaceParts.length - 1]] = new project();
} else {
  // The namespace already exists. Merge with it.
  var namespace = currentNamespace[namespaceParts[namespaceParts.length - 1]];
  var inst = new project();
  for (var key in inst)
    namespace[key] = inst[key];
}


/**
 * The exposed version of this library.
 *
 * @type {string}
 */
currentNamespace[namespaceParts[namespaceParts.length - 1]]['version'] = VERSION;

})(window, document, void(0));
