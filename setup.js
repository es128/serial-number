'use strict';

var serialNumber = require('./index');

var fail = function (err) {
	console.error('Could not read serial number:', err);
};

serialNumber(function (err) {
	if (process.platform !== 'win32' && err.match(/Permission denied/i)) {
		console.info(
			'\x1B[7m' + // inverse style
			'Your system requires root/administrative priviledge to access the serial number.' +
			'\x1B[27m',

			'\x1B[31m' + // red
			'Attempting to run command with `sudo` and cache your serial for future use.' +
			'\x1B[39m',

			'\x1B[31m' + // red
			'You will be prompted for password.' +
			'\x1B[39m'
		);
		serialNumber.useSudo(function (err, val) {
			if (err) {return fail(err);}
			require('fs').writeFile('cached', val, function (err) {
				if (err) {
					console.error('Could not write serial number cache file:', err);
				} else {
					// green
					console.info('\x1B[32m' + 'Successfully cached serial number' + '\x1B[39m');
				}
			});
		});
	} else if (err) {
		fail(err);
	}
});
