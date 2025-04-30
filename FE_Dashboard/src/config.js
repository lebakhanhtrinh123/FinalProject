// const config = {
//   // basename: only at build time to set, and Don't add '/' at end off BASENAME for breadcrumbs, also Don't put only '/' use blank('') instead,
//   // like '/berry-material-react/react/default'
//   // basename: '/free',
//   defaultPath: '/dashboard/default',
//   fontFamily: `'Roboto', sans-serif`,
//   borderRadius: 12
// };

// export default config;

const getDefaultPathByRole = () => {
  const roleName = localStorage.getItem('roleName');
  
  switch (roleName) {
    case 'Admin':
      return '/adminDashboard/store-overview';
    case 'StoreManager':
      return '/storeDashboard/store-revenue';
    case 'Florist':
      return '/floristDashboard/task-management';
    default:
      return '/dashboard';
  }
};

const config = {
  defaultPath: getDefaultPathByRole(),
  fontFamily: `'Roboto', sans-serif`,
  borderRadius: 12
};

export default config;