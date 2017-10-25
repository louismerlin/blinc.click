pragma solidity ^0.4.4;

contract Inc{

  uint public inc;
  uint public speed;
  uint public upgradeCost;
  uint public lastUpgrade;
  mapping(address => string) public usernames;
  mapping(uint => address) public upgrades;

  uint private upgradeCount;
  uint private factor;

  function Inc() {
    inc = 0;
    upgradeCount = 1;
    upgradeCost = 2**(upgradeCount+4);
    speed = upgradeCost / (32 * upgradeCount);
    lastUpgrade = now;
  }

  function upgrade() returns (bool) {
    uint currentInc = (now - lastUpgrade) * speed + inc;
    if(currentInc >= upgradeCost) {
      upgrades[upgradeCount] = msg.sender;
      upgradeCount++;
      inc = currentInc - upgradeCost;
      upgradeCost = 2**(upgradeCount+4);
      speed = upgradeCost / (32 * upgradeCount);
      lastUpgrade = now;
      return true;
    }
    return false;
  }

  function setUsername(string username) payable {
    if (msg.value >= 0.01 ether) {
      usernames[msg.sender] = username;
    }
  }

}
