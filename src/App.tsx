import './App.css';
import LoginForm from './forms/LoginForm';

function App(props: {domain: string}) {

  return (
    <div>
      <LoginForm login_url="login" domain={props.domain}/>
    </div>
  );
}

export default App;
