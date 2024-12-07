// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract Gaming {
    /* Our Online gaming contract */
    address public owner;
    bool public online;

    struct Player {
        uint wins;
        uint losses;
    }

    mapping (address => Player) public players;

    constructor() payable {
        owner = msg.sender;
        online = true;
    }

    event PlayerWon(address player, uint amount, uint mysteryNumber, uint displayedNumber);
    event PlayerLost(address player, uint amount, uint mysteryNumber, uint displayedNumber);

    function mysteryNumber() internal view returns (uint) {
        uint randomNumber = uint(blockhash(block.number-1))%10 + 1;
        return randomNumber;
    }

    function determineWinner(uint _number, uint _display, bool _guess) public pure returns (bool) {
        if (_guess == true && _number > _display) {
            return true;
        } else if (_guess == true && _number < _display) {
            return false;
        } else if (_guess == false && _number > _display) {
            return false;
        } else if (_guess == false && _number < _display) {
            return true;
        }
        return false;
    }

    function winOrLose(uint _display, bool _guess) external payable returns (bool, uint) {
        /* Use true for a higher guess, false for a lower guess */
        require(online == true, "The game is not online");
        require(msg.sender.balance > msg.value, "Insufficient funds");
        uint _mysteryNumber = mysteryNumber();
        bool isWinner = determineWinner(_mysteryNumber, _display, _guess);
        /* Player Won */
        if (isWinner == true) {
            players[msg.sender].wins += 1;
            payable(msg.sender).transfer(msg.value * 2);
            emit PlayerWon(msg.sender, msg.value, _mysteryNumber, _display);
            return (true, _mysteryNumber);
          /* Player Lost */
        } else if (isWinner == false) {
            players[msg.sender].losses += 1;
            emit PlayerLost(msg.sender, msg.value, _mysteryNumber, _display);
            return (false, _mysteryNumber);
        }
        return (false,0);
    }
}