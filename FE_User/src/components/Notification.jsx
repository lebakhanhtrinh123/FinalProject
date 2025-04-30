import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Avatar, Dropdown, List, Typography, Tag, Space, Divider, Button, Select, Empty } from 'antd';
import { BellOutlined, UserOutlined, CheckOutlined, ShoppingOutlined, GiftOutlined, MessageOutlined } from '@ant-design/icons';
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { jwtDecode } from 'jwt-decode';

const { Text, Title } = Typography;
const { Option } = Select;

// Format time helper function
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Vừa xong';
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  } else if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN');
  }
};

// Status filter options
const statusOptions = [
  { value: 'all', label: 'Tất cả thông báo' },
  { value: 'new', label: 'Mới nhất' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'other', label: 'Khác' }
];

const getNotificationIcon = (type) => {
  switch (type) {
    case 'Order':
      return <ShoppingOutlined />;
    case 'Product':
      return <GiftOutlined />;
    case 'Message':
      return <MessageOutlined />;
    case 'User':
    default:
      return <UserOutlined />;
  }
};

const NotificationItem = ({ notification, onClick }) => {
  const getTagColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'blue';
      case 'urgent':
        return 'red';
      case 'processing':
        return 'orange';
      case 'completed':
        return 'green';
      default:
        return 'default';
    }
  };

  return (
    <List.Item
      className="cursor-pointer hover:bg-pink-50 transition-colors duration-300"
      onClick={() => onClick(notification)}
    >
      <div className="flex w-full">
        <div className="mr-3">
          <Avatar icon={getNotificationIcon(notification.type)} className="bg-pink-500" />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-1">
            <Text strong>{notification.type || "Thông báo"}</Text>
            <Text type="secondary" className="text-xs">
              {formatTime(notification.updateAt ?? notification.createAt)}
            </Text>
          </div>
          <Text className="block mb-2">{notification.message}</Text>
          <div className="flex flex-wrap gap-2">
            {!notification.isRead && (
              <Tag color="red">Chưa đọc</Tag>
            )}
            {/* <Tag color={getTagColor(notification.status)}>
              {notification.status || "Mới"}
            </Tag> */}
          </div>
        </div>
      </div>
    </List.Item>
  );
};

