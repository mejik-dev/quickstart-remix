import * as React from 'react';
import { useActionData } from '@remix-run/react';
import Login, { processLogin } from '../components/Login';
import Register, { processRegister } from '../components/Register';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const operation = formData.get('operation');

  if (operation === 'login') {
    return processLogin(formData);
  } else {
    return processRegister(formData);
  }
};

const Home = () => {
  const actionData = useActionData();
  const [switchAuthForm, setSwitchAuthForm] = React.useState('login');

  React.useEffect(() => {
    if (actionData?.error?.message) {
      alert(actionData.error.message);
    }
  }, [actionData]);

  const handleRegisterForm = () => {
    setSwitchAuthForm('register');
  };

  const handleLoginForm = () => {
    setSwitchAuthForm('login');
  };

  return (
    <div className="auth-page">
      <div className="auth-button">
        <button onClick={handleLoginForm}>Login</button>
        <button onClick={handleRegisterForm}>Register</button>
      </div>
      {switchAuthForm === 'register' ? <Register /> : <Login />}
    </div>
  );
};

export default Home;
