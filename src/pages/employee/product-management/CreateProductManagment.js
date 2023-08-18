import { Option } from "antd/es/mentions";
import "./style-product.css";
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Upload,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleMinus,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { MaterialApi } from "../../../api/employee/material/Material.api";
import { CategoryApi } from "../../../api/employee/category/category.api";
import { SoleApi } from "../../../api/employee/sole/sole.api";
import { BrandApi } from "../../../api/employee/brand/Brand.api";
import { ColorApi } from "../../../api/employee/color/Color.api";
import ModalCreateSole from "../sole-management/modal/ModalCreateSole";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { GetSole, SetSole } from "../../../app/reducer/Sole.reducer";
import { GetSize } from "../../../app/reducer/Size.reducer";
import ModalCreateBrand from "../brand-management/modal/ModalCreateBrand";
import ModalCreateCategory from "../category-management/modal/ModalCreateCategory";
import ModalCreateMaterial from "../material-management/modal/ModalCreateManterial";
import {
  GetMaterail,
  SetMaterial,
} from "../../../app/reducer/Materail.reducer";
import {
  GetCategory,
  SetCategory,
} from "../../../app/reducer/Category.reducer";
import { GetBrand, SetBrand } from "../../../app/reducer/Brand.reducer";
import { ProductApi } from "../../../api/employee/product/product.api";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import ModalAddSizeProduct from "./modal/ModalAddSizeProduct";
import { toast } from "react-toastify";
import AddColorModal from "./modal/ModalAddColor";
import convert from "color-convert";

