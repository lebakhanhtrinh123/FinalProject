import dashboard from './dashboard';
import pages from './pages';
import utilities from './utilities';
import other from './other';
import managements from './management';
import adminDashboard from './adminDashboard';
import storeDashboard from './storeDashboard';
import floristDashboard from './floristDashboard';

// ==============================|| MENU ITEMS ||============================== //

const roleName = localStorage.getItem('roleName');

const menuItems = {
  items: roleName === 'Admin' 
    ? [adminDashboard] 
    // : roleName === 'General Manager' 
    // ? [generalDashboard]
    // : roleName === 'Staff' 
    // ? [staffDashboard] 
    : roleName === 'StoreManager' 
    ? [storeDashboard]
    : [floristDashboard] 
};

// const menuItems = {
//   items: [adminDashboard, storeDashboard, floristDashboard]
// };

export default menuItems;
