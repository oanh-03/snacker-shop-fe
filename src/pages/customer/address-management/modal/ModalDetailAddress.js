import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Button, Form, Popconfirm } from "antd";
import { toast } from "react-toastify";
import { AddressApi } from "../../../../api/customer/address/address.api";

const { Option } = Select;

const ModalDeatailAddress = ({ visible, id, onCancel }) => {
  const [address, setAddress] = useState([]);

  const getOne = () => {
    AddressApi.getOne(id).then((res) => {
      setAddress(res.data.data);
    });
  };

  useEffect(() => {
    console.log(id);
    if (id != null && id !== "") {
      getOne();
    }
    return () => {
      setAddress(null);
      id = null;
    };
  }, [id, visible]);

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title="Thông tin địa chỉ"
      visible={visible}
      onCancel={handleCancel}
      footer={[null]}
    >
      <Form layout="vertical">
        <Form.Item label="Tỉnh/Thành phố">
          <Input value={address != null ? address.province : null} readOnly />
        </Form.Item>

        <Form.Item label="Quận/Huyện">
          <Input value={address != null ? address.district : null} readOnly />
        </Form.Item>

        <Form.Item label="Xã/Phường">
          <Input value={address != null ? address.ward : null} readOnly />
        </Form.Item>

        <Form.Item label="Số nhà/Ngõ/Đường">
          <Input value={address != null ? address.line : null} readOnly />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalDeatailAddress;
