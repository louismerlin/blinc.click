pragma solidity ^0.4.4;

contract Inc{

  uint public inc;
  uint public speed;
  uint public upgradeCost;
  uint public lastUpgrade;

  function Inc() {
    inc = 0;
    speed = 1;
    upgradeCost = 25;
    lastUpgrade = now;
  }

  function upgrade() payable returns (bool) {
    uint currentInc = (now - lastUpgrade) * speed + inc;
    if(currentInc >= upgradeCost) {
      speed++;
      inc = currentInc - upgradeCost;
      upgradeCost *= 2;
      lastUpgrade = now;
      return true;
    }
    return false;
  }

}
