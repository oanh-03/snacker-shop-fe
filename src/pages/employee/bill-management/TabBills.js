import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Modal, Row, Table } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BillApi } from "../../../api/employee/bill/bill.api";
import {  toast } from "react-toastify";

function TabBills({ statusBill, dataFillter, addNotify }) {

  const [dataBill, setDataBill] = useState([]);
  const [dataIdCheck, setDataIdCheck] = useState([]);

  const formatCurrency = (value) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    });
    return formatter.format(value);
  };
  
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      sorter: (a, b) => a.stt - b.stt,
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Tên khách hàng",
      dataIndex: "userName",
      key: "userName",
      sorter: (a, b) => a.userName - b.userName,
    },
    {
      title: "Tên nhân viên",
      dataIndex: "nameEmployees",
      key: "nameEmployees",
      sorter: (a, b) => a.nameEmployees - b.nameEmployees,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        return <p>{type === "ONLINE" ? "OnLine" : "Tại quầy"}</p>;
      },
    },
    {
      title: <div className="title-product">Ngày tạo</div>,
      dataIndex: "createdDate",
      key: "createdDate",
      sorter: (a, b) => a.createdDate - b.createdDate,
      render: (text) => {
        const formattedDate = moment(text).format("HH:mm:ss DD-MM-YYYY"); // Định dạng ngày
        return formattedDate;
      },
    },
    {
      title: <div className="title-product">Tiền giảm</div>,
      dataIndex: "itemDiscount",
      key: "itemDiscount",
      render: (itemDiscount) => (
        <span>
          {formatCurrency(itemDiscount) }
        </span>
      ),
    },
    {
      title: <div className="title-product">Tổng tiền</div>,
      dataIndex: "totalMoney",
      key: "totalMoney",
      render: (totalMoney) => (
        <span>
          {formatCurrency(totalMoney) }
        </span>
      ),
    },
    {
      title: <div className="title-product">Thao Tác</div>,
      dataIndex: "id",
      key: "actions",
      render: (id) => (
        <Button style={{ backgroundColor: "#FF9900" }} title="Chi tiết hóa đơn">
          <Link to={`/bill-management/detail-bill/${id}`}>
            <FontAwesomeIcon icon={faEye} />
          </Link>
        </Button>
      ),
    },
  ];

 
  const [fillter, setFillter] = useState({
    startTimeString: dataFillter.startTimeString,
    endTimeString: dataFillter.endTimeString,
    status: [statusBill],
    endDeliveryDateString: dataFillter.endDeliveryDateString,
    startDeliveryDateString: dataFillter.startDeliveryDateString,
    key: dataFillter.key,
    employees: dataFillter.employees,
    user: dataFillter.user,
    phoneNumber: dataFillter.phoneNumber,
    type: dataFillter.type,
    page: 0,
  });

  useEffect(() => {
    BillApi.fetchAll(fillter).then((res) => {
      setDataBill(res.data.data);
    });
  }, []);

  useEffect(() => {
    var data = dataFillter
    dataFillter.status = [statusBill]
    BillApi.fetchAll(data).then((res) => {
      setDataBill(res.data.data);
    });
  }, [dataFillter]);

  const convertString = (key) => {
    return  key === ""
    ? "Tất cả"
    : key === "CHO_XAC_NHAN"
    ? "Xác nhận"
    : key === "CHO_VAN_CHUYEN"
    ? "Vận chuyển"
    : key === "VAN_CHUYEN"
    ? "Đã Vận chuyển"
    : key === "KHONG_TRA_HANG"
    ? "Hoàn thành"
    : key === "DA_THANH_TOAN"
    ? "Thanh Toán"
    : "Hủy"
  }

  const nextStatusBill = () => {
    return statusBill == "CHO_XAC_NHAN" ? 
    "CHO_VAN_CHUYEN" : statusBill == "CHO_VAN_CHUYEN" ? 
    "VAN_CHUYEN" : statusBill == "VAN_CHUYEN" ? 
    "DA_THANH_TOAN" :  statusBill == "DA_THANH_TOAN" ? "KHONG_TRA_HANG" :
    "DA_HUY" 
  }
  const changeStatusBill = (e) => {
    Modal.confirm({
      title: "Xác nhận",
      content: `Bạn có đồng ý ${convertString(statusBill)} không?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async() => {
        var data = {
          ids: dataIdCheck,
          status: nextStatusBill()
        }
        await BillApi.changeStatusAllBillByIds(data).then(response =>{
          if(response.data.data == true){
            addNotify( {status: nextStatusBill() ,
            quantity:dataIdCheck.length})
            toast.success(`${convertString(statusBill)} thành công`)
          }
        })
        await  BillApi.fetchAll(fillter).then((res) => {
          setDataBill(res.data.data);
        });
      },
      onCancel: () => {
       
      },
    });
  };

  return (
    <div style={{ width: "100%", marginTop: "0px" }}>
      <Row style={{ width: "100%" }}>
        <Table
          dataSource={dataBill}
          rowKey="id"
          style={{ width: "100%", marginTop: "0px" }}
          columns={columns}
          pagination={{ pageSize: 10 }}
          rowSelection={{
            type: "checkbox",
            onSelectRow: (keys) => {},
            onSelectAll: (checked) => {
              if (checked) {
                setDataIdCheck(dataBill.map((row) => row.id));
              } else {
                setDataIdCheck([]);
              }
            },
            onSelect: ( keys, checked) => {
              if (checked) {
                setDataIdCheck([...dataIdCheck, keys.id]);
              } else {
                var data = [...dataIdCheck];
                const index = data.indexOf(keys.id);
                if (index > -1) {
                  data.splice(index, 1);
                }
                setDataIdCheck(data);
              }
            },
          }}
          className="bill-table"
        />
      </Row>
      {statusBill != "" && statusBill != 'DA_HUY' && statusBill != 'KHONG_TRA_HANG'? (
        <Row style={{ width: "100%", marginTop: "15px" }} justify={"end"}>
          <Col span={3} style={{ marginRight: "10px" }}>
            <Button onClick={(e) => changeStatusBill(e)}>{convertString(statusBill)}</Button>
          </Col>
        </Row>
      ) : (
        <Row></Row>
      )}

    </div>
  );
}

export default TabBills;
