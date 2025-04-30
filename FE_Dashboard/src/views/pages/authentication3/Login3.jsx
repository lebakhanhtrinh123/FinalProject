import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

// project imports
import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import AuthPic from "../../../assets/images/authpic.jpg"
import menuItems from 'menu-items';

// Import ảnh nền nếu cần
// import backgroundImage from '../assets/image.png';

// ================================|| AUTH3 - LOGIN ||================================ //

const Login = () => {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    const payload = {
      email,
      password,
    };

    try {
      const response = await fetch('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("data", data);
        if (data?.roleName === 'Customer') {
          setError('You do not have access to this system.');
          return;
        }
        setSuccessMessage(data.messages[0]);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('roleName', data.data.roleName);
        console.log("User Role:", data?.data);
        const { roleName } = data.data;
        switch (roleName) {
          case 'Admin':
            navigate('/adminDashboard/store-overview');
            break;
          case 'StoreManager':
            navigate('/storeDashboard/store-revenue');
            break;
          case 'Florist':
            navigate('/floristDashboard/task-management');
            break;
          default:
            setError('You do not have access to this system.');
            break;
        }
      } else {
        setError(data.messages ? data.messages[0] : 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (

    <AuthWrapper1
      sx={{
        backgroundImage: `url(${AuthPic})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh'
      }}
    >
      <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid item sx={{ mb: 3 }}>
                    <Link to="#" aria-label="logo">
                      <Logo />
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack alignItems="center" justifyContent="center" spacing={1}>
                      <Typography color="#ff54b1" gutterBottom variant={downMD ? 'h3' : 'h2'}>
                        Hi, Welcome Back
                      </Typography>
                      <Typography variant="caption" fontSize="16px" textAlign={{ xs: 'center', md: 'inherit' }}>
                        Enter your credentials to continue
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={2}>
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {error && <Alert severity="error">{error}</Alert>}
                      {successMessage && <Alert severity="success">{successMessage}</Alert>}
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: '#ff66b2', '&:hover': { backgroundColor: '#ff33a2' } }}
                        fullWidth
                        onClick={handleLogin}
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </Button>

                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography component={Link} to="/register" variant="subtitle1" sx={{ color: '#ff66b2', textDecoration: 'none' }}>
                      Don&apos;t have an account?
                    </Typography>
                  </Grid>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ m: 3, mt: 1, position: 'relative', zIndex: 2 }}>
          <AuthFooter />
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
};

export default Login;
