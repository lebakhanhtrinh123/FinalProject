import { IconDashboard, IconUserCog, IconUsersGroup, IconTruckDelivery, IconBasketCog, IconHistory } from '@tabler/icons-react';

const icons = {
  IconDashboard,
  IconUserCog,
  IconUsersGroup,
  IconTruckDelivery,
  IconBasketCog,
  IconHistory
};

const storeDashboard = {
  id: 'storeDashboard',
  title: 'Store Dashboard',
  caption: 'Management Dashboard for Store Manager',
  type: 'group',
  children: [
    {
      id: 'store revenue',
      title: 'Store Revenue',
      type: 'item',
      url: '/storeDashboard/store-revenue',
      icon: IconDashboard,
      breadcrumbs: true
    },
    {
      id: 'florist',
      title: 'Florist Management',
      type: 'item',
      url: '/storeDashboard/florist-management',
      icon: IconUserCog,
      breadcrumbs: true
    },
    {
      id: 'couriver',
      title: 'Couriver Management',
      type: 'item',
      url: '/storeDashboard/couriver-management',
      icon: IconTruckDelivery,
      breadcrumbs: true
    },
    {
      id: 'order',
      title: 'Order Management',
      type: 'item',
      url: '/storeDashboard/order-management',
      icon: IconBasketCog,
      breadcrumbs: true
    },
    {
      id: 'custom',
      title: 'Custom Management',
      type: 'item',
      url: '/storeDashboard/custom-management',
      icon: IconHistory,
      breadcrumbs: true
    },
  ]
};

export default storeDashboard;
