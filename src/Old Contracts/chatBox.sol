/**
 *Submitted for verification at Etherscan.io on 2023-01-31
*/

pragma solidity ^0.5.17;

contract ChatBox {
  // Users transmit "Message" objects that contain the content and data of the intended message
  struct Message {
    address sender;
    address receiver;
    bytes32 content;
    uint timestamp;
    bool XOMessage;
  }

  struct ContractProperties {
    address CertChatOwner;
    address[] registeredUsersAddress;
    bytes32[] registeredUsersName;
  }

  struct Inbox {
    uint numSentMessages;
    uint numReceivedMessages;
    mapping (uint => Message) sentMessages;
    mapping (uint => Message) receivedMessages;
  }
  uint8 constant maxContactListLength =64;
  uint8 constant maxMessageLength =64;
  mapping (address => Inbox) userInboxes;
  mapping (address => address[maxContactListLength]) public contactList;
  address[maxContactListLength] private newContactList;
  mapping (address => bool) hasRegistered;

  Inbox newInbox;
  uint donationsInWei = 0;
  Message newMessage;
  ContractProperties contractProperties;

  constructor(bytes32 _username) public {
    // Constructor
    registerUser(_username);
    contractProperties.CertChatOwner = msg.sender;
  }

  function checkUserRegistration() public view returns (bool) {
        return hasRegistered[msg.sender];
  }

  function clearInbox() public {
    userInboxes[msg.sender] = newInbox;
  }

  function registerUser(bytes32 _username) public {
    if(!hasRegistered[msg.sender]) {
      userInboxes[msg.sender] = newInbox;
      hasRegistered[msg.sender] = true;
      contractProperties.registeredUsersAddress.push(msg.sender);
      contractProperties.registeredUsersName.push(_username);
    }
  }


  function getContractProperties() public view returns (address, address[] memory, bytes32[] memory) {
    return (contractProperties.CertChatOwner, contractProperties.registeredUsersAddress,contractProperties.registeredUsersName);
  }


  function sendMessage(address _receiver, bytes32 _content) public {
    newMessage.content = _content;
    newMessage.timestamp = now;
    newMessage.sender = msg.sender;
    newMessage.receiver = _receiver;
    // Update senders inbox
    Inbox storage sendersInbox = userInboxes[msg.sender];
    sendersInbox.sentMessages[sendersInbox.numSentMessages] = newMessage;
    sendersInbox.numSentMessages++;

    // Update receivers inbox
    Inbox storage receiversInbox = userInboxes[_receiver];
    receiversInbox.receivedMessages[receiversInbox.numReceivedMessages] = newMessage;
    receiversInbox.numReceivedMessages++;
    return;
  }

  function receiveMessages() public view returns (bytes32[maxMessageLength] memory, uint[] memory, address[] memory) {
    Inbox storage receiversInbox = userInboxes[msg.sender];
    bytes32[maxMessageLength] memory content;
    address[] memory sender = new address[](maxMessageLength);
    uint[] memory timestamp = new uint[](maxMessageLength);
    for (uint m = 0; m < maxMessageLength-1; m++) {
      Message memory message = receiversInbox.receivedMessages[m];
      content[m] = message.content;
      sender[m] = message.sender;
      timestamp[m] = message.timestamp;
    }
    return (content, timestamp, sender);
  }

  function sentMessages() public view returns (bytes32[maxMessageLength] memory, uint[] memory, address[] memory) {
    Inbox storage sentsInbox = userInboxes[msg.sender];
    bytes32[maxMessageLength] memory content;
    address[] memory receiver = new address[](maxMessageLength);
    uint[] memory timestamp = new uint[](maxMessageLength);
    for (uint m = 0; m < maxMessageLength-1; m++) {
      Message memory message = sentsInbox.sentMessages[m];
      content[m] = message.content;
      receiver[m] = message.receiver;
      timestamp[m] = message.timestamp;
    }
    return (content, timestamp, receiver);
  }

  function editMyContactList(address _address,bool _add) public {
    uint i=0;
    if(_add){
      while(i<maxContactListLength){
        if(contactList[msg.sender][i]==address(0)){
          contactList[msg.sender][i] = _address;
          i=maxContactListLength;
        }
        i++;
      }
    }else{
      while(i<maxContactListLength){
        if(contactList[msg.sender][i]==_address){
          contactList[msg.sender][i] = address(0);
          i=maxContactListLength;
        }
        i++;
      }
    }
  }
  function clearMyContactList() public {
    contactList[msg.sender] = newContactList;

  }

  function getMyContactList() public view returns (address[maxContactListLength] memory){
    return (contactList[msg.sender]);
  }

  function getMyInboxSize() public view returns (uint, uint) {
    return (userInboxes[msg.sender].numSentMessages, userInboxes[msg.sender].numReceivedMessages);
  }

}