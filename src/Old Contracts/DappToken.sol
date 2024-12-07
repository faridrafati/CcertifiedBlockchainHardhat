// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DappToken {
  string public name = "AmirToken";
  string public symbol = "AMT";
  uint256 public totalSupply;
    uint  public decimals = 0;
  address public owner;

  mapping(address => uint256) public balanceOf;
  mapping(address => mapping (address => uint256)) public allowance;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value
  );

  event Approve(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
  );
  modifier onlyOwner () {
    require(msg.sender == owner,'this address is not owner');
    _;
  }

  constructor(uint _initialSupply) {
    owner = msg.sender;
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
  }

  function transfer(address _to, uint256 _value) public returns (bool _success) {
    require(balanceOf[msg.sender] >= _value);

    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    emit Transfer(msg.sender, _to, _value);

    return true;
  }

  function approve(address _spender, uint _value) public returns (bool _success) {
    allowance[msg.sender][_spender] = _value;
    emit Approve(msg.sender, _spender, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint _value) public returns (bool _success) {
    require(_value <= balanceOf[_from]);
    require(_value <= allowance[_from][msg.sender]);

    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;

    allowance[_from][msg.sender] -= _value;

    emit Transfer(_from, _to, _value);
    return true;
  }
}
