import React from "react";
import Web3 from "web3/dist/web3.min";
import {
  DAPPTOKEN_ABI,
  DAPPTOKEN_ADDRESS,
} from "./components/config/DappTokenConfig";
import HideShow from "./HideShow";
import resetProvider from "./resetProvider";

class DappToken extends resetProvider {
  state = {
    web3: new Web3(Web3.givenProvider || "http://localhost:8545"),
    network: "",
    account: "",
    Contract: [],
    isMetaMask: "",
    owner: "",
    address: "",
    amount: "",
    name: "",
    symbol: "",
    decimals: "",
    balance: "",
    totalSupply: "",
  };

  componentDidMount() {
    this.checkMetamask();
    this.tokenContractHandler();
  }

  tokenContractHandler = async () => {
    await this.initWeb();
    await this.initContract(DAPPTOKEN_ABI, DAPPTOKEN_ADDRESS);
    await this.extraInitContract();
  };

  extraInitContract = async () => {
    let { Contract } = this.state;
    const name = await Contract.methods.name().call();
    this.setState({ name });
    const decimals = await Contract.methods.decimals().call();
    this.setState({ decimals });
    const symbol = await Contract.methods.symbol().call();
    this.setState({ symbol });
    const totalSupply = await Contract.methods.totalSupply().call();
    this.setState({ totalSupply });
    const balance =
      (await Contract.methods.balanceOf(this.state.account).call()) /
      10 ** parseInt(decimals);
    this.setState({ balance });
  };

  changeHandler = (e) => {
    let { address, amount } = this.state;
    let { name, value } = e.currentTarget;
    name === "TransferAddress" ? (address = value) : (amount = value);
    this.setState({ address, amount });
  };

  transferHandler = async () => {
    let address = this.state.address;
    let amount = this.state.amount;
    let Contract = this.state.Contract;
    let decimals = this.state.decimals;
    let TxId = "";
    for (let i = 0; i < decimals; i++) {
      amount = amount + "0";
    }

    await Contract.methods
      .transfer(address, amount)
      .send({ from: this.state.account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Pending Transactions on Ethereum");
        } else {
          this.notify("error", error.message);
        }
      });
    const balance =
      (await Contract.methods.balanceOf(this.state.account).call()) /
      10 ** parseInt(decimals);
    this.setState({ balance });
    this.notify("success", "TX is Done: " + TxId);
  };

  addTokenFunction = async () => {
    const { ethereum } = window;
    let { symbol, decimals } = this.state;
    await ethereum
      .request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: DAPPTOKEN_ADDRESS,
            symbol: symbol,
            decimals: decimals,
          },
        },
      })
      .then((result) => {
        this.notify(
          "success",
          `${this.state.name} Token is Added to Your Wallet`
        );
      })
      .catch((error) => {
        this.notify("error", error.message);
      });
  };

  render() {
    let { address, amount } = this.setState;
    return (
      <div>
        <div className="container">
          <section className="bg-light text-center">
            <h1>{this.state.name}</h1>
            <HideShow
              currentAccount={this.state.currentAccount}
              contractAddress={DAPPTOKEN_ADDRESS}
              chainId={this.state.chainId}
            />
          </section>
          <div className="row">
            <div className="col-6 col-md-8 offset-md-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">My Wallet</h3>
                </div>
                <div className="card-body">
                  <h4>Balance</h4>
                  <strong>Balance: </strong>
                  <span id="Balance"> {this.state.balance}</span>
                  <span id="Balance"> {this.state.symbol}</span>
                  <br />
                  <h4>Transfer</h4>
                  <input
                    type="text"
                    id="TransferAddress"
                    name="TransferAddress"
                    className="form-control"
                    placeholder="Address"
                    value={address}
                    onChange={this.changeHandler}
                  />
                  <input
                    type="number"
                    id="TransferAmount"
                    name="TransferAmount"
                    className="form-control"
                    placeholder="Amount"
                    value={amount}
                    style={{ marginTop: "7px" }}
                    onChange={this.changeHandler}
                  />
                  <button
                    className="btn btn-primary m-2"
                    id="transferButton"
                    type="button"
                    style={{ marginTop: "9px" }}
                    onClick={this.transferHandler}
                  >
                    Transfer
                  </button>

                  <button
                    className="btn btn-success m-2"
                    id="transferButton"
                    type="button"
                    style={{ marginTop: "9px" }}
                    onClick={this.addTokenFunction}
                  >
                    Add Token to your wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DappToken;
