import { useState } from "react";
import "./style-menu.css";
import logo from "./../../../assets/images/logo_client.png";
import { Link } from "react-router-dom";
import { Select, Input, Button, Menu,Badge } from "antd";
import { SearchOutlined, LoginOutlined ,ShoppingCartOutlined} from "@ant-design/icons";

const { Option } = Select;
function HeaderMenu() {
  const [isOptionVisible, setOptionVisible] = useState(false);
  const [modal, setModal] = useState(false);
  const [activeField, setActiveField] = useState("");

  const fields = [
    {
      className: "title-menu",
      title: "TRANG CHỦ",
    },
    {
      className: "title-menu",
      title: "SẢN PHẨM",
      option: [
        { title: "Giày nam", className: "title-option" },
        { title: "Giày nữ", className: "title-option" },
      ],
    },
    {
      className: "title-menu",
      title: "VỀ CHÚNG TÔI",
      option: [
        { title: "Blog styte", className: "title-option" },
        { title: "Liên hệ", className: "title-option" },
      ],
    },
    // {
    //   className: "title-menu",
    //   title: "SALE OFF",
    // },
  ];

  const handleMenuHover = (title) => {
    setOptionVisible(true);
    setActiveField(title);
  };

  const handleMenuLeave = () => {
    setOptionVisible(false);
    setActiveField("");
  };
  const onSearch = () => {
    if (window.scrollY === 0) {
      setModal(true);
      console.log(modal);
    } else {
      setModal(true);
      //  window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn trang lên đầu
      console.log(modal);
    }
  };

  const offSearch = () => {
    setModal(false);
  };

  return (
    <div>
      <div className="menu">
        <div className="logo-menu">
          <Link to="/home">
            {" "}
            <img className="logo-img" src={logo} alt="..." />
          </Link>
        </div>
        <div className="space-menu">
          {fields.map((field, index) => {
            return (
              <div
                key={index}
                className={field.className}
                onMouseEnter={() => handleMenuHover(field.title)}
                onMouseLeave={handleMenuLeave}
              >
                {field.option ? (
                  field.title
                ) : (
                  <Link className="link-menu" to={"/a"}>
                    {field.title}
                  </Link>
                )}
                {field.option &&
                  isOptionVisible &&
                  activeField === field.title && (
                    <Menu className="option-container">
                      {field.option.map((option, optionIndex) => (
                        <Link to="/diem">
                          <div key={optionIndex} className={option.className}>
                            {option.title}
                          </div>
                        </Link>
                      ))}
                    </Menu>
                  )}
              </div>
            );
          })}
        </div>
       <div className="left-menu">
       <div className="search-menu">
          <SearchOutlined style={{ fontSize: '20px' }} onClick={() => onSearch() } />  
        </div>
       |
    
       <div > 
       <Link >
       <Badge size="small" count={5}  style={{ backgroundColor:"#ff4400", fontSize: '10px' }}>
       <ShoppingCartOutlined className="cart-menu" style={{ fontSize: '20px' }}/>
    </Badge>
      
        </Link>
        </div>
      
       </div>
      </div>

      <div>
     
          <div className={`search-panel ${modal ? "visible" : "hidden"}`}>
            <div className="header-search">
              <div className="text-search">Tìm kiếm sản phẩm</div>

              <div className="exit-search">
                <LoginOutlined  style={{ color:"#ff4400" }} onClick={offSearch} />
              </div>
            </div>

            {/* content */}
            <div>
              <Input
                className="input-search-products"
                placeholder="Sản phẩm..."
              />

              <Select className=" custom-select" style={{ width: "100%" }}>
                <Option>aa</Option>
              </Select>

              <Button className=" button-search">Tìm kiếm</Button>
            </div>
          </div>
        
      </div>
    </div>
  );
}

export default HeaderMenu;
