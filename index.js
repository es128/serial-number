'use strict';

var exec = require('child_process').exec,
	delimiter = ': ',
	callback = function () {},
	stdoutHandler = function (error, stdout) {
		if (error !== null) {throw error;}
		callback(stdout.slice(stdout.indexOf(delimiter) + 2));
	};

module.exports = function (cb) {
	callback = cb;

	switch (process.platform) {

	case 'darwin':
		exec('system_profiler SPHardwareDataType | grep \'Serial\'', stdoutHandler);
		break;

	case 'win32':
		delimiter = '\r\n';
		exec('wmic csproduct get identifyingnumber', stdoutHandler);
		break;
	}
};
