// assets
import { IconDeviceDesktopCog } from '@tabler/icons-react';

// constant
const icons = {
    IconDeviceDesktopCog
};

// ==============================|| EXTRA MANAGEMENT MENU ITEMS ||============================== //

const managements = {
  id: 'managements',
  title: 'managements',
  // caption: 'Managements Caption',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Management',
      type: 'collapse',
      icon: icons.IconDeviceDesktopCog,

      children: [
        {
          id: 'staff',
          title: 'Staff Management',
          type: 'item',
          url: '/managements/staff-management',
          target: false
        },
        {
          id: 'customer',
          title: 'Customer Management',
          type: 'item',
          url: '/managements/customer-management',
          target: false
        },
        {
            id: 'product',
            title: 'Product Management',
            type: 'item',
            url: '/managements/product-management',
            target: false
          }
      ]
    }
  ]
};

export default managements;
