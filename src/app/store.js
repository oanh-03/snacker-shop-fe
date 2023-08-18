import { configureStore } from "@reduxjs/toolkit";
import CategoryReducer from "./reducer/Category.reducer";
import SoleReducer from "./reducer/Sole.reducer";
import MaterailReducer from "./reducer/Materail.reducer";
import BillReducer from "./reducer/Bill.reducer";
import AccountReducer from "./reducer/Account.reducer";
import BrandReducer from "./reducer/Brand.reducer";
import SizeReducer from "./reducer/Size.reducer";
import PromotionReducer from "./reducer/Promotion.reducer";
import CustomerReducer from "./reducer/Customer.reducer";
import AddressReducer from "./reducer/Address.reducer";
import ProductDetailReducer from "./reducer/ProductDetail.reducer";
import ColorReducer from "./reducer/Color.reducer";
export const store = configureStore({
  reducer: {
    category: CategoryReducer,
    sole: SoleReducer,
    material: MaterailReducer,
    account: AccountReducer,
    customer: CustomerReducer,
    bill: BillReducer,
    address: AddressReducer,
    brand: BrandReducer,
    size: SizeReducer,
    promotion: PromotionReducer,
    productDetail: ProductDetailReducer,
    color: ColorReducer,
  },
});

export const dispatch = store.dispatch;
export const getState = store.getState;
