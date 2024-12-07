import React from "react";
import { Link, NavLink } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';


const NavBar = () => {
  return (
    <div className="bg-dark">
      <nav className="navbar navbar-dark navbar-expand-lg">
        <Link className="navbar-brand" to="/">
          Home
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <li className="nav-item dropdown bg-dark">
              <a className="nav-link dropdown-toggle"  id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Tokens
              </a>
              <ul className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink className="nav-item nav-link" to="/token">
                    Tokens Wallet
                  </NavLink>
                </li>
                <li>            
                  <NavLink className="nav-item nav-link" to="/crowdSale">
                    Tokens CrowdSale
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown bg-dark">
              <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Voting
              </a>
              <ul className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink className="nav-item nav-link" to="/voting">
                    Voting(Conventional)
                  </NavLink>
                </li>
                <li>            
                  <NavLink className="nav-item nav-link" to="/weightedVoting">
                    Voting(Authorized)
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown bg-dark">
              <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Chat
              </a>
              <ul className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink className="nav-item nav-link" to="/chat">
                    Cert Email
                  </NavLink>
                </li>
                <li>            
                  <NavLink className="nav-item nav-link" to="/chatBoxStable">
                    Cert Chat
                  </NavLink>
                </li>
                <li>            
                  <NavLink className="nav-item nav-link" to="/chatBox">
                    Chat Game
                  </NavLink>
                </li>

              </ul>
            </li>

            <NavLink className="nav-item nav-link" to="/todo">
              Todo List
            </NavLink>
            <NavLink className="nav-item nav-link" to="/auction">
              Auction
            </NavLink>
            <NavLink className="nav-item nav-link" to="/certificate">
              Certificate
            </NavLink>
            <NavLink className="nav-item nav-link" to="/pollSurvey">
              BlockchainPoll
            </NavLink>

            <li className="nav-item dropdown bg-dark">
              <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Shopping
              </a>
              <ul className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink className="nav-item nav-link" to="/petAdoption">
                  Pet Adoption
                  </NavLink>
                </li>
                <li>            
                  <NavLink className="nav-item nav-link" to="/doggiesShop">
                    Doggies Shop
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown bg-dark">
              <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Games
              </a>
              <ul className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink className="nav-item nav-link" to="/guessing">
                    Guessing Game
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown bg-dark">
              <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Ticket
              </a>
              <ul className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                <li>
                  <NavLink className="nav-item nav-link" to="/ticketSale">
                    Ticket Sale
                  </NavLink>
                </li>
              </ul>
            </li>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
