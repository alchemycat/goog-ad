class Random {
	randomInt(min, max) {
		let rand = min - 0.5 + Math.random() * (max - min + 1);
		return Math.round(rand);
	}
}

exports.Random = Random;