// index.jsx cập nhật
import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { jwtDecode } from 'jwt-decode';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import ButtonBase from '@mui/material/ButtonBase';
import Badge from '@mui/material/Badge';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';

// assets
import { IconBell } from '@tabler/icons-react';

// notification status options
const status = [
  {
    value: 'all',
    label: 'All Notification'
  },
  {
    value: 'new',
    label: 'New'
  },
  {
    value: 'unread',
    label: 'Unread'
  },
  {
    value: 'other',
    label: 'Other'
  }
];

// Người dùng mặc định nhận thông báo


// ==============================|| NOTIFICATION ||============================== //

const NotificationSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationConnection, setNotificationConnection] = useState(null);
  const notificationConnectionRef = useRef(null);
  const [userId, setUserId] = useState('');

  /**
   * anchorRef is used on different components and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      const roleName = localStorage.getItem('roleName');
      if (token) {
        const decodedToken = jwtDecode(token);
        const userIdFromToken = decodedToken.Id;
        const storeIdFromToken = decodedToken.StoreId;
        const toUserId = roleName === 'StoreManager' ? storeIdFromToken : userIdFromToken;
        setUserId(toUserId);
        console.log('User ID from token:', toUserId);
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleChange = (event) => {
    if (event?.target.value) setValue(event?.target.value);
  };

  // Kết nối SignalR Notification Hub
  const connectNotificationHub = async () => {
    try {
      // Kiểm tra kết nối hiện có
      if (notificationConnectionRef.current?.state === 'Connected') {
        return;
      }

      console.log(`Connecting to Notification Hub for user: ${userId}`);

      const newConnection = new HubConnectionBuilder()
        .withUrl(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/notificationHub`, {
          skipNegotiation: true, // ⚡ Chỉ dùng WebSockets
          transport: HttpTransportType.WebSockets,
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // Xử lý sự kiện nhận thông báo
      newConnection.on('ReceiveNotification', (notification) => {
        console.log('Received notification:', notification);

        // Định dạng lại dữ liệu thông báo để phù hợp với cấu trúc hiện có
        const formattedNotification = {
          notiId: notification.notificationId,
          message: notification.message,
          type: notification.type,
          relatedId: notification.relatedId,
          createAt: new Date(notification.createdAt), // Chuyển đổi thành đối tượng Date
          isRead: notification.isRead,
          status: notification.status || 'New', // Đặt giá trị mặc định nếu không có
        };

        console.log('Formatted notification:', formattedNotification);

        // Thêm thông báo mới vào danh sách
        setNotifications(prevNotifications => [formattedNotification, ...prevNotifications]);

        // Tăng số lượng thông báo chưa đọc
        if (!notification.isRead) {
          setUnreadCount(prev => prev + 1);
        }
      });

      // Bắt đầu kết nối
      await newConnection.start();
      console.log('SignalR connection established');

      // Tham gia vào nhóm nhận thông báo của người dùng
      await newConnection.invoke('JoinNotificationGroup', userId);
      console.log(`Joined notification group for user: ${userId}`);

      // Lưu kết nối để sử dụng sau này
      setNotificationConnection(newConnection);
      notificationConnectionRef.current = newConnection;
    } catch (error) {
      console.error('Notification Hub connection failed:', error);
    }
  };

  // Thêm useEffect này vào component của bạn
  useEffect(() => {
    // Theo dõi trạng thái kết nối
    if (notificationConnection) {
      const reconnect = async () => {
        try {
          // Nếu kết nối bị đóng, thử kết nối lại
          if (notificationConnection.state === 'Disconnected') {
            await notificationConnection.start();
            console.log('Reconnected to notification hub');

            // Tham gia lại nhóm thông báo
            await notificationConnection.invoke('JoinNotificationGroup', userId);
            console.log(`Rejoined notification group for user: ${userId}`);
          }
        } catch (error) {
          console.error('Failed to reconnect:', error);
        }
      };

      // Thiết lập kiểm tra kết nối định kỳ
      const interval = setInterval(reconnect, 5000);

      return () => clearInterval(interval);
    }
  }, [notificationConnection, userId]);

  useEffect(() => {
    fetchNotifications();
    console.log('Fetched notifications structure:', notifications[0]);
  }, []);

  // Lấy thông báo từ API
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Noti/user/${userId}`);

      if (response.ok) {
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {

          const sortedData = result.data.sort((a, b) => {
            const dateA = new Date(a.updateAt ?? a.createAt);
            const dateB = new Date(b.updateAt ?? b.createAt);
            return dateB - dateA; 
          });
          setNotifications(sortedData);

          // Đếm số thông báo chưa đọc
          const unreadNotifications = result.data.filter(notification => !notification.isRead);
          setUnreadCount(unreadNotifications.length);
        }
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Đánh dấu thông báo đã đọc
  const markAsRead = async (notiId) => {
    try {
      const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Noti/read/${notiId}`, {
        method: 'PUT',
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.resultStatus === 'Success') {
          // Cập nhật trạng thái thông báo trong state
          setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
              notification.notiId === notiId
                ? { ...notification, isRead: true }
                : notification
            )
          );

          // Giảm số thông báo chưa đọc
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter(notification => !notification.isRead);

    // Đánh dấu từng thông báo là đã đọc
    unreadNotifications.forEach(async (notification) => {
      await markAsRead(notification.notiId);
    });
  };

  const filteredNotifications = useMemo(() => {
    switch (value) {
      case 'new':
        // Lọc ra các thông báo mới, ví dụ: thông báo trong 24h qua
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return notifications.filter(notification => new Date(notification.createAt) > oneDayAgo);

      case 'unread':
        // Lọc ra các thông báo chưa đọc
        return notifications.filter(notification => !notification.isRead);

      case 'other':
        // Lọc ra các thông báo khác, ví dụ: thông báo cũ hơn 24h và đã đọc
        const oneDayAgoForOther = new Date();
        oneDayAgoForOther.setDate(oneDayAgoForOther.getDate() - 1);
        return notifications.filter(notification =>
          new Date(notification.createAt) <= oneDayAgoForOther && notification.isRead
        );

      case 'all':
      default:
        // Trả về tất cả thông báo
        return notifications;
    }
  }, [value, notifications]);



  // Kết nối SignalR và lấy thông báo khi component mount
  useEffect(() => {
    connectNotificationHub();
    fetchNotifications();

    return () => {
      if (notificationConnectionRef.current) {
        notificationConnectionRef.current.stop().catch(console.error);
      }
    };
  }, [userId]);

  return (
    <>
      <Box
        sx={{
          ml: 2,
          mr: 3,
          [theme.breakpoints.down('md')]: {
            mr: 2
          }
        }}
      >
        <ButtonBase sx={{ borderRadius: '12px' }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                transition: 'all .2s ease-in-out',
                background: theme.palette.secondary.light,
                color: theme.palette.secondary.dark,
                '&[aria-controls="menu-list-grow"],&:hover': {
                  background: theme.palette.secondary.dark,
                  color: theme.palette.secondary.light
                }
              }}
              ref={anchorRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
              color="inherit"
            >
              <IconBell stroke={1.5} size="1.3rem" />
            </Avatar>
          </Badge>
        </ButtonBase>
      </Box>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
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
                offset: [matchesXs ? 5 : 0, 20]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                        <Grid item>
                          <Stack direction="row" spacing={2}>

                            <Typography variant="subtitle1">All notifications</Typography>
                            <Chip
                              size="small"
                              label={unreadCount}
                              sx={{
                                color: theme.palette.background.default,
                                bgcolor: theme.palette.warning.dark
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item>
                          <Typography component={Button} variant="subtitle2" color="primary" onClick={markAllAsRead}>
                            Mark all as read
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}>
                        <Grid container direction="column" spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ px: 2, pt: 0.25 }}>
                              <TextField
                                id="outlined-select-currency-native"
                                select
                                fullWidth
                                value={value}
                                onChange={handleChange}
                                SelectProps={{
                                  native: true
                                }}
                              >
                                {status.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </TextField>
                            </Box>
                          </Grid>
                          <Grid item xs={12} p={0}>
                            <Divider sx={{ my: 0 }} />
                          </Grid>
                        </Grid>
                        <NotificationList notifications={filteredNotifications} markAsRead={markAsRead} onClose={() => setOpen(false)} />
                      </PerfectScrollbar>
                    </Grid>
                  </Grid>
                  <Divider />
                  <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                    <Button size="small" disableElevation>

                    </Button>
                  </CardActions>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default NotificationSection;