const CreateProductManagment = () => {
  const dispatch = useAppDispatch();
  const status = "DANG_SU_DUNG";
  const [form] = Form.useForm();
  const [modalAddSole, setModalAddSole] = useState(false);
  const [modalAddCategopry, setModalAddCategory] = useState(false);
  const [modalAddMaterial, setModalAddMaterial] = useState(false);
  const [modalAddBrand, setModalAddBrand] = useState(false);
  const [modalAddColor, setModalAddColor] = useState(false);
  const [modalAddSize, setModalAddSize] = useState(false);

  const dataSole = useAppSelector(GetSole);
  const dataCategory = useAppSelector(GetCategory);
  const dataMaterial = useAppSelector(GetMaterail);
  const dataBrand = useAppSelector(GetBrand);
  const dataSize = useAppSelector(GetSize);

  const initialValues = {
    status: "DANG_SU_DUNG",
  };

  const handleCancel = () => {
    setModalAddSole(false);
    setModalAddBrand(false);
    setModalAddMaterial(false);
    setModalAddColor(false);
    setModalAddCategory(false);
    setModalAddSize(false);
  };

  const [listMaterial, setListMaterial] = useState([]);
  const [listCategory, setListCategory] = useState([]);
  const [listBrand, setListBrand] = useState([]);
  const [listProduct, setListProduct] = useState([]);
  const [listSole, setListSole] = useState([]);

  const getList = () => {
    ProductApi.fetchAll().then((res) => {
      setListProduct(res.data.data);
    });
    MaterialApi.fetchAll({
      status: status,
    }).then((res) => {
      setListMaterial(res.data.data);
      dispatch(SetMaterial(res.data.data));
    });
    CategoryApi.fetchAll({
      status: status,
    }).then((res) => {
      setListCategory(res.data.data);
      dispatch(SetCategory(res.data.data));
    });
    SoleApi.fetchAll({
      status: status,
    }).then((res) => {
      setListSole(res.data.data);
      dispatch(SetSole(res.data.data));
    });
    BrandApi.fetchAll({
      status: status,
    }).then((res) => {
      setListBrand(res.data.data);
      dispatch(SetBrand(res.data.data));
    });
  };

  const handleSearch = (value) => {
    ProductApi.fetchAllByName({
      name: value,
    }).then((res) => {
      setListProduct(res.data.data);
    });
  };

  const renderOptions = (nameList) => {
    return nameList.map((product, index) => ({
      key: `${product}-${index}`,
      value: product,
      label: product,
    }));
  };

  const [listSizeAdd, setListSizeAdd] = useState([]);

  const handleSaveData = (selectedSizeData) => {
    console.log(selectedSizeData);
    selectedSizeData.forEach((selectedSizeData) => {
      // Kiểm tra xem kích thước đã tồn tại trong listSizeAdd chưa
      const existingSize = listSizeAdd.find(
        (item) => item.nameSize === selectedSizeData.size
      );

      if (existingSize) {
        // Nếu kích thước đã tồn tại, hiển thị cảnh báo
        toast.warning(
          `Kích cỡ ${selectedSizeData.size} đã tồn tại trong danh sách!`
        );
      } else {
        // Nếu kích thước chưa tồn tại, thêm vào listSizeAdd
        setListSizeAdd((prevList) => [
          ...prevList,
          {
            nameSize: selectedSizeData.size,
          },
        ]);
      }
    });
  };

  const [listColorAdd, setListColorAdd] = useState([]);

  const getColorName = (colorCode) => {
    const hexCode = colorCode.replace("#", "").toUpperCase();
    const rgb = convert.hex.rgb(hexCode);
    const colorName = convert.rgb.keyword(rgb);

    if (colorName === null) {
      return "Unknown"; // Trường hợp không tìm thấy tên màu
    } else {
      return colorName; // Trả về tên màu
    }
  };

  const handleSaveDataColor = (color) => {
    color.forEach((color) => {
      const existingSize = listColorAdd.find((item) => item.color === color);
      if (existingSize) {
        toast.warning(
          `Màu đã ${getColorName(color)} đã tồn tại trong danh sách!`
        );
      } else {
        setListColorAdd((prevList) => [
          ...prevList,
          {
            color: color,
          },
        ]);
      }
    });
    setModalAddColor(false);
  };

  const handleDeleteSize = (index, nameSize) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn kích cỡ " + nameSize + " này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        const updatedList = [...listSizeAdd];
        updatedList.splice(index, 1);
        setListSizeAdd(updatedList);
        toast.success("Đã xóa kích cỡ thành công");
      },
    });
  };

  const handleDeleteColor = (index, color) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn màu " + color + " này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        const updatedList = [...listColorAdd];
        updatedList.splice(index, 1);
        setListColorAdd(updatedList);
        toast.success("Đã xóa màu thành công");
      },
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isSubmitting) {
      window.location.href = "/product-management";
    }
  }, [isSubmitting]);

  const handleUpload = () => {
    form
      .validateFields()
      .then((values) => {
        return new Promise((resolve, reject) => {
          Modal.confirm({
            title: "Xác nhận",
            content: "Bạn có đồng ý thêm không?",
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: () => resolve(values),
            onCancel: () => reject(),
          });
        });
      })
      .then((values) => {
        console.log(tableData);
        console.log(listColorAndFileData);

        if (!listSizeAdd || listSizeAdd.length === 0) {
          toast.error("Bạn cần thêm kích thước cho sản phẩm");
          return;
        }
        if (!listColorAdd || listColorAdd.length === 0) {
          toast.error("Bạn cần thêm màu sắc sản phẩm");
          return;
        }
        // Kiểm tra tính hợp lệ của việc tải lên ảnh
        const hasMissingUploads = tableData.some((record) => {
          const colorFileData =
            listColorAndFileData.find((item) => item.color === record.color)
              ?.fileData || [];
          return colorFileData.length === 0;
        });
        if (hasMissingUploads) {
          toast.error("Bạn cần thêm ảnh cho tất cả các màu sắc");
          setUploadValid(false);
          return;
        }

        const formData = new FormData();

        listColorAndFileData.forEach((item) => {
          const color = item.color;
          const fileData = item.fileData;
          fileData.forEach((file, index) => {
            formData.append(`${color}-${index}`, file.originFileObj);
          });
        });
        formData.append("data", JSON.stringify(tableData));
        axios
          .post("http://localhost:8080/admin/product-detail", formData)
          .then((response) => {
            console.log(response.data);
            setIsSubmitting(true);
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch(() => {
        // Xử lý khi người dùng từ chối xác nhận
      });
  };

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    if (
      dataSole != null ||
      dataBrand != null ||
      dataCategory != null ||
      dataMaterial != null ||
      dataSize != null
    ) {
      setListSole(dataSole);
      setListCategory(dataCategory);
      setListMaterial(dataMaterial);
      setListBrand(dataBrand);
    }
  }, [dataSole, dataBrand, dataCategory, dataMaterial, dataSize]);

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: "5%",
      sorter: (a, b) => a.stt - b.stt,
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "productId",
      key: "productId",
      width: "25%",
      render: (productId, record) =>
        `${productId} [ ${record.size} - ${getColorName(record.color)} ]`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value, record.key)}
        />
      ),
    },
    {
      title: "Giá Bán",
      dataIndex: "price",
      key: "price",
      width: "15%",
      render: (_, record) => (
        <Input
          value={formatCurrency(record.price)}
          onChange={(e) =>
            handlePriceChange(e.target.value.replace(/\D/g, ""), record.key)
          }
        />
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: "5%",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Xóa chi tiết">
            <Button onClick={() => handleDelete(record)} type="danger">
              <FontAwesomeIcon
                icon={faTrash}
                style={{ fontSize: "20px", color: "red" }}
              />
            </Button>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Upload Ảnh",
      dataIndex: "color",
      key: "color",
      render: (color, record, index) => {
        // Lọc các dòng có cùng màu sắc
        const rowsWithSameColor = tableData.filter(
          (item) => item.color === record.color
        );

        // Kiểm tra nếu đối tượng trước cùng màu
        if (index > 0 && record.color === tableData[index - 1].color) {
          return null; // Không hiển thị gì cả
        }

        // Hiển thị Upload Ảnh chỉ khi có 1 dòng hoặc là dòng đầu của cùng màu
        if (
          rowsWithSameColor.length === 1 ||
          rowsWithSameColor[0].key === record.key
        ) {
          const colorFileData =
            listColorAndFileData.find((item) => item.color === record.color)
              ?.fileData || [];
          const uploadColumn = (
            <>
              <Upload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                listType="picture-card"
                fileList={colorFileData}
                onPreview={handlePreview}
                onChange={(info) => handleUploadImages(info, record)}
                beforeUpload={(file) => {
                  // Kiểm tra xem tệp có phải là hình ảnh hay không
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    toast.error("Chỉ cho phép tải lên các tệp hình ảnh!");
                  }
                  return isImage ? true : Upload.LIST_IGNORE;
                }}
                multiple
              >
                {colorFileData.length >= 6 ? null : (
                  <>
                    {uploadButton}
                    {!isUploadValid}
                  </>
                )}
              </Upload>
              <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={handleCancelImage}
              >
                <img
                  alt="example"
                  style={{
                    width: "100%",
                  }}
                  src={previewImage}
                />
              </Modal>
            </>
          );

          // Sử dụng rowSpan để gộp hàng dựa trên màu sắc
          return {
            children: (
              <td
                style={{
                  // border: "1px solid blue", // Màu viền
                  borderRadius: "15px", //
                }}
                rowSpan={rowsWithSameColor.length}
              >
                {uploadColumn}
              </td>
            ),
            props: {
              rowSpan: rowsWithSameColor.length,
            },
          };
        }

        return null;
      },
    },
  ];

  // cập nhập số lượng
  const handleQuantityChange = (value, key) => {
    setTableData((prevTableData) =>
      prevTableData.map((item) =>
        item.key === key ? { ...item, quantity: value } : item
      )
    );
  };
  // cập nhập giá tiền
  const handlePriceChange = (value, key) => {
    setTableData((prevTableData) =>
      prevTableData.map((item) =>
        item.key === key ? { ...item, price: value } : item
      )
    );
  };

  // format tiền
  const formatCurrency = (value) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    });
    return formatter.format(value);
  };
  // remove
  const handleDelete = (recordToDelete) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa  này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        // Lọc ra các dòng không phải dòng cần xóa
        const updatedTableData = tableData.filter(
          (item) => item.key !== recordToDelete.key
        );
        setTableData(updatedTableData);
      },
    });
  };

  // ảnh theo màu
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const handleCancelImage = () => setPreviewOpen(false);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );

  const [listColorAndFileData, setListColorAndFileData] = useState([]);
  const [isUploadValid, setUploadValid] = useState(true);

  const handleUploadImages = (info, record) => {
    const newFileData = [...listColorAndFileData];

    const existingColorData = newFileData.find(
      (item) => item.color === record.color
    );
    if (existingColorData) {
      existingColorData.fileData = info.fileList;
    } else {
      newFileData.push({
        color: record.color,
        fileData: info.fileList,
      });
    }

    setListColorAndFileData(newFileData);
  };

  // gen dữ liệu
  const [isProductNameValid, setProductNameValid] = useState(false);
  const handleProductNameChange = (value) => {
    setProductNameValid(value.trim() !== "");
  };

  const [tableData, setTableData] = useState([]);
  const dataDetail = () => {
    const formData = form.getFieldsValue();
    const newRecords = [];
    let stt = 1;
    listColorAdd.forEach((colorItem) => {
      listSizeAdd.forEach((sizeItem) => {
        const newRecord = {
          key: `${colorItem.color}-${sizeItem.nameSize}`,
          ...formData, // Copy existing formData properties
          color: colorItem.color, // Add color property
          size: sizeItem.nameSize, // Add size property
          quantity: 1,
          price: "1000000",
          stt: stt++,
        };
        newRecords.push(newRecord);
      });
    });
    setTableData(newRecords);
  };

  useEffect(() => {
    dataDetail();
  }, [listColorAdd, listSizeAdd]);

  return (
    <>
      <div className="filter">
        <div
          className="title_product"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{ fontSize: "25px", fontWeight: "bold", marginTop: "5%" }}
          >
            THÊM SẢN PHẨM
          </span>
        </div>

        <div style={{ marginTop: "1%" }}>
          <div className="content">
            <Form form={form} initialValues={initialValues}>
              <Form.Item>
                <Tooltip title="Thêm sản phẩm chi tiết">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="form-submit-btn"
                    onClick={handleUpload}
                    disabled={isSubmitting}
                  >
                    Hoàn Tất
                  </Button>
                </Tooltip>
              </Form.Item>
              <Form.Item
                label="Tên sản phẩm"
                name="productId"
                style={{ fontWeight: "bold" }}
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm" },
                ]}
              >
                <AutoComplete
                  options={renderOptions(listProduct)}
                  placeholder="Nhập tên sản phẩm"
                  onSearch={handleSearch}
                >
                  <Input
                    className="form-input"
                    style={{ fontWeight: "bold" }}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                  />
                </AutoComplete>
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
                style={{ fontWeight: "bold" }}
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả sản phẩm" },
                ]}
              >
                <Input.TextArea
                  rows={7}
                  placeholder="Nhập mô tả sản phẩm"
                  className="form-textarea"
                />
              </Form.Item>
              <br />

              <Row gutter={7} justify="space-around">
                <Col span={8}>
                  <Form.Item
                    label="Thương hiệu"
                    name="brandId"
                    style={{ fontWeight: "bold" }}
                    rules={[
                      { required: true, message: "Vui lòng chọn thương hiệu" },
                    ]}
                  >
                    <Select placeholder="Chọn thương hiệu">
                      {listBrand.map((brand, index) => (
                        <Option key={index} value={brand.id}>
                          <span style={{ fontWeight: "bold" }}>
                            {brand.name}
                          </span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item>
                    <Tooltip title="Thêm thương hiệu">
                      <Button
                        type="primary"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        style={{ height: 30 }}
                        onClick={() => setModalAddBrand(true)}
                      />
                    </Tooltip>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    style={{ fontWeight: "bold" }}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn trạng thái sản phẩm",
                      },
                    ]}
                  >
                    <Select>
                      <Option value="DANG_SU_DUNG">
                        <span style={{ fontWeight: "bold" }}>Kinh Doanh</span>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Form.Item>
                    <Button
                      type="primary"
                      icon={<FontAwesomeIcon icon={faPlus} />}
                      style={{ height: 30 }}
                    ></Button>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={7} justify="space-around">
                <Col span={8}>
                  <Form.Item
                    label="Chất Liệu"
                    name="materialId"
                    style={{ fontWeight: "bold" }}
                    rules={[
                      { required: true, message: "Vui lòng chọn thương hiệu" },
                    ]}
                  >
                    <Select placeholder="Chọn chất liệu">
                      {listMaterial.map((material, index) => (
                        <Option key={index} value={material.id}>
                          <span style={{ fontWeight: "bold" }}>
                            {material.name}
                          </span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item>
                    <Tooltip title="Thêm vật liệu">
                      <Button
                        type="primary"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        style={{ height: 30 }}
                        onClick={() => setModalAddMaterial(true)}
                      />
                    </Tooltip>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Đế Giày"
                    name="soleId"
                    style={{ fontWeight: "bold" }}
                    rules={[
                      { required: true, message: "Vui lòng chọn thể loại" },
                    ]}
                  >
                    <Select placeholder="Chọn đế giày">
                      {listSole.map((sole, index) => (
                        <Option key={index} value={sole.id}>
                          <span style={{ fontWeight: "bold" }}>
                            {sole.name}
                          </span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Form.Item>
                    <Tooltip title="Thêm đế giày">
                      <Button
                        type="primary"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        style={{ height: 30 }}
                        onClick={() => setModalAddSole(true)}
                      />
                    </Tooltip>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={7} justify="space-around">
                <Col span={8}>
                  <Form.Item
                    label="Giới Tính"
                    name="gender"
                    style={{ fontWeight: "bold" }}
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính" },
                    ]}
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="NAM">
                        <span style={{ fontWeight: "bold" }}>Nam</span>
                      </Option>
                      <Option value="NU">
                        {" "}
                        <span style={{ fontWeight: "bold" }}>Nữ</span>
                      </Option>
                      <Option value="NAM_VA_NU">
                        {" "}
                        <span style={{ fontWeight: "bold" }}>Nam và Nữ</span>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item>
                    <Tooltip title="Thêm giới tính">
                      <Button
                        type="primary"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        style={{ height: 30 }}
                      />
                    </Tooltip>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Thể loại"
                    name="categoryId"
                    style={{ fontWeight: "bold" }}
                    rules={[
                      { required: true, message: "Vui lòng chọn thể loại" },
                    ]}
                  >
                    <Select placeholder="Chọn thể loại">
                      {listCategory.map((category, index) => (
                        <Option key={index} value={category.id}>
                          <span style={{ fontWeight: "bold" }}>
                            {category.name}
                          </span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Form.Item>
                    <Tooltip title="Thêm thể loại">
                      <Button
                        type="primary"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        style={{ height: 30 }}
                        onClick={() => setModalAddCategory(true)}
                      ></Button>
                    </Tooltip>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
          <ModalCreateSole visible={modalAddSole} onCancel={handleCancel} />
          <ModalCreateBrand visible={modalAddBrand} onCancel={handleCancel} />
          <AddColorModal visible={modalAddColor} onCancel={handleCancel} />
          <ModalCreateCategory
            visible={modalAddCategopry}
            onCancel={handleCancel}
          />
          <ModalCreateMaterial
            visible={modalAddMaterial}
            onCancel={handleCancel}
          />
        </div>
      </div>

      <div className="filter">
        <div
          className="title_product"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{ fontSize: "20px", fontWeight: "bold", marginTop: "10px" }}
          >
            KÍCH CỠ VÀ MÀU SẮC
          </span>
        </div>
        <div style={{ marginTop: "25px" }}>
          <Row
            align="middle"
            gutter={16}
            style={{ marginTop: "50px", marginBottom: "80px" }}
          >
            <Col span={3} style={{ marginLeft: "25px" }}>
              <h2>Kích Cỡ : </h2>
            </Col>
            <Col span={16}>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {listSizeAdd.map((item, index) => (
                  <Button
                    className="custom-button-size"
                    onClick={() => handleDeleteSize(index, item.nameSize)}
                  >
                    <span
                      style={{ fontWeight: "bold" }}
                    >{`${item.nameSize}`}</span>
                    <FontAwesomeIcon
                      icon={faCircleMinus}
                      className="custom-icon"
                    />
                  </Button>
                ))}
                <Col span={5}>
                  <Tooltip title="Thêm kích cỡ">
                    <Button
                      style={{ height: "40px", marginLeft: "20%" }}
                      type="primary"
                      onClick={() => {
                        if (isProductNameValid) {
                          setModalAddSize(true);
                        } else {
                          toast.error(
                            "Vui lòng nhập thông tin sản phẩm trước khi thêm kích cỡ!"
                          );
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </Tooltip>
                  <ModalAddSizeProduct
                    visible={modalAddSize}
                    onCancel={handleCancel}
                    onSaveData={handleSaveData}
                  />
                </Col>
              </div>
            </Col>
          </Row>

          <Row
            align="middle"
            gutter={16}
            style={{ marginTop: "80px", marginBottom: "80px" }}
          >
            <Col span={3} style={{ marginLeft: "25px" }}>
              <h2>Màu Sắc : </h2>
            </Col>
            <Col span={16}>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {listColorAdd.map((item, index) => (
                  <Button
                    onClick={() =>
                      handleDeleteColor(index, getColorName(item.color))
                    }
                    className="custom-button-color"
                    style={{ backgroundColor: item.color }}
                    title={getColorName(item.color)}
                  >
                    <FontAwesomeIcon
                      icon={faCircleMinus}
                      className="custom-icon"
                    />
                  </Button>
                ))}
                <Col
                  span={5}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Tooltip title="Thêm màu sắc">
                    <Button
                      style={{ height: "40px", marginRight: "50%" }}
                      type="primary"
                      onClick={() => {
                        if (isProductNameValid) {
                          setModalAddColor(true);
                        } else {
                          toast.error(
                            "Vui lòng nhập thông tin sản phẩm trước khi thêm màu sắc!"
                          );
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </Tooltip>
                  <AddColorModal
                    visible={modalAddColor}
                    onCancel={handleCancel}
                    onSaveData={handleSaveDataColor}
                  />
                </Col>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="filter">
        <div
          className="title_product"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginTop: "10px",
              marginBottom: "20px",
            }}
          >
            Chi tiết sản phẩm
          </span>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </>
  );
};
export default CreateProductManagment;
