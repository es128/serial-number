'use strict';

var exec = require('child_process').exec;

module.exports = function (cb) {
	var delimiter = ': ';
	var stdoutHandler = function (error, stdout) {
		cb(error, parseResult(stdout));
	};
	var parseResult = function (input) {
		return input.slice(input.indexOf(delimiter) + 2).trim();
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
		exec('dmidecode -t system | grep \'Serial\'', function (error, stdout) {
			if (error || parseResult(stdout).length > 1) {
				stdoutHandler(error, stdout);
			} else  {
				exec('dmidecode -t system | grep \'UUID\'', stdoutHandler);
			}
		});
		break;
	}
};
