export class GetAllResponse<T = any> {
    result: {
        docsCount?: number;
        limit?: number;
        pages?: number;
        curettagePage: number | undefined;
        result: T[];
    }
}
