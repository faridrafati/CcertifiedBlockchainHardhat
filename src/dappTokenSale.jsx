import React from "react";
import Web3 from "web3/dist/web3.min";
import {
  DAPPTOKENSALE_ABI,
  DAPPTOKENSALE_ADDRESS,
} from "./components/config/DappTokenSaleConfig";
import {
  DAPPTOKEN_ABI,
  DAPPTOKEN_ADDRESS,
} from "./components/config/DappTokenConfig";
import HideShow from "./HideShow";
import resetProvider from "./resetProvider";

class DappTokenSale extends resetProvider {
  state = {
    web3: new Web3(Web3.givenProvider || "http://localhost:8545"),
    network: "",
    account: "",
    Contract: [],
    DappContract: [],
    SaleContract: [],
    isMetaMask: "",
    owner: "",
    address: "",
    amount: "",
    buyAmount: "",
    name: "",
    symbol: "",
    decimals: "",
    balance: "",
    totalSupply: "",
    tokenPrice: "",
    tokensSold: "",
  };

  componentDidMount() {
    this.checkMetamask();
    this.tokenContractHandler();
  }

  tokenContractHandler = async () => {
    await this.initWeb();
    await this.initContract(DAPPTOKEN_ABI, DAPPTOKEN_ADDRESS);
    let DappContract = this.state.Contract;
    this.setState({ DappContract });
    await this.initContract(DAPPTOKENSALE_ABI, DAPPTOKENSALE_ADDRESS);
    let SaleContract = this.state.Contract;
    this.setState({ SaleContract });
    await this.extraInitContract();
  };

  extraInitContract = async () => {
    let { DappContract, SaleContract } = this.state;
    const name = await DappContract.methods.name().call();
    this.setState({ name });
    const decimals = await DappContract.methods.decimals().call();
    this.setState({ decimals });
    const symbol = await DappContract.methods.symbol().call();
    this.setState({ symbol });
    const totalSupply = await DappContract.methods.totalSupply().call();
    this.setState({ totalSupply });
    const balance =
      (await DappContract.methods.balanceOf(this.state.account).call()) /
      10 ** parseInt(decimals);
    this.setState({ balance });

    const tokenPrice = await SaleContract.methods.tokenPrice().call();
    this.setState({ tokenPrice });
    const tokensSold = await SaleContract.methods.tokensSold().call();
    this.setState({ tokensSold });
  };

  changeHandler = (e) => {
    let { address, amount, buyAmount } = this.state;
    let { name, value } = e.currentTarget;
    if (name === "TransferAddress") {
      address = value;
    } else if (name === "TransferAmount") {
      amount = value;
    } else if (name === "BuyAmount") {
      buyAmount = value;
    }
    this.setState({ address, amount, buyAmount });
  };

  transferHandler = async () => {
    let address = this.state.address;
    let amount = this.state.amount;
    let DappContract = this.state.DappContract;
    let decimals = this.state.decimals;
    let TxId = "";
    for (let i = 0; i < decimals; i++) {
      amount = amount + "0";
    }

    await DappContract.methods
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
      (await DappContract.methods.balanceOf(this.state.account).call()) /
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

  buyHandler = async () => {
    let { buyAmount, SaleContract, decimals, DappContract, tokenPrice } =
      this.state;
    let TxId = "";
    for (let i = 0; i < decimals; i++) {
      buyAmount = buyAmount + "0";
    }

    await SaleContract.methods
      .buyTokens(buyAmount)
      .send(
        {
          from: this.state.account,
          value: tokenPrice * buyAmount,
          gas: "1000000",
        },
        (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Pending Transactions on Ethereum");
          } else {
            this.notify("error", error.message);
          }
        }
      );
    const balance =
      (await DappContract.methods.balanceOf(this.state.account).call()) /
      10 ** parseInt(decimals);

    const tokensSold = await SaleContract.methods.tokensSold().call();
    this.setState({ balance , tokensSold});
    this.notify("success", "TX is Done: " + TxId);
  };

  endSaleFunction = async () => {
    let { buyAmount, SaleContract, decimals, DappContract, tokenPrice } =
      this.state;
    let TxId = "";

    await SaleContract.methods
      .endSale()
      .send(
        {
          from: this.state.account,
          gas: "1000000",
        },
        (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Pending Transactions on Ethereum");
          } else {
            this.notify("error", error.message);
          }
        }
      );
    const balance =
      (await DappContract.methods.balanceOf(this.state.account).call()) /
      10 ** parseInt(decimals);

    const tokensSold = await SaleContract.methods.tokensSold().call();
    this.setState({ balance , tokensSold});
    this.notify("success", "TX is Done: " + TxId);
  };

  render() {
    let { address, amount, tokensSold, totalSupply, buyAmount } = this.state;
    let progress = Math.floor((100 * tokensSold) / totalSupply);
    return (
      <div>
        <div className="container">
          <section className="bg-light text-center">
            <h1>Crowd Sale of {this.state.name}</h1>
            <HideShow
              currentAccount={this.state.currentAccount}
              contractAddress={DAPPTOKENSALE_ADDRESS}
              chainId={this.state.chainId}
            />
          </section>
          <div className="row">
            <div className="col-6 col-md-6">
              <div className="card bg-primary bg-opacity-10">
                <div className="card-header">
                  <h3 className="mb-0">{this.state.name} Wallet</h3>
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
                  <button
                    className="btn btn-danger m-2"
                    id="transferButton"
                    type="button"
                    style={{ marginTop: "9px" }}
                    onClick={this.endSaleFunction}
                  >
                    End of Sale
                  </button>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-6">
              <div className="card bg-success bg-opacity-10">
                <div className="card-header">
                  <h3 className="mb-0">{this.state.name} CrowdSale</h3>
                </div>
                <div className="card-body">
                  <p>
                    Token price is{" "}
                    <span>{this.state.tokenPrice / 10 ** 18}</span> Ether. You
                    currently have <span>{this.state.balance}</span>&nbsp;
                    {this.state.symbol}.
                  </p>
                  <input
                    type="number"
                    id="BuyAmount"
                    name="BuyAmount"
                    className="form-control"
                    placeholder="Amount"
                    value={buyAmount}
                    style={{ marginTop: "7px" }}
                    onChange={this.changeHandler}
                  />
                  <button
                    className="btn btn-primary m-2"
                    id="buyButton"
                    type="button"
                    style={{ marginTop: "9px" }}
                    onClick={this.buyHandler}
                  >
                    Buy Tokens
                  </button>
                </div>
                <div className="card-footer">
                  <div className="progress bg-danger bg-opacity-10">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progress}%` }}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {progress}%
                    </div>
                  </div>
                  <p className="text-center">
                    <span>{tokensSold}</span> / <span>{totalSupply}</span>{" "}
                    tokens sold
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DappTokenSale;
