import React, { useEffect, useState } from "react";
import { Input, Button, Select, Table, Slider, Row, Col, Modal } from "antd";
import "react-toastify/dist/ReactToastify.css";
import "./style-customer.css";
import { CustomerApi } from "../../../api/employee/account/customer.api";
import { AddressApi } from "../../../api/customer/address/address.api";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { Link } from "react-router-dom";
import {
  GetCustomer,
  SetCustomer,
} from "../../../app/reducer/Customer.reducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEye,
  faFilter,
  faKaaba,
  faListAlt,
  faPlus,
  faMap,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment/moment";
import ModalCreateAddress from "./modal/ModalCreateAddress";
import ModalUpdateAddress from "./modal/ModalUpdateAddress";
const { Option } = Select;

const CustomerManagement = () => {
  const [initialCustomerList, setInitialCustomerList] = useState([]);
  const [listaccount, setListaccount] = useState([]);
  const [initialStartDate, setInitialStartDate] = useState(null);
  const [initialEndDate, setInitialEndDate] = useState(null);
  const dispatch = useAppDispatch();
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [searchCustomer, setSearchCustomer] = useState({
    keyword: "",
    status: "",
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Lấy mảng redux ra
  const data = useAppSelector(GetCustomer);
  useEffect(() => {
    if (data != null) {
      setListaccount(data);
    }
  }, [data]);

  // Search customer
  const handleInputChangeSearch = (name, value) => {
    setSearchCustomer((prevSearchCustomer) => ({
      ...prevSearchCustomer,
      [name]: value,
    }));
  };

  const handleKeywordChange = (event) => {
    const { value } = event.target;
    handleInputChangeSearch("keyword", value);
  };

  const handleStatusChange = (value) => {
    handleInputChangeSearch("status", value);
  };
  const handleAgeRangeChange = (value) => {
    setAgeRange(value);
  };
  useEffect(() => {
    const { keyword, status } = searchCustomer;
    CustomerApi.fetchAll({ status }).then((res) => {
      const filteredCustomers = res.data.data.filter(
        (customer) =>
          customer.fullName.includes(keyword) ||
          customer.email.includes(keyword) ||
          customer.phoneNumber.includes(keyword)
      );
      setListaccount(filteredCustomers);
      dispatch(SetCustomer(filteredCustomers));
    });
  }, [searchCustomer.status]);

  const handleSubmitSearch = (event) => {
    event.preventDefault();
    const { keyword, status } = searchCustomer;

    CustomerApi.fetchAll({ status }).then((res) => {
      const filteredCustomers = res.data.data
        .filter(
          (customer) =>
            customer.fullName.toLowerCase().includes(keyword) ||
            customer.email.includes(keyword) ||
            customer.phoneNumber.includes(keyword)
        )
        .map((customer, index) => ({
          ...customer,
          stt: index + 1,
        }));
      setListaccount(filteredCustomers);
      dispatch(SetCustomer(filteredCustomers));
    });
  };

  // Lọc danh sách theo khoảng ngày sinh
  const filterByDateOfBirthRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setListaccount(initialCustomerList);
      dispatch(SetCustomer(initialCustomerList));
      return;
    }

    const filteredCustomers = initialCustomerList.filter((customer) => {
      const accountDateOfBirth = moment(customer.dateOfBirth).startOf("day");
      const start = moment(startDate).startOf("day");
      const end = moment(endDate).endOf("day");
      return accountDateOfBirth.isBetween(start, end, null, "[]");
    });

    setListaccount(filteredCustomers);
    dispatch(SetCustomer(filteredCustomers));
  };
  const handleStartDateChange = (event) => {
    const startDate = event.target.value;
    setStartDate(startDate);
    filterByDateOfBirthRange(startDate, endDate);
  };

  const handleEndDateChange = (event) => {
    const endDate = event.target.value;
    setEndDate(endDate);
    filterByDateOfBirthRange(startDate, endDate);
  };

  const handleClear = () => {
    setSearchCustomer({
      keyword: "",
      status: "",
    });
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    filterByDateOfBirthRange(initialStartDate, initialEndDate);
    setListaccount(
      initialCustomerList.map((customer, index) => ({
        ...customer,
        stt: index + 1,
      }))
    );
    loadData();
  };
  const filterByAgeRange = (minAge, maxAge) => {
    if (minAge === 0 && maxAge === 100) {
      setListaccount(initialCustomerList);
      dispatch(SetCustomer(initialCustomerList));
    } else {
      const filteredAccounts = initialCustomerList.filter((customer) => {
        const age = moment().diff(customer.dateOfBirth, "years");
        return age >= minAge && age <= maxAge;
      });

      setListaccount(filteredAccounts);
      dispatch(SetCustomer(filteredAccounts));
    }
  };
  const loadData = () => {
    CustomerApi.fetchAll().then(
      (res) => {
        const accounts = res.data.data.map((customer, index) => ({
          ...customer,
          stt: index + 1,
        }));
        setListaccount(res.data.data);
        setInitialCustomerList(accounts);
        setInitialStartDate(null);
        setInitialEndDate(null);
        dispatch(SetCustomer(res.data.data));
      },
      (err) => {
        console.log(err);
      }
    );
  };

  // Xử lý logic chỉnh sửa
  const [idUpdate, setIdUpdate] = useState("");
  const [idDetail, setIdDetail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleAddAddress, setModalVisibleAddAddress] = useState(false);
  const [modalVisibleUpdateAddress, setModalVisibleUpdateAddress] =
    useState(false);
  const [modalVisibleUpdate, setModalVisibleUpdate] = useState(false);
  const [modalVisibleDetail, setModalVisibleDetail] = useState(false);
  const [addressId, setAddressId] = useState("");
  const [customerId, setCustomerId] = useState("");

  const handleViewUpdate = (id) => {
    setAddressId(id);
    setModalVisibleUpdateAddress(true);
    setIsModalAddressOpen(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setModalVisibleAddAddress(false);
    setModalVisibleUpdateAddress(false);
    setModalVisibleUpdate(false);
    setModalVisibleDetail(false);
  };

  const handleViewDetail = (id) => {
    setIdDetail(id);
    setModalVisibleDetail(true);
  };

  const handleUpdate = (id) => {
    setIdUpdate(id);
    setModalVisibleUpdate(true);
  };

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    filterByAgeRange(ageRange[0], ageRange[1]);
  }, [ageRange, initialCustomerList]);
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      sorter: (a, b) => a.stt - b.stt,
    },
    {
      title: "Ảnh",
      dataIndex: "avata",
      key: "avata",
      render: (avata) => (
        <img
          src={avata}
          alt="Hình ảnh"
          style={{ width: "150px", height: "110px", borderRadius: "20px" }}
        />
      ),
    },
    {
      title: "Tên khách hàng",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      sorter: (a, b) => a.dateOfBirth - b.dateOfBirth,
      render: (date) => moment(date).format("DD-MM-YYYY"),
    },
    {
      title: "Điểm",
      dataIndex: "points",
      key: "points",
      sorter: (a, b) => a.points.localeCompare(b.points),
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
            {text === "DANG_SU_DUNG" ? "Kích hoạt " : "Ngừng kích hoạt"}
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
          <Link to={`/detail-customer-management/${record.id}`}>
            <Button
              type="primary"
              title="Chi tiết khách hàng"
              style={{ backgroundColor: "#FF9900" }}
              onClick={() => handleViewDetail(record.id)}
            >
              <FontAwesomeIcon icon={faEye} />
            </Button>
          </Link>
          <Link to={`/update-customer-management/${record.id}`}>
            <Button
              type="primary"
              title="Chỉnh sửa khách hàng"
              style={{ backgroundColor: "green", borderColor: "green" }}
              onClick={() => handleUpdate(record.id)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </Link>

          <Button
            type="primary"
            title="Địa chỉ khách hàng"
            style={{ backgroundColor: "black", borderColor: "black" }}
            onClick={() => selectedAccount(record)}
          >
            <FontAwesomeIcon icon={faMap} />
          </Button>
        </div>
      ),
    },
  ];
  const columnsAddress = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      sorter: (a, b) => a.stt - b.stt,
    },
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phonenumber",
      key: "phonenumber",
      sorter: (a, b) => a.phonenumber.localeCompare(b.phonenumber),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      sorter: (a, b) => a.address.localeCompare(b.address),
    },

    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        const genderClass = text === "DANG_SU_DUNG" ? "trangthai-sd" : "";
        return (
          <button className={`gender ${genderClass}`}>
            {text === "DANG_SU_DUNG" ? "Mặc định " : ""}
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
            type="dashed"
            title="Chọn"
            style={{
              color: "#02bdf0",
              border: "1px solid #02bdf0",
              fontWeight: "500",
            }}
            onClick={() => handleViewUpdate(record.id)}
          >
            Cập nhật
          </Button>
        </div>
      ),
    },
  ];
  const [isModalAddressOpen, setIsModalAddressOpen] = useState(false);

  const showModalAddress = (e) => {
    setIsModalAddressOpen(true);
  };
  const handleOkAddress = () => {
    setIsModalAddressOpen(false);
  };
  const handleCancelAddress = () => {
    setIsModalAddressOpen(false);
  };
  const handleOpenAddAdress = () => {
    setIsModalAddressOpen(false);
    setModalVisibleAddAddress(true);
  };
  const [listAddress, setListAddress] = useState([]);

  const selectedAccount = (record) => {
    console.log(record);
    setIsModalAddressOpen(true);
    setCustomerId(record.id);
    AddressApi.fetchAllAddressByUser(record.id).then((res) => {
      setListAddress(res.data.data);
    });
  };

  return (
    <>
      <div className="title_account">
        {" "}
        <FontAwesomeIcon icon={faKaaba} style={{ fontSize: "26px" }} />
        <span style={{ marginLeft: "10px" }}>Quản lý tài khoản khách hàng</span>
      </div>
      <div className="filter">
        <FontAwesomeIcon icon={faFilter} size="2x" />{" "}
        <span style={{ fontSize: "18px", fontWeight: "500" }}>Bộ lọc</span>
        <hr />
        <div className="content">
          <div className="content-wrapper">
            <div>
              <Row>
                <Input
                  style={{
                    width: "250px",
                    height: "38px",
                    marginRight: "8px",
                  }}
                  placeholder="Tìm kiếm"
                  type="text"
                  name="keyword"
                  value={searchCustomer.keyword}
                  onChange={handleKeywordChange}
                />
                <Button
                  className="btn_filter"
                  type="submit"
                  onClick={handleSubmitSearch}
                >
                  Tìm kiếm
                </Button>
                <Button
                  className="btn_clear"
                  key="submit"
                  type="primary"
                  onClick={handleClear}
                >
                  Làm mới bộ lọc
                </Button>
                ,
              </Row>
            </div>
          </div>
        </div>
        <div>
          <Row gutter={[24, 16]}>
            <Col span={6}>
              <div>
                Trạng thái :{" "}
                <Select
                  style={{ width: "90%", marginLeft: "" }}
                  name="status"
                  value={searchCustomer.status}
                  onChange={handleStatusChange}
                >
                  <Option value="">Tất cả</Option>
                  <Option value="DANG_SU_DUNG">Kích hoạt</Option>
                  <Option value="KHONG_SU_DUNG">Ngừng kích hoạt</Option>
                </Select>
              </div>
            </Col>
            <Col span={10}>
              <div>
                Ngày sinh : <br />
                <Input
                  style={{ width: "47%", height: "40px" }}
                  type="date"
                  value={startDate || initialStartDate}
                  onChange={handleStartDateChange}
                />
                <Input
                  style={{ width: "47%", height: "40px" }}
                  type="date"
                  value={endDate || initialEndDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </Col>
            <Col span={8}>
              Khoảng tuổi:<br></br>
              <Slider
                style={{ width: "70%" }}
                range
                min={0}
                max={100}
                defaultValue={ageRange}
                value={ageRange}
                onChange={handleAgeRangeChange}
              />
            </Col>
          </Row>
        </div>
      </div>
      <div className="account-table">
        <div
          className="title_account"
          style={{ display: "flex", alignItems: "center" }}
        >
          <FontAwesomeIcon
            icon={faListAlt}
            style={{ fontSize: "26px", marginRight: "10px" }}
          />
          <span style={{ fontSize: "18px", fontWeight: "500" }}>
            Danh sách khách hàng
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Link to="/create-customer-management">
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faPlus} />}
                onClick={() => setModalVisible(true)}
              >
                Thêm
              </Button>
            </Link>
          </div>
        </div>
        <div style={{ marginTop: "25px" }}>
          <Table
            dataSource={listaccount}
            rowKey="id"
            columns={columns}
            pagination={{ pageSize: 3 }}
            className="customer-table"
          />
        </div>
      </div>

      <ModalCreateAddress
        visible={modalVisibleAddAddress}
        onCancel={handleCancel}
        id={customerId}
      />
      <ModalUpdateAddress
        visible={modalVisibleUpdateAddress}
        onCancel={handleCancel}
        id={addressId}
      />
      {/* begin modal Address */}
      <Modal
        title="Địa chỉ"
        open={isModalAddressOpen}
        onOk={handleOkAddress}
        className="account"
        onCancel={handleCancelAddress}
      >
        <Row style={{ width: "100%" }}>
          <Col span={20}></Col>
          <Col span={1}></Col>
          <Col span={3}>
            {" "}
            <Button
              className="btn_filter"
              type="submit"
              onClick={() => handleOpenAddAdress()}
            >
              Thêm địa chỉ
            </Button>
          </Col>
        </Row>
        <Row style={{ width: "100%", marginTop: "20px" }}>
          <Table
            style={{ width: "100%" }}
            dataSource={listAddress}
            rowKey="id"
            columns={columnsAddress}
            pagination={{ pageSize: 3 }}
            className="customer-table"
          />
        </Row>
      </Modal>
      {/* end  modal Address */}
    </>
  );
};
export default CustomerManagement;