const NotificationSection = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationConnection, setNotificationConnection] = useState(null);
  const notificationConnectionRef = useRef(null);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        message.error('Please login to view orders');
        navigate('/login');
        return;
      }
      const decodedToken = jwtDecode(token);
      const customerId = decodedToken.Id;
      setUserId(customerId);


    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  // Connect to SignalR Notification Hub
  const connectNotificationHub = async () => {
    try {
      // Check existing connection
      if (notificationConnectionRef.current?.state === 'Connected') {
        return;
      }

      console.log(`Connecting to Notification Hub for user: ${userId}`);

      const newConnection = new HubConnectionBuilder()
        .withUrl(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/notificationHub`, {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // Handle receive notification event
      newConnection.on('ReceiveNotification', (notification) => {
        console.log('Received notification:', notification);

        // Format notification to match structure
        const formattedNotification = {
          notiId: notification.notificationId,
          message: notification.message,
          type: notification.type,
          relatedId: notification.relatedId,
          createAt: new Date(notification.createdAt),
          isRead: notification.isRead,
          status: notification.status || 'New',
        };

        console.log('Formatted notification:', formattedNotification);

        // Add new notification to list
        setNotifications(prevNotifications => [formattedNotification, ...prevNotifications]);

        // Increase unread count
        if (!notification.isRead) {
          setUnreadCount(prev => prev + 1);
        }
      });

      // Start connection
      await newConnection.start();
      console.log('SignalR connection established');

      // Join notification group
      await newConnection.invoke('JoinNotificationGroup', userId);
      console.log(`Joined notification group for user: ${userId}`);

      // Save connection for later use
      setNotificationConnection(newConnection);
      notificationConnectionRef.current = newConnection;
    } catch (error) {
      console.error('Notification Hub connection failed:', error);
    }
  };

  // Track connection state
  useEffect(() => {
    if (notificationConnection) {
      const reconnect = async () => {
        try {
          // Try to reconnect if disconnected
          if (notificationConnection.state === 'Disconnected') {
            await notificationConnection.start();
            console.log('Reconnected to notification hub');

            // Rejoin notification group
            await notificationConnection.invoke('JoinNotificationGroup', userId);
            console.log(`Rejoined notification group for user: ${userId}`);
          }
        } catch (error) {
          console.error('Failed to reconnect:', error);
        }
      };

      // Set periodic connection check
      const interval = setInterval(reconnect, 5000);

      return () => clearInterval(interval);
    }
  }, [notificationConnection, userId]);

  // Fetch notifications from API
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

          // Count unread notifications
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

  // Mark as read
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
          // Update notification state
          setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
              notification.notiId === notiId
                ? { ...notification, isRead: true }
                : notification
            )
          );

          // Decrease unread count
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter(notification => !notification.isRead);

    // Mark each notification as read
    unreadNotifications.forEach(async (notification) => {
      await markAsRead(notification.notiId);
    });
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notiId);
    }

    setOpen(false);

    // Handle navigation based on notification type
    if (notification.relatedId) {
      switch (notification.type) {
        case 'Order':
          navigate(`/order/detail/${notification.relatedId}`);
          break;
        case 'Product':
          navigate(`/product/detail/${notification.relatedId}`);
          break;
        case 'User':
          navigate(`/user/profile/${notification.relatedId}`);
          break;
        // Trong hàm handleNotificationClick, case 'Message'
        case 'Message':
          if (notification.relatedId) {
            // Call API to get chat room details
            fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/chatRooms/Id?id=${notification.relatedId}`, {
              headers: {
                'accept': '*/*',
              },
            })
              .then(res => res.json())
              .then(data => {
                if (data?.data) {
                  const { orderId, customerId, employeeId } = data.data;
                  navigate(`/wallet?openChat=true&orderId=${orderId}&customerId=${customerId}&employeeId=${employeeId}`);
                } else {
                  console.error("Cannot get chat room data");
                }
              })
              .catch(error => {
                console.error("Error calling chatRoom API:", error);
              });
          }
          break;
        default:
          console.log('Notification clicked:', notification);
          break;
      }
    }
  };

  // Filter Notifications
  const filteredNotifications = useMemo(() => {
    switch (value) {
      case 'new':
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return notifications.filter(notification => new Date(notification.createAt) > oneDayAgo);

      case 'unread':
        return notifications.filter(notification => !notification.isRead);

      case 'other':
        const oneDayAgoForOther = new Date();
        oneDayAgoForOther.setDate(oneDayAgoForOther.getDate() - 1);
        return notifications.filter(notification =>
          new Date(notification.createAt) <= oneDayAgoForOther && notification.isRead
        );

      case 'all':
      default:
        return notifications;
    }
  }, [value, notifications]);

  // Connect to SignalR and fetch notifications on component mount
  useEffect(() => {
    if (userId) {
      connectNotificationHub();
      fetchNotifications();
    }

    return () => {
      if (notificationConnectionRef.current) {
        notificationConnectionRef.current.stop().catch(console.error);
      }
    };
  }, [userId]);

  // Dropdown Content
  const menu = (
    <div className="bg-white rounded-lg shadow-lg w-80 max-h-98 overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Title level={5} className="m-0">Notification</Title>
          {unreadCount > 0 && (
            <Badge count={unreadCount} className="ml-2 mb-2" />
          )}
        </div>
        <Button
          type="text"
          className="text-pink-500 hover:text-pink-700"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Space>
            <CheckOutlined />
            <span>Mark as read</span>
          </Space>
        </Button>
      </div>

      <div className="p-3 border-b border-gray-100">
        <Select
          className="w-full"
          value={value}
          onChange={setValue}
          options={statusOptions}
        />
      </div>

      <div className="overflow-y-auto pl-4 pr-2 max-h-64">
        {filteredNotifications.length > 0 ? (
          <List
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <NotificationItem
                notification={item}
                onClick={handleNotificationClick}
              />
            )}
            split={true}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo"
            className="py-8"
          />
        )}
      </div>

      <div className="p-2 border-t border-gray-100 text-center">
        <Button type="link">Xem tất cả</Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow
      overlayClassName="shadow-2xl"
    >
      <div className="cursor-pointer p-1">
        <Badge count={unreadCount} overflowCount={99}>
          <BellOutlined className="text-2xl text-gray-600 hover:text-pink-500" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationSection;