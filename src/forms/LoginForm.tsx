import { useState } from "react";
import { doFetch } from "../utils/secureFetch";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { DataDisplay } from "../generics/DataDisplay";
import { useSingleDataModel } from "../utils/dataFetch";

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

interface sync_completed_response{
    syncCompleted: boolean;
    syncErr: string;
}

function LoginForm(props: {login_url: string, domain: string}){

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
                'domain': props.domain
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
        <div className="loginDiv">
            <form className="loginForm" onSubmit={handleLogin}>
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
                <Button id="loginSubmitButton" type="submit" variant="contained">Login</Button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}

function LoginHandler(props: {login_url: string, domain: string}){

    const navigate = useNavigate()

    const {data, loading, error} = useSingleDataModel<auth_interface>("/is_auth");

    if(!loading && !error && data != null && data.auth){
        navigate("/words");
    }
    
    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p className="error">Error: {error}</p>}
            {!loading && !error && (data == null || !data.auth)? 
                    <LoginForm login_url={props.login_url} domain={props.domain} />
                :
                    <p>Redirecting to Word Collection, click <a href="/words">here</a> to redirect immediately</p>
            }
        </div>
    );
}

export default LoginHandler;