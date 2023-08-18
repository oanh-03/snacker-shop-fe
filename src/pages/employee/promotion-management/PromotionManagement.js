import React, { useEffect, useState, useRef } from "react";
import "./style-promotion.css";
import {
  Form,
  Input,
  Button,
  Select,
  Table,
  Modal,
  InputNumber,
  Popconfirm,
  DatePicker,
} from "antd";
import { Link } from "react-router-dom";
import { PromotionApi } from "../../../api/employee/promotion/Promotion.api";
import {
  CreatePromotion,
  GetPromotion,
  SetPromotion,
  UpdatePromotion,
} from "../../../app/reducer/Promotion.reducer";
import {
  faEdit,
  faEye,
  faFilter,
  faKaaba,
  faListAlt,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
dayjs.extend(utc);
const PromotionManagement = () => {
  const dispatch = useAppDispatch();
  const [list, setList] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [formDataSearch, setFormDataSearch] = useState({});
  const [showData, setShowData] = useState(true);
  const [id, setId] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const receiveFormData = useRef({});
  const data = useAppSelector(GetPromotion);

  useEffect(() => {
    if (data != null) {
      setList(data);
    }
  }, [data]);

  useEffect(() => {
    loadData();
  }, [showData, formDataSearch]);

 

  const closeModal = () => {
    setModal(false);
    setShowDetail(false);
  };

  const resetFormSearch = () => {
    setFormDataSearch({});
    loadData();
  };
  const convertToLong = () => {
    const convertedFormData = { ...formData };
    if (formData.startDate) {
      convertedFormData.startDate = dayjs(formData.startDate).unix() * 1000;
    }
    if (formData.endDate) {
      convertedFormData.endDate = dayjs(formData.endDate).unix() * 1000;
    }
    return convertedFormData;
  };
  const convertToLongSearch = () => {
    const convertedFormDataSearch = { ...formDataSearch };
    if (formDataSearch.startDate) {
      convertedFormDataSearch.startDate =
        dayjs(formDataSearch.startDate).unix() * 1000;
    }
    if (formDataSearch.endDate) {
      convertedFormDataSearch.endDate =
        dayjs(formDataSearch.endDate).unix() * 1000;
    }
    return convertedFormDataSearch;
  };

  const loadData = () => {
    PromotionApi.fetchAll(convertToLongSearch()).then(
      (res) => {
        setList(res.data.data);
        dispatch(SetPromotion(res.data.data));
        console.log(res.data.data);
      },
      (err) => {
        console.log(err);
      }
    );
  };
  const detailPromotion = (id) => {
    PromotionApi.getOne(id).then(
      (res) => {
        const  getDetailPromotion = res.data.data
        setFormData({
          name: getDetailPromotion.name,
          code:getDetailPromotion.code,
          value: getDetailPromotion.value,
          startDate: dayjs(getDetailPromotion.startDate),
          endDate: dayjs(getDetailPromotion.endDate),
          status: getDetailPromotion.status,
          createdDate: dayjs(getDetailPromotion.createdDate),
        })
      },
      (err) => console.log(err)
    );
  };

  const handleInputChangeSearch = (name, value) => {
    setFormDataSearch({ ...formDataSearch, [name]: value });
  };
  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };
  const openUpdate = (id) => {
    localStorage.setItem("id", id);
  };
  const openDetail = (id) => {
    setModal(true);
    detailPromotion(id);
    setShowDetail(true);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      sorter: (a, b) => a.stt - b.stt,
    },
    {
      title: "Mã khuyến mại",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Tên khuyến mại",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },

    {
      title: "Giá trị giảm",
      dataIndex: "value",
      key: "value",
      sorter: (a, b) => a.value - b.value,
      render: (value) => `${value}%`,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => a.startDate - b.startDate,
      render: (date) => dayjs(date).format("HH:mm:ss  DD-MM-YYYY "),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => a.endDate - b.endDate,
      render: (date) => dayjs(date).format("HH:mm:ss DD-MM-YYYY"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "lastModifiedDate",
      key: "lastModifiedDate",
      sorter: (a, b) => a.lastModifiedDate - b.lastModifiedDate,
      render: (date) => dayjs(date).format("HH:mm:ss DD-MM-YYYY"),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        const genderClass =
          text === "DANG_SU_DUNG" ? "trangthai-sd" : "trangthai-ksd";
        return (
          <button className={`gender ${genderClass}`}>
            {text === "DANG_SU_DUNG" ? "Còn hạn " : "Hết hạn"}
          </button>
        );
      },
    },
    {
      title: "Hành động",
      dataIndex: "hanhDong",
      key: "hanhDong",
      render: (text, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            title="Chi tiết thể loại"
            style={{ backgroundColor: "#FF9900" }}
            onClick={() => openDetail(record.id)}
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
          <Link to="/update-promotion-management">
            <Button
              type="primary"
              title="Chỉnh sửa thể loại"
              style={{ backgroundColor: "green", borderColor: "green" }}
              onClick={() => openUpdate(record.id)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const { Option } = Select;
  const fields = [
    {
      name: "code",
      type: "text",
      label: "Mã khuyễn mại",
      text: "mã khuyễn mại",
      hidden: true,
      class: "input-form",
    },
    {
      name: "name",
      type: "text",
      label: "Tên khuyễn mại",
      text: "tên khuyễn mại",
      class: "input-form",
    },
    {
      name: "value",
      type: "number",
      label: "Giá trị giảm",
      text: "giá trị giảm",
      class: "input-form",
      formatter: (value) => `${value}%`,
    },
    {
      name: "startDate",
      type: "date",
      label: "Ngày bắt đầu",
      text: "ngày bắt đầu",
      class: "input-form",
    },
    {
      name: "endDate",
      type: "date",
      label: "Ngày kết thúc",
      text: "ngày kết thúc",
      class: "input-form",
    },
    {
      name: "status",
      type: "select",
      label: "Trạng thái",
      options: [
        { value: "DANG_SU_DUNG", label: "Đang sử dụng" },
        { value: "KHONG_SU_DUNG", label: "Không sử dụng" },
      ],
      text: "trạng thái",
      class: "input-form",
    },
    {
      name: "createdDate",
      type: "date",
      label: "Ngày tạo",
      text: "ngày tạo",
      hidden: true,
      class: "input-form",
    },
  ];

  const fieldsSearch = [
    {
      name: "code",
      type: "text",
      label: "Mã khuyễn mại",
      class: "input-search",
      placeholder: "Tìm kiếm",
    },
    {
      name: "name",
      type: "text",
      label: "Tên khuyễn mại",
      class: "input-search",
      placeholder: "Tìm kiếm",
    },
    {
      name: "value",
      type: "number",
      label: "Giá trị giảm",
      class: "input-search",
      placeholder: "Tìm kiếm",
      formatter: (value) => `${value}%`,
    },
    {
      name: "status",
      type: "select",
      label: "Trạng thái",
      options: [
        { value: "DANG_SU_DUNG", label: "Đang sử dụng" },
        { value: "KHONG_SU_DUNG", label: "Không sử dụng" },
      ],
      class: "input-search",
      placeholder: "Tìm kiếm",
    },
    {
      name: "startDate",
      type: "date",
      label: "Từ ngày",
      class: "input-search",
      placeholder: "Tìm kiếm",
    },
    {
      name: "endDate",
      type: "date",
      label: "Đến ngày",
      class: "input-search",
      placeholder: "Tìm kiếm",
    },
  ];
  return (
    <div className="promotion">
      <h1 className="title-promotion">
        {" "}
        <FontAwesomeIcon icon={faKaaba} /> Quản lý khuyến mại
      </h1>

      <div className="form-search">
        <h3>
          <FontAwesomeIcon icon={faFilter} /> Bộ lọc
        </h3>
        <hr></hr>

        <div className="row-search">
          {fieldsSearch.map((field, index) => {
            return (
              <div key={index}>
                <Form.Item label={field.label}>
                  {field.type === "number" && (
                    <InputNumber
                      className={field.class}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formDataSearch[field.name] || ""}
                      onChange={(value) =>
                        handleInputChangeSearch(field.name, value)
                      }
                      min="1"
                      formatter={field.formatter}
                    />
                  )}
                  {field.type === "date" && (
                    <DatePicker
                      className={field.class}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formDataSearch[field.name]}
                      onChange={(value) => {
                        handleInputChangeSearch(field.name, value);
                      }}
                      format="DD-MM-YYYY"
                    />
                  )}

                  {field.type === "select" && (
                    <Select
                      className={field.class}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formDataSearch[field.name] || ""}
                      onChange={(value) =>
                        handleInputChangeSearch(field.name, value)
                      }
                    >
                      <Option value="">Tất cả</Option>
                      {field.options.map((option, optionIndex) => (
                        <Option key={optionIndex} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                  {field.type !== "date" &&
                    field.type !== "select" &&
                    field.type !== "number" && (
                      <Input
                        className={field.class}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formDataSearch[field.name] || ""}
                        onChange={(e) =>
                          handleInputChangeSearch(field.name, e.target.value)
                        }
                      />
                    )}
                </Form.Item>
              </div>
            );
          })}
        </div>

        <div className="reset-form-search">
          <Button
            title="Làm mới mục tìm kiếm"
            className="button-submit"
            onClick={resetFormSearch}
          >
            Làm mới
          </Button>
        </div>
      </div>

      <h3>
        {" "}
        <FontAwesomeIcon icon={faListAlt} /> Danh sách khuyến mãi{" "}
      </h3>
      <hr></hr>
      <div className="manager-promotion">

        <Link to="/create-promotion-management">
          <Button title="Thêm khuyến mại" className="button-add">
            + Thêm
          </Button>
        </Link>

        <div className="promotion-table">
          <Table
            dataSource={list}
            rowKey="id"
            columns={columns}
            pagination={{ pageSize: 5 }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "even-row" : "odd-row"
            }
          />
        </div>
      </div>

      {/* modal */}
      <Modal
        title={
          showDetail === true ? "Chi tiết khuyễn mại" : " Cập nhập khuyến mại"
        }
        visible={modal}
        onCancel={closeModal}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <hr></hr>
        <br></br>
        <Form
          name="wrap"
          labelCol={{
            flex: "110px",
          }}
          labelAlign="left"
          labelWrap
          wrapperCol={{
            flex: 1,
          }}
          colon={false}
          style={{
            maxWidth: 600,
          }}
        >
          {fields.map((field, index) => {
            return (
              <div key={index}>
                <Form.Item
                  label={field.label}
                  validateStatus={formErrors[field.name] ? "error" : ""}
                  help={formErrors[field.name] || ""}
                  style={{
                    display: field.hidden && !showDetail ? "none" : "block",
                  }}
                >
                  {field.type === "number" && (
                    <InputNumber
                      className={field.class}
                      readOnly={showDetail}
                      name={field.name}
                      placeholder={field.label}
                      value={`${formData[field.name]}%` || ""}
                      onChange={(value) => {
                        if (!showDetail) {
                          handleInputChange(field.name, value);
                        }
                      }}
                      min="1"
                    />
                  )}
                  {field.type === "date" &&
                    (showDetail ? (
                      <Input
                        className={field.class}
                        readOnly={true}
                        name={field.name}
                        placeholder={field.label}
                        value={dayjs(formData[field.name]).format("DD-MM-YYYY")}
                      />
                    ) : (
                      <DatePicker
                        showTime
                        className={field.class}
                        readOnly={showDetail}
                        name={field.name}
                        placeholder={field.label}
                        value={formData[field.name]}
                        onChange={(value) => {
                          handleInputChange(field.name, value);
                        }}
                      />
                    ))}
                  {field.type === "select" &&
                    (showDetail ? (
                      <Input
                        className={field.class}
                        readOnly={true}
                        name={field.name}
                        placeholder={field.label}
                        value={
                          formData[field.name] === "DANG_SU_DUNG"
                            ? "Đang sử dụng"
                            : "Không sử dụng"
                        }
                      />
                    ) : (
                      <Select
                        className={field.class}
                        readOnly={showDetail}
                        name={field.name}
                        placeholder={field.label}
                        value={formData[field.name] || ""}
                        onChange={(value) => {
                          if (!showDetail) {
                            handleInputChange(field.name, value);
                          }
                        }}
                      >
                        <Option value="">Chọn trạng thái</Option>
                        {field.options.map((option, optionIndex) => (
                          <Option key={optionIndex} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    ))}

                  {field.type !== "date" &&
                    field.type !== "select" &&
                    field.type !== "number" && (
                      <Input
                        className={field.class}
                        readOnly={showDetail}
                        name={field.name}
                        placeholder={field.label}
                        value={formData[field.name] || ""}
                        onChange={(e) => {
                          if (!showDetail) {
                            handleInputChange(field.name, e.target.value);
                          }
                        }}
                      />
                    )}
                </Form.Item>
              </div>
            );
          })}

          <Form.Item label=" ">
            <Button onClick={closeModal}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManagement;
