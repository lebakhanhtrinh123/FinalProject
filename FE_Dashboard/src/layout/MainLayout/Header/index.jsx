import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { AppBar, Toolbar } from '@mui/material';

// project imports
import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';

// assets
import { IconMenu2 } from '@tabler/icons-react';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(45deg,rgb(255, 231, 231) 30%,rgb(255, 178, 191) 90%)',
        boxShadow: '0 3px 5px 2px rgba(255, 192, 203, 0.3)',
      }}
    >
      <Toolbar>
        {/* logo & toggler button */}
        <Box
          sx={{
            width: 228,
            display: 'flex',
            [theme.breakpoints.down('md')]: {
              width: 'auto'
            }
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
            <LogoSection />
          </Box>
          <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                transition: 'all .2s ease-in-out',
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: '#FFF'
                }
              }}
              onClick={handleLeftDrawerToggle}
              color="inherit"
            >
              <IconMenu2 stroke={1.5} size="1.3rem" />
            </Avatar>
          </ButtonBase>
        </Box>

        {/* header search */}
        {/* <SearchSection /> */}
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ flexGrow: 1 }} />

        {/* notification & profile */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          '& .MuiAvatar-root': {
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#FFF',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            }
          }
        }}>
          <NotificationSection />
          <ProfileSection />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
