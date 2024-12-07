import React from "react";
import "./components/css/chatBox.css";
import userProfilePic from "./components/images/user-profile.png";
import Web3 from "web3/dist/web3.min";
import {
  CHATBOXPLUS_ABI,
  CHATBOXPLUS_ADDRESS,
} from "./components/config/ChatBoxPlusConfig";
import resetProvider from "./resetProvider";
import HideShow from "./HideShow";
import LoginForm from "./loginForm";
import _ from "lodash";
import Like from "./like";
class ChatBoxPlus extends resetProvider {
  state = {
    web3: new Web3(Web3.givenProvider || "http://localhost:8545"),
    network: "",
    account: "",
    Contract: "",
    isMetaMask: "",
    owner: "",
    balance: 0,
    myInboxSize: 0,
    myOutboxSize: 0,
    selectedAddress: "",
    checkRegister: false,
    contacts: [],
    messages: [],
    inputValue: "",
    searchValue: "",
    selectedContactIndex: 0,
    initialContactList: [],
    editedContactList: [],
    showListedContact: false,
    chatting: false,

    gameCost: "",
    gameActive: "",
    gameMessage: "",
    board: "",
    player1: "0x350E98bEa1Cdbc5189F443E13D8ef4324e392B53",
    player2: "0x5F873c07ED0A2668b9F36cE6F162f0E24a6a153f",
    zeroAddress: "0x0000000000000000000000000000000000000000",
    blockNumberOfContract: 0,
    deployedHash: "",
    winEvents: [],
    winCount: 0,
    loseCount: 0,
  };

  getEvents = async (eventName, blockNumberOfContract) => {
    let { web3, Contract } = this.state;
    let latest_block = await web3.eth.getBlockNumber();
    let historical_block = blockNumberOfContract; //latest_block - 10000; // you can also change the value to 'latest' if you have a upgraded rpc

    const events = await Contract.getPastEvents(
      eventName,
      {
        filter: {}, // Using an array means OR: e.g. 20 or 23
        fromBlock: historical_block,
        toBlock: latest_block,
      },
      function (error) {
        if (error) {
          console.log(error);
        }
      }
    );

    let winOrLose = await this.getTransferDetails(events);
    return winOrLose;
  };

  getTransferDetails = async (data_events) => {
    let winOrLose = [];
    for (let i = 0; i < data_events.length; i++) {
      let winner = data_events[i]["returnValues"]["winner"];
      let looser = data_events[i]["returnValues"]["looser"];
      winOrLose.push(winner, looser);
    }
    return winOrLose;
  };

  getContractProperties = async () => {
    let { Contract } = this.state;
    let contractProperties = await Contract.methods
      .getContractProperties()
      .call();
      let contacts = [];
      for (let i = 0; i <  contractProperties[1].length; i++) {
        contacts.push({
          address: contractProperties[1][i],
          name: this.bytes32toAscii(contractProperties[2][i]),
        });
      }
      this.setState({ contacts });

    this.setState({ owner : contractProperties[0], registeredUsersAddress : contractProperties[1], registeredUsersName : contractProperties[2] });
  }
  checkUserRegistration = async () => {
    let { account, Contract } = this.state;
    if (
      await Contract.methods.checkUserRegistration().call({ from: account })
    ) {
      this.setState({ checkRegister: true });
      return true;
    } else {
      this.setState({ checkRegister: false });
      return false;
    }
  };

  extraInitContract = async () => {
    await this.getContractProperties();
    await this.checkUserRegistration();
    await this.getUpdateTotalChats();
  };

  refreshPage = async () => {
    await this.getContractProperties();
    await this.getUpdateTotalChats();
  };

