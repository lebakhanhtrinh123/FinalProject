// material-ui
import { Typography } from '@mui/material';

// project imports
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { useEffect, useState } from 'react';
import adminDashboard from 'menu-items/adminDashboard';
import storeDashboard from 'menu-items/storeDashboard';
import floristDashboard from 'menu-items/floristDashboard';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const [menuItem, setMenuItem] = useState(adminDashboard)
  useEffect(() => {
    const roleName = localStorage.getItem('roleName');
    setMenuItem({
      items: roleName === 'Admin'
        ? [adminDashboard]
        // : roleName === 'General Manager' 
        // ? [generalDashboard]
        // : roleName === 'Staff' 
        // ? [staffDashboard] 
        : roleName === 'StoreManager'
          ? [storeDashboard]
          : [floristDashboard]
    })
  }, [])
  const navItems = menuItem?.items?.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <>{navItems}</>;
};

export default MenuList;
