import { IBrand } from "src/common";

export class BrandResponse {
    brand: IBrand
}

export class GetAllResponse{
     result:{
        docsCount?: number,
        limit?: number,
        pages?: number,
        curettagePage: number | undefined,
        result: IBrand[] 
      }
}
