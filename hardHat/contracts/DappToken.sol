// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DappToken is ERC20 {
    uint8 decimal;
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint _initialSupply) ERC20(_name, _symbol)
    {
      decimal=_decimals;
      _mint(msg.sender, _initialSupply * 10 ** uint256(decimal));
    }

    function decimals() public view override virtual returns (uint8) {
        return decimal;
    }
}