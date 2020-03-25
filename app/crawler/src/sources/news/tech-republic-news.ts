import { DefaultNews } from 'src/sources/news/default-news';
import { CATEGORY } from '@vdtn359/news-models';

export class TechRepublicNews extends DefaultNews {
	constructor(category: CATEGORY, rssFeed: string) {
		super(category, rssFeed);
	}
}