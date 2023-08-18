import { useEffect, useState } from "react";
import AddressService from "../../../service/AddressService";
import { Button, Form, Input, Modal, Select, Table } from "antd";
import ReactPaginate from "react-paginate";
import moment from "moment";
import "./address.scss";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SearchOutlined } from "@mui/icons-material";
import { Offcanvas } from "react-bootstrap";

const TableAddress = () => {
  const [listAddressPage, setListAddressPage] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // tạo đối tượng để hứng data inputs
  const [formData, setFormData] = useState({
    line: "",
    city: "",
    province: "",
    country: "",
    user: "",
  });

  const [formDataSearch, setFormDataSearch] = useState({
    line: "",
    city: "",
    province: "",
    country: "",
    userId: "",
  });
  const [load, setLoad] = useState(false);
  // gọi hàm getOneById ở service sang
  const getOne = (id) => {
    AddressService.getOneById(id)
      .then((response) => {
        console.log(response.data.data);
        setFormData({
          line: response.data.data.line,
          city: response.data.data.city,
          province: response.data.data.province,
          country: response.data.data.country,
          userId: response.data.data.nameUser,
        });
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  //    Modal update address
  //   -- showModal là mở modal lên
  //   -- handleOk là mở modal xác nhận
  //   -- handleCancel là đóng lại modanl
  const openModal = (id) => {
    setSelectedAddressId(id);
    // Lấy dữ liệu từ máy chủ trước khi mở modal
    // gán dư liệu cho formdata
    getOne(id);
    setIsModalOpen(true);
  };

  const openModalAdd = () => {
    setFormData({
      // line: "",
      // city: "",
      // province: "",
      // country: "",
      // userId: "Mời chọn",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      line: "",
      city: "",
      province: "",
      country: "",
      userId: "Mời chọn",
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      line: "",
      city: "",
      province: "",
      country: "",
      userId: "",
    });
  };

  const handlePageClick = (event) => {
    loadData(+event.selected);
  };

  const update = (id, address) => {
    AddressService.updateAddress(id, address).catch((err) => {
      console.log(err);
    });
  };

  const add = (address) => {
    AddressService.addAddress(address).catch((err) => {
      console.log(err);
    });
  };

  useEffect(() => {
    // loadData(0, "", "", "", "", "", "");
    loadData(0);
    setLoad(false);
    setDataUser( AddressService.getAllUser())
    console.log(dataUser);
  }, [load]);

  const loadData = async (page) => {
    AddressService.fetchAllAddress(page)
      .then((res) => {
        setListAddressPage(res.data.data.data);
        setTotalPage(res.data.data.totalPages);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // const loadData = async (page, line, city, province, country, user) => {
  //   AddressService.fetchAllAddress(page, line, city, province, country, user)
  //     .then((res) => {
  //       setListAddressPage(res.data.data.data);
  //       setTotalPage(res.data.data.totalPages);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // xử lý update address

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.line) {
      toast.error("Vui lòng nhập Đường");
      return;
    }
    if (!formData.city) {
      toast.error("Vui lòng nhập thành phố");
      return;
    }
    if (!formData.province) {
      toast.error("Vui lòng nhập tỉnh");
      return;
    }
    if (!formData.country) {
      toast.error("Vui lòng nhập quốc gia");
      return;
    }

    if (selectedAddressId === null) {
      add(formData);
      toast.success("Thêm thành công");
    } else {
      update(selectedAddressId, formData);
      setSelectedAddressId(null);
      toast.success("Update thành công");
    }

    // update(selectedAddressId, formData);
    setFormData({
      line: "",
      city: "",
      province: "",
      country: "",
      userId: "",
    });
    setLoad(true);
    closeModal();
  };

  const handleSubmitSeacrh = (e) => {
    e.preventDefault();
    setLoad(true);
    closeModal();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // lấy dữ liệu ở combox
  const handleSelectChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      userId: value,
    }));
  };

  // colum table
  const columns = [
    {
      title: <div className="title-address">STT</div>,
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: <div className="title-address">Người dùng</div>,
      dataIndex: "nameUser",
      key: "nameUser",
    },
    {
      title: <div className="title-address">Đường</div>,
      dataIndex: "line",
      key: "line",
    },
    {
      title: <div className="title-address">Thành phố</div>,
      dataIndex: "city",
      key: "city",
    },
    {
      title: <div className="title-address">Tỉnh</div>,
      dataIndex: "province",
      key: "province",
    },
    {
      title: <div className="title-address">Quốc gia</div>,
      dataIndex: "country",
      key: "country",
    },
    {
      title: <div className="title-address">Ngày Tạo</div>,
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) => {
        const formattedDate = moment(text).format("DD-MM-YYYY"); // Định dạng ngày
        return formattedDate;
      },
    },
    {
      title: <div className="title-address">Ngày Cập Nhập</div>,
      dataIndex: "lastModifiedDate",
      key: "lastModifiedDate",
      render: (text) => {
        const formattedDate = moment(text).format("DD-MM-YYYY"); // Định dạng ngày
        return formattedDate;
      },
    },
    {
      title: <div className="title-address">Thao Tác</div>,
      dataIndex: "id",
      key: "actions",
      render: (id) => (
        <div className="action-buttons">
          <Link
            title="Chi tiết địa chỉ"
            className="btn btn-info"
            onClick={() => openModal(id)}
          >
            {" "}
            <FontAwesomeIcon icon={faEye} />{" "}
          </Link>
          <Link
            title="Chỉnh sửa địa chỉ"
            className="btn btn-success"
            onClick={() => openModal(id)}
          >
            {" "}
            <FontAwesomeIcon icon={faEdit} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="row">
        <div>
          <Button
            title="Lọc địa chỉ"
            className="btn btn-outline-warning btn-"
            onClick={handleShow}
            style={{
              float: "right",
              marginRight: "20px",
              marginBottom: "20px",
            }}
          >
            Lọc
          </Button>
          <Button
            title="Thêm địa chỉ"
            className="btn btn-outline-dark"
            onClick={() => openModalAdd()}
            style={{
              float: "right",
              marginRight: "20px",
              marginBottom: "20px",
            }}
          >
            + Thêm
          </Button>
        </div>
      </div>
      {/* Bảng hiện thị */}
      <Table
        dataSource={listAddressPage}
        columns={columns}
        rowKey="id"
        pagination={false} // Disable default pagination
      />

      {/* Phân trang */}
      <div className="pagination-container">
        <ReactPaginate
          previousLabel={"<<"}
          nextLabel={">>"}
          breakLabel={"..."}
          pageCount={totalPage}
          marginPagesDisplayed={1}
          pageRangeDisplayed={2}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
      </div>

      {/* Modal */}
      <Modal
        title="Địa chỉ"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
      >
        <Form onSubmit={handleSubmit} layout="vertical">
          <Form.Item label="Đường">
            <Input
              type="text"
              name="line"
              value={formData.line}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Thành phố">
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Tỉnh">
            <Input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Quốc gia">
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Người dùng">
            <Select
              name="userId"
              value={formData.userId}
              onChange={handleSelectChange}
            >
             { dataUser.map(item => {
                return <Select.Option value={item.id}>
                {item.userName}
              </Select.Option>
             })}
              
             
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Offcanvas show={show} onHide={handleClose} placement={"end"}>
        <div className="row">
          {/* <Search style={{ height: "90%" }} /> */}
          <div
            className="container"
            style={{ height: "100%", marginLeft: "10px" }}
          >
            {" "}
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Tìm kiếm</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body style={{ height: "500px" }}>
              <div className="row">
                <div className="row">
                  <div className="row">Người dùng</div>
                  <div className="row">
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      value={formDataSearch.user}
                      name="userId"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="row">Đường</div>
                  <div className="row">
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      value={formDataSearch.line}
                      name="line"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="row">Thành phố</div>
                  <div className="row">
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      value={formDataSearch.city}
                      name="city"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="row">Tỉnh</div>
                  <div className="row">
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      value={formDataSearch.province}
                      name="province"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="row">Quốc gia</div>
                  <div className="row">
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      value={formDataSearch.country}
                      name="country"
                    />
                  </div>
                </div>
                <div className="row"></div>
              </div>
            </Offcanvas.Body>
          </div>
        </div>
        <div className="row">
          <div className="col-7"></div>
          <button
            style={{ marginLeft: "10px", height: "35px" }}
            className="btn btn-primary col-4"
            onClick={() => handleSubmitSeacrh()}
          >
            Tìm kiếm{" "}
          </button>
        </div>
      </Offcanvas>
    </>
  );
};
export default TableAddress;
