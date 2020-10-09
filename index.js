'use strict';

var fs		= require('fs');
var http	= require('http');
var execFile	= require('child_process').execFile;
var spawn	= require('child_process').spawn;

var serialNumber = function (cb, cmdPrefix) {
	var delimiter = ': ';
	var uselessSerials = [
		'To be filled by O.E.M.',
	]

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
		var result = input.slice(input.indexOf(delimiter) + 2).trim();

		var isResultUseless = uselessSerials.some(function(val) {
			return val === result;
		});

		if (isResultUseless) {
			return '';
		}

		return result;
	};

	var execCmd = function (cmdPrefix, cmd, val, callback) {
		if (cmdPrefix.endsWith(' ')) {	// If ends with space is treated as a comand, like sudo
			var cmdArgs = cmd;
			cmd = cmdPrefix.trim();
		} else {							// Else path, apend
			var cmdArgs = cmd.slice(1);
			cmd = cmdPrefix + cmd[0];
		}
		if (process.platform == 'win32') {
			args.push(val);
			execFile(cmd, cmdArgs, (error, stdout) => {
				if(callback) callback(error, stdout);
			});
		} else { // If not win32 use spawn for grep
			let stdout = '';
			let stderr = '';
			const spCmd1 = spawn(cmd, cmdArgs);
			const spCmd2 = spawn('grep', [val]);

			spCmd1.stdout.on('data', (data) => {
				spCmd2.stdin.write(data);
			});
			spCmd1.stderr.on('data', (data) => {
				stderr += data;
			});
			spCmd1.on('close', (code) => {
				if (code !== 0) {
					console.error(`${cmd1} process exited with code ${code}`);
				}
				spCmd2.stdin.end();
			});
			spCmd2.stdout.on('data', (data) => {
				stdout += data.toString();
			});
			spCmd2.stderr.on('data', (data) => {
				stderr+= data;
			});
			spCmd2.on('close', (code) => {
			if (code !== 0) {
				console.error(`${cmd2} process exited with code ${code}`);
			}
				if(callback) callback(stderr, stdout);
  			});
		}
	}

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
		cmd = ['wmic', 'csproduct', 'get'];
		break;

	case 'darwin':
		cmd = ['system_profiler', 'SPHardwareDataType'];
		break;

	case 'linux':
		if (process.arch === 'arm') {
			vals[1] = 'Serial';
			cmd = ['cat', '/proc/cpuinfo'];

		} else {
			cmd = ['dmidecode', '-t', 'system'];
		}
		break;

	case 'freebsd':
		cmd = ['dmidecode', '-t', 'system'];
		break;
	}

	if (!cmd) return cb(new Error('Cannot provide serial number for ' + process.platform));

	if (serialNumber.preferUUID) vals.reverse();

	execCmd(cmdPrefix, cmd, vals[0], (error, stdout) => {
		if (error || parseResult(stdout).length > 1) {
			stdoutHandler(error, stdout);
		} else {
			execCmd(cmdPrefix, cmd, vals[1], stdoutHandler);
		}
	});
};

serialNumber.preferUUID = false;

module.exports = exports = serialNumber;

exports.useSudo = function (cb) {
	serialNumber(cb, 'sudo ');
};
