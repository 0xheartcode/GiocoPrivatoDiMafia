// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract MafiaGamePrep {
    address public owner;
    mapping(address => uint256) public deposits;
    mapping(address => bool) public readyToEnterGame;
    uint256 public enterGameFee = 1 ether;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Owner functions

    function ownerChangeOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }

    // Function to allow the owner to set readyToEnterGame to false for any address
    function ownerResetReadyToEnterGame(address player) public onlyOwner {
        readyToEnterGame[player] = false;
    }


    function ownerWithdraw(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(amount);
    }


    // Player functions


    receive() external payable {
        deposits[msg.sender] += msg.value;
    }

    function enterGame() public {
        require(deposits[msg.sender] >= enterGameFee, "Insufficient funds to enter the game");
        require(!readyToEnterGame[msg.sender], "Player is already ready to enter the game");

        deposits[msg.sender] -= enterGameFee;
        readyToEnterGame[msg.sender] = true;
    }


}


