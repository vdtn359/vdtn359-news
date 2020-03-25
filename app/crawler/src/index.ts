import { AuNews } from 'src/sources/news';
import { CATEGORY, NewsDto } from '@vdtn359/news-schema';
import Bottleneck from 'bottleneck';
import { promises } from '@vdtn359/news-utils';
import { SmhNews } from 'src/sources/news/smh-news';

const newsSources = [
	new AuNews(
		CATEGORY.NATIONAL,
		'https://www.news.com.au/content-feeds/latest-news-national'
	),
	new AuNews(
		CATEGORY.WORLD,
		'https://www.news.com.au/content-feeds/latest-news-world'
	),
	new AuNews(
		CATEGORY.LIFESTYLE,
		'https://www.news.com.au/content-feeds/latest-news-lifestyle'
	),
	new AuNews(
		CATEGORY.TRAVEL,
		'https://www.news.com.au/content-feeds/latest-news-travel'
	),
	new AuNews(
		CATEGORY.ENTERTAINMENT,
		'https://www.news.com.au/content-feeds/latest-news-entertainment'
	),
	new AuNews(
		CATEGORY.TECHNOLOGY,
		'https://www.news.com.au/content-feeds/latest-news-technology'
	),
	new AuNews(
		CATEGORY.BUSINESS,
		'https://www.news.com.au/content-feeds/latest-news-finance'
	),
	new AuNews(
		CATEGORY.SPORT,
		'https://www.news.com.au/content-feeds/latest-news-sport'
	),
	new SmhNews(CATEGORY.NATIONAL, 'https://www.smh.com.au/rss/national.xml'),
];

const limiter = new Bottleneck({
	maxConcurrent: 5,
	minTime: 100,
});

async function fetchNews() {
	const allResults: NewsDto[] = [];
	await Promise.all(
		newsSources.map((newSource) =>
			limiter
				.schedule(() => newSource.extractFeeds())
				.then((news) => {
					allResults.push(...news);
				})
		)
	);
	await promises.fs.writeJSON('feed.json', allResults);
}

fetchNews().then(() => console.info('Completed'));