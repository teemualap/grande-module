grande-module
=============

Use Grande.js as a CommonJS module eg. in your Browserify builds. Originally forked from [Grande.js](https://github.com/mduvall/grande.js) by mduvall. 

This build includes many bug fixes but also alters the way grande works quite a bit. I wanted to use grande as an easy drop-in component in our AngularJS-based SPA admin tools via directives. Via Grande.dispose you can unbind all events bound by grande and also remove any elements appended to the document (the styling menu).

Heading tags from h1 to h5 are supported but you also have the ability to omit any tags from the menu via config.

Usage
-----
See examples folder

License
-------
MIT
