export interface ICacheService {
    getOne(key: string): Promise<string | null>;
    getMany(keys: string[]): Promise<(string | null)[]>;
    getCollection(collectionKey: string): Promise<string[]>;

    setOne(key: string, value: string, ttlSeconds?: number): Promise<void>;
    setMany(items: { key: string; value: string }[], ttlSeconds?: number): Promise<void>;

    addOneToCollection(key: string, value: string, ttlSeconds?: number): Promise<void>;
    addManyToCollection(key: string, values: string[], ttlSeconds?: number): Promise<void>;

    removeOne(key: string): Promise<void>;
    removeMany(keys: string[]): Promise<void>;

    removeOneFromCollection(key: string, value: string): Promise<void>;
    removeManyFromCollection(key: string, values: string[]): Promise<void>;

    getTtl(key: string): Promise<number>;
    getOneWithTtl(key: string): Promise<{ value: string | null; ttlSeconds: number }>;

    transaction(): ICacheTransaction;

    isAlive(): Promise<boolean>;
}

export interface ICacheTransaction {
    setOne(key: string, value: string, ttlSeconds?: number): this;
    setMany(items: { key: string; value: string }[], ttlSeconds?: number): this;

    addOneToCollection(key: string, value: string, ttlSeconds?: number): this;
    addManyToCollection(key: string, values: string[], ttlSeconds?: number): this;

    removeOne(key: string): this;
    removeMany(keys: string[]): this;

    removeOneFromCollection(key: string, value: string): this;
    removeManyFromCollection(key: string, values: string[]): this;

    execute(): Promise<void>;
}
