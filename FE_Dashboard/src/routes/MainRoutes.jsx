import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));

// Admin Dashboard
const Statistic = Loadable(lazy(() => import('views/pages/admin-dashboard/Statistic')));
const ChainOverview = Loadable(lazy(() => import('views/pages/admin-dashboard/ChainOverview')));
const StoreOverview = Loadable(lazy(() => import('views/pages/admin-dashboard/StoreOverview')));
const SystemWallet = Loadable(lazy(() => import('views/pages/admin-dashboard/SystemWallet')));
const CustomerManagement = Loadable(lazy(() => import('views/pages/admin-dashboard/CustomerManagement')));
const PromotionManagement = Loadable(lazy(() => import('views/pages/admin-dashboard/PromotionManagement')));
const RefundManagement = Loadable(lazy(() => import('views/pages/admin-dashboard/RefundManagement')));

const CategoryManagement = Loadable(lazy(() => import('views/pages/admin-dashboard/CategoryManagement')));
const FlowerBasketCategoryManagement = Loadable(lazy(() => import('views/pages/admin-dashboard/FlowerBasketCategoryManagement')));
const FlowerCategoryManagement= Loadable(lazy(() => import('views/pages/admin-dashboard/FlowerCategoryManagement')));
const StyleCategoryManagement= Loadable(lazy(() => import('views/pages/admin-dashboard/StyleCategoryManagement')));
const AccessoryCategoryManagement= Loadable(lazy(() => import('views/pages/admin-dashboard/AccessoryCategoryManagement')));
const ProductManagement = Loadable(lazy(() => import('views/pages/admin-dashboard/ProductManagement')));
const FlowerManagement =  Loadable(lazy(() => import('views/pages/admin-dashboard/FlowerManagement')));
const FlowerBasketManagement = Loadable(lazy(() => import('views/pages/admin-dashboard/FlowerBasketManagement')));
const StyleManagement= Loadable(lazy(() => import('views/pages/admin-dashboard/StyleManagement')));
const AccessoryManagement =Loadable(lazy(() => import('views/pages/admin-dashboard/AccessoryManagement')));
const AllOrderManagement =Loadable(lazy(() => import('views/pages/admin-dashboard/AllOrderManagement')));

// Store Dashboard
const StaffManagement = Loadable(lazy(() => import('views/pages/store-dashboard/StaffManagement')));
const StoreRevenue = Loadable(lazy(() => import('views/pages/store-dashboard/StoreRevenue')));
const FloristManagement = Loadable(lazy(() => import('views/pages/store-dashboard/FloristManagement')));
const CouriverManagement = Loadable(lazy(() => import('views/pages/store-dashboard/CouriverManagement')));
const OrderManagement = Loadable(lazy(() => import('views/pages/store-dashboard/OrderManagement')));
const CustomManagement =  Loadable(lazy(() => import('views/pages/store-dashboard/CustomManagement')));

// Florist Dashboard
const TaskSchedule = Loadable(lazy(() => import('views/pages/florist-dashboard/TaskSchedule')));
const TaskManagement = Loadable(lazy(() => import('views/pages/florist-dashboard/TaskManagement')));
const DesignConsultant = Loadable(lazy(() => import('views/pages/florist-dashboard/DesignConsultant')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },

    // Admin Dashboard
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'statistic',
          element: <Statistic />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'chain-overview',
          element: <ChainOverview />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'store-overview',
          element: <StoreOverview />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'system-wallet',
          element: <SystemWallet />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'customer-management',
          element: <CustomerManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'promotion-management',
          element: <PromotionManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'refund-management',
          element: <RefundManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'category-management',
          element: <CategoryManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'flowerbasket-category-management',
          element: <FlowerBasketCategoryManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'flower-category-management',
          element: <FlowerCategoryManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'style-category-management',
          element: <StyleCategoryManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'accessory-category-management',
          element: <AccessoryCategoryManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'order-management',
          element: <AllOrderManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'product-management',
          element: <ProductManagement />
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'flower-management',
          element: <FlowerManagement/>
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'style-management',
          element: <StyleManagement/>
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'accessory-management',
          element: <AccessoryManagement/>
        }
      ]
    },
    {
      path: '/adminDashboard',
      children: [
        {
          path: 'flowerbasket-management',
          element: <FlowerBasketManagement/>
        }
      ]
    },

    // Store Dashboard
    {
      path: '/storeDashboard',
      children: [
        {
          path: 'store-revenue',
          element: <StoreRevenue />
        }
      ]
    },
    {
      path: '/storeDashboard',
      children: [
        {
          path: 'staff-management',
          element: <StaffManagement />
        }
      ]
    },
    {
      path: '/storeDashboard',
      children: [
        {
          path: 'florist-management',
          element: <FloristManagement />
        }
      ]
    },
    {
      path: '/storeDashboard',
      children: [
        {
          path: 'couriver-management',
          element: <CouriverManagement />
        }
      ]
    },
    {
      path: '/storeDashboard',
      children: [
        {
          path: 'order-management',
          element: <OrderManagement />
        }
      ]
    },
    {
      path: '/storeDashboard',
      children: [
        {
          path: 'custom-management',
          element: <CustomManagement />
        }
      ]
    },

    // Florist Dashboard
    {
      path: '/floristDashboard',
      children: [
        {
          path: 'task-schedule',
          element: <TaskSchedule />
        }
      ]
    },
    {
      path: '/floristDashboard',
      children: [
        {
          path: 'task-management',
          element: <TaskManagement />
        }
      ]
    },
    {
      path: '/floristDashboard',
      children: [
        {
          path: 'design-consultant',
          element: <DesignConsultant />
        }
      ]
    },
  ]
};

export default MainRoutes;
