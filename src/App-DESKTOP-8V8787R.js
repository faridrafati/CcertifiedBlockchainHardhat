import React, { Component } from 'react';
import { Route, Redirect, Switch } from "react-router-dom";
import CoderToken from './coderToken';
import './App.css';
import VotingContract from './votingContract';
import NavBar from './navBar';
import NotFound from './notFound';
import CertChat from './CertChat';
import Task from './Task';
import Auction from './Auction';
import WeightedVoting from './WeightedVoting';
import Certificate from './certificate';
import BlockchainPoll from './blockchainPoll';
import PetShop from './petShop';


class App extends Component {
  render() {
    return (
      <React.Fragment>
        <NavBar />
        <main className="container">
          <Switch>

            <Route path="/token" component={CoderToken} />
            <Route path="/voting" component={VotingContract} />
            <Route path="/weightedVoting" component={WeightedVoting} />
            <Route path="/chat" component={CertChat} />
            <Route path="/todo" component={Task} />
            <Route path="/auction" component={Auction} />
            <Route path="/certificate" component={Certificate} />
            <Route path="/pollSurvey" component={BlockchainPoll} />
            <Route path="/petAdoption" component={PetShop} />
            <Route path="/not-found" component={NotFound} />
            <Redirect from="/" exact to="/token" />
            <Redirect to="/not-found" />
          </Switch>
        </main>
    </React.Fragment>
    );
  }
}

export default App;
