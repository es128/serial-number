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

	cmdPrefix = cmdPrefix || '';
	var vals = ['Serial', 'UUID'];
	var cmd;

	switch (process.platform) {

	case 'win32':
		delimiter = '\r\n';
		vals[0] = 'IdentifyingNumber';
		cmd = 'wmic csproduct get ';
		break;

	case 'darwin':
		cmd = 'system_profiler SPHardwareDataType | grep ';
		break;

	case 'linux':
	case 'freebsd':
		cmd = 'dmidecode -t system | grep ';
		break;
	}

	if (!cmd) return cb(new Error('Cannot provide serial number for ' + process.platform));

	if (serialNumber.preferUUID) vals.reverse();

	exec(cmdPrefix + cmd + vals[0], function (error, stdout) {
		if (error || parseResult(stdout).length > 1) {
			stdoutHandler(error, stdout);
		} else {
			exec(cmdPrefix + cmd + vals[1], stdoutHandler);
		}
	});
};

serialNumber.preferUUID = false;

module.exports = exports = serialNumber;

exports.useSudo = function (cb) {
	serialNumber(cb, 'sudo ');
};
