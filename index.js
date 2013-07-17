'use strict';

var fs		= require('fs');
var http	= require('http');
var exec	= require('child_process').exec;

var serialNumber = function (cb, cmdPrefix) {
	var delimiter = ': ';

	var fromCache = function (error, stdout) {
		fs.readFile(__dirname + '/cache', function (fsErr, data) {
			if (data) {data = data.toString().trim();}
			if (fsErr || !data || data.length < 2) {
				attemptEC2(function() {
					stdoutHandler(error, stdout, true);
				});
			} else {
				cb(null, data);
			}
		});
	};

	var stdoutHandler = function (error, stdout, bypassCache) {
		if (error && !bypassCache) {
			fromCache(error, stdout);
		} else {
			cb(error, parseResult(stdout));
		}
	};

	var parseResult = function (input) {
		return input.slice(input.indexOf(delimiter) + 2).trim();
	};

	var attemptEC2 = function (failCb) {
		var data = '';
		var failHandler = function () {
			failCb();
			failCb = function () {};
		};
		var request = http.get(
			'http://169.254.169.254/latest/meta-data/instance-id',
			function (res) {
				res.on('data', function (chunk) {
					data += chunk;
				}).on('end', function () {
					if (data.length > 2) {
						cb(null, data.trim());
					} else {
						failHandler();
					}
				});
			}
		);
		request.on('error', failHandler).setTimeout(1000, failHandler);
	};

	if (!cmdPrefix) {cmdPrefix = '';}

	switch (process.platform) {

	case 'darwin':
		exec(cmdPrefix + 'system_profiler SPHardwareDataType | grep \'Serial\'', stdoutHandler);
		break;

	case 'win32':
		delimiter = '\r\n';
		exec('wmic csproduct get identifyingnumber', stdoutHandler);
		break;

	case 'linux':
	case 'freebsd':
		exec(cmdPrefix + 'dmidecode -t system | grep \'Serial\'', function (error, stdout) {
			if (error || parseResult(stdout).length > 1) {
				stdoutHandler(error, stdout);
			} else  {
				exec(cmdPrefix + 'dmidecode -t system | grep \'UUID\'', stdoutHandler);
			}
		});
		break;
	}
};

module.exports = exports = serialNumber;

exports.useSudo = function (cb) {
	serialNumber(cb, 'sudo ');
};
