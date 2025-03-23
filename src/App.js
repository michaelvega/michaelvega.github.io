import './App.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import {ExperimentFilled, HomeFilled, SettingFilled, SmileFilled, BookFilled, RiseOutlined} from "@ant-design/icons";
import 'bootstrap/dist/css/bootstrap.css';
import Landing from "./components/landing/Landing";
import Introduction from "./components/introduction/Introduction";
import Learn from "./components/learn/Learn";
import IntroduceYourself from './components/introduceYourself/IntroduceYourself';
import Hands from "./components/handtrackingstate/HandTracking";
import HandGestureComparison from "./components/handtrackingstate/HandTracking";
import Tutorial from "./components/tutorial/Tutorial";
import DropDownHelp from "./components/dropdownhelp/DropDownHelp";
import SignIn from "./components/signin/SignIn";
import DictionaryLearn from "./components/learn/DictionaryLearn";
import Practice from "./components/learn/Practice";
import Units from "./components/units/Units";
import Dictionary from "./components/dictionary/Dictionary";
import SingleWordPractice from "./components/learn/SingleWordPractice";
import MultiSignLearn from "./components/learn/MultiSignLearn";



function App() {
  const navigate = useNavigate();

  const navigateHome = () => {
    navigate('/home');
  };

  const navigateAccount = () => {
    navigate('/login');
  };

  const navigateLanding = () => {
    navigate('/landing');
  };

  const navigateLearn = () => {
    navigate('/learn');
  };

  const navigateUnits = () => {
    navigate('/units')
  }

  const navigateDictionary = () => {
    navigate('/dictionary')
  }

  const navigateIntroduceYourself = () => {
    navigate('/introduceYourself')
  }

  

  const navigateTutorial = () => {
    const current = localStorage.getItem("current");
    if (current) {
      const newURL = `/tutorial/${String(current)}`
      navigate(newURL);
    }
    else {
      navigate('/tutorial/1'); // default current practice to 1, a
    }
  };

  const navigatePractice = () => {
    const current = localStorage.getItem("current");
    if (current) {
      const newURL = `/practice/${String(current)}`
      navigate(newURL);
    }
    else {
      navigate('/practice/1'); // default current TUTORIAL to 1, a
    }
  };

  const navigateSettings = () => {
    navigate('/settings');
  };

  return (
      <div className="App">
        <div className={"bottomnavWrapper"}>
          <center>
            <div className="bottomnav">
              <button type="button" className="reactButton" onClick={navigateLanding}><HomeFilled/></button>
              <button type="button" className="reactButton" onClick={navigateUnits}><RiseOutlined/></button>
              <button type="button" className="reactButton" onClick={navigateDictionary}><BookFilled/></button>
              <button type="button" className="reactButton" onClick={navigateSettings}><SettingFilled/></button>
            </div>
          </center>
        </div>

        <Routes>
          <Route path="/" element={<Landing/>}/>
          <Route path="/landing" element={<Landing />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/learn/:exerciseID" element={<MultiSignLearn  />} />
          <Route path="/practice/:exerciseID" element={<Practice  />} />
          <Route path="/dictionary/:wordID" element={<SingleWordPractice  />} />
          <Route path="/dictionary/" element={<Dictionary />} />
          <Route path="/units" element={<Units />} />
          <Route path="/units/introduceYourself" element={<IntroduceYourself />} />
          <Route path={"/dropdown"} element={<DropDownHelp/>} />
          <Route path ={"/signin"} element = {<SignIn/>} />
        </Routes>
      </div>
  )
}

export default App;
