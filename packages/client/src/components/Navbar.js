import {NAV_TAB_NAMES} from '../constants';
import './Navbar.css';


export const Navbar = ({selectedTab, onTabClick}) => {
  const getSelectedTabClass = (tabName) => {
    return `Navbar-tab ${tabName === selectedTab ? 'Navbar-tab-selected' : ''}`;
  }
  return (
    <div className="Navbar-container">
      <div className={getSelectedTabClass(NAV_TAB_NAMES.WEATHER)}>
        <button onClick={onTabClick(NAV_TAB_NAMES.WEATHER)} className="Navbar-button">Weather</button>
      </div>
      <div className={getSelectedTabClass(NAV_TAB_NAMES.CLOCK)}>
        <button onClick={onTabClick(NAV_TAB_NAMES.CLOCK)} className="Navbar-button">Clock</button>
      </div>
      <div className={getSelectedTabClass(NAV_TAB_NAMES.BOTH)}>
        <button onClick={onTabClick(NAV_TAB_NAMES.BOTH)} className="Navbar-button">Both</button>
      </div>
    </div>
  );
} 