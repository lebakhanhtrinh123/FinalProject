import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
// Import các trang khác...

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/forgot-password" component={ForgotPasswordPage} />
                <Route path="/reset-password" component={ResetPasswordPage} />
                {/* Các route khác... */}
            </Switch>
        </Router>
    );
};

export default App; 