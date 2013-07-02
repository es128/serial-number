'use strict';

var exec = require('child_process').exec;

module.exports = function (cb) {
	var delimiter = ': ',
		stdoutHandler = function (error, stdout) {
		if (error !== null) {throw error;}
		cb(stdout.slice(stdout.indexOf(delimiter) + 2));
	};

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
