import React, { useState } from "react";
import API, { setAuthToken } from "../api";

function Register({ onRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await API.post('auth/register/', { username, password });
            setSuccess('Account created successfully! Please click Login to sign in.');
            setUsername('');
            setPassword('');
        } catch (err) {
            setError('Registration failed');
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {success && (
                <>
                    <p style={{ color: 'green' }}>{success}</p>
                </>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form className="login-form" onSubmit={handleRegister} >
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
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;