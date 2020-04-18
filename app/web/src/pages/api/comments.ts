import { NextApiResponse } from 'next';
import { commentSchema } from 'src/utils/validation/schema';
import { Container } from 'typedi';
import createError from 'http-errors';
import { ApiRequest, getHandler } from 'src/api/handler';
import { keyBy, uniq } from 'lodash';
import { Auth0Service } from 'src/services/auth/auth0.service';
import { CommentService } from 'src/services/news/comment.service';
import { authenticated } from 'src/api/authenticated';
import util from 'util';
import { CommentDto } from '@vdtn359/news-models';
import { stringQuery } from 'src/api/parse';

const handler = getHandler();
handler.post(postRequest);
handler.get(getRequest);

export default handler;

async function getRequest(req: ApiRequest, res: NextApiResponse) {
	const commentsService = Container.get(CommentService);
	const auth0Service = Container.get(Auth0Service);
	const newsId = stringQuery(req.query.newsId);
	if (!newsId) {
		throw new createError.BadRequest('News id is required');
	}
	const comments = await commentsService.getComments(newsId);
	const userIds = uniq(comments.map((comment) => comment.userId));
	const users = await auth0Service.getUsers(userIds);
	const userMap = keyBy(users, 'user_id');
	res.json(
		comments
			.map((comment) => {
				const user = userMap[comment.userId];
				if (!user) {
					return;
				}
				return {
					id: comment.id,
					content: comment.content,
					avatar: user.picture,
					author: user.name,
					newsId: comment.newsId,
					time: comment.time,
				};
			})
			.filter((comment) => comment)
	);
}

async function postRequest(req: ApiRequest, res: NextApiResponse) {
	await util.promisify(authenticated)(req, res);
	const body = await validateInput(req.body);
	const commentService = Container.get(CommentService);
	const newComment = await commentService.addComment({
		content: body.content,
		userId: req.user.sub,
		newsId: body.newsId,
		time: new Date(),
	});
	const commentDto: CommentDto = {
		id: newComment.id,
		content: newComment.content,
		avatar: req.user.picture,
		author: req.user.name,
		newsId: newComment.newsId,
		time: newComment.time,
	};
	res.json(commentDto);
}

async function validateInput(body) {
	if (!body.newsId) {
		throw new createError.BadRequest('News id is required');
	}
	try {
		const validatedBody = await commentSchema.validate(body, {
			abortEarly: true,
		});
		return {
			...body,
			...validatedBody,
		};
	} catch (e) {
		throw new createError.BadRequest(e.errors[0]);
	}
}
