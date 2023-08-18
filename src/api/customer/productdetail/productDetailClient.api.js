import { request } from "../../../helper/request";

export class ProductDetailClientApi {
    static getByIdCategory = (id) => {
        return request({
          method: "GET",
          url: `/client/product-detail/byCategory/${id}`
        });
      };
    
      static getDetailProductOfClient = (id,idColor)=>{
        return request({
          method: "GET",
          url: `/client/product-detail/${id}&&${idColor}`
        });
      }
   
}