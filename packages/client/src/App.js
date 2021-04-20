import {useState} from 'react';
import {useHistory, useLocation} from "react-router-dom";
import {Header} from './components/Header_old';
import {Main} from './components/Main';
import {Navbar} from './components/Navbar';
import {NAV_TAB_NAMES} from './constants';
import {ROUTES} from './constants';
import './App.css';

function App() {
  const [selectedTab, updatedSelectedTab] = useState(NAV_TAB_NAMES.CALENDAR);
  let history = useHistory();
  let location = useLocation();
  const locationName = location.pathname.replace('/', '');

  // Sets a string value equal to the selected tab
  const handleSelectedTabClick = (tabName) => () => {
    history.push(ROUTES[tabName?.toUpperCase()]);
    return updatedSelectedTab(tabName);
  }
  return (
    <div className="App">
      <div className="App-background App-layout-grid">
        {/* {isLoading ? <div>Loading...</div> : null} */}
        <Header className="App-layout-grid-item" />
        <Main className="App-layout-grid-item" history={history} selectedTab={selectedTab} />
        <Navbar 
          className="App-layout-grid-item" 
          selectedTab={locationName} 
          onTabClick={handleSelectedTabClick}
          />
      </div>
    </div>
  );
}

export default App;
