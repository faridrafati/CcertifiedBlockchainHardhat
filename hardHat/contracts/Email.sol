// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Email {
    // Users transmit "Message" objects that contain the content and data of the intended message
    struct Message {
        address sender;
        address receiver;
        bytes32 content;
        uint timestamp;
    }

    struct ContractProperties {
        address CertChatOwner;
        address[] registeredUsersAddress;
    }

    struct Inbox {
        uint numSentMessages;
        uint numReceivedMessages;
        mapping(uint => Message) sentMessages;
        mapping(uint => Message) receivedMessages;
    }

    mapping(address => Inbox) userInboxes;
    mapping(address => bool) hasRegistered;

    Inbox newInbox;
    uint donationsInWei = 0;
    Message newMessage;
    ContractProperties contractProperties;


    constructor() {
        registerUser();
        contractProperties.CertChatOwner = msg.sender;
    }

    function checkUserRegistration() public view returns (bool) {
        return hasRegistered[msg.sender];
    }

    function clearInbox() public {
        //userInboxes[msg.sender] = newInbox;
        delete userInboxes[msg.sender];
    }

    function registerUser() public {
        if (!hasRegistered[msg.sender]) {
            //userInboxes[msg.sender] = newInbox;
            delete userInboxes[msg.sender];
            hasRegistered[msg.sender] = true;
            contractProperties.registeredUsersAddress.push(msg.sender);
        }
    }

    function getContractProperties()
        public
        view
        returns (address, address[] memory)
    {
        return (
            contractProperties.CertChatOwner,
            contractProperties.registeredUsersAddress
        );
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
        receiversInbox.receivedMessages[
            receiversInbox.numReceivedMessages
        ] = newMessage;
        receiversInbox.numReceivedMessages++;
        return;
    }

    function receiveMessages()
        public
        view
        returns (bytes32[16] memory, uint[] memory, address[] memory)
    {
        Inbox storage receiversInbox = userInboxes[msg.sender];
        bytes32[16] memory content;
        address[] memory sender = new address[](16);
        uint[] memory timestamp = new uint[](16);
        for (uint m = 0; m < 15; m++) {
            Message memory message = receiversInbox.receivedMessages[m];
            content[m] = message.content;
            sender[m] = message.sender;
            timestamp[m] = message.timestamp;
        }
        return (content, timestamp, sender);
    }

    function sentMessages()
        public
        view
        returns (bytes32[16] memory, uint[] memory, address[] memory)
    {
        Inbox storage sentsInbox = userInboxes[msg.sender];
        bytes32[16] memory content;
        address[] memory receiver = new address[](16);
        uint[] memory timestamp = new uint[](16);
        for (uint m = 0; m < 15; m++) {
            Message memory message = sentsInbox.sentMessages[m];
            content[m] = message.content;
            receiver[m] = message.receiver;
            timestamp[m] = message.timestamp;
        }
        return (content, timestamp, receiver);
    }

    function getMyInboxSize() public view returns (uint, uint) {
        return (
            userInboxes[msg.sender].numSentMessages,
            userInboxes[msg.sender].numReceivedMessages
        );
    }
}
