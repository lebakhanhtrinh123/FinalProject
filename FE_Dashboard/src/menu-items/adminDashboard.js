import { IconWallet, IconBasketCog,IconGraph, IconChartBar, IconDashboard, IconUsersGroup, IconFlower, IconGiftCard, IconCategory, IconGift, IconBasket, IconDiamond, IconSettings, IconCreditCardRefund } from '@tabler/icons-react';

const adminDashboard = {
  id: 'adminDashboard',
  title: 'Admin Dashboard',
  caption: 'Management Dashboard for Admin',
  type: 'group',
  children: [
    {
      id: 'stat',
      title: 'Statistic',
      type: 'item',
      url: '/adminDashboard/statistic',
      icon: IconGraph,
      breadcrumbs: true
    },
    {
      id: 'chain',
      title: 'Chain Overview',
      type: 'item',
      url: '/adminDashboard/chain-overview',
      icon: IconChartBar,
      breadcrumbs: true
    },
    {
      id: 'store',
      title: 'Store Overview',
      type: 'item',
      url: '/adminDashboard/store-overview',
      icon: IconDashboard,
      breadcrumbs: true
    },
    {
      id: 'wallet',
      title: 'System Wallet',
      type: 'item',
      url: '/adminDashboard/system-wallet',
      icon: IconWallet,
      breadcrumbs: true
    },
    {
      id: 'customer',
      title: 'Customer Management',
      type: 'item',
      url: '/adminDashboard/customer-management',
      icon: IconUsersGroup,
      breadcrumbs: true
    },
    {
      id: 'order',
      title: 'Order Management',
      type: 'item',
      url: '/adminDashboard/order-management',
      icon: IconBasketCog,
      breadcrumbs: true
    },
    {
      id: 'category',
      title: 'Category Management',
      type: 'collapse',
      icon: IconCategory,
      children: [
        {
          id: 'category',
          title: 'Product',
          type: 'item',
          url: '/adminDashboard/category-management',
          icon: IconGift,
          breadcrumbs: true
        },
        {
          id: 'productcategory',
          title: 'FlowerBasket',
          type: 'item',
          url: '/adminDashboard/flowerbasket-category-management',
          icon: IconBasket,
          breadcrumbs: true
        },
        {
          id: 'flowercategory',
          title: 'Flower',
          type: 'item',
          url: '/adminDashboard/flower-category-management',
          icon: IconFlower,
          breadcrumbs: true
        },
        {
          id: 'stylecategory',
          title: 'Style',
          type: 'item',
          url: '/adminDashboard/style-category-management',
          icon: IconGiftCard,
          breadcrumbs: true
        },
        {
          id: 'accessorycategory',
          title: 'Accessory',
          type: 'item',
          url: '/adminDashboard/accessory-category-management',
          icon: IconDiamond,
          breadcrumbs: true
        }
      ]
    },
    {
      id: 'product',
      title: 'Product Management',
      type: 'item',
      url: '/adminDashboard/product-management',
      icon: IconGift,
      breadcrumbs: true
    },
    {
      id: 'promotion',
      title: 'Promotion Management',
      type: 'item',
      url: '/adminDashboard/promotion-management',
      icon: IconGiftCard,
      breadcrumbs: true
    },
    {
      id: 'refund',
      title: 'WithdrawMoney Management',
      type: 'item',
      url: '/adminDashboard/refund-management',
      icon: IconCreditCardRefund,
      breadcrumbs: true
    },
    {
      id: 'custom',
      title: 'Custom Management',
      type: 'collapse',
      icon: IconSettings,
      children: [
        {
          id: 'flowerBasket',
          title: 'FlowerBasket',
          type: 'item',
          url: '/adminDashboard/flowerbasket-management',
          icon: IconBasket,
          breadcrumbs: true
        },
        {
          id: 'flower',
          title: 'Flower',
          type: 'item',
          url: '/adminDashboard/flower-management',
          icon: IconFlower,
          breadcrumbs: true
        },
        {
          id: 'style',
          title: 'Style',
          type: 'item',
          url: '/adminDashboard/style-management',
          icon: IconGiftCard,
          breadcrumbs: true
        },
        {
          id: 'accessory',
          title: 'Accessory',
          type: 'item',
          url: '/adminDashboard/accessory-management',
          icon: IconDiamond,
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default adminDashboard;
