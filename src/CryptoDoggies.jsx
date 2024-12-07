import React from "react";
import Web3 from "web3/dist/web3.min";
import {
  CRYPTODOGGIES_ABI,
  CRYPTODOGGIES_ADDRESS,
} from "./components/config/CryptoDoggiesConfig";
import HideShow from "./HideShow";
import resetProvider from "./resetProvider";
import DogImage from "./components/images/pawbg.png";
import doggyidparser from "./components/doggyidparser";
import { TextField, Button, FormControlLabel, Switch } from "@mui/material";

class CryptoDoggies extends resetProvider {
  state = {
    web3: new Web3(Web3.givenProvider || "http://localhost:8545"),
    network: "",
    account: "",
    Contract: "",
    isMetaMask: "",
    owner: "",
    tasks: [],
    inputs: {
      name: "",
      owner: "",
      price: "",
      newContractOwner: "",
    },
    status: "",
    doggies: [
      {
        name: "",
        dna: "",
        nextPrice: "",
        owner: "",
      },
    ],
    totalSupply: "",
    paused: false,
  };

  componentDidMount = () => {
    this.checkMetamask();
    this.tokenContractHandler();
  };
  tokenContractHandler = async () => {
    await this.initWeb();
    await this.initContract(CRYPTODOGGIES_ABI, CRYPTODOGGIES_ADDRESS);
    await this.extraInitContract();
  };

  extraInitContract = async () => {
    await this.getAllTokens();
  };

  getAllTokens = async () => {
    let { web3, Contract, paused } = this.state;
    console.log(Contract);
    let allTokens = await Contract.methods.getAllTokens().call();
    paused = await Contract.methods.paused().call();
    let doggies = [];
    for (let i = 0; i < allTokens[0].length; i++) {
      doggies[i] = {
        name: allTokens[0][i],
        dna: allTokens[1][i],
        price: web3.utils.fromWei(allTokens[2][i], "ether"),
        nextPrice: web3.utils.fromWei(allTokens[3][i], "ether"),
        owner: allTokens[4][i],
      };
    }
    this.setState({ doggies, paused });

    for (let i = 0; i < allTokens[0].length; i++) {
      this.generateDoggyImage(
        this.replaceAt(doggies[i].dna, 2, "00"),
        4,
        "doggy-canvas-" + i
      );
    }
  };

  replaceAt = function (thisWord, index, replacement) {
    return (
      thisWord.substring(0, index) +
      replacement +
      thisWord.substring(index + replacement.length)
    );
  };

