import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./style-card.css";
import { Card, Modal, Row, Col, Button, InputNumber } from "antd";
import { toast } from "react-toastify";
import { ProductDetailClientApi } from "./../../../api/customer/productdetail/productDetailClient.api";
function CardItem({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const [modal, setModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState({
    codeColor: "",
    idProduct: "",
    image: "",
    listIdColor: "",
    listCodeColor: "",
    listNameSize: "",
    nameProduct: "",
    price: 0,
    quantity: 0,
  });
  const [formAdd, setFormAdd] = useState({
    // idProduct:"",
    // codeColor:"",
    // nameSize:""
  });
  const [clickedIndex, setClickedIndex] = useState(-1);

  const handleSizeClick = (index, nameSize) => {
    setFormAdd((prevFormAdd) => ({
      ...prevFormAdd,
      nameSize: nameSize,
    }));
    setClickedIndex(index);
  };
  useEffect(() => {
    console.log(detailProduct);
  }, [detailProduct]);
  useEffect(() => {
    console.log(formAdd);
  }, [formAdd]);
  const getDetailProduct = (idProduct, idColor) => {
    ProductDetailClientApi.getDetailProductOfClient(idProduct, idColor).then(
      (res) => {
        setDetailProduct( res.data.data);
      },
      (err) => {
        console.log(err);
      }
    );
    setModal(true);
  };
  const addToCard = () => {
    if (!formAdd.nameSize) {
      toast.success("Chưa chọn size ạ?", {
        autoClose: 3000,
      });
    } else {
      toast.success("Love you so much!", {
        autoClose: 3000,
      });
    }
  };
  const handleClickDetail = (idProduct, codeColor) => {
    setClickedIndex(-1);
    setFormAdd({});
    setFormAdd((prevFormAdd) => ({
      ...prevFormAdd,
      idProduct: idProduct,
      codeColor: codeColor,
    }));
    getDetailProduct(idProduct, codeColor);
  };
  const closeModal = () => {
    setModal(false);
    setClickedIndex(-1);
  };
  const formatMoney = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
  };
  const handleButtonMouseEnter = () => {
    setHovered(true);
  };

  const handleButtonMouseLeave = () => {
    setHovered(false);
  };
  return (
    <>
      <div>
        <Card
          to="/detail"
          className="card-item"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Link className="link-card-item" to="/detail">
            {item.valuePromotion !== null && (
              <p className="value-promotion">
                Giảm {parseInt(item.valuePromotion)}%
              </p>
            )}
            <img className="image-product" src={item.image} alt="..." />
            <p className="name-product">{item.nameProduct}</p>
            <p className="price-product">{formatMoney(item.price)}</p>
          </Link>
        </Card>

        <p
          className={`button-buy-now ${hovered ? "visible" : "hidden"}`}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          onClick={() => {
            handleClickDetail(item.idProduct, item.codeColor);
          }}
        >
          Mua ngay
        </p>
      </div>

      <Modal
        className="modal-detail-product"
        width={900}
        onCancel={closeModal}
        open={modal}
        closeIcon={null}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <div className="modal-detail-product">
          <Row justify="center">
            <Col lg={{ span: 11, offset: 0 }} style={{ height: 500 }}>
              <img
                className="img-detail-product"
                src={detailProduct.image}
                alt="..."
              />
            </Col>
            <Col lg={{ span: 12, offset: 1 }} style={{ height: 500 }}>
              <h1>{detailProduct.nameProduct}</h1>
              <div className="price-product">
                {" "}
                Giá: {formatMoney(detailProduct.price)}
              </div>
              <div>
                <div>
                  ------------------------------------------------------------------------
                </div>
                <div>Màu:</div>
                <div className="list-color-detail">
                  {detailProduct.listCodeColor
                    .split(",")
                    .sort((a, b) => {
                      if (a === detailProduct.codeColor) {
                        return -1;
                      } else if (b === detailProduct.codeColor) {
                        return 1;
                      } else {
                        return 0;
                      }
                    })
                    .map((codeColor, index) => (
                      <p
                        className="color-product"
                        key={index}
                        style={{
                          backgroundColor: codeColor.replace("%23", "#"),
                        }}
                        onClick={() => {
                          handleClickDetail(detailProduct.idProduct, codeColor);
                        }}
                      ></p>
                    ))}
                </div>
              </div>

              <div>
                ------------------------------------------------------------------------
              </div>
              <div>
                <div>Size:</div>
                <div className="list-size-product" tabIndex="0">
                  {detailProduct.listNameSize
                    .split(",")
                    .sort()
                    .map((item, index) => (
                      <div
                        className={`size-product ${
                          clickedIndex === index ? "clicked" : ""
                        }`}
                        key={index}
                        tabIndex="0"
                        onClick={() => handleSizeClick(index, item)}
                      >
                        {item}
                      </div>
                    ))}
                </div>
              </div>
              <div className="add-to-card">
                <InputNumber
                  className="input-quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                ></InputNumber>
                <div className="button-add-to-card" onClick={addToCard}>
                  Thêm vào Giỏ hàng
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
}

export default CardItem;
