import React from "react";
import Web3 from "web3/dist/web3.min";
import "bootstrap/dist/css/bootstrap.min.css";
import {
   WEIGHTEDVOTING_ABI,
   WEIGHTEDVOTING_ADDRESS,
} from "./components/config/WeightedVotingConfig";
import resetProvider from "./resetProvider";
import HideShow from "./HideShow";
class WeightedVoting extends resetProvider {
  state = {
    web3: new Web3(Web3.givenProvider || "http://localhost:8545"),
    network: "",
    account: "",
    Contract: [],
    isMetaMask: "",
    weight: 1,
    address: "",
    candidatesList: [
      { name: "", voteCount: "" },
      { name: "", voteCount: "" },
      { name: "", voteCount: "" },
    ],
    accountBid: "",
    status:'',
    enableButton:false
  };

  componentDidMount = () => {
    this.checkMetamask();
    this.tokenContractHandler();
  };
  tokenContractHandler = async () => {
    await this.initWeb();
    await this.initContract(
       WEIGHTEDVOTING_ABI,
       WEIGHTEDVOTING_ADDRESS
    );
    await this.extraInitContract();
  };

  extraInitContract = async () => {
    let { Contract, candidatesList } = this.state;
    let list = await Contract.methods.getAllCandidatesWithVotes().call();
    for (let i = 0; i < 3; i++) {
      candidatesList[i].name = list[2 * i];
      candidatesList[i].voteCount = list[2 * i + 1];
    }
    await this.isAuthorizedVoter();
    this.setState({ candidatesList });
  };

  getCandidatesList = async () => {
    let { candidatesList, Contract } = this.state;
    let list = await Contract.methods.getAllCandidatesWithVotes().call();
    for (let i = 0; i < 3; i++) {
      candidatesList[i].name = list[2 * i];
      candidatesList[i].voteCount = list[2 * i + 1];
    }
    return candidatesList;
  };

  isAuthorizedVoter = async (e) => {
    let { Contract, account} = this.state;
    let isAuthorized = await Contract.methods
      .isAuthorizedVoter()
      .call({ from: account });
      let status;
      if (isAuthorized[0] === "0") {
        status = "You Are Not Authorized";
      } else {
        status = "You Are Authorized ";
  
        if (isAuthorized[1] === false) {
            status = status + "& You Can Vote Now";
        } else {
            status = status + "& You have Voted";
        }
      };
      let enableButton = (isAuthorized[0] !== "0") && (!isAuthorized[1]);
      console.log(enableButton);
      this.setState({ status, enableButton });
  };

  authorizeVoter = async (e) => {
    let TxId = "";
    e.preventDefault();
    let { account, address, weight, Contract } = this.state;
    await Contract.methods
      .authorizeVoter(address, weight)
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Authorizing is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Authorizing is Failed: " + error.message);
        }
      });
    await this.extraInitContract();
    this.notify("success", "Authorizing is Done: " + TxId);
  };

  voteForCandidate = async (index) => {
    let TxId = "";
    let { account, Contract } = this.state;
    await Contract.methods
      .voteForCandidate(index)
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Voting is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Voting is Failed: " + error.message);
        }
      });
    await this.extraInitContract();
    this.notify("success", "Voting is Done: " + TxId);
  };

  weightHandler = (e) => {
    let weight = this.state.weight;
    weight = e.currentTarget.value;
    this.setState({ weight });
  };

  addressHandler = (e) => {
    let address = this.state.address;
    address = e.currentTarget.value;
    this.setState({ address });
  };

  render() {
    let { candidatesList, owner, account, address, weight, status, enableButton } = this.state;

    return (
      <div className="container">
        <section className="bg-light text-center">
          <h1>Weighted Voting Contract</h1>
          <HideShow
            currentAccount={this.state.currentAccount}
            contractAddress={ WEIGHTEDVOTING_ADDRESS}
            chainId={this.state.chainId}
            owner={owner}
          />
        </section>
        <hr />
        {owner === account ? (
          <div className="container">
            <div id="votersRow" className="row">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Candidate Names</th>
                    <th scope="col">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatesList.map((candidate, index) => (
                    <tr key={index}>
                      <th scope="row">{index}</th>
                      <td>{candidate["name"]}</td>
                      <td>{candidate["voteCount"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="form-authorize">
              <label htmlFor="usr">Authorized Voter Weight:</label>
              <input
                type="text"
                className="form-control"
                id="weight"
                value={weight}
                onChange={this.weightHandler}
                style={{ marginBottom: "10px" }}
              />
              <label htmlFor="usr">Authorized Voter Address:</label>
              <input
                type="text"
                className="form-control"
                id="address"
                value={address}
                onChange={this.addressHandler}
                style={{ marginBottom: "10px" }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.authorizeVoter}
              >
                Authorize
              </button>
            </div>
          </div>
        ) : (
          <div id="votingTemplate">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Candidate Names</th>
                  <th scope="col">Votes</th>
                  <th scope="col">Vote</th>
                </tr>
              </thead>
              <tbody>
                {candidatesList.map((candidate, index) => (
                  <tr key={index}>
                    <th scope="row">{index}</th>
                    <td>{candidate["name"]}</td>
                    <td>{candidate["voteCount"]}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        disabled={!enableButton}
                        onClick={() => this.voteForCandidate(index)}
                      >
                        VOTE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <label className="form-label">Status: </label>
            <br />
            <span className={!enableButton === true ?"badge bg-secondary":"badge bg-primary"}>{status}</span>
            <br />
          </div>
        )}
      </div>
    );
  }
}

export default WeightedVoting;
