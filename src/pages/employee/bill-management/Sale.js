import { Button, Col, Row, Table, Tabs } from "antd";
import Search from "antd/es/input/Search";
import React, { useRef, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { BillApi } from "../../../api/employee/bill/bill.api";
import { useAppDispatch } from "../../../app/hook";
import { getAllBillAtCounter } from "../../../app/reducer/Bill.reducer";
import moment from "moment";
import CreateBill from "./CreateBill";
import { toast } from "react-toastify";

function Sale() {
  const [invoiceNumber, setInvoiceNumber] = useState(1);
 
  const defaultPanes = new Array(invoiceNumber).fill(null).map((_, index) => {
    const id = String(index + 1);
    return {
      label: `Hóa đơn  ${id}`,
      children: <CreateBill />,
      key: id,
    };
  });

  const [activeKey, setActiveKey] = useState(defaultPanes[0].key);
  const [items, setItems] = useState(defaultPanes);
  const newTabIndex = useRef(2);


  const onChange = (key) => {
    setActiveKey(key);
  };
  const add = (e) => {
    if(invoiceNumber >= 5){
      toast.warning(`Không thể tạo thêm hóa đơn`);
    }else{
      const newActiveKey = `Hóa đơn ${newTabIndex.current}`;
      setItems([
        ...items,
        {
          label: `Hóa đơn ${newTabIndex.current++}`,
          children: <CreateBill style={{ width: "100%" }} removePane={remove} targetKey={newTabIndex}/>,
          key: newActiveKey,
        },
      ]);
      setActiveKey(newActiveKey);
      setInvoiceNumber(invoiceNumber + 1)
    }
   
  };

  const remove = (targetKey) => {
    if(invoiceNumber > 1){
      const targetIndex = items.findIndex((pane) => pane.key === targetKey);
    const newPanes = items.filter((pane) => pane.key !== targetKey);
    if (newPanes.length && targetKey === activeKey) {
      const { key } =
        newPanes[
          targetIndex === newPanes.length ? targetIndex - 1 : targetIndex
        ];
      setActiveKey(key);
    }
    setItems(newPanes);
    setInvoiceNumber(invoiceNumber - 1)
    }else{

    }
    
  };
  const onEdit = (targetKey, action) => {
    if (action === "add") {
      // add();
    } else {
      remove(targetKey);
    }
  };

  return (
    <div>
      <Row style={{ background: "white", width: "100%" }}>
        <Row style={{ width: "100%", marginTop: "10px" }}>
          <Col span={12}>
          
          </Col>
          <Col span={12} align={"end"}>
            <Button
              type="primary"
              onClick={(e) => add(e)}
              icon={<PlusOutlined />}
              size={"large"}
              style={{marginRight: "20px"}}
            >
              Tạo hóa đơn
            </Button>
          </Col>
        </Row>
        <Row style={{ width: "100%", marginTop: "40px" }}>
          <Tabs
            hideAdd
            onChange={onChange}
            activeKey={activeKey}
            style={{ width: "100%", marginLeft: "10px" }}
            type="editable-card"
            onEdit={onEdit}
            items={items}
          />
        </Row>
      </Row>
    </div>
  );
}

export default Sale;

