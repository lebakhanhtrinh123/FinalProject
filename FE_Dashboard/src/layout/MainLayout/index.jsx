import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import { CssBaseline, styled, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Customization from '../Customization';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { SET_MENU } from 'store/actions';
import { drawerWidth } from 'store/constant';

// assets
import { IconChevronRight } from '@tabler/icons-react';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'theme' })(({ theme, open }) => ({
  ...theme.typography.mainContent,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  background: 'linear-gradient(135deg, #FFE6EE 0%, #FFD1DC 100%)',
  minHeight: '100vh',
  transition: theme.transitions.create(
    'margin',
    open
      ? {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        }
      : {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        }
  ),
  [theme.breakpoints.up('md')]: {
    marginLeft: open ? 0 : -(drawerWidth - 20),
    width: `calc(100% - ${drawerWidth}px)`
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: '20px',
    width: `calc(100% - ${drawerWidth}px)`,
    padding: '16px'
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: '10px',
    width: `calc(100% - ${drawerWidth}px)`,
    padding: '16px',
    marginRight: '10px'
  }
}));

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  return (
    <Box sx={{ 
      display: 'flex',
      background: 'linear-gradient(135deg, #FFE6EE 0%, #FFD1DC 100%)',
      minHeight: '100vh'
    }}>
      <CssBaseline />
      {/* header */}
      <AppBar
        enableColorOnDark
        position="fixed"
        elevation={0}
        sx={{
          background: 'linear-gradient(45deg, #FF69B4 30%, #FFB6C1 90%)',
          boxShadow: '0 3px 5px 2px rgba(255, 105, 180, .3)',
          transition: leftDrawerOpened ? theme.transitions.create('width') : 'none'
        }}
      >
        <Toolbar>
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* drawer */}
      <Sidebar drawerOpen={!matchDownMd ? leftDrawerOpened : !leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

      {/* main content */}
      <Main theme={theme} open={leftDrawerOpened}>
        {/* breadcrumb */}
        <Breadcrumbs 
          separator={IconChevronRight} 
          navigation={navigation} 
          icon 
          title 
          rightAlign 
          sx={{
            '& .MuiBreadcrumbs-ol': {
              '& .MuiBreadcrumbs-li': {
                '& a': {
                  color: '#FF1493',
                  '&:hover': {
                    color: '#FF69B4'
                  }
                },
                '& .MuiTypography-root': {
                  color: '#FF1493'
                }
              }
            },
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            padding: '8px 16px',
            marginBottom: '16px'
          }}
        />
        <Box sx={{
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(255, 105, 180, 0.1)'
        }}>
          <Outlet />
        </Box>
      </Main>
      {/* <Customization /> */}
    </Box>
  );
};

export default MainLayout;
