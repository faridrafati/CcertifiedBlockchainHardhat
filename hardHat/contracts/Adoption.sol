// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Adoption {
    address[16] public adopters;

    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

    function adopt(uint _petId) public returns (uint) {
        require(_petId >= 0 && _petId <= 15);
        require(adopters[_petId] == address(0x0));
        adopters[_petId] = msg.sender;
        return (_petId);
    }
}
