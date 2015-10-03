function intercept (cmd, args, opts, callback) {
	if (cmd === 'cd') {
		setCwd(args[0]);
		return true;
	}
	return false;
}
