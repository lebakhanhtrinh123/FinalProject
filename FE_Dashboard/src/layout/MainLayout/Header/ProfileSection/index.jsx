import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import User1 from 'assets/images/users/user-round.svg';

// assets
import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react';

const ProfileSection = () => {
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const getRoleName = () => {
    const roleName = localStorage.getItem('roleName');
    if (!roleName) {
      navigate('/login');
      return;
    }
    return roleName;
  };

  useEffect(() => {
    const userRole = getRoleName();
    setRole(userRole);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('roleName');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Chip
        sx={{
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          transition: 'all .2s ease-in-out',
          borderColor: theme.palette.primary.light,
          backgroundColor: `#ffe0f0 !important`,
          '& svg': {
            stroke: '#ff54b1',
          },
          '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: '#ff94cc',
            background: `#ff94cc !important`,
            color: theme.palette.primary.light,
            '& svg': {
              stroke: theme.palette.primary.light
            }
          },
          '& .MuiChip-label': {
            lineHeight: 0
          }
        }}
        icon={
          <Avatar
            src={User1}
            sx={{
              ...theme.typography.mediumAvatar,
              margin: '8px 0 8px 8px !important',
              cursor: 'pointer'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="1.5rem" color={theme.palette.primary.main} />}
        variant="outlined"
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
      />
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 14]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Box sx={{ p: 2, pb: 0 }}>
                    <Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h4">Good Morning,</Typography>
                        <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                          {role}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Divider />
                  </Box>
                  <Box sx={{ p: 2, pt: 0, maxHeight: 'auto', overflow: 'hidden' }}>
                    <List
                      component="nav"
                      sx={{
                        width: '100%',
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '10px',
                        '& .MuiListItemButton-root': {
                          mt: 0.5
                        }
                      }}
                    >
                      {/* <ListItemButton
                        sx={{
                          borderRadius: `${customization.borderRadius}px`,
                          '&:hover': {
                            backgroundColor: '#ffe0f0',

                          }
                        }}
                        onClick={handleProfile}
                      >
                        <ListItemIcon>
                          <IconUser stroke={1.5} size="1.3rem" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ color: 'inherit' }}>
                              Profile
                            </Typography>
                          }
                        />
                      </ListItemButton> */}

                      <ListItemButton
                        sx={{
                          borderRadius: `${customization.borderRadius}px`,
                          color: 'red',
                          '& svg': { stroke: 'red' },
                          '&:hover': {
                            backgroundColor: '#ffe0f0',
                            color: 'red',
                            '& svg': { stroke: 'red' }
                          }
                        }}
                        onClick={handleLogout}
                      >
                        <ListItemIcon>
                          <IconLogout stroke={1.5} size="1.3rem" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ color: 'inherit' }}>
                              Logout
                            </Typography>
                          }
                        />
                      </ListItemButton>

                    </List>
                  </Box>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default ProfileSection;