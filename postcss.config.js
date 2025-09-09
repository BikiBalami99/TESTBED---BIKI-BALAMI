module.exports = {
	plugins: {
		autoprefixer: {
			// Ensure backdrop-filter gets proper prefixes
			overrideBrowserslist: [
				"last 2 versions",
				"> 1%",
				"iOS >= 9",
				"Safari >= 9",
				"Chrome >= 60",
				"Firefox >= 60",
				"Edge >= 79",
			],
			// Force autoprefixer to add standard properties
			cascade: false,
			// Ensure backdrop-filter is properly handled
			flexbox: "no-2009",
		},
	},
};
