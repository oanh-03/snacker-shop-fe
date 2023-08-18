import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Button, Form } from "antd";
import { useAppDispatch } from "../../../../app/hook";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CategoryApi } from "../../../../api/employee/category/category.api";
import { UpdateCategory } from "../../../../app/reducer/Category.reducer";

const { Option } = Select;

const ModalUpdateCategory = ({ visible, id, onCancel }) => {
  const [form] = Form.useForm();
  const [category, setCategory] = useState({});
  const dispatch = useAppDispatch();
  const getOne = () => {
    CategoryApi.getOne(id).then((res) => {
      setCategory(res.data.data);
      form.setFieldsValue(res.data.data);
    });
  };

  useEffect(() => {
    if (id != null && id !== "") {
      getOne();
    }
    form.resetFields();
    return () => {
      setCategory(null);
      id = null;
    };
  }, [id, visible]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        return new Promise((resolve, reject) => {
          Modal.confirm({
            title: "Xác nhận",
            content: "Bạn có đồng ý cập nhật không?",
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: () => resolve(values),
            onCancel: () => reject(),
          });
        });
      })
      .then((values) => {
        form.resetFields();
        CategoryApi.update(id, values).then((res) => {
          dispatch(UpdateCategory(res.data.data));
          toast.success("Cập nhật thành công");
          onCancel();
        });
        form.resetFields();
      })
      .catch((error) => {
        toast.error("Cập nhật thất bại");
        console.log("Validation failed:", error);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Cập nhật thể loại "
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Cập nhật
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên thể loại"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên thể loại" },
            { max: 50, message: "Tên thể loại tối đa 50 ký tự" },
          ]}
        >
          <Input placeholder="Tên thể loại" />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select placeholder=" Vui lòng chọn trạng thái ">
            <Option value="DANG_SU_DUNG">Đang sử dụng</Option>
            <Option value="KHONG_SU_DUNG">Không sử dụng</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUpdateCategory;
