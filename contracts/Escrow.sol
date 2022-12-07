//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract Escrow{
    address public payer; //send the money
    address payable public beneficiary; //receiver the money
    address public lawyer;
    uint public amount;

    constructor(address _payer, address payable _beneficiary, uint _amount){
        payer = _payer;
        beneficiary = _beneficiary;
        lawyer = msg.sender;
        amount = _amount;
    }

    function deposit() payable public {
        require(msg.sender == payer, "Sender must be the payer");
        require( address(this).balance <= amount, "Wrong amount");
    }

    function release() public {
        require(address(this).balance == amount, "Cannot release funds before fill amount is sent");
        require(msg.sender == lawyer, "You are not lawyer");
        beneficiary.transfer(amount);
    }

    function balanceOf() public view returns (uint256){
        return address(this).balance;
    }

}