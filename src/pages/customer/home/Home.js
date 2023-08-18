import { useState, useEffect, useRef } from "react";
import { Select, Space, Input, Button, Row, Col, Card, Menu } from "antd";
import {
  RiseOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import banner1 from "./../../../assets/images/third_slider_img01.png";
import banner2 from "./../../../assets/images/shoes_cat_img01.jpg";
import banner3 from "./../../../assets/images/shoes_cat_img03.jpg";
import banner4 from "./../../../assets/images/shoes_cat_img02.jpg";
import category1 from "./../../../assets/images/trending_banner.jpg";
import category2 from "./../../../assets/images/trending_banner02.jpg";
import category3 from "./../../../assets/images/trending_banner03.jpg";
import "./style-home.css";
import { CategoryClientApi } from "./../../../api/customer/category/categoryClient.api";
import { ProductDetailClientApi } from "./../../../api/customer/productdetail/productDetailClient.api";
import CardItem from "../component/Card";
import { Grid } from "react-virtualized";
function Home() {
  const [listCategory, setListcategory] = useState([]);
  const [listProductDetailByCategory, setListProductDetailByCategory] =useState([]);


  const firstCategoryId = listCategory.length > 0 ? listCategory[0].id : null;
  useEffect(() => {
    if (firstCategoryId !== null) {
      getProductDetailByCategory(firstCategoryId);
    }
  }, [firstCategoryId]);

    const cellRenderer = ({ columnIndex, key, style }) => (
      <div key={key} style={style}>
        {listProductDetailByCategory[columnIndex] && (
          <CardItem item={listProductDetailByCategory[columnIndex]} index={columnIndex} key={columnIndex} />
        )}
      </div>
    );
  useEffect(() => {
    getCategory();
    console.log(listCategory);
  }, []);
  useEffect(() => {
    console.log(listCategory);
  }, [listCategory]);
  useEffect(() => {
    console.log(listProductDetailByCategory);
  }, [listProductDetailByCategory]);

  const getCategory = () => {
    CategoryClientApi.getAll().then(
      (res) => {
        setListcategory(res.data.data);
      },
      (err) => {
        console.log(err);
      }
    );
  };
  const getProductDetailByCategory = (id) => {
    ProductDetailClientApi.getByIdCategory(id).then(
      (res) => {
        setListProductDetailByCategory(res.data.data);
      },
      (err) => {
        console.log(err);
      }
    );
  };
  return (
    <div className="home">
      <div className="banner">
        <img className="banner1" src={banner1} alt="..." />
      </div>
      <div>
        <Row justify="center">
          <Col className="col-choose" lg={{ span: 7, offset: 0 }}>
            <div className="type-gender">
              <Link className="hover-wrapper">
                <img className="choose-gender" src={banner3} alt="..." />
                <Button type="" className="button-choose-gender">
                  Giày Nữ <RiseOutlined />
                </Button>
              </Link>
            </div>
          </Col>
          <Col className="col-choose" lg={{ span: 6, offset: 0 }}>
            <div className="type-gender">
              <Link className="hover-wrapper">
                <img className="choose-gender" src={banner4} alt="..." />
              </Link>

              <div className="text-product-center">
                <div className="text-product">Sản phẩm</div>
                <div className="horizontal-line"></div>
                <div className="quantity-product-home">19</div>
              </div>
            </div>
          </Col>
          <Col lg={{ span: 7, offset: 0 }}>
            <div className="type-gender">
              <Link className="hover-wrapper">
                <img className="choose-gender" src={banner2} alt="..." />
                <Button type="" className="button-choose-gender">
                  Giày Nam <RiseOutlined />
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </div>

      <div className="search-category">
        <div className="title-product-category">
          <p> SẢN PHẨM </p>
        </div>
        <Row>
          <Col lg={{ span: 23 }} className="content-search-category">
            <div className="title-category-home">
              <div className="text-category">Loại giày</div>

              <Menu defaultSelectedKeys={['0']}>
                {listCategory.map((item, index) => (
                  <Menu.Item
                    className="item-category"
                    key={index}
                    onClick={() => {
                      getProductDetailByCategory(item.id);
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    {item.name}
                  </Menu.Item>
                ))}
              </Menu>
            </div>
            <div
              style={{
                width: "362px",
                height: "100%",
              }}
            >
              <Link>
                <img src={category3} alt="..."></img>
              </Link>
            </div>

            <div className="list-product-of-category">
             <Grid
        width={1200} // Độ rộng của danh sách
        height={470} // Chiều cao của danh sách
        columnCount={listProductDetailByCategory.length} // Số lượng cột trong danh sách
        columnWidth={380} // Chiều rộng của mỗi cột (bao gồm cả khoảng trống giữa cột)
        rowCount={1} // Số lượng hàng trong danh sách (chỉ có 1 hàng ngang)
        rowHeight={470} // Chiều cao của hàng ngang
        cellRenderer={cellRenderer}
        marginRight={50}
      />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Home;
