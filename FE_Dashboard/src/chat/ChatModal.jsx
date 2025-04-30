import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Grid, TextField, IconButton,
  CircularProgress, Paper, Avatar, Divider, Tooltip
} from "@mui/material";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import axios from "axios";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';

// Base URL for API calls
const API_BASE_URL = 'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvkqdbaue/image/upload';
const CLOUDINARY_PRESET = 'delivery_app';

const ChatModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  const { orderId, customerId, employeeId } = task;

  // State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [chatRoomId, setChatRoomId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Setup SignalR connection only once when component mounts
  useEffect(() => {
    let newConnection = null;

    const createConnection = () => {
      newConnection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/chatHub`, {
          skipNegotiation: true, // ⚡ Chỉ dùng WebSockets
          transport: HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build();

      // Add event handlers
      newConnection.onclose(() => {
        console.log('SignalR connection closed.');
        setConnectionState('disconnected');
      });

      newConnection.onreconnecting(() => {
        console.log('SignalR reconnecting...');
        setConnectionState('reconnecting');
      });

      newConnection.onreconnected(() => {
        console.log('SignalR reconnected. Rejoining chat room...');
        setConnectionState('connected');
        if (chatRoomId) {
          newConnection.invoke("JoinChatRoom", chatRoomId).catch(console.error);
        }
      });

      setConnection(newConnection);
    };

    createConnection();

    return () => {
      if (newConnection) {
        newConnection.stop().catch(console.error);
      }
    };
  }, []);

  // Handle connection start and message reception
  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      if (connectionState !== 'disconnected') {
        console.log(`Connection is already in state: ${connectionState}`);
        return;
      }

      try {
        setConnectionState('connecting');
        await connection.start();
        console.log('SignalR Connected!');
        setConnectionState('connected');
        
        // If we already have a chatRoomId, join it
        if (chatRoomId) {
          await connection.invoke("JoinChatRoom", chatRoomId);
        }
      } catch (error) {
        console.error('SignalR Connection Error:', error);
        setConnectionState('disconnected');
        // Try again after a delay
        setTimeout(startConnection, 5000);
      }
    };

    // Only setup message listener once
    connection.off('ReceiveMessage'); // Remove any existing listeners
    connection.on('ReceiveMessage', (message) => {
      console.log("Received message:", message);
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Start connection if disconnected
    if (connectionState === 'disconnected') {
      startConnection();
    }
  }, [connection, connectionState, chatRoomId]);

  // Join chat room when we have both a connected connection and a room ID
  useEffect(() => {
    const joinChatRoom = async () => {
      if (connection && connectionState === 'connected' && chatRoomId) {
        try {
          console.log(`Joining chat room: ${chatRoomId}`);
          await connection.invoke("JoinChatRoom", chatRoomId);
        } catch (error) {
          console.error('Error joining chat room:', error);
        }
      }
    };

    joinChatRoom();

    // Clean up when component unmounts or chatRoomId changes
    return () => {
      if (connection && connectionState === 'connected' && chatRoomId) {
        connection.invoke("LeaveChatRoom", chatRoomId).catch(console.error);
      }
    };
  }, [connection, connectionState, chatRoomId]);

  // Fetch messages from API
  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/messages/messages/${orderId}/${customerId}/${employeeId}`
        );
        
        if (response.data.data) {
          setMessages(response.data.data);
          
          // Get chatRoomId from first message if available
          if (response.data.data.length > 0) {
            const roomId = response.data.data[0].chatRoomId;
            setChatRoomId(roomId);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [isOpen, orderId, customerId, employeeId]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle image selection
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData);
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Send message (text or image)
  const sendMessage = async () => {
    if (!chatRoomId || (!newMessage.trim() && !selectedImage)) return;
    
    // Check SignalR connection
    if (!connection || connectionState !== 'connected') {
      console.error('SignalR connection is not ready.');
      return;
    }

    try {
      setIsUploading(true);
      let messageContent = newMessage;
      let messageType = 'text';
      let imageUrl = null;

      // If image is selected, upload it first
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          alert('Failed to upload image');
          setIsUploading(false);
          return;
        }
        messageType = imageUrl;
      }

      const messageData = {
        chatRoomId,
        senderId: employeeId,
        receiveId: customerId,
        messageType,
        content: messageContent
      };

      // Send the message via API
      await axios.post(`${API_BASE_URL}/api/messages/create-message`, messageData);

      // Reset input and image selection
      setNewMessage('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Show full-size image in modal
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine if a message is from the current user
  const isCurrentUser = (senderId) => senderId === employeeId;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.12)",
            overflow: "hidden"
          },
        }}
      >
        <DialogTitle 
          sx={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
            color: 'white',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h5">Chat Support - Order #{task.orderId}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {connectionState !== 'connected' && (
              <Typography variant="caption" sx={{ mr: 1 }}>
                {connectionState === 'connecting' ? 'Connecting...' : 
                 connectionState === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
              </Typography>
            )}
            <IconButton onClick={onClose} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Grid container spacing={3}>
            {/* Order Details Panel */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid #3f51b5', pb: 1, mb: 2 }}>
                  Order Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Order ID:</Typography>
                    <Typography variant="body1" fontWeight="medium">{task.orderId}</Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Price:</Typography>
                    <Typography variant="body1" fontWeight="medium" color="success.main">${task.price}</Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Payment:</Typography>
                    <Typography variant="body1" fontWeight="medium">{task.payment}</Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Date:</Typography>
                    <Typography variant="body1" fontWeight="medium">{task.date}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            {/* Chat Panel */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid #e0e0e0',
                  background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Chat History
                  </Typography>
                </Box>
                
                {/* Messages Area */}
                <Box 
                  ref={chatContainerRef}
                  sx={{ 
                    height: '400px', 
                    overflowY: 'auto', 
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">No messages yet. Start the conversation!</Typography>
                    </Box>
                  ) : (
                    messages.map((msg, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: isCurrentUser(msg.senderId) ? 'flex-end' : 'flex-start',
                          mb: 1,
                        }}
                      >
                        {!isCurrentUser(msg.senderId) && (
                          <Avatar 
                            sx={{ 
                              bgcolor: '#e0e0e0', 
                              width: 36, 
                              height: 36, 
                              mr: 1,
                              alignSelf: 'flex-end'
                            }}
                          >
                            C
                          </Avatar>
                        )}
                        
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: isCurrentUser(msg.senderId) 
                              ? 'primary.light' 
                              : '#ffffff',
                            color: isCurrentUser(msg.senderId) ? 'black' : 'inherit',
                            maxWidth: '70%',
                            boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
                            position: 'relative',
                          }}
                        >
                          {msg.messageType.startsWith('http') ? (
                            <Box>
                              <Box 
                                sx={{ 
                                  borderRadius: '8px', 
                                  overflow: 'hidden',
                                  mb: msg.content ? 1 : 0
                                }}
                              >
                                <img
                                  src={msg.messageType}
                                  alt="Shared"
                                  style={{ 
                                    width: '100%', 
                                    maxHeight: '200px',
                                    objectFit: 'cover',
                                    cursor: 'pointer' 
                                  }}
                                  onClick={() => openImageModal(msg.messageType)}
                                />
                              </Box>
                              {msg.content && <Typography>{msg.content}</Typography>}
                            </Box>
                          ) : (
                            <Typography sx={{ wordBreak: 'break-word' }}>{msg.content}</Typography>
                          )}
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              textAlign: 'right', 
                              mt: 0.5,
                              opacity: 0.7
                            }}
                          >
                            {formatDate(msg.createAt)}
                          </Typography>
                        </Box>
                        
                        {isCurrentUser(msg.senderId) && (
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main', 
                              width: 36, 
                              height: 36, 
                              ml: 1,
                              alignSelf: 'flex-end'
                            }}
                          >
                            E
                          </Avatar>
                        )}
                      </Box>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </Box>
                
                {/* Selected Image Preview */}
                {selectedImage && (
                  <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Selected"
                        style={{ 
                          maxHeight: '100px', 
                          maxWidth: '200px', 
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={handleRemoveImage}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'white',
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            bgcolor: '#f5f5f5'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
                
                {/* Message Input */}
                <Box sx={{ 
                  p: 2, 
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TextField
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={handleKeyPress}
                    disabled={isUploading || connectionState !== 'connected'}
                    multiline
                    maxRows={3}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '24px',
                      }
                    }}
                  />
                  
                  <Tooltip title="Attach Image">
                    <IconButton 
                      color="primary" 
                      component="label"
                      disabled={isUploading || connectionState !== 'connected'}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                      />
                      <ImageIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={sendMessage}
                    disabled={isUploading || connectionState !== 'connected' || (!newMessage.trim() && !selectedImage)}
                    sx={{ 
                      borderRadius: '24px',
                      px: 3
                    }}
                  >
                    {isUploading ? 'Sending...' : 'Send'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      
      {/* Full-size Image Modal */}
      {showImageModal && (
        <Dialog
          open={showImageModal}
          onClose={() => setShowImageModal(false)}
          maxWidth="lg"
        >
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ position: 'relative' }}>
              <img
                src={modalImage}
                alt="Full size"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '80vh',
                  display: 'block'
                }}
              />
              <IconButton
                onClick={() => setShowImageModal(false)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ChatModal;