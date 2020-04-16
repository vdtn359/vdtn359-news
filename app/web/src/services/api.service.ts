import { Inject, Service } from 'typedi';
import axios, { AxiosInstance } from 'axios';
import querystring from 'querystring';
import { BehaviorSubject, Subject } from 'rxjs';
import { captureException } from 'src/utils/exception/capture';

@Service()
export class ApiService {
	private readonly axios: AxiosInstance;
	apiCallSubscription = new BehaviorSubject<number>(0);
	errorSubscription = new Subject<Error>();

	constructor(
		@Inject('baseUrl') private readonly baseUrl: string,
		@Inject('context') private readonly ctx
	) {
		this.axios = axios.create({
			baseURL: `${baseUrl}/api`,
			paramsSerializer: (params) => querystring.stringify(params),
			headers:
				ctx.req && ctx.req.headers?.cookie
					? { cookie: ctx.req.headers.cookie }
					: undefined,
		});

		this.setupInterceptors();
	}

	private setupInterceptors() {
		this.axios.interceptors.request.use((config) => {
			this.apiCallSubscription.next(
				this.apiCallSubscription.getValue() + 1
			);
			return config;
		});
		this.axios.interceptors.response.use(
			(response) => {
				this.apiCallSubscription.next(
					this.apiCallSubscription.getValue() - 1
				);
				return response;
			},
			(error) => {
				this.errorSubscription.next(error);
				this.apiCallSubscription.next(
					this.apiCallSubscription.getValue() - 1
				);
				captureException({
					error,
				});
				throw error;
			}
		);
	}

	api() {
		return this.axios;
	}
}