  getMyXOGameInfo = async () => {
    let {
      Contract,
      contacts,
      selectedContactIndex,
      account,
      zeroAddress,
      winEvents,
    } = this.state;
    var secondPlayer = contacts[selectedContactIndex].address;
    let gameIndex = await Contract.methods
      .gameIndexFunction(secondPlayer)
      .call({ from: account });
    let gameExists = gameIndex[0];

    if (gameIndex[0]) {
      let game = await Contract.methods.game(parseInt(gameIndex[1])).call();
      let activePlayer = game["activePlayer"];
      let gameActive = game["gameActive"];
      let player1 = game["player1"];
      let player2 = game["player2"];
      let winner = game["winner"];
      let boardSize = await Contract.methods.boardSize().call();
      let board = await Contract.methods
        .getBoard(secondPlayer)
        .call({ from: account });

      let tempBoard = Array(boardSize * boardSize);
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          tempBoard[boardSize * i + j] = board[i][j];
        }
      }
      let gameMessage = "";
      if (!gameActive) {
        if (winner !== zeroAddress) {
          if (winner === account) {
            gameMessage = (
              <span className="badge bg-success">You Are Winner!!!</span>
            );
          } else {
            gameMessage = contacts[selectedContactIndex].name + " is winner";
            gameMessage = (
              <span className="badge bg-danger">{gameMessage}</span>
            );
          }
        } else {
          gameMessage =
            "<span className='badge bg-secondary'>Game is Ended without Winner</span>";
        }
      }
      this.setState({
        activePlayer,
        gameActive,
        gameMessage,
        boardSize,
        board: tempBoard,
        player1,
        player2,
        winner,
      });
    }
    this.setState({ secondPlayer, gameExists, winEvents });
  };
  winLoseEvent = async () => {
    let { contacts, selectedContactIndex, account } = this.state;
    let winCount = 0;
    let loseCount = 0;
    let winEvents = await this.getEvents("GameWinner", 0);
    var secondPlayer = contacts[selectedContactIndex].address;
    for (let i = 0; i < winEvents.length; i++) {
      if (
        winEvents[2 * i] === account &&
        winEvents[2 * i + 1] === secondPlayer
      ) {
        winCount++;
      }
      if (
        winEvents[2 * i] === secondPlayer &&
        winEvents[2 * i + 1] === account
      ) {
        loseCount++;
      }
    }
    this.setState({ winCount, loseCount });
  };
  tokenContractHandler = async () => {
    await this.initWeb();
    await this.initContract(CHATBOXPLUS_ABI, CHATBOXPLUS_ADDRESS);
    await this.extraInitContract();
  };
  componentDidMount = () => {
    this.checkMetamask();
    this.tokenContractHandler();
    this.interval = setInterval(() => this.getUpdateTotalChats(), 1000);
  };

  getMyContactList = async () => {
    let { Contract, account, contacts } = this.state;
    let initialContactList = await Contract.methods
      .getMyContactList()
      .call({ from: account });
    let editedContactList = initialContactList;
    for (let i = 0; i < contacts; i++) {
      contacts[i].listed = false;
    }
    this.setState({ initialContactList, editedContactList });
    for (let i = 0; i < contacts.length; i++) {
      for (let j = 0; j < initialContactList.length; j++) {
        if (
          initialContactList[j] !== "0x0000000000000000000000000000000000000000"
        ) {
          if (
            contacts[i].address.toLowerCase() ===
            initialContactList[j].toLowerCase()
          ) {
            contacts[i].listed = true;
            break;
          }
        }
      }
    }
    this.setState({ contacts });
  };

  editContactListHandler = async (index) => {
    let { contacts, selectedContactIndex, account, Contract } = this.state;
    let TxId = "";
    selectedContactIndex = index;
    await Contract.methods
      .editMyContactList(
        contacts[selectedContactIndex].address,
        !contacts[selectedContactIndex].listed
      )
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Editing Contact List is in Progress");
        } else {
          console.log(error);
          this.notify(
            "error",
            "Editing Contact List is Failed: " + error.message
          );
        }
      });
    this.notify("success", "Editing Contact List is Done: " + TxId);
    contacts[selectedContactIndex].listed =
      !contacts[selectedContactIndex].listed;
    this.setState({ contacts });
    await this.extraInitContract();
  };

  getUpdateMessages = async () => {
    let { account, Contract, myInboxSize, myOutboxSize } = this.state;
    let value = await Contract.methods.getMyInboxSize().call({ from: account });
    myOutboxSize = value[0];
    myInboxSize = value[1];
    this.setState({ myOutboxSize, myInboxSize });
    await this.retrieveMessages();
    this.sortMessages();
  };

  retrieveMessages = async () => {
    let { Contract, account, myInboxSize, myOutboxSize } = this.state;
    let value = await Contract.methods
      .receiveMessages()
      .call({}, { from: account });
    let messages = [];
    for (let i = 0; i < myInboxSize; i++) {
      if (value[1][i] !== 0) {
        let content = value[0][i];
        let timestamp = value[1][i];
        let sender = value[2][i];
        messages.push({
          from: sender,
          to: account,
          message: this.bytes32toAscii(content),
          time: timestamp,
        });
      }
    }
    value = await Contract.methods.sentMessages().call({}, { from: account });
    for (let i = 0; i < myOutboxSize; i++) {
      if (value[1][i] !== 0) {
        let content = value[0][i];
        let timestamp = value[1][i];
        let receiver = value[2][i];
        messages.push({
          from: account,
          to: receiver,
          message: this.bytes32toAscii(content),
          time: timestamp,
        });
      }
    }
    this.setState({ messages });
  };
  bytes32toAscii = (content) => {
    content = this.state.web3.utils.toAscii(content);
    return content.replace(/[^a-zA-Z0-9 ]/g, "");
  };

  sortMessages = () => {
    let { messages, contacts, account } = this.state;
    messages = _.orderBy(messages, ["time"], ["asc"]);
    for (let i = 0; i < messages.length; i++) {
      let date = new Date(
        parseInt(messages[i]["time"]) * 1000
      ).toLocaleDateString("en-US");
      let time = new Date(
        parseInt(messages[i]["time"]) * 1000
      ).toLocaleTimeString("en-US");
      messages[i]["beautyTime"] = date + " | " + time;
    }
    this.setState({ messages });
    for (let i = 0; i < contacts.length; i++) {
      contacts[i].lastActivity = "";
    }
    for (let j = 0; j < messages.length; j++) {
      for (let i = 0; i < contacts.length; i++) {
        if (
          messages[j].from === account &&
          messages[j].to === contacts[i].address
        ) {
          contacts[i].lastActivity = messages[j].beautyTime;
        } else if (
          messages[j].to === account &&
          messages[j].from === contacts[i].address
        ) {
          contacts[i].lastActivity = messages[j].beautyTime;
        }
      }
    }

    this.setState({ contacts });
  };

  registerUser = async (username) => {
    let TxId = "";
    let { web3, account, Contract } = this.state;

    await Contract.methods
      .registerUser(web3.utils.fromAscii(username))
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
  };

  sendMessage = async () => {
    let { inputValue, selectedContactIndex, contacts } = this.state;
    if (inputValue !== "") {
      let TxId = "";
      let { web3, Contract } = this.state;
      var receiver = contacts[selectedContactIndex].address;
      var newMessage = inputValue;

      newMessage = web3.utils.fromAscii(newMessage);

      await Contract.methods
        .sendMessage(receiver, newMessage)
        .send({ from: this.state.account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Sending Message is in Progress");
          } else {
            console.log(error);
            this.notify("error", "Sending Message is Failed: " + error.message);
          }
        });
      this.notify("success", "Sending Message is Done: " + TxId);
      await this.extraInitContract();
      this.setState({ inputValue: "" });
    }
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
    this.notify("success", "Clearing Inbox is Done: " + TxId);
    await this.extraInitContract();
  };

  clearContactList = async () => {
    let TxId = "";
    let { Contract, account } = this.state;
    await Contract.methods
      .clearMyContactList()
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Clearing Contact is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Clearing Contact is Failed: " + error.message);
        }
      });
    this.notify("success", "Clearing Contact is Done: " + TxId);
    await this.extraInitContract();
  };

  onClickContactHandler = async (index) => {
    let { selectedContactIndex } = this.state;
    selectedContactIndex = index;
    this.setState({ selectedContactIndex });
    await this.getUpdateTotalChats();
  };

  getUpdateTotalChats = async () => {
    await this.getUpdateMessages();
    await this.getMyXOGameInfo();
    await this.winLoseEvent();
  };

  onChangeHandler = (e) => {
    let { inputValue } = this.state.inputValue;
    inputValue = e.currentTarget.value;
    this.setState({ inputValue });
  };
  onSearchHandler = (e) => {
    let { searchValue } = this.state.searchValue;
    searchValue = e.currentTarget.value;
    this.setState({ searchValue });
  };

  onStarClickHandler = async () => {
    let { showListedContact, selectedContactIndex } = this.state;
    showListedContact = !showListedContact;
    selectedContactIndex = 0;
    this.setState({ showListedContact, selectedContactIndex });
    await this.getMyContactList();
  };

  onChatClickHandler = async () => {
    let { chatting } = this.state;
    chatting = !chatting;
    this.setState({ chatting });
  };

  getCellClass(index) {
    let { board, player1, player2, zeroAddress } = this.state;
    let className;
    if (board[index] === zeroAddress) {
      className = "game-cell cell";
    } else if (board[index] === player1) {
      className = "game-cell cell-x";
    } else if (board[index] === player2) {
      className = "game-cell cell-o";
    }
    return className;
  }

  clickHandler = async (item) => {
    let { secondPlayer } = this.state;

    let TxId = "";
    let { Contract, account } = this.state;
    if (item === 1) {
      await Contract.methods
        .createGame(secondPlayer)
        .send({ from: account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Creating Game is in Progress");
          } else {
            console.log(error);
            this.notify("error", "Creating Game is Failed: " + error.message);
          }
        });
      this.notify("success", "Creating Game is Done: " + TxId);
    } else if (item === 0) {
      await Contract.methods
        .resetGame(secondPlayer)
        .send({ from: account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "Resetting Game is in Progress");
          } else {
            console.log(error);
            this.notify("error", "⚠️ Resetting is Failed: " + error.message);
          }
        });
      this.notify("success", "Resetting Game is Done: " + TxId);
    }
    await this.extraInitContract();
  };

  markPosition = async (index) => {
    let {
      Contract,
      board,
      boardSize,
      account,
      activePlayer,
      gameActive,
      zeroAddress,
      secondPlayer,
    } = this.state;
    let x, y;
    x = Math.trunc(index / boardSize);
    y = index % boardSize;
    if (
      board[index] === zeroAddress &&
      account === activePlayer &&
      gameActive
    ) {
      let TxId = "";
      await Contract.methods
        .setStone(x, y, secondPlayer)
        .send({ from: account, gas: "1000000" }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify("info", "setStone is in Progress");
          } else {
            console.log(error);
            this.notify("error", "setStone is Failed: " + error.message);
          }
        });
      this.notify("success", "setStone is Done: " + TxId);
      board[index] = account;
      await this.extraInitContract();
    }
    this.setState({ board });
  };

  render() {
    let {
      contacts,
      messages,
      account,
      checkRegister,
      owner,
      selectedContactIndex,
      searchValue,
      inputValue,
      showListedContact,
      chatting,
      gameMessage,
    } = this.state;

    let {
      boardSize,
      zeroAddress,
      player1,
      player2,
      activePlayer,
      winCount,
      loseCount,
      gameActive,
      gameExists,
    } = this.state;
    boardSize = 3;

    let cellsBoardSize = _.range(0, boardSize);
    if (showListedContact) {
      contacts = _.filter(contacts, function (contact) {
        return contact.listed;
      });
    }
    contacts = _.filter(contacts, function (contact) {
      return (
        contact.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        contact.address.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
    if (contacts.length === 0) {
      contacts.push({ address: "0x0", name: "Not Found" });
    }
    return (
      <div>
        <section className="bg-light text-center">
          <h1>Chat Box App</h1>
          <HideShow
            currentAccount={this.state.currentAccount}
            contractAddress={CHATBOXPLUS_ADDRESS}
            chainId={this.state.chainId}
            owner={owner}
          />
        </section>
        {checkRegister === false ? (
          <LoginForm register={this.registerUser} />
        ) : (
          <div className="container">
            <div className="messaging">
              <div className="inbox_msg">
                <div className="inbox_people">
                  <div className="headind_srch">
                    <div className="recent_heading">
                      <button
                        className="refresh_btn"
                        type="button"
                        id="refresh"
                        onClick={() => this.refreshPage()}
                      >
                        <i className="fa fa-refresh" aria-hidden="true"></i>
                      </button>
                      <button
                        className="trash_btn ms-2"
                        type="button"
                        id="trash"
                        onClick={() => this.clearInbox()}
                      >
                        <i className="fa fa-trash" aria-hidden="true"></i>
                      </button>
                      <button
                        className="fav_btn ms-2"
                        type="button"
                        id="favorite"
                        onClick={() => this.onStarClickHandler()}
                      >
                        <i
                          className={
                            showListedContact ? "fa fa-star" : "fa fa-star-o"
                          }
                          aria-hidden="true"
                        ></i>
                      </button>
                      <button
                        className="xo_btn ms-2"
                        type="button"
                        id="favorite"
                        onClick={() => this.onChatClickHandler()}
                      >
                        <i
                          className={
                            chatting ? "fa fa-gamepad" : "fa fa-comment"
                          }
                          aria-hidden="true"
                        ></i>
                      </button>
                    </div>
                    <div className="srch_bar" style={{ marginRight: "-1px" }}>
                      <div className="stylish-input-group">
                        <input
                          type="text"
                          className="search-bar"
                          value={searchValue}
                          placeholder="Search"
                          onChange={this.onSearchHandler}
                        />
                        <span className="input-group-addon">
                          <button type="button">
                            <i className="fa fa-search" aria-hidden="true"></i>
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="inbox_chat">
                    {contacts.map((contact, index) => (
                      <div
                        className={
                          selectedContactIndex !== index
                            ? "chat_list"
                            : "chat_list active_chat"
                        }
                        key={index}
                        onClick={() => this.onClickContactHandler(index)}
                      >
                        <div
                          className="chat_people"
                          style={{ cursor: "pointer" }}
                        >
                          <div className="chat_img">
                            {" "}
                            <img src={userProfilePic} alt={contact.name} />{" "}
                          </div>
                          <div className="chat_ib">
                            <h5>
                              {contact.address !== account
                                ? contact.name
                                : contact.name + " (Saved Messages)"}{" "}
                              <span
                                className="chat_date"
                                onClick={() =>
                                  this.editContactListHandler(index)
                                }
                              >
                                <Like liked={contact.listed} />
                              </span>
                            </h5>
                            <p>{contact.address}</p>
                            <h5>
                              <span className="chat_date">
                                {contact.lastActivity}
                              </span>
                            </h5>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  {chatting ? (
                    <div className="mesgs">
                      <div className="msg_history">
                        {messages.map((message, index) =>
                          message.from === account &&
                          message.to ===
                            contacts[selectedContactIndex].address ? (
                            <div className="outgoing_msg" key={index}>
                              <div className="sent_msg">
                                <p>{message.message}</p>
                                <span className="time_date">
                                  {message.beautyTime}
                                </span>
                              </div>
                            </div>
                          ) : message.to === account &&
                            message.from ===
                              contacts[selectedContactIndex].address ? (
                            <div className="incoming_msg" key={index}>
                              <div className="incoming_msg_img">
                                {" "}
                                <img
                                  src={userProfilePic}
                                  alt={contacts[selectedContactIndex].name}
                                />{" "}
                              </div>
                              <div className="received_msg">
                                <div className="received_withd_msg">
                                  <p>{message.message}</p>
                                  <span className="time_date">
                                    {message.beautyTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={index}></div>
                          )
                        )}
                      </div>
                      <span
                        className={
                          inputValue.length < 24
                            ? "badge bg-secondary"
                            : "badge bg-danger"
                        }
                      >
                        {inputValue.length}/32
                      </span>
                      <div className="type_msg">
                        <div className="input_msg_write">
                          <input
                            type="text"
                            value={inputValue}
                            className="write_msg"
                            placeholder="Type a message"
                            onChange={this.onChangeHandler}
                            maxLength="32"
                          />
                          <button
                            disabled={inputValue.length === 0}
                            className="msg_send_btn"
                            style={{ marginTop: "-3px", marginRight: "10px" }}
                            type="button"
                            onClick={() => this.sendMessage()}
                          >
                            <i
                              className="fa fa-paper-plane-o"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : gameExists ? (
                    <div className="align-items-center justify-content-center">
                      {gameActive ? (
                        <div>
                          <h4 className="h4_xo mt-4">
                            {account === activePlayer &&
                            player2 !== zeroAddress ? (
                              <span className="badge bg-success">
                                Its Your Turn
                              </span>
                            ) : activePlayer !== zeroAddress &&
                              player2 !== zeroAddress ? (
                              <span className="badge bg-danger">
                                Its {contacts[selectedContactIndex].name} Turn
                              </span>
                            ) : (
                              <div></div>
                            )}
                          </h4>
                          <h4 className="h4_xo mt-4">
                            <span className="badge bg-primary">
                              Active Player:
                            </span>
                          </h4>

                          <table className="table_xoSmall mt-3">
                            <tbody>
                              <tr>
                                <td className="td_xoSmall">
                                  <div
                                    className={
                                      activePlayer === player1
                                        ? "game-cell cell-x"
                                        : activePlayer === player2
                                        ? "game-cell cell-o"
                                        : "game-cell"
                                    }
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                      <h4 className="h4_xo mt-2">
                        <span className="badge bg-success">{winCount}</span> -{" "}
                        <span className="badge bg-danger">{loseCount}</span>
                      </h4>

                      <table className="table_xo" id="board">
                        <tbody>
                          {cellsBoardSize.map((row, index) => (
                            <tr key={index}>
                              {cellsBoardSize.map((col, index) => (
                                <td className="td_xo" key={index}>
                                  <div
                                    id={"cell-" + row * boardSize + col}
                                    onClick={() =>
                                      this.markPosition(row * boardSize + col)
                                    }
                                    className={this.getCellClass(
                                      row * boardSize + col
                                    )}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {gameActive ? null : (
                        <div>
                          <h4 className="h4_xo">{gameMessage}</h4>
                        </div>
                      )}
                      <div className="row">
                        <div className="col-3"></div>
                        <div className="col-6 container d-flex align-items-center justify-content-center">
                          <div>
                            <button
                              className="btn btn-primary text-light  ms-2"
                              onClick={() => this.clickHandler(0)}
                            >
                              Reset Game
                            </button>
                          </div>
                        </div>
                        <div className="col-3"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-6 container d-flex align-items-center justify-content-center align-self-center mt-4">
                        <button
                          className="btn btn-primary ms-2"
                          onClick={() => this.clickHandler(1)}
                        >
                          Create A Game
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ChatBoxPlus;
