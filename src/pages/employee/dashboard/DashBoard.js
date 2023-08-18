import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Form, Row, Col, Table } from "antd";
import "../dashboard/style-dashboard.css";
import { CChart } from "@coreui/react-chartjs";
import { StatisticalApi } from "../../../api/employee/statistical/statistical.api";
const DashBoard = () => {
  const [totalBillMonth, setTotalBillMonth] = useState(0);
  const [totalBillAmoutMonth, setTotalBillAmoutMonth] = useState(0);
  const [totalProductMonth, setTotalProductMonth] = useState(0);
  const [totalBillDay, setTotalBillDay] = useState(0);
  const [totalBillAmountDay, setTotalBillAmoutDay] = useState(0);

  const [dataPie, setDataPie] = useState([]);
  const [listSellingProduct, setListSellingProduct] = useState([]);
  const [dataColumn, setDataColumn] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const loadData = () => {
    StatisticalApi.fetchAllStatisticalMonth().then(
      (res) => {
        const data = res.data.data[0];
        setTotalBillMonth(data.totalBill);
        setTotalBillAmoutMonth(formatCurrency(data.totalBillAmount));
        setTotalProductMonth(data.totalProduct);
      },
      (err) => {
        console.log(err);
      }
    );
    StatisticalApi.fetchAllStatisticalDay().then(
      (res) => {
        const data = res.data.data[0];
        setTotalBillDay(data.totalBillToday);
        setTotalBillAmoutDay(formatCurrency(data.totalBillAmountToday));
      },
      (err) => {
        console.log(err);
      }
    );

    StatisticalApi.fetchAllStatisticalBestSellingProduct().then(
      (res) => {
        const data = res.data.data;
        setListSellingProduct(data);
      },
      (err) => {
        console.log(err);
      }
    );
    StatisticalApi.fetchAllStatisticalStatusBill().then(
      (res) => {
        const data = res.data.data;
        setDataPie(data);
      },
      (err) => {
        console.log(err);
      }
    );
    StatisticalApi.fetchBillByDate().then(
      (res) => {
        const data = res.data.data;
        setDataColumn(data);
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  };
  useEffect(() => {
    loadData();
  }, []);

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
      width: "5%",
      sorter: (a, b) => a.stt - b.stt,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={text}
            alt="Ảnh sản phẩm"
            style={{ width: "100px", borderRadius: "10%", height: "100px" }}
          />
        </div>
      ),
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "nameProduct",
      key: "nameProduct",
      sorter: (a, b) => a.nameProduct.localeCompare(b.nameProduct),
    },
    {
      title: "Giá Bán",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (text) => formatCurrency(text),
    },
    {
      title: "Doanh số",
      dataIndex: "sales",
      key: "sales",
      sorter: (a, b) => a.seles - b.seles,
      align: "center",
    },
  ];
  const getRowClassName = (record, index) => {
    return index % 2 === 0 ? "even-row" : "odd-row";
  };
  const statusMapping = {
    TAO_HOA_DON: "Tạo hóa đơn",
    CHO_XAC_NHAN: "Chờ xác nhận",
    CHO_VAN_CHUYEN: "Chờ vận chuyển",
    VAN_CHUYEN: "vận chuyển",
    DA_THANH_TOAN: "Đã thanh toán",
    KHONG_TRA_HANG: "Không trả hàng",
    TRA_HANG: "Trả hàng",
    DA_HUY: "Đã Hủy",
  };

  const chartPieLabels = dataPie.map((item) => statusMapping[item.statusBill]);
  const chartPieData = dataPie.map((item) => item.totalStatusBill);

  const dateMap = {};
  dataColumn.forEach((item) => {
    const date = new Date(Number(item.billDate));
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    if (dateMap[formattedDate]) {
      dateMap[formattedDate] += item.totalBillDate;
    } else {
      dateMap[formattedDate] = item.totalBillDate;
    }
  });

  const chartLabels = Object.keys(dateMap);
  const chartData = Object.values(dateMap);

  const handleStartDateChange = (event) => {
    const startDate = event.target.value;
    const startDateLong = new Date(startDate).getTime();
    console.log(startDate);
    console.log(startDateLong);
    setStartDate(startDateLong);
    loadDataChartColumn(startDateLong, endDate);
  };

  const handleEndDateChange = (event) => {
    const endDate = event.target.value;
    const endDateLong = new Date(endDate).getTime();
    console.log(endDate);
    console.log(endDateLong);
    setEndDate(endDateLong);
    loadDataChartColumn(startDate, endDateLong);
  };

  const loadDataChartColumn = (startDate, endDate) => {
    StatisticalApi.fetchBillByDate(startDate, endDate).then(
      (res) => {
        const data = res.data.data;
        setDataColumn(data);
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  };
  return (
    <div>
      <div
        className="content-wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "25px",
            fontWeight: "bold",
            marginTop: "10px",
            marginBottom: "20px",
          }}
        >
          THỐNG KÊ
        </span>
      </div>
      <div>
        <Row className="row-header">
          <Col span={7} className="col-header">
            <div className="content-header">
              <h2 className="color-text-topic">Doanh số tháng này</h2>
              <h3 className="color-text-content">
                {totalBillMonth} đơn hàng / {totalBillAmoutMonth}
              </h3>
            </div>
          </Col>

          <Col span={7} className="col-header">
            <div className="content-header">
              <h2 className="color-text-topic">Doanh số hôm nay</h2>
              <h3 className="color-text-content">
                {totalBillDay} đơn hàng / {totalBillAmountDay}
              </h3>
            </div>
          </Col>

          <Col span={7} className="col-header">
            <div className="content-header">
              <h2 className="color-text-topic">Hàng bán được tháng này</h2>
              <h3 className="color-text-content">
                {totalProductMonth} sản phẩm
              </h3>
            </div>
          </Col>
        </Row>
        <Row className="row-body">
          <h2>Biểu đồ thống kê</h2>
          <div className="row-body-container">
            <div class="header-date">
              <br />
              <div className="header-date">
                <label htmlFor="startDate" style={{ marginRight: "10px" }}>
                  Ngày bắt đầu:
                </label>
                <Input
                  id="startDate"
                  style={{ width: "27%", height: "45px" }}
                  type="date"
                  onChange={handleStartDateChange}
                />
                <label
                  htmlFor="endDate"
                  style={{ marginLeft: "20px", marginRight: "10px" }}
                >
                  Ngày kết thúc:
                </label>
                <Input
                  id="endDate"
                  style={{ width: "27%", height: "45px" }}
                  type="date"
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
            <div>
              <CChart
                type="bar"
                data={{
                  labels: chartLabels,
                  datasets: [
                    {
                      label: "Hóa đơn",
                      backgroundColor: "#6cb2eb", // Màu xanh dương
                      data: chartData,
                    },
                  ],
                }}
                labels="months"
                options={{
                  plugins: {
                    legend: {
                      labels: {
                        color: "#333", // Màu văn bản
                        font: {
                          size: 15,
                        },
                      },
                    },
                    tooltip: {
                      position: "nearest", // Hiển thị tooltip ở vị trí gần nhất
                      mode: "index", // Hiển thị tooltip dựa trên vị trí chỉ mục của dữ liệu
                      intersect: true, // Chỉ hiển thị một tooltip
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: "#f2f2f2", // Màu dòng lưới x
                      },
                      ticks: {
                        color: "#555", // Màu số trên trục x
                      },
                    },
                    y: {
                      grid: {
                        color: "#f2f2f2", // Màu dòng lưới y
                      },
                      ticks: {
                        color: "#555", // Màu số trên trục y
                      },
                    },
                  },
                  layout: {
                    padding: {
                      left: 50, // Khoảng cách từ biểu đồ đến mép trái
                      right: 20, // Khoảng cách từ biểu đồ đến mép phải
                      top: 100, // Khoảng cách từ biểu đồ đến phía trên
                      bottom: 20, // Khoảng cách từ biểu đồ đến phía dưới
                    },
                  },
                }}
                style={{ width: "1010px", height: "460px" }} // Kích thước của biểu đồ
              />
            </div>
          </div>
        </Row>
        <Row className="row-footer">
          <Col className="row-footer-left">
            <h2 style={{ textAlign: "center", margin: " 2%" }}>
              Top sản phẩm bán chạy
            </h2>
            <Table
              style={{ marginTop: "30px" }}
              dataSource={listSellingProduct}
              rowKey="stt"
              columns={columns}
              pagination={{ pageSize: 3 }}
              scroll={{ y: 400 }}
              rowClassName={getRowClassName}
            />
          </Col>
          <Col className="row-footer-right">
            <h2 style={{ textAlign: "center", margin: " 3%" }}>
              Trạng thái đơn hàng
            </h2>
            <CChart
              type="doughnut"
              data={{
                datasets: [
                  {
                    backgroundColor: [
                      "#41B883",
                      "#00D8FF",
                      "#E46651",
                      "#DD1B16",
                      "#FFCE56",
                      "#4CAF50",
                      "#9C27B0",
                    ],
                    data: chartPieData,
                  },
                ],
                labels: chartPieLabels,
              }}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: "#333",
                      font: {
                        size: 19,
                      },
                    },
                  },
                },
              }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashBoard;
