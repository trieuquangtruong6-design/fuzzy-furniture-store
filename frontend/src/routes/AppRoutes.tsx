import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminRoute from '../components/auth/AdminRoute'
import LandingPage from '../pages/LandingPage'

const AdminOrdersPage = lazy(() => import('../pages/AdminOrdersPage'))
const AdminProductsPage = lazy(() => import('../pages/AdminProductsPage'))
const AdminCenterPage = lazy(() => import('../pages/AdminCenterPage'))
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage'))
const CartPage = lazy(() => import('../pages/CartPage'))
const CategoriesPage = lazy(() => import('../pages/CategoriesPage'))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'))
const CouponPage = lazy(() => import('../pages/CouponPage'))
const DynamicProductPage = lazy(() => import('../pages/DynamicProductPage'))
const EmptyCartPage = lazy(() => import('../pages/EmptyCartPage'))
const EmptyNotificationPage = lazy(() => import('../pages/EmptyNotificationPage'))
const EmptyOrderHistoryPage = lazy(() => import('../pages/EmptyOrderHistoryPage'))
const EmptySearchPage = lazy(() => import('../pages/EmptySearchPage'))
const EmptyWishlistPage = lazy(() => import('../pages/EmptyWishlistPage'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))
const HelpPage = lazy(() => import('../pages/HelpPage'))
const HomePage = lazy(() => import('../pages/HomePage'))
const LanguagePage = lazy(() => import('../pages/LanguagePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const ManageAddressPage = lazy(() => import('../pages/ManageAddressPage'))
const ManageDeliveryAddressPage = lazy(() => import('../pages/ManageDeliveryAddressPage'))
const ManagePaymentPage = lazy(() => import('../pages/ManagePaymentPage'))
const NePage = lazy(() => import('../pages/NePage'))
const NewAddressPage = lazy(() => import('../pages/NewAddressPage'))
const NewCardPage = lazy(() => import('../pages/NewCardPage'))
const NotificationPage = lazy(() => import('../pages/NotificationPage'))
const OrderDetailsPage = lazy(() => import('../pages/OrderDetailsPage'))
const OrdersPage = lazy(() => import('../pages/OrdersPage'))
const OrderTrackingPage = lazy(() => import('../pages/OrderTrackingPage'))
const OtherSettingPage = lazy(() => import('../pages/OtherSettingPage'))
const OtpPage = lazy(() => import('../pages/OtpPage'))
const PageListingPage = lazy(() => import('../pages/PageListingPage'))
const PaymentPage = lazy(() => import('../pages/PaymentPage'))
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'))
const Product2DetailsPage = lazy(() => import('../pages/Product2DetailsPage'))
const ProfileSettingPage = lazy(() => import('../pages/ProfileSettingPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'))
const SearchPage = lazy(() => import('../pages/SearchPage'))
const SettingPage = lazy(() => import('../pages/SettingPage'))
const ShippingAddressPage = lazy(() => import('../pages/ShippingAddressPage'))
const ShippingPage = lazy(() => import('../pages/ShippingPage'))
const ShopPage = lazy(() => import('../pages/ShopPage'))
const TermsConditionsPage = lazy(() => import('../pages/TermsConditionsPage'))
const VoucherPage = lazy(() => import('../pages/VoucherPage'))
const WishlistPage = lazy(() => import('../pages/WishlistPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="route-loading" role="status">Loading...</div>}>
    <Routes>
      <Route path="/admin" element={<AdminRoute><AdminCenterPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/coupon" element={<CouponPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/empty-cart" element={<EmptyCartPage />} />
      <Route path="/empty-notification" element={<EmptyNotificationPage />} />
      <Route path="/empty-order-history" element={<EmptyOrderHistoryPage />} />
      <Route path="/empty-search" element={<EmptySearchPage />} />
      <Route path="/empty-wishlist" element={<EmptyWishlistPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/language" element={<LanguagePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/manage-address" element={<ProtectedRoute><ManageAddressPage /></ProtectedRoute>} />
      <Route path="/manage-delivery-address" element={<ManageDeliveryAddressPage />} />
      <Route path="/manage-payment" element={<ManagePaymentPage />} />
      <Route path="/ne" element={<NePage />} />
      <Route path="/new-address" element={<ProtectedRoute><NewAddressPage /></ProtectedRoute>} />
      <Route path="/new-card" element={<NewCardPage />} />
      <Route path="/notification" element={<NotificationPage />} />
      <Route path="/order-details" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:orderCode" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
      <Route path="/order-tracking" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
      <Route path="/other-setting" element={<OtherSettingPage />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/page-listing" element={<PageListingPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/product/1" element={<ProductDetailPage />} />
      <Route path="/product/2" element={<Product2DetailsPage />} />
      <Route path="/product/:slug" element={<DynamicProductPage />} />
      <Route path="/profile-setting" element={<ProtectedRoute><ProfileSettingPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/setting" element={<SettingPage />} />
      <Route path="/shipping-address" element={<ProtectedRoute><ShippingAddressPage /></ProtectedRoute>} />
      <Route path="/shipping" element={<ShippingPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/terms-conditions" element={<TermsConditionsPage />} />
      <Route path="/voucher" element={<VoucherPage />} />
      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="*" element={<HomePage />} />
    </Routes>
    </Suspense>
  )
}
