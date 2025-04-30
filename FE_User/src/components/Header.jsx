import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchOutlined, ShoppingCartOutlined, UserOutlined, LogoutOutlined, HistoryOutlined, WalletOutlined ,EyeFilled} from '@ant-design/icons';
import NotificationSection from './Notification';

const Header = () => {
  const navItems = [
    { name: 'Home', link: '/home' },
    { name: 'Product', link: '/product' },
    { name: 'Customize', link: '/customize-options' },
    { name: 'About Us', link: '/about' }
  ];

  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap';
    document.head.appendChild(linkElement);

    setActiveItem(location.pathname);
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);  
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [location.pathname]);

  useEffect(() => {
    const interval = setInterval(checkLoginStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkLoginStatus = () => {
    const token = sessionStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <header className="w-full border-b border-gray-200 px-4 py-3 bg-pink-50 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/home" style={{ fontFamily: 'Caveat, cursive' }} className="text-5xl font-bold text-pink-500">
          CustomFlowerChain
        </Link>

        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className={`text-xl transition-colors uppercase text-sm tracking-wider ${activeItem === item.link
                ? 'font-bold text-pink-500 border-b-2 border-pink-500'
                : 'hover:text-pink-500'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-6">
          {/* <button className="text-gray-600 hover:text-pink-500 transition-colors">
            <SearchOutlined className="text-2xl" />
          </button> */}

          <div className="relative">
            <Link
              to="/cart"
              className="text-gray-600 hover:text-pink-500 transition-colors"
            >
              <ShoppingCartOutlined className="text-2xl" />
            </Link>
          </div>

          {isLoggedIn && (
            <NotificationSection />
          )}

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                <UserOutlined className="text-2xl" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                  <Link
                    to="/userprofile"
                    className="flex items-center px-4 py-2 text-blue-600 hover:bg-pink-200"
                  >
                    <UserOutlined className="text-lg mr-4" />
                    Profile
                  </Link>
                  <Link
                    to="/request-custom-history"
                    className="flex items-center px-4 py-2 text-pink-600 hover:bg-pink-200"
                  >
                    <HistoryOutlined className="text-lg mr-4" />
                    Request History 
                  </Link>
                  <Link
                    to="/wallet"
                    className="flex items-center px-4 py-2 text-yellow-600 hover:bg-pink-200"
                  >
                    <HistoryOutlined className="text-lg mr-4" />
                    Order History
                  </Link>
                  <Link
                    to="/wallet2"
                    className="flex items-center px-4 py-2 text-green-600 hover:bg-pink-200"
                  >
                    <WalletOutlined className="text-lg mr-4" />
                    Wallet
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-pink-200"
                  >
                    <LogoutOutlined className="text-lg mr-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 bg-pink-500 text-white font-medium rounded-md hover:bg-pink-600 transition-colors"
            >
              Login/Register
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden flex justify-between items-center py-2">
        <div style={{ fontFamily: 'Caveat, cursive' }} className="text-2xl font-bold text-pink-500">
          CustomFlowerChain
        </div>
        <button className="text-gray-600 hover:text-pink-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;