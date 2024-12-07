import React from 'react';
import './components/css/chatBox.css';
import userProfilePic from './components/images/user-profile.png';
import Web3 from 'web3/dist/web3.min';
import {
  CHATBOXPLUS_ABI,
  CHATBOXPLUS_ADDRESS,
} from './components/config/ChatBoxPlusConfig';
import resetProvider from './resetProvider';
import HideShow from './HideShow';
import LoginForm from './loginForm';
import _ from 'lodash';
import Like from './like';
class ChatBoxStable extends resetProvider {
  state = {
    web3: new Web3(Web3.givenProvider || 'http://localhost:8545'),
    network: '',
    account: '',
    Contract: '',
    isMetaMask: '',
    owner: '',
    balance: 0,
    myInboxSize: 0,
    myOutboxSize: 0,
    selectedAddress: '',
    checkRegister: false,
    contacts: [],
    messages: [],
    inputValue: '',
    searchValue: '',
    selectedContactIndex: 0,
    initialContactList: [],
    editedContactList: [],
    showListedContact: false,
  };

  getContractProperties = async () => {
    let { Contract } = this.state;
    let contractProperties = await Contract.methods
      .getContractProperties()
      .call();
    let owner = contractProperties[0];
    let registeredUsersAddress = contractProperties[1];
    let registeredUsersName = contractProperties[2];
    let contacts = [];
    for (let i = 0; i < registeredUsersAddress.length; i++) {
      let registeredUsersAddress = contractProperties[1][i];
      let registeredUsersName = contractProperties[2][i];
      contacts.push({
        address: registeredUsersAddress,
        name: this.bytes32toAscii(registeredUsersName),
      });
    }
    this.setState({ contacts });
    this.setState({ owner, registeredUsersAddress, registeredUsersName });
  };

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
    await this.getUpdateMessages();
    await this.getMyContactList();
  };

  tokenContractHandler = async () => {
    await this.initWeb();
    await this.initContract(CHATBOXPLUS_ABI, CHATBOXPLUS_ADDRESS);
    await this.extraInitContract();
  };
  componentDidMount = () => {
    this.checkMetamask();
    this.tokenContractHandler();
    this.interval = setInterval(() => this.getUpdateMessages(), 1000);
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
          initialContactList[j] !== '0x0000000000000000000000000000000000000000'
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
    let TxId = '';
    selectedContactIndex = index;
    await Contract.methods
      .editMyContactList(
        contacts[selectedContactIndex].address,
        !contacts[selectedContactIndex].listed
      )
      .send({ from: account, gas: '1000000' }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify('info', 'Editing Contact List is in Progress');
        } else {
          console.log(error);
          this.notify(
            'error',
            'Editing Contact List is Failed: ' + error.message
          );
        }
      });
    this.notify('success', 'Editing Contact List is Done: ' + TxId);
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
    return content.replace(/[^a-zA-Z0-9 ]/g, '');
  };

  sortMessages = () => {
    let { messages, contacts, account } = this.state;
    messages = _.orderBy(messages, ['time'], ['asc']);
    for (let i = 0; i < messages.length; i++) {
      let date = new Date(
        parseInt(messages[i]['time']) * 1000
      ).toLocaleDateString('en-US');
      let time = new Date(
        parseInt(messages[i]['time']) * 1000
      ).toLocaleTimeString('en-US');
      messages[i]['beautyTime'] = date + ' | ' + time;
    }
    this.setState({ messages });
    for (let i = 0; i < contacts.length; i++) {
      contacts[i].lastActivity = '';
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
    let TxId = '';
    let { web3, account, Contract } = this.state;

    await Contract.methods
      .registerUser(web3.utils.fromAscii(username))
      .send({ from: account, gas: '1000000' }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify('info', 'Registration is in Progress');
        } else {
          console.log(error);
          this.notify('error', 'Registration is Failed: ' + error.message);
        }
      });
    this.notify('success', 'Registration is Done: ' + TxId);
    await this.extraInitContract();
  };

  sendMessage = async () => {
    let { inputValue, selectedContactIndex, contacts } = this.state;
    if (inputValue !== '') {
      let TxId = '';
      let { web3, Contract } = this.state;
      var receiver = contacts[selectedContactIndex].address;
      var newMessage = inputValue;

      newMessage = web3.utils.fromAscii(newMessage);

      await Contract.methods
        .sendMessage(receiver, newMessage)
        .send({ from: this.state.account, gas: '1000000' }, (error, result) => {
          if (!error) {
            TxId = result;
            this.notify('info', 'Sending Message is in Progress');
          } else {
            console.log(error);
            this.notify('error', 'Sending Message is Failed: ' + error.message);
          }
        });
      this.notify('success', 'Sending Message is Done: ' + TxId);
      await this.extraInitContract();
      this.setState({ inputValue: '' });
    }
  };
  clearInbox = async () => {
    let TxId = '';
    let { Contract, account } = this.state;
    await Contract.methods
      .clearInbox()
      .send({ from: account, gas: '1000000' }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify('info', 'Clearing Inbox is in Progress');
        } else {
          console.log(error);
          this.notify('error', 'Clearing Inbox is Failed: ' + error.message);
        }
      });
    this.notify('success', 'Clearing Inbox is Done: ' + TxId);
    await this.extraInitContract();
  };

  clearContactList = async () => {
    let TxId = '';
    let { Contract, account } = this.state;
    await Contract.methods
      .clearMyContactList()
      .send({ from: account, gas: '1000000' }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify('info', 'Clearing Contact is in Progress');
        } else {
          console.log(error);
          this.notify('error', 'Clearing Contact is Failed: ' + error.message);
        }
      });
    this.notify('success', 'Clearing Contact is Done: ' + TxId);
    await this.extraInitContract();
  };

  onClickContactHandler = async (index) => {
    let { selectedContactIndex } = this.state;
    selectedContactIndex = index;
    this.setState({ selectedContactIndex });
    await this.getUpdateMessages();
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
    } = this.state;
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
      contacts.push({ address: '0x0', name: 'Not Found' });
    }
    return (
      <div>
        <section className='bg-light text-center'>
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
          <div className='container'>
            <div className='messaging'>
              <div className='inbox_msg'>
                <div className='inbox_people'>
                  <div className='headind_srch'>
                    <div className='recent_heading'>
                      <button
                        className='refresh_btn'
                        type='button'
                        id='refresh'
                        onClick={() => this.getUpdateMessages()}
                      >
                        <i className='fa fa-refresh' aria-hidden='true'></i>
                      </button>
                      <button
                        className='trash_btn ms-2'
                        type='button'
                        id='trash'
                        onClick={() => this.clearInbox()}
                      >
                        <i className='fa fa-trash' aria-hidden='true'></i>
                      </button>
                      <button
                        className='fav_btn ms-2'
                        type='button'
                        id='favorite'
                        onClick={() => this.onStarClickHandler()}
                      >
                        <i
                          className={
                            showListedContact ? 'fa fa-star' : 'fa fa-star-o'
                          }
                          aria-hidden='true'
                        ></i>
                      </button>
                      <button
                        className='trash_contact_btn ms-2'
                        type='button'
                        id='contact'
                        onClick={() => this.clearContactList()}
                      >
                        <i className='fa fa-user-times' aria-hidden='true'></i>
                      </button>
                    </div>

                    <div className='srch_bar'>
                      <div className='stylish-input-group'>
                        <input
                          type='text'
                          className='search-bar'
                          value={searchValue}
                          placeholder='Search'
                          onChange={this.onSearchHandler}
                        />
                        <span className='input-group-addon'>
                          <button type='button'>
                            <i className='fa fa-search' aria-hidden='true'></i>
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='inbox_chat'>
                    {contacts.map((contact, index) => (
                      <div
                        className={
                          selectedContactIndex !== index
                            ? 'chat_list'
                            : 'chat_list active_chat'
                        }
                        key={index}
                        onClick={() => this.onClickContactHandler(index)}
                      >
                        <div
                          className='chat_people'
                          style={{ cursor: 'pointer' }}
                        >
                          <div className='chat_img'>
                            {' '}
                            <img src={userProfilePic} alt={contact.name} />{' '}
                          </div>
                          <div className='chat_ib'>
                            <h5>
                              {contact.address !== account
                                ? contact.name
                                : contact.name + ' (Saved Messages)'}{' '}
                              <span
                                className='chat_date'
                                onClick={() =>
                                  this.editContactListHandler(index)
                                }
                              >
                                <Like liked={contact.listed} />
                              </span>
                            </h5>
                            <p>{contact.address}</p>
                            <h5>
                              <span className='chat_date'>
                                {contact.lastActivity}
                              </span>
                            </h5>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='mesgs'>
                  <div className='msg_history'>
                    {messages.map((message, index) =>
                      message.from === account &&
                      message.to === contacts[selectedContactIndex].address ? (
                        <div className='outgoing_msg' key={index}>
                          <div className='sent_msg'>
                            <p>{message.message}</p>
                            <span className='time_date'>
                              {message.beautyTime}
                            </span>
                          </div>
                        </div>
                      ) : message.to === account &&
                        message.from ===
                          contacts[selectedContactIndex].address ? (
                        <div className='incoming_msg' key={index}>
                          <div className='incoming_msg_img'>
                            {' '}
                            <img
                              src={userProfilePic}
                              alt={contacts[selectedContactIndex].name}
                            />{' '}
                          </div>
                          <div className='received_msg'>
                            <div className='received_withd_msg'>
                              <p>{message.message}</p>
                              <span className='time_date'>
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
                        ? 'badge bg-secondary'
                        : 'badge bg-danger'
                    }
                  >
                    {inputValue.length}/32
                  </span>
                  <div className='type_msg'>
                    <div className='input_msg_write'>
                      <input
                        type='text'
                        value={inputValue}
                        className='write_msg'
                        placeholder='Type a message'
                        onChange={this.onChangeHandler}
                        maxLength='32'
                      />
                      <button
                        disabled={inputValue.length === 0}
                        className='msg_send_btn'
                        style={{ marginTop: '-3px', marginRight: '10px' }}
                        type='button'
                        onClick={() => this.sendMessage()}
                      >
                        <i
                          className='fa fa-paper-plane-o'
                          aria-hidden='true'
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ChatBoxStable;
