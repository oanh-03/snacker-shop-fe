import { Button, Result } from "antd";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
      extra={
        <Button type="primary">
          <Link to="/dashboard">Về trang chủ</Link>
        </Button>
      }
    />
  );
};
export default NotFound;
