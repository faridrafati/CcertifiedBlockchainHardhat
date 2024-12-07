// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Adoption {
  address[16] public adoptors;

  function getAdoptors() public view returns(address[16] memory) {
    return adoptors;
  }

  function adopt(uint _petId) public returns(uint) {
    require (_petId>=0 && _petId <=15);
    require (adoptors[_petId] == address(0x0));
    adoptors[_petId] = msg.sender;
    return(_petId);
  }
}