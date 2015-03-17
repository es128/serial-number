Serial Number
=============

A simple Node.js module for accessing the serial number (a.k.a. Dell Service
Tag, asset tag) of the local machine. Supports Linux, Mac (OS X), Windows, and
FreeBSD. On Amazon EC2 instances, it will return the instance-id.


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

If the serial number turns out to be invalid (common on VMs), the system's UUID
value will be provided as a fallback. To instead try to get the UUID on the
first attempt, set the `preferUUID` flag:

```javascript
serialNumber.preferUUID = true;
```

To prefix the system command with `sudo` use the `useSudo` method:

```javascript
serialNumber.useSudo(function (err, value) {
	console.log(value);
});
```


License
-------
[MIT](https://raw.github.com/es128/serial-number/master/LICENSE)	
