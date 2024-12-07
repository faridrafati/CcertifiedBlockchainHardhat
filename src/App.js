import React from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import "./components/css/App.css";
import "react-toastify/dist/ReactToastify.css";
import ModalForm from "./modalForm";
import resetProvider from "./resetProvider";
import { ToastContainer } from "react-toastify";
import NavBar from "./navBar";
import NotFound from "./notFound";

import Adoption from "./adoption";
import Auction from "./Auction";
import Certificate from "./Certificate";
import GuessingGame from "./GuessingGame";
import Task from "./Task";
import Poll from "./Poll";
import Email from "./Email";
import CryptoDoggies from "./CryptoDoggies";

import ChatBox from "./chatBoxPlus";
import ChatBoxStable from "./chatBoxStable";
import Voting from "./Voting";

//////////////////////////////////////////////////






import WeightedVoting from "./WeightedVoting";




import DappToken from "./dappToken";
import DappTokenSale from "./dappTokenSale";
import TicketSale from "./TicketSale";

class App extends resetProvider {
  state = {
    currentAccount: null,
    ethBalance: "",
    chainId: "",
    message: "Please Wait",
    buttonName: "Ok",
    modalNeed: true,
    AppNavbar: (
      <React.Fragment>
        <NavBar />
        <main className="container">
         <Switch>
            <Route path="/petAdoption" component={Adoption} />
            <Route path="/token" component={DappToken} />
            <Route path="/crowdSale" component={DappTokenSale} />
            <Route path="/voting" component={Voting} />
            <Route path="/weightedVoting" component={WeightedVoting} />
            <Route path="/chat" component={Email} />
            <Route path="/chatBox" component={ChatBox} />
            <Route path="/chatBoxStable" component={ChatBoxStable} />
            <Route path="/todo" component={Task} />
            <Route path="/auction" component={Auction} />
            <Route path="/certificate" component={Certificate} />
            <Route path="/pollSurvey" component={Poll} />
            <Route path="/doggiesShop" component={CryptoDoggies} />
            <Route path="/guessing" component={GuessingGame} />
            <Route path="/ticketSale" component={TicketSale} />
            <Route path="/not-found" component={NotFound} />
            <Redirect from="/" exact to="/token" />
            <Redirect to="/not-found" />
          </Switch>
        </main>
      </React.Fragment>
    ),
  };

  render() {
    return (
      <div>
        <ToastContainer />
        {this.state.modalNeed === true ? (
          <ModalForm
            message={this.state.message}
            buttonName={this.state.buttonName}
            onClick={this.onClickConnect}
          />
        ) : (
          <div>{this.state.AppNavbar}</div>
        )}
      </div>
    );
  }
}

export default App;
