import { request } from "../../../helper/request";

export class VoucherApi {
    static fetchAll = (filter) => {
        return request({
          method: "GET",
          url: `/admin/voucher`,
          params: filter,
        });
      };
    
      static create = (data) => {
        return request({
          method: "POST",
          url: `/admin/voucher`,
          data: data,
        });
      };
    
      static getOne = (id) => {
        return request({
          method: "GET",
          url: `/admin/voucher/${id}`,
        });
      };
    
      static update = (id,data) => {
        return request({
          method: "PUT",
          url: `/admin/voucher/${id}`,
          data: data,
        });
      };
}