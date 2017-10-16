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

  function upgrade() payable {
    inc = (block.timestamp - lastUpgrade)*speed + inc;
    if(inc >= upgradeCost){
      speed++;
      inc -= upgradeCost;
      upgradeCost *= 2;
      lastUpgrade = now;
    }
  }

}
