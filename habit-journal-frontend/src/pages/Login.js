import React, {useState} from "react";
import API, {setAuthToken} from "../api";
import '../styles.css'; // 
import { useNavigate } from 'react-router-dom';

function Login ({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('auth/token/', {
                username,
                password
            });
            const { access } = res.data; //const access = res.data.access;
            const { refresh } = res.data;

            setAuthToken(access);
            localStorage.setItem('access_token', access);
            localStorage.setItem('username',username);
            localStorage.setItem('refresh_token', refresh);
            onLogin();
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials')
            setError('Login failed');
        }
    };

return (
    <div >
        <h2>Login</h2>
        <p>My space and journel start from now</p>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form className="login-form" onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
            /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            /><br />
            <button type="submit">Login</button>

        </form>
    </div>
    );
}

export default Login
