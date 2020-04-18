export interface Dao<T> {
	save(items: T[]): Promise<void>;

	saveOne(id: string): Promise<T>;

	get(id: string): Promise<T>;

	query(where: any): Promise<T[]>;

	findByIds(itemIds: string[]): Promise<T[]>;
}
