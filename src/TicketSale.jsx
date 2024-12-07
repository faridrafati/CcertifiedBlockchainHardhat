import React from "react";
import Web3 from "web3/dist/web3.min";
import {
  TICKETSALE_ABI,
  TICKETSALE_ADDRESS,
} from "./components/config/TicketSaleConfig";
import HideShow from "./HideShow";
import resetProvider from "./resetProvider";
import doggyidparser from "./components/doggyidparser";
import { TextField, Button, FormControlLabel, Switch } from "@mui/material";
import Navigation from './components/Navigation';

class TicketSale extends resetProvider {
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
    await this.initContract(TICKETSALE_ABI, TICKETSALE_ADDRESS);
    await this.extraInitContract();
  };

  extraInitContract = async () => {
    await this.getAllTokens();
  };

  getAllTokens = async () => {
    let { web3, Contract, paused } = this.state;
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

    await Contract.methods
      .purchase(index)
      .send(
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
            this.notify(
              "error",
              "Purchasing Doggy is Failed: " + error.message
            );
          }
        }
      );

    this.notify("success", "Purchasing Doggy is Done: " + TxId);
    await this.getAllTokens();
  };

  render() {
    return (
      <div>
        <header>
          <Navigation/>
          <h2 className="header__title">
            <strong>Event</strong> Tickets
          </h2>
        </header>
      </div>
    );
  }
}
export default TicketSale;
