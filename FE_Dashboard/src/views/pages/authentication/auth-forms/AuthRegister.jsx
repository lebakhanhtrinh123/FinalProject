import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios'; // Import axios for API calls

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { CloudUpload } from '@mui/icons-material'; // Import icon for file upload
import { useNavigate } from 'react-router-dom';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import Google from 'assets/images/icons/social-google.svg';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===========================|| FIREBASE - REGISTER ||=========================== //

const AuthRegister = ({ ...others }) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const customization = useSelector((state) => state.customization);
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);
  const [stores, setStores] = useState([]); // State to hold stores
  const [selectedStoreId, setSelectedStoreId] = useState(''); // State for selected store ID
  const navigate = useNavigate();
  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState();

  const googleHandler = async () => {
    console.error('Register');
  };

  useEffect(() => {
    // Fetch stores from API
    const fetchStores = async () => {
      try {
        const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Store/GetAllStore');
        setStores(response.data.data || []);
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    fetchStores();
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setStrength(temp);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('123456');
  }, []);

  const handleRegister = async (values) => {
    const formData = new FormData();
    formData.append('Gender', true);
    formData.append('Phone', values.phone);
    formData.append('Address', values.address);
    formData.append('IdentificationNumber', values.identificationNumber);
    formData.append('FullName', values.fullName);
    formData.append('Email', values.email);
    formData.append('Birthday', values.birthday);

    // Append files if any
    if (values.avatar) {
      formData.append('Avatar', values.avatar);
    }
    if (values.identificationFront) {
      formData.append('IdentificationFontOfPhoto', values.identificationFront);
    }
    if (values.identificationBack) {
      formData.append('IdentificationBackOfPhoto', values.identificationBack);
    }

    try {
      const response = await axios.post(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/auth/register-Florist-account?storeId=${selectedStoreId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.status === 200) {
        console.log('Registration successful:', response.data);
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Error registering:', error);
      setSnackbarMessage('Đăng ký không thành công. Vui lòng thử lại.'); // Set error message
      setSnackbarOpen(true); 
    }
  };

  return (
    <>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        {/* <Grid item xs={12}>
          <AnimateButton>
            <Button
              variant="outlined"
              fullWidth
              onClick={googleHandler}
              size="large"
              sx={{
                color: 'grey.700',
                backgroundColor: theme.palette.grey[50],
                borderColor: theme.palette.grey[100]
              }}
            >
              <Box sx={{ mr: { xs: 1, sm: 2, width: 20 } }}>
                <img src={Google} alt="google" width={16} height={16} style={{ marginRight: matchDownSM ? 8 : 16 }} />
              </Box>
              Sign up with Google
            </Button>
          </AnimateButton>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ alignItems: 'center', display: 'flex' }}>
            <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
            <Button
              variant="outlined"
              sx={{
                cursor: 'unset',
                m: 2,
                py: 0.5,
                px: 7,
                borderColor: `${theme.palette.grey[100]} !important`,
                color: `${theme.palette.grey[900]}!important`,
                fontWeight: 500,
                borderRadius: `${customization.borderRadius}px`
              }}
              disableRipple
              disabled
            >
              OR
            </Button>
            <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
          </Box>
        </Grid> */}
        <Grid item xs={12} container alignItems="center" justifyContent="center">
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Sign up with Email address</Typography>
          </Box>
        </Grid>
      </Grid>

      <Formik
        initialValues={{
          email: '',
          password: '',
          fullName: '',
          phone: '',
          address: '',
          identificationNumber: '',
          birthday: '',
          avatar: null,
          identificationFront: null,
          identificationBack: null,
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          fullName: Yup.string().required('Full Name is required'),
          phone: Yup.string().required('Phone is required'),
          address: Yup.string().required('Address is required'),
          identificationNumber: Yup.string().required('Identification Number is required'),
          birthday: Yup.date().required('Birthday is required'),
        })}
        onSubmit={handleRegister}
        >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>Register as a Florist</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  margin="normal"
                  name="fullName"
                  type="text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.fullName}
                  error={Boolean(touched.fullName && errors.fullName)}
                  helperText={touched.fullName && errors.fullName}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={Boolean(touched.email && errors.email)}>
                  <InputLabel htmlFor="outlined-adornment-email-register">Email Address</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email-register"
                type="email"
                value={values.email}
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
              />
              {touched.email && errors.email && (
                <FormHelperText error id="standard-weight-helper-text--register">
                  {errors.email}
                </FormHelperText>
              )}
            </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  margin="normal"
                  name="phone"
                  type="text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.phone}
                  error={Boolean(touched.phone && errors.phone)}
                  helperText={touched.phone && errors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  margin="normal"
                  name="address"
                  type="text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.address}
                  error={Boolean(touched.address && errors.address)}
                  helperText={touched.address && errors.address}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Identification Number"
                  margin="normal"
                  name="identificationNumber"
                  type="text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.identificationNumber}
                  error={Boolean(touched.identificationNumber && errors.identificationNumber)}
                  helperText={touched.identificationNumber && errors.identificationNumber}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Birthday"
                  margin="normal"
                  name="birthday"
                  type="date"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.birthday}
                  error={Boolean(touched.birthday && errors.birthday)}
                  helperText={touched.birthday && errors.birthday}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="store-select">Select Store</InputLabel>
                  <Select
                    id="store-select"
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                  >
                    {stores.map((store) => (
                      <MenuItem key={store.storeId} value={store.storeId}>
                        {store.storeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* File Uploads */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Upload Documents</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>Avatar</Typography>
                <input
                  type="file"
                  onChange={(e) => {
                    setFieldValue('avatar', e.currentTarget.files[0]);
                    setFieldValue('avatarName', e.currentTarget.files[0]?.name);
                  }}
                  accept="image/*"
                />
                {values.avatarName && <Typography variant="caption">{values.avatarName}</Typography>}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>CMND Mặt Trước</Typography>
                <input
                  type="file"
                  onChange={(e) => {
                    setFieldValue('identificationFront', e.currentTarget.files[0]);
                    setFieldValue('identificationFrontName', e.currentTarget.files[0]?.name);
                  }}
                  accept="image/*"
                />
                {values.identificationFrontName && <Typography variant="caption">{values.identificationFrontName}</Typography>}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>CMND Mặt Sau</Typography>
                <input
                  type="file"
                  onChange={(e) => {
                    setFieldValue('identificationBack', e.currentTarget.files[0]);
                    setFieldValue('identificationBackName', e.currentTarget.files[0]?.name);
                  }}
                  accept="image/*"
                />
                {values.identificationBackName && <Typography variant="caption">{values.identificationBackName}</Typography>}
              </Grid>
            

              {/* <Grid item xs={12}>
                <FormControl fullWidth error={Boolean(touched.password && errors.password)}>
              <InputLabel htmlFor="outlined-adornment-password-register">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-register"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                    onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password-register">
                  {errors.password}
                </FormHelperText>
              )}
            </FormControl>
              </Grid> */}

            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />
                  }
                  label={
                    <Typography variant="subtitle1">
                      Agree with &nbsp;
                      <Typography variant="subtitle1" component={Link} to="#">
                        Terms & Condition.
                      </Typography>
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <AnimateButton>
                <Button
                  disableElevation
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{ backgroundColor: '#ff66b2', '&:hover': { backgroundColor: '#ff33a2' } }}
                >
                  Sign up
                </Button>
              </AnimateButton>
            </Box>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthRegister;
