import React, { useEffect, useState } from "react";
import { Col, Form, Row, Button, Select, Space, Input, DatePicker } from "antd";
import { values } from "lodash";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

const data = [
  {
    id: "TAO_HOA_DON",
    name: "Tạo Hóa đơn",
  },
  {
    id: "CHO_XAC_NHAN",
    name: "Chờ xác nhận",
  },
  {
    id: "VAN_CHUYEN",
    name: "Đang vận chuyển",
  },
  {
    id: "DA_THANH_TOAN",
    name: "Đã thanh toán",
  },
  {
    id: "KHONG_TRA_HANG",
    name: "Thành công",
  },
  {
    id: "DA_HUY",
    name: "Đã hủy",
  },
  {
    id: "TRA_HANG",
    name: "Trả hàng",
  },
];

function FormSearch({
  fillter,
  changFillter,
  onChangeStatusBillInFillter,
  users,
  employess,
  status,
  handleSubmitSearch,
  clearFillter,
  handleSelectChange,
  handleSelectMultipleChange,
}) {
  const { Option } = Select;
  const handleChange = (value) => {
    var arr = Object.keys(value).map(function (key) {
      return value[key];
    });
    onChangeStatusBillInFillter(arr);
  };
  console.log(fillter.type);
  const { RangePicker } = DatePicker;

  return (
    <div>
      <div>
        <Row style={{ marginTop: "15px" }}>
          <Col span={11}>
            <Row style={{width: "100%"}}>
              <Col span={4} className="text">
                {" "}
                Tìm kiếm:
              </Col>
              <Col span={11}>
                <Input
                  value={fillter.key}
                  onChange={(value) => changFillter(value.target.value, "key")}
                  placeholder="Nhập"
                  style={{ width: "98%" }}
                />
              </Col>
              <Col span={8}>
                <Row style={{width: "100%"}}>
                  <Col span={12}>
                    <Button
                    style={{width: "100%"}}
                      className="btn_filter"
                      type="submit"
                      onClick={(e) => handleSubmitSearch(e)}
                    >
                      Tìm kiếm
                    </Button>
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Button
                      className="btn_clear"
                      onClick={(e) => clearFillter(e)}
                      style={{marginLeft: "5px"}}
                    >
                      Làm mới
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col span={9}>
            <Row>
              <Col span={3} className="text">
                {" "}
              </Col>
              <Col span={20}>
                <Row>
                  <Col span={11}>
                    <Input
                      type="date"
                      style={{ width: "98%" }}
                      value={fillter.startTimeString}
                      placeholder= "Từ ngày"
                      onChange={(value) =>
                        changFillter(value.target.value, "startTimeString")
                      }
                    />
                  </Col>
                  <Col
                    span={1}
                    style={{ textAlign: "center", margin: "6px 4px 0px 4px" }}
                  >
                    <RightOutlined />
                  </Col>
                  <Col span={11}>
                    <Input
                      type="date"
                      style={{ width: "98%" }}
                      value={fillter.endTimeString}
                      onChange={(value) =>
                        changFillter(value.target.value, "endTimeString")
                      }
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={1}></Col>
            </Row>
          </Col>
          <Col
            span={4}
            className="text"
            align={"end"}
            style={{ margin: "0px" }}
          >
            <Link to={"/sale-counter"} style={{ marginRight: "10px" }}>
              <Button type="primary" icon={<PlusOutlined />} size={"large"}>
                Tạo đơn hàng
              </Button>
            </Link>
          </Col>
        </Row>
       
        <Row style={{ marginTop: "15px" }}>
          {/* <Col span={12}>
            <Row>
              <Col span={24} className="text" style={{ margin: "0px" }}>
                <Select
                  mode="multiple"
                  style={{ width: "98%" }}
                  // className="select_multi"
                  placeholder="Trạng thái"
                  defaultValue={fillter.status}
                  onChange={(value) => handleSelectMultipleChange(value)}
                  optionLabelProp="label"
                  allowClear
                  value={status}
                >
                  {data.map((item, index) => (
                    <Option value={item.id} label={item.name} key={index}>
                      <Space>{item.name}</Space>
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col> */}
          <Col span={12}>
            <Row style={{ marginLeft: "15px" }}>
              <Col span={24}>
                <Select
                  style={{ width: "98%" }}
                  value={fillter.type}
                  onChange={(value) => {changFillter(value, "type")}}
                  defaultValue={-1}
                >
                  <Option value={''} disabled>
                    Loại  đơn
                  </Option>
                  <Option value={'OFFLINE'}>Tại quầy</Option>
                  <Option value={'ONLINE'}>Online</Option>
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default FormSearch;
