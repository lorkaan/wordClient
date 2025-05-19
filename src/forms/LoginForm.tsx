import { useState } from "react";


function LoginForm(props: {login_url: string}){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        try{
            const res = await fetch(props.login_url, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, password, domain})
            });

            if(res.ok){
                const data = await res.json();
                console.log('Login successful: ', data);
            }else {
                const errData = await res.json();
                console.error('Login failed:', errData);
                setError('Invalid Credentials');
            }
        }catch(err){
            console.error('Network Error', err);
            setError('Network Error')
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <input 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <input
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="Domain"
                required
            />
            <button type="submit">Login</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}

export default LoginForm;