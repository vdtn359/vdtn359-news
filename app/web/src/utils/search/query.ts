/*  eslint-disable @typescript-eslint/camelcase */
import { filterCategories } from 'src/utils/categories';
import { flatMap } from 'lodash';

export function buildEsQuery(queryStr: any = {}) {
	const mustQuery = [];
	if (queryStr.categories) {
		if (!Array.isArray(queryStr.categories)) {
			queryStr.categories = [queryStr.categories];
		}
		const categories = filterCategories(queryStr.categories);
		mustQuery.push({
			terms: {
				category: categories,
			},
		});
	}

	if (queryStr.search) {
		const searchQuery = Array.isArray(queryStr.search)
			? queryStr.search[0]
			: queryStr.search;
		mustQuery.push(constructSearchQuery(searchQuery));
	}

	if (!mustQuery.length) {
		mustQuery.push({
			match_all: {},
		});
	}

	return {
		bool: {
			must: mustQuery,
		},
	};
}

function constructSearchQuery(searchQuery) {
	const phrases = Array.from(searchQuery.matchAll(/"(.*?)"/g)).map(
		(match) => match[1]
	);
	const must = [];
	const should = [getContentQuery(searchQuery, false)];

	if (phrases.length) {
		for (const phrase of phrases) {
			must.push({
				bool: {
					should: getContentQuery(phrase, true),
					minimum_should_match: 1,
				},
			});
		}
	}

	return {
		bool: {
			should: flatMap(should),
			must,
			minimum_should_match: 1,
		},
	};
}

function getContentQuery(searchQuery, isPhraseMatch) {
	return [
		{
			[isPhraseMatch ? 'match_phrase' : 'match']: {
				title: {
					boost: 2,
					query: searchQuery,
				},
			},
		},
		{
			[isPhraseMatch ? 'match_phrase' : 'match']: {
				description: {
					boost: 1.5,
					query: searchQuery,
				},
			},
		},
		{
			[isPhraseMatch ? 'match_phrase' : 'match']: {
				body: {
					boost: 1,
					query: searchQuery,
				},
			},
		},
	];
}
