import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Table,
} from "antd";
import TimeLine from "./TimeLine";
import {
  addPaymentsMethod,
  addStatusPresent,
  getBill,
  getBillHistory,
  getPaymentsMethod,
  getProductInBillDetail,
} from "../../../app/reducer/Bill.reducer";
import moment from "moment";
import { useState } from "react";
import { BillApi } from "../../../api/employee/bill/bill.api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import React from "react";

import { useParams } from "react-router";
import { addBillHistory } from "../../../app/reducer/Bill.reducer";
import { PaymentsMethodApi } from "../../../api/employee/paymentsmethod/PaymentsMethod.api";
import "./detail.css";
import TextArea from "antd/es/input/TextArea";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NumberFormat from "react-number-format";
import ModalAddProductDetail from "./modal/ModalAddProductDetail";
import { AddressApi } from "../../../api/customer/address/address.api";

var listStatus = [
  { id: 0, name: "Tạo hóa đơn", status: "TAO_HOA_DON" },
  { id: 1, name: "Xác nhận", status: "CHO_XAC_NHAN" },
  { id: 2, name: "Chờ vận chuyển", status: "CHO_VAN_CHUYEN" },
  { id: 3, name: "Vận chuyển", status: "VAN_CHUYEN" },
  { id: 4, name: "Thanh toán", status: "DA_THANH_TOAN" },
  { id: 5, name: "Thành công", status: "KHONG_TRA_HANG" },
];

