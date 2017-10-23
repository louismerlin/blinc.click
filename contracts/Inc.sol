pragma solidity ^0.4.4;

contract Inc{

  uint public inc;
  uint public speed;
  uint public upgradeCost;
  uint public baseCost;
  uint public baseFactor;
  uint public baseExp;
  uint public lastUpgrade;
  uint public upgradeCount;

  function Inc() {
    inc = 0;
    baseCost = 3265342;
    upgradeCount = 1;
    baseFactor = 244;
    baseExp = 2;
    upgradeCost = baseCost * (baseFactor**upgradeCount) / ((10**baseExp)**upgradeCount);
    speed = upgradeCost / (60 * upgradeCount);
    lastUpgrade = now;
  }

  function upgrade() returns (bool) {
    uint currentInc = (now - lastUpgrade) * speed + inc;
    if(currentInc >= upgradeCost) {
      upgradeCount++;
      inc = currentInc - upgradeCost;
      upgradeCost = baseCost * (baseFactor**upgradeCount) / ((10**baseExp)**upgradeCount);
      speed = upgradeCost / (60 * upgradeCount);
      lastUpgrade = now;
      return true;
    }
    return false;
  }

}
