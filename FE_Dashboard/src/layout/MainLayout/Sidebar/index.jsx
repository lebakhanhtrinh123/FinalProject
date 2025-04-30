import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import MenuCard from './MenuCard';
import MenuList from './MenuList';
import LogoSection from '../LogoSection';
import Chip from 'ui-component/extended/Chip';

import { drawerWidth } from 'store/constant';

// ==============================|| SIDEBAR DRAWER ||============================== //

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

  const drawer = (
    <>
      <Box sx={{ 
        display: { xs: 'block', md: 'none' },
        background: 'linear-gradient(45deg, #FF69B4 30%, #FFB6C1 90%)',
      }}>
        <Box sx={{ display: 'flex', p: 2, mx: 'auto' }}>
          <LogoSection />
        </Box>
      </Box>
      <BrowserView>
        <PerfectScrollbar
          component="div"
          style={{
            height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
            paddingLeft: '16px',
            paddingRight: '16px',
            background: 'linear-gradient(180deg, #FFF0F5 0%, #FFFFFF 100%)', // Light pink gradient background
          }}
        >
          <MenuList />
          <MenuCard />
          <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
            <Chip 
              label={import.meta.env.VITE_APP_VERSION} 
              disabled 
              chipcolor="secondary" 
              size="small" 
              sx={{ 
                cursor: 'pointer',
                background: '#FF69B4',
                color: '#fff' 
              }} 
            />
          </Stack>
        </PerfectScrollbar>
      </BrowserView>
      <MobileView>
        <Box sx={{ 
          px: 2,
          background: 'linear-gradient(180deg, #FFF0F5 0%, #FFFFFF 100%)', // Light pink gradient background
        }}>
          <MenuList />
          <MenuCard />
          <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
            <Chip 
              label={import.meta.env.VITE_APP_VERSION} 
              disabled 
              chipcolor="secondary" 
              size="small" 
              sx={{ 
                cursor: 'pointer',
                background: '#FF69B4',
                color: '#fff'
              }} 
            />
          </Stack>
        </Box>
      </MobileView>
    </>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? drawerWidth : 'auto' }} aria-label="mailbox folders">
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={drawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: 'linear-gradient(180deg, #FFF0F5 0%, #FFFFFF 100%)', // Light pink gradient background
            color: theme.palette.text.primary,
            borderRight: 'none',
            boxShadow: '4px 0 8px rgba(255, 105, 180, 0.1)', // Soft pink shadow
            [theme.breakpoints.up('md')]: {
              top: '88px'
            },
            '& .MuiListItem-root': {
              transition: 'all .2s ease-in-out',
              borderRadius: '8px',
              margin: '4px 0',
              '&:hover': {
                background: 'rgba(255, 105, 180, 0.1)', // Light pink hover
                color: '#FF69B4',
              },
              '&.Mui-selected, &.Mui-selected:hover': {
                background: 'rgba(255, 105, 180, 0.2)', // Darker pink for selected
                color: '#FF69B4',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '60%',
                  width: '4px',
                  background: '#FF69B4',
                  borderRadius: '0 4px 4px 0'
                }
              }
            },
            '& .MuiListItemButton-root': {
              transition: 'all .2s ease-in-out',
              borderRadius: '8px',
              '&:hover': {
                background: 'rgba(255, 105, 180, 0.1)', // Light pink hover
                color: '#FF69B4',
              },
              '&.Mui-selected, &.Mui-selected:hover': {
                background: 'rgba(255, 105, 180, 0.2)', // Darker pink for selected
                color: '#FF69B4',
              }
            },
            '& .MuiListItemIcon-root': {
              color: 'inherit'
            },
            '& .MuiListItemText-primary': {
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }
        }}
        ModalProps={{ keepMounted: true }}
        color="inherit"
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
