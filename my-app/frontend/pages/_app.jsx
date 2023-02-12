// add bootstrap css 
import 'bootstrap/dist/css/bootstrap.css'
// own css files here
//import "../css/customcss.css";
import "../styles/globals.css";
import Thing from "../components/Thing";

function MyApp({ Component, pageProps }) {
  return (<div>
    <Thing />
    <Component {...pageProps} />
  </div>);
}

export default MyApp;
