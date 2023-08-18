import { useSelector } from "react-redux";
import Navbar from "../../../components/navbar/Navbar";
import SidebarProject from "../../../components/sidebar/SidebarProject";
import TableAddress from "./TableAddress";

const Address = () => {
  const addresses = useSelector((state) => state.address.address.value);

  return (
    <div>
      <div className="home">
        <SidebarProject />
        <div className="homeContainer">
          <Navbar />
          <div className="container" style={{ marginTop: "20px" }}>
            <div className="row"></div>
            <div className="row">
              {/* hiển thị table */}
              <TableAddress rows={addresses} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Address;
