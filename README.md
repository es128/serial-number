Serial Number
=============

A simple Node.js module for accessing the serial number (a.k.a. Dell Service
Tag, asset tag) of the local machine. Supports Linux, Mac (OS X), Windows, and
FreeBSD.


Installation
------------
`npm install serial-number`

And/or install globally for a `serial-number` shell command:
`[sudo] npm install -g serial-number`


Usage
-----
The serial number value is retrieved from the system asynchronously and passed
to a callback.

```javascript
var serialNumber = require('serial-number');

serialNumber(function (err, value) {
	console.log(value);
});
```


License
-------
MIT