function DetailBill() {
  const { id } = useParams();
  const detailProductInBill = useSelector(
    (state) => state.bill.bill.billDetail
  );
  const billHistory = useSelector((state) => state.bill.bill.billHistory);
  const paymentsMethod = useSelector((state) => state.bill.bill.paymentsMethod);
  const bill = useSelector((state) => state.bill.bill.value);
  const statusPresent = useSelector((state) => state.bill.bill.status);
  const [statusBill, setStatusBill] = useState({
    actionDescription: "",
    method: "TIEN_MAT",
    totalMoney: 0,
    status: "THANH_TOAN",
  });
  const dispatch = useDispatch();

  const formRef = React.useRef(null);

  const [listProvince, setListProvince] = useState([]);
  const [listDistricts, setListDistricts] = useState([]);
  const [listWard, setListWard] = useState([]);
  const [payMentNo, setPayMentNo] = useState(false);
  const { Option } = Select;

  const formatCurrency = (value) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    });
    return formatter.format(value);
  };

  useEffect(() => {
    BillApi.fetchAllProductsInBillByIdBill(id).then((res) => {
      console.log(res);
      dispatch(getProductInBillDetail(res.data.data));
    });
    BillApi.fetchDetailBill(id).then((res) => {
      dispatch(getBill(res.data.data));
      var index = listStatus.findIndex(
        (item) => item.status == res.data.data.statusBill
      );
      if (res.data.data.statusBill == "TRA_HANG") {
        index = 6;
      }
      if (res.data.data.statusBill == "DA_HUY") {
        index = 7;
      }
      dispatch(addStatusPresent(index));
    });
    BillApi.fetchAllHistoryInBillByIdBill(id).then((res) => {
      dispatch(getBillHistory(res.data.data));
      console.log(res.data.data);
    });
    PaymentsMethodApi.findByIdBill(id).then((res) => {
      setPayMentNo(res.data.data.some((item) => item.status === "TRA_SAU"));
      dispatch(getPaymentsMethod(res.data.data));
    });
    loadDataProvince();
  }, []);

  //load data tỉnh
  const loadDataProvince = () => {
    AddressApi.fetchAllProvince().then(
      (res) => {
        setListProvince(res.data.data);
      },
      (err) => {
        console.log(err);
      }
    );
  };
  //load data quận/huyện khi chọn tỉnh
  const handleProvinceChange = (value, valueProvince) => {
    // form.setFieldsValue({ provinceId: valueProvince.valueProvince });
    setAddress({ ...address, city: valueProvince.value });
    AddressApi.fetchAllProvinceDistricts(valueProvince.valueProvince).then(
      (res) => {
        setListDistricts(res.data.data);
      }
    );
  };
  //load data xã/phường khi chọn quận/huyện
  const handleDistrictChange = (value, valueDistrict) => {
    setAddress({ ...address, district: valueDistrict.value });
    // form.setFieldsValue({ toDistrictId: valueDistrict.valueDistrict });
    AddressApi.fetchAllProvinceWard(valueDistrict.valueDistrict).then((res) => {
      setListWard(res.data.data);
    });
  };
  //load data phí ship và ngày ship
  const handleWardChange = (value, valueWard) => {
    // form.setFieldsValue({ toDistrictId: valueDistrict.valueDistrict });
    setAddress({ ...address, wards: valueWard.value });
    AddressApi.fetchAllMoneyShip(
      valueWard.valueDistrict,
      valueWard.valueWard
    ).then((res) => {
      // setShipFee(res.data.data.total);
    });
    AddressApi.fetchAllDayShip(
      valueWard.valueDistrict,
      valueWard.valueWard
    ).then((res) => {
      const leadtimeInSeconds = res.data.data.leadtime;
      const formattedDate = moment.unix(leadtimeInSeconds).format("DD/MM/YYYY");
      // setDayShip(formattedDate);
    });
  };

  console.log(bill);

  const [form] = Form.useForm();

  // begin cancelBill
  const [isModalCanCelOpen, setIsModalCanCelOpen] = useState(false);
  const showModalCanCel = () => {
    setIsModalCanCelOpen(true);
  };
  const handleCanCelOk = () => {
    setIsModalCanCelOpen(false);
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có đồng ý hủy không?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: () => {
        BillApi.changeCancelStatusBill(id, statusBill).then((res) => {
          dispatch(getBill(res.data.data));
          var index = listStatus.findIndex(
            (item) => item.status == res.data.data.statusBill
          );
          if (res.data.data.statusBill == "TRA_HANG") {
            index = 5;
          }
          if (res.data.data.statusBill == "DA_HUY") {
            index = 6;
          }
          var history = {
            stt: billHistory.length + 1,
            statusBill: res.data.data.statusBill,
            actionDesc: statusBill.actionDescription,
            id: "",
            createDate: new Date().getTime(),
          };
          dispatch(addStatusPresent(index));
          dispatch(addBillHistory(history));
        });
        setIsModalCanCelOpen(false);
        toast("Hủy hóa đơn thành công");
      },
      onCancel: () => {
        setIsModalCanCelOpen(false);
      },
    });

    setStatusBill({
      actionDescription: "",
      method: "TIEN_MAT",
      totalMoney: 0,
      status: "THANH_TOAN",
    });
    form.resetFields();
  };
  const handleCanCelClose = () => {
    setIsModalCanCelOpen(false);
    form.resetFields();
  };
  // end  cancelBill

  // begin modal thanh toán
  const [isModalPayMentOpen, setIsModalPayMentOpen] = useState(false);
  const XacNhanThanhToan = async (e) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có đồng ý xác nhận không?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async () => {
        var data = paymentsMethod.map((item) => item.id);
        await PaymentsMethodApi.updateStatus(id, data).then((res) => {
          console.log(res.data.data);
        });
        await BillApi.fetchAllProductsInBillByIdBill(id).then((res) => {
          console.log(res.data.data);
          dispatch(getProductInBillDetail(res.data.data));
        });
        await BillApi.fetchDetailBill(id).then((res) => {
          console.log(res.data.data);
          dispatch(getBill(res.data.data));
          var index = listStatus.findIndex(
            (item) => item.status == res.data.data.statusBill
          );
          if (res.data.data.statusBill == "TRA_HANG") {
            index = 7;
          }
          if (res.data.data.statusBill == "DA_HUY") {
            index = 6;
          }
          dispatch(addStatusPresent(index));
        });
        await BillApi.fetchAllHistoryInBillByIdBill(id).then((res) => {
          dispatch(getBillHistory(res.data.data));
        });
        toast("Thanh toán thành công");
      },
      onCancel: () => {
        setIsModalOpenChangeStatus(false);
      },
    });
    form.resetFields();
  };
  const showModalPayMent = (e) => {
    setIsModalPayMentOpen(true);
    form.resetFields();
  };
  const handleOkPayMent = () => {
    if (statusBill.totalMoney >= 0) {
      setIsModalPayMentOpen(false);
      Modal.confirm({
        title: "Xác nhận",
        content: "Bạn có đồng ý thanh toán không?",
        okText: "Đồng ý",
        cancelText: "Hủy",
        onOk: async () => {
          await PaymentsMethodApi.payment(id, statusBill).then((res) => {
            dispatch(addPaymentsMethod(res.data.data));
            console.log(res.data.data);
          });
          await BillApi.fetchAllProductsInBillByIdBill(id).then((res) => {
            console.log(res.data.data);
            dispatch(getProductInBillDetail(res.data.data));
          });
          await BillApi.fetchDetailBill(id).then((res) => {
            console.log(res.data.data);
            dispatch(getBill(res.data.data));
            var index = listStatus.findIndex(
              (item) => item.status == res.data.data.statusBill
            );
            if (res.data.data.statusBill == "TRA_HANG") {
              index = 6;
            }
            if (res.data.data.statusBill == "DA_HUY") {
              index = 7;
            }
            dispatch(addStatusPresent(index));
            console.log(index);
          });
          await BillApi.fetchAllHistoryInBillByIdBill(id).then((res) => {
            dispatch(getBillHistory(res.data.data));
            console.log(res.data.data);
          });
          toast("Thanh toán thành công");
          setIsModalPayMentOpen(false);
          setStatusBill({
            actionDescription: "",
            method: "TIEN_MAT",
            totalMoney: 0,
            status: "THANH_TOAN",
          });
        },
        onCancel: () => {
          setIsModalPayMentOpen(false);
          setStatusBill({
            actionDescription: "",
            method: "TIEN_MAT",
            totalMoney: 0,
            status: "THANH_TOAN",
          });
        },
      });
      form.resetFields();
    }
    setStatusBill({
      actionDescription: "",
      method: "TIEN_MAT",
      totalMoney: 0,
      status: "THANH_TOAN",
    });
  };
  const handleCancelPayMent = () => {
    setIsModalPayMentOpen(false);
    setStatusBill({
      actionDescription: "",
      method: "TIEN_MAT",
      totalMoney: 0,
      status: "THANH_TOAN",
    });
  };
  // enad modal thanh toán

  // begin modal bill
  const [billRequest, setBillRequest] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    moneyShip: "0",
    note: "",
  });

  const [address, setAddress] = useState({
    city: "",
    district: "",
    wards: "",
    detail: "",
  });

  const onChangeBill = (fileName, value) => {
    setBillRequest({ ...billRequest, [fileName]: value });
  };

  const onChangeAddress = (fileName, value) => {
    setAddress({ ...address, [fileName]: value });
    var addressuser =
      address.detail +
      ", " +
      address.wards +
      ", " +
      address.district +
      ", " +
      address.city;
    setBillRequest({ ...billRequest, address: addressuser });
  };

  const [isModaBillOpen, setIsModalBillOpen] = useState(false);
  const showModalBill = (e) => {
    setIsModalBillOpen(true);
  };
  const checkNotEmptyBill = () => {
    return Object.keys(billRequest)
      .filter((key) => key !== "note")
      .every((key) => billRequest[key] !== "");
  };
  const checkNotEmptyAddress = () => {
    return (
      Object.keys(address).filter((key) => address[key] !== "").length ===
      Object.keys(address).length - 1
    );
  };
  const handleOkBill = () => {
    var addressuser = "";
    if (!checkNotEmptyAddress()) {
      addressuser =
        address.detail +
        ", " +
        address.wards +
        ", " +
        address.district +
        ", " +
        address.city;
    }
    setBillRequest({ ...billRequest, address: addressuser });
    if (!checkNotEmptyBill()) {
      setIsModalBillOpen(false);
      Modal.confirm({
        title: "Xác nhận",
        content: "Bạn có xác nhận thay đổi không?",
        okText: "Đồng ý",
        cancelText: "Hủy",
        onOk: async () => {
          console.log(billRequest);
          await BillApi.updateBill(id, billRequest).then((res) => {
            dispatch(getBill(res.data.data));
            var index = listStatus.findIndex(
              (item) => item.status == res.data.data.statusBill
            );
            if (res.data.data.statusBill == "TRA_HANG") {
              index = 6;
            }
            if (res.data.data.statusBill == "DA_HUY") {
              index = 7;
            }
            dispatch(addStatusPresent(index));
          });
          toast("Thay đổi hóa đơn thành công");
          setIsModalBillOpen(false);
        },
        onCancel: () => {
          setIsModalBillOpen(false);
        },
      });
      setBillRequest({
        name: "",
        phoneNumber: "",
        address: "",
        moneyShip: "0",
        note: "",
      });
      setAddress({
        city: "",
        district: "",
        wards: "",
        detail: "",
      });
    }
  };
  const handleCancelBill = () => {
    setIsModalBillOpen(false);
  };
  // end modal bill

  // begin detail product

  const [detaiProduct, setDetailProduct] = useState({});
  const [products, setProducts] = useState([]);

  const typeAddProductBill = id;

  //  end detail product

  // begin modal refundProduct
  const [refundProduct, setRefundProduct] = useState({
    id: "",
    idBill: id,
    idProduct: "",
    size: "",
    quantity: 0,
    note: "",
  });

  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    if (quantity < detaiProduct.maxQuantity + detaiProduct.quantity) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };
  const onChangeRefundProduct = (fileName, value) => {
    setRefundProduct({ ...refundProduct, [fileName]: value });
  };

  const [isModaRefundProductOpen, setIsModalRefundProductOpen] =
    useState(false);
  const showModalRefundProduct = async (e, id) => {
    await BillApi.getDetaiProductInBill(id).then((res) => {
      setUpdateProduct({
        ...refundProduct,
        idProduct: res.data.data.idProduct,
        size: res.data.data.nameSize,
        id: res.data.data.id,
      });

      setDetailProduct(res.data.data);
      setQuantity(res.data.data.quantity);
    });
    setIsModalRefundProductOpen(true);
  };

  const handleOkRefundProduct = () => {
    if (quantity < 1) {
      toast("vui lòng nhập số lượng lớn hơn 0 ");
    } else {
      var listProduct = [...detailProductInBill];
      var index = listProduct.findIndex((item) => item.id == idProductInBill);
      var newProduct = { ...listProduct[index] };
      newProduct.quantity = quantity;
      listProduct.splice(index, 1, newProduct);
      // newProduct.quantity = quantity
      listProduct.splice(index, 1, newProduct);
      var total = listProduct.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.price * currentValue.quantity;
      }, 0);
      setIsModalRefundProductOpen(false);
      Modal.confirm({
        title: "Xác nhận",
        content: "Bạn có xác nhận Hoàn hàng không?",
        okText: "Đồng ý",
        cancelText: "Hủy",
        onOk: async () => {
          var data = {
            id: refundProduct.id,
            idBill: refundProduct.idBill,
            idProduct: refundProduct.idProduct,
            size: refundProduct.size,
            quantity: quantity,
            totalMoney: total,
            note: refundProduct.note,
          };
          await BillApi.refundProduct(data).then((res) => {
            toast("Hoàn hàng thành công");
          });
          await BillApi.fetchAllProductsInBillByIdBill(id).then((res) => {
            dispatch(getProductInBillDetail(res.data.data));
          });
          await BillApi.fetchDetailBill(id).then((res) => {
            dispatch(getBill(res.data.data));
            var index = listStatus.findIndex(
              (item) => item.status == res.data.data.statusBill
            );
            if (res.data.data.statusBill == "TRA_HANG") {
              index = 6;
            }
            if (res.data.data.statusBill == "DA_HUY") {
              index = 7;
            }
            dispatch(addStatusPresent(index));
          });
          await BillApi.fetchAllHistoryInBillByIdBill(id).then((res) => {
            dispatch(getBillHistory(res.data.data));
          });

          setIsModalRefundProductOpen(false);
        },
        onCancel: () => {
          setIsModalRefundProductOpen(false);
        },
      });
      setQuantity(1);
    }
  };
  const handleCancelRefundProduct = () => {
    setIsModalRefundProductOpen(false);
    setQuantity(1);
  };
  // end modal refundProduct

  // begin modal refundProduct
  const [updateProduct, setUpdateProduct] = useState({
    idBill: id,
    idProduct: "",
    size: "",
    quantity: 0,
    price: "",
    totalMoney: "",
  });

  const [idProductInBill, setIdProductInBill] = useState("");

  const onChangeUpdateProduct = (fileName, value) => {
    setUpdateProduct({ ...updateProduct, [fileName]: value });
  };

  const [isModaUpdateProduct, setIsModalUpdateProduct] = useState(false);
  const showModalUpdateProduct = async (e, id) => {
    await BillApi.getDetaiProductInBill(id).then((res) => {
      console.log(res);
      setUpdateProduct({
        ...updateProduct,
        idProduct: res.data.data.idProduct,
        size: res.data.data.nameSize,
      });
      setIdProductInBill(res.data.data.id);
      setDetailProduct(res.data.data);
      setQuantity(res.data.data.quantity);
    });
    setIsModalUpdateProduct(true);
  };
  const checkNotEmptyUpdateProduct = () => {
    return Object.keys(refundProduct)
      .filter((key) => key !== "note")
      .every((key) => refundProduct[key] !== "");
  };

  const handleOkUpdateProduct = () => {
    if (quantity < 1 && quantity < detaiProduct.quantity) {
      toast(
        "vui lòng nhập số lượng lớn hơn 0 và nhỏ hơn " + detaiProduct.quantity
      );
    } else {
      if (quantity == detaiProduct.quantity) {
        setIsModalUpdateProduct(false);
      } else {
        var listProduct = [...detailProductInBill];
        var index = listProduct.findIndex((item) => item.id == idProductInBill);
        var newProduct = { ...listProduct[index] };
        newProduct.quantity = quantity;
        listProduct.splice(index, 1, newProduct);
        // newProduct.quantity = quantity
        listProduct.splice(index, 1, newProduct);
        var total = listProduct.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.price * currentValue.quantity;
        }, 0);
        Modal.confirm({
          title: "Xác nhận",
          content: "Bạn có xác nhận thay đổi không?",
          okText: "Đồng ý",
          cancelText: "Hủy",
          onOk: async () => {
            var data = {
              idBill: updateProduct.idBill,
              idProduct: updateProduct.idProduct,
              size: updateProduct.size,
              quantity: quantity,
              price: "",
              totalMoney: total,
            };
            await BillApi.updateProductInBill(idProductInBill, data).then(
              (res) => {
                toast("Thay đổi thành công");
              }
            );
            await BillApi.fetchAllProductsInBillByIdBill(id).then((res) => {
              dispatch(getProductInBillDetail(res.data.data));
            });
            await BillApi.fetchDetailBill(id).then((res) => {
              dispatch(getBill(res.data.data));
              var index = listStatus.findIndex(
                (item) => item.status == res.data.data.statusBill
              );
              if (res.data.data.statusBill == "TRA_HANG") {
                index = 6;
              }
              if (res.data.data.statusBill == "DA_HUY") {
                index = 7;
              }
              dispatch(addStatusPresent(index));
            });
            await BillApi.fetchAllHistoryInBillByIdBill(id).then((res) => {
              dispatch(getBillHistory(res.data.data));
            });
            setIsModalUpdateProduct(false);
          },
          onCancel: () => {
            setIsModalUpdateProduct(false);
          },
        });
        setIsModalUpdateProduct(false);
        setQuantity(1);
      }
    }
  };
  const handleCancelUpdateProduct = () => {
    setIsModalUpdateProduct(false);
    setQuantity(1);
  };
  // end modal refundProduct

  // begin modal product
  const [isModalProductOpen, setIsModalProductOpen] = useState(false);

  const handleQuantityDecrease = (record) => {};

  const handleQuantityChange = (value, record) => {};

  const handleQuantityIncrease = (record) => {};

  const showModalProduct = (e) => {
    setIsModalProductOpen(true);
  };
  const handleOkProduct = () => {
    setIsModalProductOpen(false);
  };
  const handleCancelProduct = () => {
    setIsModalProductOpen(false);
  };

  // dispatch(addProductBillWait(res.data.data));

  //  end modal product

  //  begin modal change status

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [isModalOpenChangeStatus, setIsModalOpenChangeStatus] = useState(false);

  const showModalChangeStatus = () => {
    setIsModalOpenChangeStatus(true);
  };

  const handleOkChangeStatus = () => {
    if (statusBill.actionDescription == "") {
      toast.error("Vui lòng nhập mô tả");
    } else {
      if (
        statusBill.totalMoney < bill.totalMoney &&
        bill.statusBill == "VAN_CHUYEN"
      ) {
        toast.error("Số tiền thanh toán không đủ");
      } else {
        Modal.confirm({
          title: "Xác nhận",
          content: "Bạn có đồng ý xác nhận thanh toán không?",
          okText: "Đồng ý",
          cancelText: "Hủy",
          onOk: async () => {
            await BillApi.changeStatusBill(id, statusBill).then((res) => {
              dispatch(getBill(res.data.data));
              var index = listStatus.findIndex(
                (item) => item.status == res.data.data.statusBill
              );

              console.log(res.data.data.statusBill);
              console.log(index);
              if (res.data.data.statusBill == "TRA_HANG") {
                index = 6;
              }
              if (res.data.data.statusBill == "DA_HUY") {
                index = 7;
              }
              dispatch(addStatusPresent(index));
            });
            await PaymentsMethodApi.findByIdBill(id).then((res) => {
              dispatch(getPaymentsMethod(res.data.data));
            });
            await BillApi.fetchAllHistoryInBillByIdBill(id).then((res) => {
              dispatch(getBillHistory(res.data.data));
            });
            toast("Xác nhận thành công");
            setIsModalOpenChangeStatus(false);
          },
          onCancel: () => {
            setIsModalOpenChangeStatus(false);
          },
        });
        setStatusBill({
          actionDescription: "",
          method: "TIEN_MAT",
          totalMoney: 0,
          status: "THANH_TOAN",
        });
        form.resetFields();
      }
      setIsModalOpenChangeStatus(false);
    }

    setStatusBill({
      actionDescription: "",
      method: "TIEN_MAT",
      totalMoney: 0,
      status: "THANH_TOAN",
    });
  };

  const handleCancelChangeStatus = () => {
    setIsModalOpenChangeStatus(false);
    setStatusBill({
      actionDescription: "",
      method: "TIEN_MAT",
      totalMoney: 0,
      status: "THANH_TOAN",
    });
    form.resetFields();
  };

  const onChangeDescStatusBill = (fileName, value) => {
    if (fileName === "totalMoney") {
      setStatusBill({
        ...statusBill,
        [fileName]: parseFloat(value.replace(/[^0-9.-]+/g, "")),
      });
    } else {
      setStatusBill({ ...statusBill, [fileName]: value });
    }
  };

  const onFinish = (values) => {
    const priceValue = values.price;
    console.log(priceValue);
    const numericPrice = parseFloat(priceValue.replace(/[^0-9.-]+/g, ""));
    values.price = numericPrice + "";
    var data = statusBill;
    data.totalMoney = values;
    setStatusBill(data);
    // setProductDetail(values);
    console.log(statusBill);
  };
  const initialValues = {
    status: "DANG_SU_DUNG",
  };

  // end modal change statust

  const columns = [
    {
      title: <div className="title-product">STT</div>,
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: "Ảnh",
      dataIndex: "img",
      key: "img",
      render: (text, record) => (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={text}
            alt="Ảnh sản phẩm"
            style={{ width: "170px", borderRadius: "10%", height: "140px" }}
          />
          <div
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              padding: "0px",
              cursor: "pointer",
              borderRadius: "50%",
            }}
          >
            {/* <FontAwesomeIcon
              icon={faBookmark}
              style={{
                ...getPromotionColor(record.promotion),
                fontSize: "3.5em",
              }}
            /> */}
            <span
              style={{
                position: "absolute",
                top: "calc(50% - 10px)", // Đặt "50%" lên trên biểu tượng (từ 50% trừ 10px)
                left: "50%", // Để "50%" nằm chính giữa biểu tượng
                transform: "translate(-50%, -50%)", // Dịch chuyển "50%" đến vị trí chính giữa
                fontSize: "0.8em",
                fontWeight: "bold",
                ...getPromotionStyle(record.promotion),
              }}
            >
              {record.promotion == null ? "0%" : `${record.promotion}%`}
            </span>
            <span
              style={{
                position: "absolute",
                top: "60%", // Để "Giảm" nằm chính giữa biểu tượng
                left: "50%", // Để "Giảm" nằm chính giữa biểu tượng
                transform: "translate(-50%, -50%)", // Dịch chuyển "Giảm" đến vị trí chính giữa
                fontSize: "0.8em",
                fontWeight: "bold",
                ...getPromotionStyle(record.promotion),
              }}
            >
              Giảm
            </span>
          </div>
        </div>
      ),
    },
    {
      title: <div className="title-product">Mã sản phẩm</div>,
      dataIndex: "codeProduct",
      key: "codeProduct",
    },
    {
      title: <div className="title-product">Tên Sản Phẩm</div>,
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: <div className="title-product">Kích thước</div>,
      dataIndex: "nameSize",
      key: "nameSize",
    },
    {
      title: <div className="title-product">Màu</div>,
      dataIndex: "nameColor",
      key: "nameColor",
    },
    {
      title: <div className="title-product">Đế giày</div>,
      dataIndex: "nameSole",
      key: "nameSole",
    },
    {
      title: <div className="title-product">Chất liệu</div>,
      dataIndex: "nameMaterial",
      key: "nameMaterial",
    },
    {
      title: <div className="title-product">Giá</div>,
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span>
          {
          formatCurrency(price)
          }
        </span>
      ),
    },
    {
      title: <div className="title-product">Số lượng </div>,
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title:
        bill.statusBill == "DA_THANH_TOAN" ||
        bill.statusBill == "TAO_HOA_DON" ? (
          <div className="title-product">hành động</div>
        ) : (
          <div></div>
        ),
      dataIndex: "action",
      key: "id",
      render: (id) => (
        <div style={{ display: "flex", gap: "10px" }}>
          {bill.statusBill == "TAO_HOA_DON" ? (
            <Button
              type="primary"
              title="Hủy"
              style={{ backgroundColor: "red" }}
              // onClick={() => handleViewDetail(record.id)}
            >
              Thay đổi
            </Button>
          ) : bill.statusBill == "DA_THANH_TOAN" ? (
            <Button
              type="primary"
              title="Hủy"
              style={{ backgroundColor: "red" }}
              // onClick={() => handleViewDetail(record.id)}
            >
              Hủy
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      ),
    },
  ];

  const columnsHistory = [
    {
      title: <div className="title-product">STT</div>,
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: <div className="title-product">Trạng thái</div>,
      dataIndex: "statusBill",
      key: "statusBill",
      render: (statusBill) => (
        <span>
          {statusBill == "TAO_HOA_DON"
            ? "Tạo Hóa đơn"
            : statusBill == "CHO_XAC_NHAN"
            ? "Chờ xác nhận"
            : statusBill === "CHO_VAN_CHUYEN"
            ? "Chờ vận chuyển"
            : statusBill === "VAN_CHUYEN"
            ? "Đang vận chuyển"
            : statusBill === "DA_THANH_TOAN"
            ? "Đã thanh toán"
            : statusBill === "KHONG_TRA_HANG"
            ? "Thành công"
            : statusBill === "TRA_HANG"
            ? "Trả hàng"
            : "Đã hủy"}
        </span>
      ),
    },
    {
      title: <div className="title-product">Ngày</div>,
      dataIndex: "createDate",
      key: "createDate",
      render: (text) => {
        const formattedDate = moment(text).format(" HH:mm:ss DD-MM-YYYY"); // Định dạng ngày
        return formattedDate;
      },
    },
    {
      title: <div className="title-product">Người xác nhận</div>,
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: <div className="title-product">Ghi chú</div>,
      dataIndex: "actionDesc",
      key: "actionDesc",
    },
  ];

  const columnsPayments = [
    {
      title: <div className="title-product">Số tiền</div>,
      dataIndex: "totalMoney",
      key: "totalMoney",
      render: (totalMoney) => (
        <span>
          {formatCurrency(totalMoney)}
        </span>
      ),
    },
    {
      title: <div className="title-product">Loại giao dịch</div>,
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={status}>
          {status == "THANH_TOAN"
            ? "Thanh toán"
            : status == "TRA_SAU"
            ? "Trả sau"
            : "Hoàn tiền"}
        </span>
      ),
    },
    {
      title: <div className="title-product">Phương thức thanh toán</div>,
      dataIndex: "method",
      key: "method",
      render: (method) => (
        <span className={method}>
          {method == "TIEN_MAT"
            ? "Tiền mặt"
            : method == "CHUYEN_KHOAN"
            ? "Chuyển khoản"
            : "Chuyển khoản và tiền mặt"}
        </span>
      ),
    },
    {
      title: <div className="title-product">Trạng thái</div>,
      dataIndex: "method",
      key: "method",
      render: (method) => (
        <span>
          {method == "TIEN_MAT"
            ? "Tiền mặt"
            : method == "CHUYEN_KHOAN"
            ? "Chuyển khoản"
            : "Tiền mặt và chuyển khoản"}
        </span>
      ),
    },
    {
      title: <div className="title-product">thời gian</div>,
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) => {
        const formattedDate = moment(text).format("DD-MM-YYYY"); // Định dạng ngày
        return formattedDate;
      },
    },
    {
      title: <div className="title-product">Ghi chú</div>,
      dataIndex: "description",
      key: "description",
    },
    {
      title: <div className="title-product">Người xác nhận</div>,
      dataIndex: "employees",
      key: "employees",
      render: (employees) => {
        return employees.user.fullName;
      },
    },
  ];

  const getPromotionStyle = (promotion) => {
    return promotion >= 50 ? { color: "white" } : { color: "#000000" };
  };
  const getPromotionColor = (promotion) => {
    return promotion >= 50 ? { color: "#FF0000" } : { color: "#FFCC00" };
  };

  // begin delete product

  const removeProductInBill = (idProduct, size) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có xác nhận xóa sản phẩmkhông?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async () => {
        await BillApi.removeProductInBill(idProduct, size).then((res) => {
          toast("xóa thành công");
        });
        await BillApi.fetchAllProductsInBillByIdBill(id).then((res) => {
          dispatch(getProductInBillDetail(res.data.data));
        });
        await BillApi.fetchDetailBill(id).then((res) => {
          dispatch(getBill(res.data.data));
          var index = listStatus.findIndex(
            (item) => item.status == res.data.data.statusBill
          );
          if (res.data.data.statusBill == "TRA_HANG") {
            index = 6;
          }
          if (res.data.data.statusBill == "DA_HUY") {
            index = 7;
          }
          dispatch(addStatusPresent(index));
        });
        await BillApi.fetchAllHistoryInBillByIdBill(id).then((res) => {
          dispatch(getBillHistory(res.data.data));
        });
      },
      onCancel: () => {},
    });
  };
  // end delete product

  return (
    <div>
      <Row style={{ width: "100%" }}>
        <div
          className="row"
          style={{
            backgroundColor: "white",
            width: "100%",
            marginBottom: "30px",
          }}
        >
          <Row style={{ backgroundColor: "white", width: "100%" }}>
            <TimeLine
              style={{ with: "100%" }}
              listStatus={listStatus}
              data={billHistory}
              statusPresent={statusPresent}
            />
          </Row>
          <Row
            style={{ width: "100%", marginBottom: "20px" }}
            justify={"space-around"}
          >
            <Row style={{ width: "100%" }}>
              <Col span={12}>
                <Row>
                  <Col
                    style={{ width: "100%" }}
                    span={statusPresent < 5 ? 7 : 0}
                  >
                    {statusPresent < 5 && statusPresent != 3 ? (
                      <Button
                        type="primary"
                        className="btn btn-primary"
                        onClick={() => showModalChangeStatus()}
                        style={{
                          fontSize: "medium",
                          fontWeight: "500",
                          marginLeft: "20px",
                        }}
                      >
                        {listStatus[statusPresent + 1].name}
                      </Button>
                    ) : (
                      <div></div>
                    )}
                  </Col>
                  <Col span={statusPresent < 2 ? 6 : 0}>
                    {statusPresent < 2 ? (
                      <Button
                        type="danger"
                        onClick={() => showModalCanCel()}
                        style={{
                          fontSize: "medium",
                          fontWeight: "500",
                          marginLeft: "20px",
                          backgroundColor: "red",
                          color: "white",
                        }}
                      >
                        Hủy
                      </Button>
                    ) : (
                      <div></div>
                    )}
                  </Col>
                </Row>
              </Col>
              <Col span={12} align={"end"}>
                <Button
                  type="primary"
                  onClick={showModal}
                  style={{
                    fontSize: "medium",
                    fontWeight: "500",
                    marginRight: "20px",
                    // backgroundColor: ",
                  }}
                >
                  Lịch sử
                </Button>
              </Col>
            </Row>
            <Modal
              title="Xác nhận Đơn hàng"
              open={isModalOpenChangeStatus}
              onOk={handleOkChangeStatus}
              onCancel={handleCancelChangeStatus}
            >
              <Form onFinish={onFinish} ref={formRef} form={form} initialValues={initialValues}>
                {bill.statusBill === "VAN_CHUYEN" ? (
                  <div>
                    <Row style={{ width: "100%", marginTop: "10px" }}>
                      <Col span={24} style={{ marginTop: "10px" }}>
                        <label className="label-bill" style={{ top: "-15px" }}>
                          Giá
                        </label>
                        <Form.Item
                          label=""
                          name="price"
                          // style={{ fontWeight: "bold" }}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số tiền",
                            },
                          ]}
                        >
                          <NumberFormat
                            thousandSeparator={true}
                            suffix=" VND"
                            placeholder="Vui lòng nhập số tiền"
                            style={{
                              width: "100%",
                              position: "relative",
                              height: "37px",
                            }}
                            customInput={Input}
                            onChange={(e) =>
                              onChangeDescStatusBill(
                                "totalMoney",
                                e.target.value
                              )
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row style={{ width: "100%" }}>
                      <Col span={24} style={{ marginTop: "10px" }}>
                        <label
                          className="label-bill"
                          style={{ marginTop: "-4px" }}
                        >
                          Hình thức
                        </label>
                        <Select
                          showSearch
                          style={{
                            width: "100%",
                            margin: "10px 0",
                            position: "relative",
                          }}
                          placeholder="Chọn hình thức"
                          optionFilterProp="children"
                          onChange={(value) =>
                            onChangeDescStatusBill("method", value)
                          }
                          defaultValue={statusBill.method}
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={[
                            {
                              value: "TIEN_MAT",
                              label: "Tiền mặt",
                            },
                            {
                              value: "CHUYEN_KHOAN",
                              label: "Chuyển khoản",
                            },
                            {
                              value: "TIEN_MAT_VA_CHUYEN_KHOAN",
                              label: "Tiền mặt và chuyển khoản",
                            },
                          ]}
                        />
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div></div>
                )}
                <Row style={{ width: "100%" }}>
                  <Col span={24} style={{ marginTop: "20px" }}>
                    <label className="label-bill">Mô Tả</label>
                    <Form.Item
                      label=""
                      name="actionDescription"
                      // style={{ fontWeight: "bold" }}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mô tả",
                        },
                      ]}
                    >
                      <TextArea
                        rows={bill.statusBill === "VAN_CHUYEN" ? 3 : 4}
                        placeholder="Nhập mô tả"
                        style={{ width: "100%", position: "F" }}
                        onChange={(e) =>
                          onChangeDescStatusBill(
                            "actionDescription",
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
            <div className="col-2">
              <Modal
                title="Hủy đơn hàng"
                open={isModalCanCelOpen}
                onOk={handleCanCelOk}
                onCancel={handleCanCelClose}
              >
                <Form onFinish={onFinish}  ref={formRef}  form={form} initialValues={initialValues}>
                  <Col span={24} style={{ marginTop: "20px" }}>
                    <label className="label-bill">Mô Tả</label>

                    <Form.Item
                      label=""
                      name="actionDescription"
                      // style={{ fontWeight: "bold" }}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mô tả",
                        },
                      ]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="Nhập mô tả"
                        onChange={(e) =>
                          onChangeDescStatusBill(
                            "actionDescription",
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Form>
              </Modal>
            </div>
            <div className="offset-6 col-2">
              <Modal
                title="Lịch sử"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                className="widthModal"
                width={800}
              >
                <Table
                  dataSource={billHistory}
                  columns={columnsHistory}
                  rowKey="id"
                  pagination={false} // Disable default pagination
                  className="product-table"
                />
              </Modal>
            </div>
          </Row>
        </div>
      </Row>

      <Row
        style={{
          width: "100%",
          marginBottom: "20px",
          backgroundColor: "white",
        }}
      >
        <Row
          style={{
            width: "100%",
            borderBottom: "2px solid #ccc",
            padding: "12px",
            margin: "0px 20px",
          }}
        >
          <Col span={20}>
            <h2
              className="text-center"
              style={{
                width: "100%",
                fontSize: "x-large",
                fontWeight: "500",
                // margin: "10px 20px 20px 20px",
              }}
            >
              Lịch sử thanh toán
            </h2>
          </Col>
          <Col span={4}>
            {/* <Button
              type="dashed"
              align={"end"}
              style={{ margin: "" }}
              onClick={(e) => showModalPayMent(e)}
            >
              Xác nhận thanh toán
            </Button> */}
            {payMentNo && statusPresent == 3 ? (
              <Button
                type="dashed"
                align={"end"}
                style={{ margin: "" }}
                onClick={(e) => XacNhanThanhToan(e)}
              >
                Xác nhận thanh toán
              </Button>
            ) : (
              <div></div>
            )}
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Table
            dataSource={paymentsMethod}
            columns={columnsPayments}
            rowKey="id"
            pagination={false} // Disable default pagination
            className="product-table"
          />
        </Row>
      </Row>
      <Row style={{ width: "100%" }}>
        <div style={{ backgroundColor: "white", width: "100%" }}>
          <Row
            style={{
              width: "96%",
              margin: "10px 20px 20px 20px",
              borderBottom: "2px solid #ccc",
              padding: "12px",
            }}
          >
            <Col span={22}>
              <h2
                className="text-center"
                style={{
                  fontSize: "x-large",
                  fontWeight: "500",
                }}
              >
                Thông tin đơn hàng
              </h2>
            </Col>
            <Col span={2}>
              <Button
                type="dashed"
                align={"end"}
                style={{ margin: "" }}
                onClick={(e) => showModalBill(e)}
              >
                Thay đổi
              </Button>
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={12} className="text">
              <Row style={{ marginLeft: "20px" }}>
                <Col span={8}>Trạng thái:</Col>
                <Col span={16}>
                  <span
                    className={`trangThai ${" status_" + bill.statusBill} `}
                  >
                    {bill.statusBill == "TAO_HOA_DON"
                      ? "Tạo Hóa đơn"
                      : bill.statusBill == "CHO_XAC_NHAN"
                      ? "Chờ xác nhận"
                      : bill.statusBill === "VAN_CHUYEN"
                      ? "Đang vận chuyển"
                      : bill.statusBill === "DA_THANH_TOAN"
                      ? "Đã thanh toán"
                      : bill.statusBill === "KHONG_TRA_HANG"
                      ? "Thành công"
                      : bill.statusBill === "TRA_HANG"
                      ? "Trả hàng"
                      : "Đã hủy"}
                  </span>
                </Col>
              </Row>
            </Col>
            <Col span={12} className="text">
              <Row style={{ marginLeft: "20px", marginTop: "8px" }}>
                <Col span={8}>Tên khách hàng:</Col>
                <Col span={16}>
                  {bill.userName == "" ? (
                    <span
                      style={{
                        backgroundColor: " #ccc",
                        color: "white",
                        width: "180px",
                        borderRadius: "15px",
                        padding: " 5px 19px",
                        marginLeft: "10px",
                      }}
                    >
                      Khách lẻ
                    </span>
                  ) : (
                    <span style={{ color: "black" }}>{bill.userName}</span>
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={12} className="text">
              <Row style={{ marginLeft: "20px", marginTop: "8px" }}>
                <Col span={8}>Loại:</Col>
                <Col span={16}>
                  <span
                    style={{
                      backgroundColor: "#6633FF",
                      color: "white",
                      width: "300px",
                      borderRadius: "15px",
                      padding: " 5px 38px",
                    }}
                  >
                    {bill.typeBill}
                  </span>
                </Col>
              </Row>
            </Col>
            <Col span={12} className="text">
              <Row style={{ marginLeft: "20px", marginTop: "8px" }}>
                <Col span={8}> Số điện thoại:</Col>
                <Col span={16}>
                  <span style={{ color: "black" }}>{bill.phoneNumber}</span>
                </Col>
              </Row>
            </Col>

            {/* <Col span={12} className="text">
              <div style={{ marginLeft: "20px" }}>Gmail: {bill.account != null ? bill.account.email : bill.account.customer }</div>
            </Col> */}
            <Col span={12} className="text">
              <Row style={{ marginLeft: "20px", marginTop: "8px" }}>
                <Col span={8}>Địa chỉ:</Col>
                <Col span={16}>
                  <span style={{ color: "black" }}>{bill.address}</span>
                </Col>
              </Row>
            </Col>
            <Col span={12} className="text">
              <Row
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "20px",
                }}
              >
                <Col span={8}>ghi chú:</Col>
                <Col span={16}>
                  <span>{bill.note}</span>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Row>
      <Row
        style={{ width: "100%", backgroundColor: "white", marginTop: "20px" }}
      >
        {bill.statusBill == "TAO_HOA_DON" ? (
          <Row style={{ width: "100%" }} justify="end">
            <Button
              type="primary"
              style={{ margin: "10px 20px 0 0 " }}
              onClick={(e) => showModalProduct(e)}
            >
              Thêm sản phẩm
            </Button>
          </Row>
        ) : (
          <div></div>
        )}
        <Row
          style={{
            width: "100%",
            marginTop: "20px",
            borderBottom: "1px solid #ccc",
            padding: "12px",
          }}
        >
          {detailProductInBill.map((item) => {
            return (
              <Row style={{ marginTop: "10px", width: "100%" }}>
                <Col span={5}>
                  <img
                    src={item.image}
                    alt="Ảnh sản phẩm"
                    style={{
                      width: "170px",
                      borderRadius: "10%",
                      height: "140px",
                      marginLeft: "5px",
                    }}
                  />
                </Col>
                <Col span={11}>
                  <Row>
                    {" "}
                    <span
                      style={{
                        fontSize: "19",
                        fontWeight: "500",
                        marginTop: "10px",
                      }}
                    >
                      {item.productName}
                    </span>{" "}
                  </Row>
                  <Row>
                    <span style={{ color: "red", fontWeight: "500" }}>
                      {formatCurrency(item.price )}
                    </span>{" "}
                  </Row>
                  <Row>
                    <span style={{ fontSize: "12", marginTop: "10px" }}>
                      Size: {item.nameSize}
                    </span>{" "}
                  </Row>
                  <Row>
                    <span style={{ fontSize: "12" }}>x {item.quantity}</span>{" "}
                  </Row>
                </Col>
                <Col span={3} style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      color: "red",
                      fontWeight: "bold",
                      marginBottom: "30px",
                    }}
                  >
                    {item.price * item.quantity >= 1000
                      ? (item.price * item.quantity).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : item.price * item.quantity + " đ"}
                  </span>{" "}
                </Col>
                <Col span={5} style={{ display: "flex", alignItems: "center" }}>
                  <Row>
                    <Col span={12}>
                      {bill.statusBill == "TAO_HOA_DON" ||
                      bill.statusBill == "CHO_XAC_NHAN" ? (
                        <Button
                          type=""
                          style={{
                            color: "#00ffe0",
                            fontWeight: "500",
                            marginBottom: "30px",
                            border: "1px solid #00ffe0",
                            borderRadius: "10px",
                          }}
                          onClick={(e) => showModalUpdateProduct(e, item.id)}
                        >
                          Cập nhật
                        </Button>
                      ) : (
                        <div></div>
                      )}
                    </Col>
                    {bill.statusBill == "TAO_HOA_DON" ||
                    bill.statusBill == "CHO_XAC_NHAN" ? (
                      <Col span={12}>
                        <Button
                          type=""
                          style={{
                            color: "#eb5a36",
                            marginLeft: "20px",
                            fontWeight: "500",
                            marginBottom: "30px",
                            border: "1px solid #eb5a36",
                            borderRadius: "10px",
                          }}
                          onClick={(e) =>
                            removeProductInBill(item.id, item.idProduct)
                          }
                        >
                          Xóa
                        </Button>
                      </Col>
                    ) : (
                      <div></div>
                    )}
                    {bill.statusBill == "DA_THANH_TOAN" ||
                    bill.statusBill == "KHONG_TRA_HANG" ||
                    bill.statusBill == "TRA_HANG" ? (
                      <Col span={12}>
                        <Button
                          type=""
                          style={{
                            color: "#eb5a36",
                            marginLeft: "20px",
                            fontWeight: "500",
                            marginBottom: "30px",
                            border: "1px solid #eb5a36",
                            borderRadius: "10px",
                          }}
                          disabled={item.status == "TRA_HANG"}
                          onClick={(e) => showModalRefundProduct(e, item.id)}
                        >
                          {item.status != "TRA_HANG"
                            ? "Trả hàng"
                            : "Đã hoàn hàng"}
                        </Button>
                      </Col>
                    ) : (
                      <div></div>
                    )}
                  </Row>
                </Col>
              </Row>
            );
          })}
        </Row>
        <Row style={{ width: "100%", marginTop: "20px" }} justify={"end"}>
          <Col span={10}>
            <Row style={{ marginLeft: "20px", marginTop: "8px" }}>
              <Col span={7}></Col>
              <Col span={6}>Tiền hàng:</Col>
              <Col span={10} align={"end"}>
                <span>
                  {formatCurrency(bill.totalMoney) }
                </span>
              </Col>
            </Row>
              {
                bill.moneyShip == undefined || bill.moneyShip == "" ? (
                  <Row style={{ marginLeft: "20px", marginTop: "8px" }}>
                  <Col span={7}></Col>
                  <Col span={6}>Phí vận chuyển:</Col>
                  <Col span={10} align={"end"}>
                    <span>
                      {formatCurrency(bill.moneyShip)}
                    </span>
                  </Col>
                </Row>
                ) :(<Row></Row>)
              }
           
            <Row style={{ marginLeft: "20px", marginTop: "8px" }}>
              <Col span={7}></Col>
              <Col span={6}>Tiền giảm: </Col>
              <Col span={10} align={"end"}>
                <span>
                  {formatCurrency(bill.itemDiscount) }
                </span>
              </Col>
            </Row>
            <Row style={{ marginLeft: "20px", marginTop: "8px" }}>
              <Col span={7}></Col>
              <Col span={6} style={{ marginBottom: "40px" }}>
                Tổng tiền:{" "}
              </Col>
              <Col span={10} align={"end"}>
                <span style={{ color: "red", fontWeight: "bold" }}>
                  { formatCurrency(detailProductInBill.reduce((accumulator, currentValue) => {
                    return (
                      accumulator + currentValue.price * currentValue.quantity
                    );
                  }, 0) +
                    bill.moneyShip -
                    bill.itemDiscount)  }
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
      </Row>
      {/* begin modal payment  */}
      <Modal
        title="Thanh toán"
        open={isModalPayMentOpen}
        onOk={handleOkPayMent}
        onCancel={handleCancelPayMent}
      >
        <Form form={form} ref={formRef} >
          <Row style={{ width: "100%", marginTop: "10px" }}>
            <Col span={24} style={{ marginTop: "10px" }}>
              <label className="label-bill" style={{ top: "-14px" }}>
                Giá
              </label>
              <Form.Item
                label=""
                name="price"
                style={{ marginBottom: "20px" }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số tiền",
                  },
                ]}
              >
                <NumberFormat
                  thousandSeparator={true}
                  suffix=" VND"
                  placeholder="Vui lòng nhập số tiền"
                  style={{
                    width: "100%",
                    position: "relative",
                    height: "37px",
                  }}
                  customInput={Input}
                  onChange={(e) =>
                    onChangeDescStatusBill("totalMoney", e.target.value)
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "10px" }}>
              <label className="label-bill" style={{ marginTop: "2px" }}>
                Hình thức
              </label>
              <Select
                showSearch
                style={{
                  width: "100%",
                  margin: "10px 0",
                  position: "relative",
                }}
                placeholder="Chọn hình thức"
                optionFilterProp="children"
                onChange={(value) => onChangeDescStatusBill("method", value)}
                defaultValue={statusBill.method}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={[
                  {
                    value: "TIEN_MAT",
                    label: "Tiền mặt",
                  },
                  {
                    value: "CHUYEN_KHOAN",
                    label: "Chuyển khoản",
                  },
                  {
                    value: "TIEN_MAT_VA_CHUYEN_KHOAN",
                    label: "Tiền mặt và chuyển khoản",
                  },
                ]}
              />
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "10px" }}>
              <label className="label-bill" style={{ top: "-6%" }}>
                Loại thanh toán
              </label>
              <Select
                showSearch
                style={{
                  width: "100%",
                  margin: "10px 0",
                  position: "relative",
                }}
                placeholder="Chọn Loại"
                optionFilterProp="children"
                onChange={(value) => onChangeDescStatusBill("status", value)}
                defaultValue={statusBill.status}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={[
                  {
                    value: "THANH_TOAN",
                    label: "Thanh toán",
                  },
                  {
                    value: "HOAN_TIEN",
                    label: "Hoàn tiền",
                  },
                ]}
              />
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "20px" }}>
              <label className="label-bill">Mô Tả</label>
              <TextArea
                rows={bill.statusBill === "VAN_CHUYEN" ? 3 : 4}
                defaultValue={statusBill.actionDescription}
                style={{ width: "100%", position: "relative" }}
                placeholder="Nhập mô tả"
                onChange={(e) =>
                  onChangeDescStatusBill("actionDescription", e.target.value)
                }
              />
            </Col>
          </Row>
        </Form>
      </Modal>
      {/* end modal payment  */}

      {/* begin modal bill  */}
      <Modal
        title="Thay đổi hóa đơn"
        open={isModaBillOpen}
        onOk={handleOkBill}
        onCancel={handleCancelBill}
      >
        <Form initialValues={initialValues} form={form} ref={formRef} >
          <Row style={{ width: "100%", marginTop: "10px" }}></Row>

          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "20px" }}>
              <label
                className="label-bill"
                style={{ marginTop: "3px", top: "-31%" }}
              >
                Tên khách hàng
              </label>
              <Form.Item
                label=""
                name="name"
                style={{ marginBottom: "20px" }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên khách hàng",
                  },
                ]}
              >
                <Input
                  onChange={(e) => onChangeBill("name", e.target.value)}
                  placeholder="Nhập tên khách hàng"
                  style={{ width: "98%", position: "relative", height: "40px" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "20px" }}>
              <label
                className="label-bill"
                style={{ marginTop: "-4px", top: "-25%" }}
              >
                Số điện thoại
              </label>
              <Form.Item
                label=""
                name="phoneNumber"
                style={{ marginBottom: "20px" }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại",
                  },
                  {
                    pattern:
                      "(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}",
                    message: "Vui lòng nhập đúng số điện thoại",
                  },
                ]}
              >
                <Input
                  onChange={(e) => onChangeBill("phoneNumber", e.target.value)}
                  placeholder="Nhập số điện thoại"
                  style={{ width: "98%", position: "relative", height: "40px" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{}}>
            <Col span={24}>
              <Row style={{ width: "100%", marginTop: "20px" }}>
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <label
                        className="label-bill"
                        style={{ marginTop: "-4px", top: "-25%" }}
                      >
                        Tỉnh
                      </label>
                      <Form.Item
                        label=""
                        name="city"
                        style={{ marginBottom: "20px" }}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn tỉnh",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          placeholder="Chọn tỉnh"
                          optionFilterProp="children"
                          // onChange={(v) => onChangeAddress("city", v)}
                          onChange={handleProvinceChange}
                          defaultValue={address.city}
                          style={{ width: "90%", position: "relative" }}
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          // options={[]}
                        >
                          {listProvince?.map((item) => {
                            return (
                              <Option
                                key={item.ProvinceID}
                                value={item.ProvinceName}
                                valueProvince={item.ProvinceID}
                              >
                                {item.ProvinceName}
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <label
                        className="label-bill"
                        style={{ marginTop: "-4px", top: "-25%" }}
                      >
                        Quận
                      </label>

                      <Form.Item
                        label=""
                        name="district"
                        style={{ marginBottom: "20px" }}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn Quận",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          placeholder="Chọn Quận"
                          optionFilterProp="children"
                          // onChange={(v) => onChangeAddress("district", v)}
                          onChange={handleDistrictChange}
                          defaultValue={address.district}
                          style={{ width: "90%", position: "relative" }}
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          // options={[]}
                        >
                          {listDistricts?.map((item) => {
                            return (
                              <Option
                                key={item.DistrictID}
                                value={item.DistrictName}
                                valueDistrict={item.DistrictID}
                              >
                                {item.DistrictName}
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <label
                        className="label-bill"
                        style={{ marginTop: "-4px", top: "-25%" }}
                      >
                        xã
                      </label>
                      <Form.Item
                        label=""
                        name="wards"
                        style={{ marginBottom: "20px" }}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn Quận",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          placeholder="Chọn Phường xã"
                          optionFilterProp="children"
                          // onChange={(v) => onChangeAddress("wards", v)}
                          onChange={handleWardChange}
                          defaultValue={address.wards}
                          style={{ width: "94%", position: "relative" }}
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          // options={[]}
                        >
                          {listWard?.map((item) => {
                            return (
                              <Option
                                key={item.WardCode}
                                value={item.WardName}
                                valueWard={item.WardCode}
                                valueDistrict={item.DistrictID}
                              >
                                {item.WardName}
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "20px" }}>
              <label
                className="label-bill"
                style={{ marginTop: "-4px", top: "-25%" }}
              >
                Địa chỉ cụ thể
              </label>
              <Form.Item
                label=""
                name="detail"
                style={{ marginBottom: "20px" }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn Quận",
                  },
                ]}
              >
                <Input
                   defaultValue={address.detail}
                  onChange={(e) => onChangeAddress("detail", e.target.value)}
                  placeholder="Nhập địa chỉ"
                  style={{ width: "98%", position: "relative", height: "40px" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "20px" }}>
              <label className="label-bill">Ghi chú</label>
              <TextArea
                rows={bill.statusBill === "VAN_CHUYEN" ? 3 : 4}
                defaultValue={billRequest.note}
                style={{ width: "100%", position: "relative" }}
                placeholder="Nhập mô tả"
                onChange={(e) => onChangeBill("note", e.target.value)}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
      {/* end modal bill  */}

      {/* begin modal refundProduct  */}
      <Modal
        title="Trả hàng"
        className="refundProduct"
        open={isModaRefundProductOpen}
        onOk={handleOkRefundProduct}
        onCancel={handleCancelRefundProduct}
        style={{ width: "800px" }}
      >
        <Form initialValues={initialValues} ref={formRef}  form={form}>
          <Row style={{ width: "100%", marginTop: "10px" }}>
            <Col span={24} style={{ marginTop: "10px" }}></Col>
          </Row>

          <Row style={{ marginTop: "10px", width: "100%" }}>
            <Col span={7}>
              <img
                src={detaiProduct.image}
                alt="Ảnh sản phẩm"
                style={{
                  width: "170px",
                  borderRadius: "10%",
                  height: "140px",
                  marginLeft: "5px",
                }}
              />
            </Col>
            <Col span={14}>
              <Row>
                {" "}
                <span
                  style={{
                    fontSize: "19",
                    fontWeight: "500",
                    marginTop: "10px",
                  }}
                >
                  {detaiProduct.productName}
                </span>{" "}
              </Row>
              <Row>
                <span style={{ color: "red", fontWeight: "500" }}>
                  { formatCurrency(detaiProduct.price) }
                </span>{" "}
              </Row>
              <Row>
                <span style={{ fontSize: "12", marginTop: "10px" }}>
                  Size: {detaiProduct.nameSize}
                </span>{" "}
              </Row>
              <Row>
                <span style={{ fontSize: "12" }}>
                  x {detaiProduct.quantity}
                </span>{" "}
              </Row>
            </Col>
            <Col span={3} style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  color: "red",
                  fontWeight: "bold",
                  marginBottom: "30px",
                }}
              >
                 { formatCurrency(detaiProduct.price * detaiProduct.quantity )
               }
              </span>{" "}
            </Col>
          </Row>
          <Row style={{ width: "100%", marginTop: "20px" }} justify={"center"}>
            <Col span={4}>Số lượng</Col>
            <Col span={6}>
              <Row>
                <Col span={6}>
                  {" "}
                  <Button
                    onClick={handleDecrease}
                    style={{ margin: "0 4px 0 10px" }}
                  >
                    -
                  </Button>
                </Col>
                <Col span={12}>
                  {" "}
                  <InputNumber
                    min={1}
                    defaultValue={quantity}
                    max={detaiProduct.quantity}
                    style={{ marginLeft: "4px" }}
                    onChange={(value) => {
                      if (
                        value < detaiProduct.quantity ||
                        value > 1 ||
                        value != undefined
                      ) {
                        setQuantity(value);
                      }
                    }}
                  />
                </Col>
                <Col span={6}>
                  {" "}
                  <Button
                    onClick={handleIncrease}
                    style={{ margin: "0 4px 0 4px" }}
                  >
                    +
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "20px" }}>
              <label className="label-bill">Ghi chú</label>
              <TextArea
                rows={4}
                defaultValue={refundProduct.note}
                style={{ width: "100%", position: "relative" }}
                placeholder="Nhập mô tả"
                onChange={(e) => onChangeRefundProduct("note", e.target.value)}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
      {/* end modal refundProduct  */}

      {/* begin modal update product  */}
      <Modal
        title="Sửa sản phẩm"
        className="refundProduct"
        open={isModaUpdateProduct}
        onOk={handleOkUpdateProduct}
        onCancel={handleCancelUpdateProduct}
        style={{ width: "800px" }}
      >
        <Form initialValues={initialValues} form={form} ref={formRef} >
          <Row style={{ width: "100%", marginTop: "10px" }}>
            <Col span={24} style={{ marginTop: "10px" }}></Col>
          </Row>

          <Row style={{ marginTop: "10px", width: "100%" }}>
            <Col span={7}>
              <img
                src={detaiProduct.image}
                alt="Ảnh sản phẩm"
                style={{
                  width: "170px",
                  borderRadius: "10%",
                  height: "140px",
                  marginLeft: "5px",
                }}
              />
            </Col>
            <Col span={14}>
              <Row>
                {" "}
                <span
                  style={{
                    fontSize: "19",
                    fontWeight: "500",
                    marginTop: "10px",
                  }}
                >
                  {detaiProduct.productName}
                </span>{" "}
              </Row>
              <Row>
                <span style={{ color: "red", fontWeight: "500" }}>
                  {detaiProduct.price >= 1000
                    ? detaiProduct.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                    : detaiProduct.price + " đ"}
                </span>{" "}
              </Row>
              <Row>
                <span style={{ fontSize: "12", marginTop: "10px" }}>
                  Size: {detaiProduct.nameSize}
                </span>{" "}
              </Row>
              <Row>
                <span style={{ fontSize: "12" }}>
                  x {detaiProduct.quantity}
                </span>{" "}
              </Row>
            </Col>
            <Col span={3} style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  color: "red",
                  fontWeight: "bold",
                  marginBottom: "30px",
                }}
              >
                {detaiProduct.price * detaiProduct.quantity >= 1000
                  ? (detaiProduct.price * detaiProduct.quantity).toLocaleString(
                      "vi-VN",
                      {
                        style: "currency",
                        currency: "VND",
                      }
                    )
                  : detaiProduct.price * detaiProduct.quantity + " đ"}
              </span>{" "}
            </Col>
          </Row>
          <Row style={{ width: "100%", marginTop: "20px" }} justify={"center"}>
            <Col span={4}>Số lượng</Col>
            <Col span={6}>
              <Row>
                <Col span={6}>
                  {" "}
                  <Button
                    onClick={handleDecrease}
                    style={{ margin: "0 4px 0 10px" }}
                  >
                    -
                  </Button>
                </Col>
                <Col span={12}>
                  {" "}
                  <InputNumber
                    min={1}
                    max={detaiProduct.maxQuantity}
                    defaultValue={quantity}
                    style={{ marginLeft: "4px" }}
                    onChange={(value) => {
                      if (
                        value <=
                          detaiProduct.maxQuantity + detaiProduct.quantity &&
                        value > 0 &&
                        value != undefined
                      ) {
                        setQuantity(value);
                      }
                    }}
                  />
                </Col>
                <Col span={6}>
                  {" "}
                  <Button
                    onClick={handleIncrease}
                    style={{ margin: "0 4px 0 4px" }}
                  >
                    +
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24} style={{ marginTop: "20px" }}>
              <label className="label-bill">Ghi chú</label>
              <TextArea
                rows={4}
                defaultValue={refundProduct.note}
                style={{ width: "100%", position: "relative" }}
                placeholder="Nhập mô tả"
                onChange={(e) => onChangeUpdateProduct("note", e.target.value)}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
      {/* end modal update product  */}

      {/* begin modal product */}
      <Modal
        title="Basic Modal"
        open={isModalProductOpen}
        onOk={handleOkProduct}
        onCancel={handleCancelProduct}
        width={1000}
      >
        <ModalAddProductDetail
          handleCancelProduct={handleCancelProduct}
          products={products}
          setProducts={setProducts}
          typeAddProductBill={typeAddProductBill}
        />
      </Modal>
      {/* end bigin modal product */}

      <ToastContainer
        position="top-right"
        autoClose={500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
      <ToastContainer />
    </div>
  );
}

export default DetailBill;
