import React from "react";
import Web3 from "web3/dist/web3.min";
import {
  EMAIL_ABI,
  EMAIL_ADDRESS,
} from "./components/config/EmailConfig";
import resetProvider from "./resetProvider";
import HideShow from "./HideShow";

class Email extends resetProvider {
  state = {
    web3: new Web3(Web3.givenProvider || "http://localhost:8545"),
    network: "",
    account: "",
    Contract: "",
    isMetaMask: "",
    owner: "",
    registeredUsersAddress: [],
    balance: 0,
    status: "",
    myInboxSize: 0,
    myOutboxSize: 0,
    selectedAddress: "",
    display: "none",
    newMessage: "",
    maxLength:32,
  };

  componentDidMount = () => {
    this.checkMetamask();
    this.tokenContractHandler();
  };

  tokenContractHandler = async () => {
    await this.initWeb();
    await this.initContract(EMAIL_ABI, EMAIL_ADDRESS);
    await this.extraInitContract();
  };

  extraInitContract = async () => {
    await this.getContractProperties();
    await this.checkUserRegistration();
    await this.getMyInboxSize();
    await this.getMyOutboxSize();
  };

  getContractProperties = async () => {
    let { Contract } = this.state;
    let contractProperties = await Contract.methods
      .getContractProperties()
      .call();
    let owner = contractProperties[0];
    let registeredUsersAddress = contractProperties[1];
    this.setState({ owner, registeredUsersAddress });
  };

  checkUserRegistration = async () => {
    let { account, Contract, status } = this.state;
    if (
      await Contract.methods.checkUserRegistration().call({ from: account })
    ) {
      status = "User has been registered";
    } else {
      status = "You are new User you need to be registered now";
      this.setState({ status });
      if (
        window.confirm(
          "New user: we need to setup an inbox for you on the Ethereum blockchain. For this you will need to submit a transaction in MetaMask. You will only need to do this once."
        )
      ) {
        this.registerUser();
      } else {
        return null;
      }
    }
    this.setState({ status });
  };