  generateDoggyImage = (doggyId, size, canvas) => {
    size = size || 10;
    var data = doggyidparser(doggyId);
    var canvas = document.getElementById(canvas);
    canvas.width = size * data.length;
    canvas.height = size * data[1].length;
    var ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-over";
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        var color = data[i][j];
        if (color) {
          if (color === "#ffffff") {
            color = "#CC6600";
          }
          ctx.fillStyle = color;
          ctx.fillRect(i * size, j * size, size, size);
        }
      }
    }
    return canvas.toDataURL();
  };

  inputHandler = (e) => {
    let { inputs } = this.state;
    inputs[e.currentTarget.id] = e.currentTarget.value;
    this.setState({ inputs });
    console.log(inputs);
  };

  pausing = async (e) => {
    let TxId = "";
    e.preventDefault();
    let { account, Contract, paused } = this.state;
    if (paused) {
      await Contract.methods
        .unpause()
        .send({ from: account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Unpausing is in Progress");
          } else {
            console.log(error);
            this.notify("error", "Unpausing is Failed: " + error.message);
          }
        });
    } else {
      await Contract.methods
        .pause()
        .send({ from: account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Pausing is in Progress");
          } else {
            console.log(error);
            this.notify("error", "Pausing is Failed: " + error.message);
          }
        });
    }

    this.notify("success", "Pausing/Unpausing is Done: " + TxId);
    this.setState({ paused: !paused });
  };

  setOwner = async (e) => {
    let { inputs } = this.state;
    let TxId = "";
    e.preventDefault();
    let { account, Contract } = this.state;
    await Contract.methods
      .setOwner(inputs.newContractOwner)
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Adding new Owner is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Adding new Owner is Failed: " + error.message);
        }
      });
    this.notify("success", "Adding new Owner is Done: " + TxId);
    await this.tokenContractHandler();
  };

  addDoggy = async (e) => {
    let { web3 } = this.state;
    let TxId = "";
    e.preventDefault();
    let { inputs, account, Contract } = this.state;
    if (inputs.price === "" || inputs.owner === "") {
      await Contract.methods
        .createToken(inputs.name)
        .send({ from: account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Adding Doggy is in Progress");
          } else {
            console.log(error);
            this.notify("error", "Adding Doggy is Failed: " + error.message);
          }
        });
    } else {
      await Contract.methods
        .createToken(
          inputs.name,
          inputs.owner,
          web3.utils.toWei(inputs.price, "ether")
        )
        .send({ from: account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Adding Doggy is in Progress");
          } else {
            console.log(error);
            this.notify("error", "Adding Doggy is Failed: " + error.message);
          }
        });
    }

    this.notify("success", "Adding Doggy is Done: " + TxId);
    await this.getAllTokens();
  };

  buyHandler = async (index, nextPrice) => {
    let { web3 } = this.state;
    let TxId = "";
    let { account, Contract } = this.state;

    await Contract.methods.purchase(index).send(
      {
        from: account,
        gas: "1000000",
        value: web3.utils.toWei(nextPrice, "ether"),
      },
      (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Purchasing Doggy is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Purchasing Doggy is Failed: " + error.message);
        }
      }
    );

    this.notify("success", "Purchasing Doggy is Done: " + TxId);
    await this.getAllTokens();
  };


  withdrawBalance = async () => {
    let { web3 } = this.state;
    let TxId = "";
    let { account, Contract } = this.state;

    await Contract.methods.withdrawBalance('0x0000000000000000000000000000000000000000',0).send(
      {
        from: account,
        gas: "1000000",
      },
      (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "withdraw Balance Doggy is in Progress");
        } else {
          console.log(error);
          this.notify("error", "withdraw Balance Doggy is Failed: " + error.message);
        }
      }
    );

    this.notify("success", "withdraw Balance Doggy is Done: " + TxId);
    await this.getAllTokens();
  };


  render() {
    let { doggies, owner, account, inputs, paused } = this.state;
    if (owner !== account || account === "") {
      return (
        <div className="container">
          <section
            className="section text-center"
            style={{ backgroundImage: `url(${DogImage})` }}
          >
            <h1>Doggies Shop</h1>
            <HideShow
              currentAccount={this.state.currentAccount}
              contractAddress={CRYPTODOGGIES_ADDRESS}
              chainId={this.state.chainId}
            />
          </section>
          <div className="row">
            {doggies.map((doggy, index) => (
              <div
                className="card col-3"
                style={{
                  width: "19rem",
                  margin: "8px",
                  border: "secondary",
                  textAlign: "left",
                }}
                key={index}
              >
                <div className="card-header" style={{ textAlign: "center" }}>
                  <h5>
                    <b>{doggy.name}</b>
                  </h5>
                </div>
                <canvas
                  className="card-img-top "
                  id={"doggy-canvas-" + index}
                  style={{ width: "100%" }}
                ></canvas>
                <div className="card-body">
                  <p className="card-text">
                    <b>DNA: </b>
                    {doggy.dna}
                  </p>
                  <p className="card-text">
                    <b>Price: </b> {doggy.nextPrice} ether
                  </p>
                  <p className="card-text">
                    <b>Owner: </b>
                    {doggy.owner}
                  </p>
                  <form>
                    <div className="form-group input-group">
                      {doggy.owner !== account ? (
                        <input
                          className="form-control"
                          type="number"
                          id="doggyPrice"
                          defaultValue={doggy.nextPrice}
                          disabled={paused || doggy.owner === account}
                        ></input>
                      ) : null}

                      <button
                        className={
                          "btn btn-buy btn-" +
                          (doggy.owner !== account ? "primary" : "success")
                        }
                        type="submit"
                        id="doggyBuyButton"
                        disabled={paused || doggy.owner === account}
                        onClick={() => this.buyHandler(index, doggy.nextPrice)}
                      >
                        {doggy.owner === account ? "OWNED" : "Buy"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <section
            className="section bg-light text-center"
            style={{ backgroundImage: `url(${DogImage})` }}
          >
            <h1>Doggies Shop (Admin Section)</h1>
            <HideShow
              currentAccount={this.state.currentAccount}
              contractAddress={CRYPTODOGGIES_ADDRESS}
              chainId={this.state.chainId}
              owner={owner}
            />
          </section>
          <br />
          <form>
            <div className="form-group input-group">
              <br />
              <Button
                variant="contained"
                color="warning"
                onClick={this.withdrawBalance}
              >
                Withdraw Balance
              </Button>
            </div>
          </form>
          <hr />
          <form>
            <div className="form-group input-group">
              <TextField
                id="newContractOwner"
                label="Contract Owner Address:"
                variant="outlined"
                sx={{ width: "415px" }}
                style={{ margin: "10px 15px" }}
                size="small"
                value={inputs.newContractOwner}
                onChange={this.inputHandler}
              />
              <br />

              <br />
              <Button
                variant="contained"
                color="warning"
                onClick={this.setOwner}
                disabled={inputs.newContractOwner.length === 0}
              >
                Change Owner Address
              </Button>
            </div>
          </form>
          <hr />
          <form>
            <TextField
              id="name"
              label="Doggies Name:"
              variant="outlined"
              style={{ margin: "10px 15px" }}
              size="small"
              value={inputs.name}
              onChange={this.inputHandler}
            />
            <TextField
              id="price"
              label="Price:"
              variant="outlined"
              style={{ margin: "10px 15px" }}
              size="small"
              value={inputs.price}
              onChange={this.inputHandler}
            />
            <TextField
              id="owner"
              label="Doggies Owner Address:"
              variant="outlined"
              sx={{ width: "415px" }}
              style={{ margin: "10px 15px" }}
              size="small"
              value={inputs.owner}
              onChange={this.inputHandler}
            />
            <br />

            <br />
            <Button
              variant="contained"
              color="primary"
              onClick={this.addDoggy}
              disabled={inputs.name.length === 0}
            >
              Add Doggy
            </Button>
            <br />
            <FormControlLabel
              control={<Switch checked={paused} />}
              label="Pausing Token Sale"
              onClick={this.pausing}
            />
            <br />
            <hr />
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">DNA</th>
                  <th scope="col">Price (Eth)</th>
                  <th scope="col">Next Price (Eth)</th>
                  <th scope="col">Owner</th>
                </tr>
              </thead>
              <tbody>
                {doggies.map((doggy, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{doggy.name}</td>
                    <td>{doggy.dna}</td>
                    <td>{doggy.price}</td>
                    <td>{doggy.nextPrice}</td>
                    <td>{doggy.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
        </div>
      );
    }
  }
}
export default CryptoDoggies;
