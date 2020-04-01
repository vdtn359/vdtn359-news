import React from 'react';
import { NewsService } from 'src/services/news.service';
import { NewsDto } from '@vdtn359/news-models';
import { NewsStream } from 'src/components/news/NewsStream';
import { ContainerInstance } from 'typedi';

interface Props {
    news: NewsDto[];
    container: ContainerInstance;
}

export default class IndexPage extends React.Component<Props> {
    static async getInitialProps(ctx) {
        const newsService = ctx.container.get(NewsService);
        const news = await newsService.fetchNews();

        return {
            news,
        };
    }

    render() {
        return (
            <NewsStream
                initialNewsList={this.props.news}
                loadFunc={(nextTimestamp) => {
                    const newsService = this.props.container.get(NewsService);
                    return newsService.fetchNews({ nextTimestamp });
                }}
            />
        );
    }
}
