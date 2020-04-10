import util from 'util';
import { logger } from 'src/setup';
import { logging } from '@vdtn359/news-core';

process.on('unhandledRejection', (e) => {
	logger.error('Unhandled rejections: ', e);
});

export function errorLogger(err, req, res) {
	if (err.name === 'ResponseError') {
		return handleElasticSearchError(err, res);
	}
	const status = err.status || 500;
	if (status >= 400) {
		logger.info('', new logging.HttpLog(req, res));
	}
	if (status >= 500) {
		logger.error(err);
	}
	res.status(status).json({
		error: err.message || 'Internal Server Error',
	});
}

function handleElasticSearchError(err, res) {
	logger.error(
		util.inspect(err.meta, {
			depth: null,
		})
	);
	res.status(500).json({
		error: 'Internal server error',
	});
}
