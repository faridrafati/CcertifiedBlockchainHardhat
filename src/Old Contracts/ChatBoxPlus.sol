// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17;

contract ChatBoxPlus {
  // Users transmit "Message" objects that contain the content and data of the intended message

    struct Game {
      address player1;
      address player2;
      bool gameActive;
      address activePlayer;
      uint8 movesCounter;
      address[3][3] board;
      address winner;
    }
    
  uint8 public boardSize;
  address[3][3] emptyBoard;
  uint64 public gameCounter;

  mapping (uint => Game) public game;

  event GameWinner(address winner, address looser);
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
    gameCounter = 0;
    boardSize = 3;
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
    newMessage.timestamp = block.timestamp;
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


  /************************************game part*************************** */



    function createGame (address _invitedPlayer) public returns(bool){
        bool gameExist;
        uint64 gameIndex;
        (gameExist,gameIndex) = gameIndexFunction(_invitedPlayer);
        require(!gameExist);
        require(_invitedPlayer != msg.sender);
        game[gameCounter].player1=msg.sender;
        game[gameCounter].player2=_invitedPlayer;
        game[gameCounter].gameActive = true;
        game[gameCounter].winner = address(0);
        if(block.number % 2 == 0) {
            game[gameCounter].activePlayer =  game[gameCounter].player2;
        } else {
            game[gameCounter].activePlayer =  game[gameCounter].player1;
        }
        game[gameCounter].movesCounter = 0;
        game[gameCounter].board = emptyBoard;
        gameCounter++;
        return true;
    }

    function gameIndexFunction(address _secondPlayer) public view returns(bool,uint64){
        for (uint64 index=0; index<gameCounter ; index++) {
            if(((game[index].player1 == msg.sender)&&(game[index].player2 == _secondPlayer))||
               ((game[index].player1 == _secondPlayer)&&(game[index].player2 == msg.sender))){
                return (true,index);
            }
        }
        return (false,0);
    }

    function getBoard(address _secondPlayer) public view returns(address[3][3] memory) {
        bool gameExist;
        uint64 gameIndex;
        (gameExist,gameIndex) = gameIndexFunction(_secondPlayer);
        require(gameExist);
        return game[gameIndex].board;
    }

    function resetGame(address _secondPlayer) public {
        bool gameExist;
        uint64 gameIndex;
        (gameExist,gameIndex) = gameIndexFunction(_secondPlayer);
        require(gameExist);
        game[gameIndex].board = emptyBoard;
        game[gameIndex].gameActive = true;
        if(block.number % 2 == 0) {
            game[gameIndex].player1=msg.sender;
            game[gameIndex].player2=_secondPlayer;
        } else {
            game[gameIndex].player1=_secondPlayer;
            game[gameIndex].player2=msg.sender;
        }
        game[gameIndex].activePlayer =  game[gameIndex].player1;
        game[gameIndex].movesCounter = 0;
        game[gameIndex].board = emptyBoard;
        game[gameIndex].winner = address(0);
    }

    function setWinner(address player,address _secondPlayer) private {
        bool gameExist;
        uint64 gameIndex;
        (gameExist,gameIndex) = gameIndexFunction(_secondPlayer);
        require(gameExist);
        game[gameIndex].gameActive = false;
        //emit an event
        if(msg.sender == player){
            emit GameWinner(player, _secondPlayer);
            game[gameIndex].winner = player;
        } else{
            emit GameWinner(_secondPlayer,player);
            game[gameIndex].winner = _secondPlayer;
        }

    }

    function setDraw(address _secondPlayer) private {
        bool gameExist;
        uint64 gameIndex;
        (gameExist,gameIndex) = gameIndexFunction(_secondPlayer);
        require(gameExist);
        game[gameIndex].gameActive = false;
    }

    function setStone(uint8 x, uint8 y,address _secondPlayer) public {
        bool gameExist;
        uint64 gameIndex;
        (gameExist,gameIndex) = gameIndexFunction(_secondPlayer);
        require(gameExist);
        require(game[gameIndex].board[x][y] == address(0));
        assert(game[gameIndex].gameActive);
        assert(x < boardSize);
        assert(y < boardSize);
        require(msg.sender == game[gameIndex].activePlayer);
        game[gameIndex].board[x][y] = msg.sender;
        game[gameIndex].movesCounter++;

        for(uint8 i = 0; i < boardSize; i++) {
            if(game[gameIndex].board[i][y] != game[gameIndex].activePlayer) {
                break;
            }
            //win
            if(i == boardSize - 1) {
                //winner
                setWinner(game[gameIndex].activePlayer,_secondPlayer);
                return;
            }
        }
        for(uint i = 0; i < boardSize; i++) {
            if(game[gameIndex].board[x][i] != game[gameIndex].activePlayer) {
                break;
            }
            //win

            if(i == boardSize - 1) {
                //winner
                setWinner(game[gameIndex].activePlayer,_secondPlayer);
                return;
            }
        }

        //diagonale
        if(x == y) {
            for(uint i = 0; i < boardSize; i++) {
                if(game[gameIndex].board[i][i] !=game[gameIndex].activePlayer) {
                    break;
                }
                //win
                if(i == boardSize - 1) {
                    //winner
                    setWinner(game[gameIndex].activePlayer,_secondPlayer);
                    return;
                }
            }
        }

        //anti-diagonale
        if((x+y) == boardSize-1) {
            for(uint i = 0; i < boardSize; i++) {
                if(game[gameIndex].board[i][(boardSize-1)-i] != game[gameIndex].activePlayer) {
                    break;
                }
                //win

                if(i == boardSize - 1) {
                    //winner
                    setWinner(game[gameIndex].activePlayer,_secondPlayer);
                    return;
                }
            }
        }

        //draw
        if(game[gameIndex].movesCounter == (boardSize**2)) {
            //draw
            setDraw(_secondPlayer);
            return;
        }

        if(game[gameIndex].activePlayer == game[gameIndex].player1) {
            game[gameIndex].activePlayer = game[gameIndex].player2;
        } else {
            game[gameIndex].activePlayer = game[gameIndex].player1;
        }
    }

}