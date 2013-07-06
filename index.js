'use strict';

var exec = require('child_process').exec;

module.exports = function (cb) {
	var delimiter = ': ';
	var stdoutHandler = function (error, stdout) {
		cb(error, stdout.slice(stdout.indexOf(delimiter) + 2));
	};

	switch (process.platform) {

	case 'darwin':
		exec('system_profiler SPHardwareDataType | grep \'Serial\'', stdoutHandler);
		break;

	case 'win32':
		delimiter = '\r\n';
		exec('wmic csproduct get identifyingnumber', stdoutHandler);
		break;

	case 'linux':
	case 'freebsd':
		exec('dmidecode -t system | grep \'Serial\'', stdoutHandler);
		break;
	}
};
