const winston = require('winston');

const { format, transports, createLogger } = winston;
const path = require('path');

const consoleloggerLevel = process.env.WINSTON_LOGGER_LEVEL || 'info';

const consoleFormat = format.combine(
	format.colorize(),
	format.timestamp(),
	format.align(),
	format.printf((info) => `${info.timestamp} - ${info.level}:  ${info.message
		} ${JSON.stringify(info.metadata)}`),
);

const fileFormat = format.combine(
	format.timestamp(),
	format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
	format.json(),
);

const logger = createLogger({
	level: 'info',
	format: fileFormat,
	transports: [
		new transports.File({
			filename: path.join(__dirname, '../logs/error.log'),
			level: 'error',
		}),
		new transports.File({
			filename: path.join(__dirname, '../logs/activity.log'),
			maxsize: 5242880,
			maxFiles: 5,
		}),
	],
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(
		new transports.Console({
			level: consoleloggerLevel,
			format: consoleFormat,
		}),
	);
}

fetch(path.join(__dirname, '../logs/activity.log'))
	.then((response) => response.text())
	.then((logData) => {
		const logLines = logData.trim().split('\n');
		const tableBody = document.getElementById('logContent');

		logLines.forEach((logLine) => {
			const logObject = JSON.parse(logLine);
			const row = document.createElement('tr');

			const levelCell = document.createElement('td');
			levelCell.textContent = logObject.level;
			levelCell.classList.add(logObject.level); // Add class for styling
			row.appendChild(levelCell);

			const messageCell = document.createElement('td');
			messageCell.textContent = logObject.message;
			row.appendChild(messageCell);

			const metadataCell = document.createElement('td');
			metadataCell.textContent = JSON.stringify(logObject.metadata, null, 2);
			row.appendChild(metadataCell);

			const timestampCell = document.createElement('td');
			timestampCell.textContent = logObject.timestamp;
			row.appendChild(timestampCell);

			tableBody.appendChild(row);
		});
	})
	.catch((error) => {
		// console.error('Error fetching log file:', error);
	});

module.exports = logger;
