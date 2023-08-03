function getBotResponse(input) {
	// rock paper scissors
	if (input === 'rock') {
		return 'paper';
	} if (input === 'paper') {
		return 'scissors';
	} if (input === 'scissors') {
		return 'rock';
	}

	// Simple responses
	if (input === 'hello') {
		return 'Hello there!';
	} if (input === 'goodbye') {
		return 'Talk to you later!';
	}
	return 'Try asking something else!';
}
