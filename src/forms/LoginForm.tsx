import { useState } from "react";
import { doFetch } from "../utils/secureFetch";
import { useNavigate } from "react-router-dom";

/**
 * 
 * Hard coded the URL in since this demo is going to be locked to a specific Domain and
 *  having to re-enter the domain into the field is really annoying.
 * 
 * Ideally, the user would select from a drop down list of possible domains after login, but since this demo will only
 * ever use a single domain in order to limit the scope of the changes that can be made to the test data, it should be ok.
 * 
 * The rest of the system is set up to handle multiple domains, so locking it here will limit the scope to test data.
 */
const domain: string = "https://www-spellinblox-info.filesusr.com/";

interface sync_completed_response{
    syncCompleted: boolean;
    syncErr: string;
}

function LoginForm(props: {login_url: string}){

    const navigate = useNavigate()

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    //const [domain, setDomain] = useState('');
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        doFetch<sync_completed_response>({
            url: props.login_url,
            method: "POST",
            data: {
                'username': username,
                'password': password,
                'domain': domain
            }
        }).catch((err) => {
            console.error('Login & Sync failed:', err);
            setError('Network Error: ' + err)
        }).then((syncResponse: sync_completed_response | void) =>{
            if(syncResponse){
                if(syncResponse.syncCompleted){
                    // Sync is completed correctly
                    navigate("/words");
                }else{
                    // Sync is a problem
                    setError("Sync Failed: " + syncResponse.syncErr);
                }
            }else{
                // Sync did not happen and nothing was returned, something is really wrong on the server side
                setError("Server Fail");
            }
        })
    }

    return (
        <form onSubmit={handleLogin}>
            <label className="formLabel">Username:</label><input 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <br/>
            <label className="formLabel">Password:</label><input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <br/>
            <button type="submit">Login</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}

export default LoginForm;