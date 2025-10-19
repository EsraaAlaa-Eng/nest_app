import { CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseUpdateQueryOptions, PopulateOption, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery, Types, UpdateQuery, UpdateWriteOpResult } from "mongoose";

export type Lean<T> = FlattenMaps<T>;

export abstract class DatabaseRepository<TRawDocument,TDocument=HydratedDocument<TRawDocument>> {
    constructor(protected model: Model<TDocument>) { }


   async create({
        data,
        options,
    }: {
        data: Partial<TRawDocument>[];
        options?: CreateOptions | undefined;
    }): Promise<TDocument[] > {
        return await this.model.create(data, options) || [];
    }
 


    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TRawDocument>;
        select?: ProjectionType<TRawDocument> | null;
        options?: QueryOptions<TDocument> | null;

    }): Promise<
        // | Lean<TDocument>
        | HydratedDocument<TDocument>
        | null
    > {
        const doc = this.model.findOne(filter).select(select || "")
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }

    async find({
        filter,
        select,
        options,
    }: {
        filter: RootFilterQuery<TRawDocument>;
        select?: ProjectionType<TRawDocument> | undefined;
        options?: QueryOptions<TDocument> | undefined
    }): Promise<TDocument[] | [] | Lean<TDocument>[]> {
        const doc = this.model.find(filter || {}).select(select || ' ');

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[])
        }

        if (options?.skip) {
            doc.skip(options.skip)
        }
        if (options?.lean) {
            doc.lean(options.lean)
        }
        if (options?.limit) {
            doc.limit(options.limit)
        }
        return await doc.exec();
    }



    async paginate({
        filter = {},
        options = {},
        select,
        page = 'all',
        size = 5,

    }: {
        filter: RootFilterQuery<TRawDocument>,
        select?: ProjectionType<TRawDocument> | undefined,
        options?: QueryOptions<TDocument> | undefined,
        page?: number | 'all',
        size?: number,
    }): Promise<TDocument[] | [] | Lean<TDocument>[] | any> {
        let docsCount: number | undefined = undefined;
        let pages: number | undefined = undefined;

        if (page !== 'all') {
            page = Math.floor(page < 1 ? 1 : page);
            options.limit = Math.floor(size < 1 || !size ? 5 : size);
            options.skip = (page - 1) * options.limit;

            docsCount = await this.model.countDocuments(filter);
            pages = Math.ceil(docsCount / options.limit);
        }
        const result = await this.find({ filter, select, options });

        return {
            docsCount,
            limit: options.limit,
            pages,
            curettagePage: page !== 'all' ? page : undefined,
            result,
        }

    }




    async updateOne({
        filter,
        update,
        options

    }:
        {
            filter: RootFilterQuery<TRawDocument>,
            update: UpdateQuery<TDocument>,
            options?:
            | MongooseUpdateQueryOptions<TDocument>
            | null

        }): Promise<UpdateWriteOpResult> {
        return this.model.updateOne(
            filter,
            { ...update, $inc: { __v: 1 } },
            options);
    }



    async findByIdAndUpdate({
        id,
        update,
        options = { new: true },

    }: {
        id: Types.ObjectId;
        update?: UpdateQuery<TDocument>,
        options?: QueryOptions<TDocument>,
    }): Promise<TDocument | Lean<TDocument> | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { ...update, $inc: { __v: 1 } },
            options,
        )

    }


    async findOneAndUpdate({
        filter,
        update,
        options = { new: true },


    }: {
        filter?: RootFilterQuery<TRawDocument>;
        update?: UpdateQuery<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<TDocument | Lean<TDocument> | null> {
        return this.model.findOneAndUpdate(
            filter,
            { ...update, $inc: { __v: 1 } },
            options
        );
    }




    async deleteOne({
        filter,


    }:
        {
            filter: RootFilterQuery<TRawDocument>,


        }): Promise<DeleteResult> {
        return this.model.deleteOne(
            filter,
        );
    }


}