  registerUser = async () => {
    let TxId = "";
    let { account, Contract, status } = this.state;
    if (status !== "User has been registered") {
      status = "User registration:(open MetaMask->submit->wait)";
      await Contract.methods
        .registerUser()
        .send({ from: account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Registration is in Progress");
          } else {
            console.log(error);
            this.notify("error", "Registration is Failed: " + error.message);
          }
        });
      this.notify("success", "Registration is Done: " + TxId);
      await this.extraInitContract();
      var gasUsedWei = Contract.receipt.gasUsed;
      status = "User is registered...gas spent: " + gasUsedWei + "(Wei)";
      alert(
        "A personal inbox has been established for you on the Ethereum blockchain. You're all set!"
      );
      this.setState({ status });
    }
  };

  getMyInboxSize = async () => {
    let { account, Contract, myInboxSize, display } = this.state;
    let value = await Contract.methods.getMyInboxSize().call({ from: account });
    myInboxSize = value[1];
    this.setState({ myInboxSize });
    if (myInboxSize > 0) {
      display = "inline";
      this.setState({ display });
      return this.receiveMessages();
    } /*else {
            display = "none";
            this.setState({display});
            return null;
        }*/
  };

  getMyOutboxSize = async () => {
    let { account, Contract, myOutboxSize, display } = this.state;
    let value = await Contract.methods.getMyInboxSize().call({ from: account });
    myOutboxSize = value[0];
    this.setState({ myOutboxSize });
    if (myOutboxSize > 0) {
      display = "inline";
      this.setState({ display });
      return this.sentMessages();
    } /*else {
            display = "none";
            this.setState({display});
            return null;
        }*/
  };

  sendMessage = async () => {
    let { newMessage, account } = this.state;
    let TxId = "";
    let { web3, Contract } = this.state;
    var receiver = document.getElementById("receiver").value;
    if (receiver === "") {
      this.setState({ status: "Send address cannot be empty" });
      return null;
    }
    if (!web3.utils.isAddress(receiver)) {
      this.setState({ status: "You did not enter a valid Ethereum address" });
      return null;
    }
    if (newMessage === "") {
      this.setState({ status: "Oops! Message is empty" });
      //return null;
    }
    newMessage = web3.utils.fromAscii(newMessage);

    this.setState({ status: "Sending message:(open MetaMask->submit->wait)" });
    await Contract.methods
      .sendMessage(receiver, newMessage)
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Sending Message is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Sending Message is Failed: " + error.message);
        }
      });
    await this.extraInitContract();
    this.setState({ newMessage: "" });
    this.notify("success", "Sending Message is Done: " + TxId);
  };

  clearInbox = async () => {
    let TxId = "";
    let { Contract, account } = this.state;
    await Contract.methods
      .clearInbox()
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Clearing Inbox is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Clearing Inbox is Failed: " + error.message);
        }
      });
    await this.extraInitContract();
    this.notify("success", "Clearing Inbox is Done: " + TxId);
    var clearInboxButton = document.getElementById("clearInboxButton");
    clearInboxButton.parentNode.removeChild(clearInboxButton);
    //  $("#mytable tr").remove();
    document.getElementById("receivedTable").style.display = "none";
    alert("Your inbox was cleared");
    this.setState({ status: "Inbox cleared" });
  };

  receiveMessages = async () => {
    let { web3, Contract, account, myInboxSize } = this.state;
    let value = await Contract.methods
      .receiveMessages()
      .call({}, { from: account });
    var content = value[0];
    var timestamp = value[1];
    var sender = value[2];

    for (var m = 0; m < myInboxSize; m++) {
      var tbody = document.getElementById("mytable-receive");
      var row = tbody.insertRow();
      var cell1 = row.insertCell();
      let date = new Date(parseInt(timestamp[m])).toLocaleDateString("en-US");
      let time = new Date(parseInt(timestamp[m])).toLocaleTimeString("en-US");
      cell1.innerHTML = date + "<br />" + time;
      var cell2 = row.insertCell();
      cell2.innerHTML = sender[m];
      var cell3 = row.insertCell();

      var thisRowReceivedText = content[m].toString();
      var receivedAscii = web3.utils.toAscii(thisRowReceivedText);
      cell3.innerHTML = receivedAscii;
      cell3.hidden = false;
    }
    var table = document.getElementById("mytable");
    var rows = table.rows;
    for (var i = 1; i < rows.length; i++) {
      rows[i].onclick = function (e) {
        var thisRowContent = this.cells[2].innerHTML;
        document.getElementById("reply").innerHTML = thisRowContent;
        document.getElementById("receiver").value = this.cells[1].innerHTML;
      };
    }
  };

  sentMessages = async () => {
    let { web3, Contract, account, myOutboxSize } = this.state;
    let value = await Contract.methods
      .sentMessages()
      .call({}, { from: account });
    var content = value[0];
    var timestamp = value[1];
    var receiver = value[2];

    for (var m = 0; m < myOutboxSize; m++) {
      var tbody = document.getElementById("mytable-sent");
      var row = tbody.insertRow();
      var cell1 = row.insertCell();
      let date = new Date(parseInt(timestamp[m])).toLocaleDateString("en-US");
      let time = new Date(parseInt(timestamp[m])).toLocaleTimeString("en-US");
      cell1.innerHTML = date + "<br />" + time;
      var cell2 = row.insertCell();
      cell2.innerHTML = receiver[m];
      var cell3 = row.insertCell();

      var thisRowReceivedText = content[m].toString();
      var receivedAscii = web3.utils.toAscii(thisRowReceivedText);
      cell3.innerHTML = receivedAscii;
      cell3.hidden = false;
    }

    var table = document.getElementById("mytable");
    var rows = table.rows;

    for (var i = 1; i < rows.length; i++) {
      rows[i].onclick = function (e) {
        var thisRowContent = this.cells[2].innerHTML;
        document.getElementById("reply").innerHTML = thisRowContent;
        document.getElementById("receiver").value = this.cells[1].innerHTML;
      };
    }
  };

  copyAddressToSend = () => {
    var sel = document.getElementById("registeredUsersAddressMenu");
    var copyText = sel.options[sel.selectedIndex];
    document.getElementById("receiver").value = copyText.innerHTML;
    this.setState({ selectedAddress: copyText.innerHTML });
  };

  replyToMessage = () => {
    console.log(this.state.replyToAddress);
  };

  changeHandler = (e) => {
    let { newMessage } = this.state;
    let { value } = e.currentTarget;
    newMessage = value;
    //id ==="message" ? newMessage = value : amount = value;
    this.setState({ newMessage });
  };
  render() {
    let {
      account,
      Contract,
      registeredUsersAddress,
      balance,
      status,
      display,
      owner,
      myInboxSize,
      myOutboxSize,
      newMessage,
      selectedAddress,maxLength
    } = this.state;
    let messages = [];
    messages[0] = Contract === "" ? "Could Not Load" : Contract._address;
    messages[1] = Contract === "" ? "Could Not Load" : account;
    messages[2] = Contract === "" ? "Could Not Load" : owner;
    messages[3] = Contract === "" ? "0" : balance;
    messages[3] += " Ether";
    messages[4] =
      Contract === ""
        ? ["Could Not Load", "Could Not Load"]
        : registeredUsersAddress;
    return (
      <div>
        <section className="bg-light text-center">
          <h1>Certified Chat</h1>
          <HideShow
            currentAccount={this.state.currentAccount}
            contractAddress={EMAIL_ADDRESS}
            chainId={this.state.chainId}
            owner={owner}
          />
        </section>
        <br />
        <label>Your Contact List:</label> <br />
        <div className="row">
          <select
            className="form-select m-2 col"
            style={{ width: "auto" }}
            id="registeredUsersAddressMenu"
          >
            {messages[4].map((registeredUsersAddress, index) => {
              if (registeredUsersAddress !== account)
                return <option key={index}>{registeredUsersAddress}</option>;
            })}
          </select>

          <button
            className="btn btn-primary btn-sm col-2 m-2"
            onClick={this.copyAddressToSend}
          >
            Select
          </button>
          <div className="input-group col">
            <div className="input-group-prepend mt-2">
              <span className="input-group-text">Send to: </span>
            </div>
            <input
              type="text"
              className="form-control col mt-2 mb-2"
              id="receiver"
              spellCheck="false"
              readOnly={true}
            />
          </div>
        </div>
        <div className="">
          <div className="input-group row">
            <div className="input-group-prepend col-10">
              <div className="form-group">
                <label htmlFor="exampleFormControlTextarea1">Messages: </label>
                <textarea
                  className="form-control"
                  id="message"
                  rows="3"
                  value={newMessage}
                  onChange={this.changeHandler}
                  maxLength={maxLength}
                  required
                ></textarea>
              </div>
            </div>
            <button
              className="btn btn-success col-2 mt-4"
              id="sendMessageButton"
              label="Copy"
              onClick={this.sendMessage}
              disabled={(selectedAddress==="")||(newMessage==='')}
            >
              Send
            </button>
          </div>
        </div>
        <div id="receivedTable" style={{ display: display }}>
          <div style={{ overflow: "hidden", paddingRight: "10px" }}>
            <label htmlFor="exampleFormControlTextarea1">Received: </label>
            <textarea className="form-control" id="reply" rows="3"></textarea>​
          </div>
          <br />

          {myInboxSize === 0 ? (
            <div></div>
          ) : (
            <table className="table" id="mytable">
              <thead className="thead">
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th style={{ show: false }}>Content</th>
                </tr>
              </thead>
              <tbody id="mytable-receive"></tbody>
            </table>
          )}

          {myOutboxSize === 0 ? (
            <div></div>
          ) : (
            <table className="table" id="mytable">
              <thead className="thead">
                <tr>
                  <th>Date</th>
                  <th>To</th>
                  <th style={{ show: false }}>Content</th>
                </tr>
              </thead>
              <tbody id="mytable-sent"></tbody>
            </table>
          )}

          <button
            className="btn btn-warning m-2 col-12"
            id="clearInboxButton"
            type="clearInboxButton"
            onClick={this.clearInbox}
          >
            Clear inbox
          </button>
        </div>
        <br />
        <label className="form-label">Status: </label>
        <br />
        <span className="badge bg-primary">{status}</span>
        <br />
        <br />
      </div>
    );
  }
}

export default Email;
