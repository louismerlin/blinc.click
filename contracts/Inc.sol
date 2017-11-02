pragma solidity ^0.4.4;

contract Inc{

  uint public inc;
  uint public speed;
  uint public upgradeCost;
  uint public lastUpgrade;
  address[] public upgraders;
  uint public upgradeCount;

  mapping(address => bytes32) public usernames;

  address private creator;

  function Inc() {
    inc = 0;
    upgradeCount = 0;
    upgradeCost = 2**(upgradeCount+5);
    speed = upgradeCost / (32 * (upgradeCount+1));
    lastUpgrade = now;
    creator = msg.sender;
    upgraders = new address[](0);
  }

  function upgrade() returns (bool) {
    uint currentInc = (now - lastUpgrade) * speed + inc;
    if(currentInc >= upgradeCost) {
      upgraders.push(msg.sender);
      upgradeCount++;
      inc = currentInc - upgradeCost;
      upgradeCost = 2**(upgradeCount+5);
      speed = upgradeCost / (32 * (upgradeCount+1));
      lastUpgrade = now;
      return true;
    }
    return false;
  }

  function setUsername(bytes32 username) payable {
    if (msg.value >= 0.01 ether) {
      usernames[msg.sender] = username;
    }
  }

  function payout() {
    if(msg.sender == creator) {
      creator.transfer(this.balance);
    }
  }

  function getUpgraders() public constant returns (address[]) {
    return upgraders;
  }

}
