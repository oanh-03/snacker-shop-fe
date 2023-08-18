import { request } from "../../../helper/request";
export class LoginApi {
  static authentication = (filter) => {
    return request({
      method: "GET",
      url: `/admin/login`,
      params: filter,
    });
  };

  static restPassword = (filter) => {
    return request({
      method: "GET",
      url: `/admin/login/rest-password`,
      params: filter,
    });
  };
}
