import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';

// project imports
import config from 'config';
import Logo from 'ui-component/Logo';
import { MENU_OPEN } from 'store/actions';

// Styled components
const StyledButtonBase = styled(ButtonBase)(() => ({
  padding: '8px',
  borderRadius: '8px',
  transition: 'all 0.3s ease-in-out',
  background: 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '& .logo-img': {
    filter: 'hue-rotate(320deg) saturate(1.5)',
  },
  '& svg': {
    fill: '#FF69B4',
    '& path': {
      fill: '#FF69B4',
    }
  },
  '& img': {
    maxHeight: '40px',
    background: 'transparent',
    mixBlendMode: 'multiply',
  }
}));

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => {
  const defaultId = useSelector((state) => state.customization.defaultId);
  const dispatch = useDispatch();
  
  return (
    <StyledButtonBase 
      disableRipple 
      onClick={() => dispatch({ type: MENU_OPEN, id: defaultId })} 
      component={Link} 
      to={config.defaultPath}
      sx={{
        background: 'transparent',
        '& > *': {
          background: 'transparent',
        }
      }}
    >
      <Logo />
    </StyledButtonBase>
  );
};

export default LogoSection;
