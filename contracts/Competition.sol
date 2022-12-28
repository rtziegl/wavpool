// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Competition{

    address[] public usersInCompetition;
    uint public spotsInCompetition;
    uint public amtOfTickets;
    uint256 private _cost; 

    constructor(){
        spotsInCompetition = 100;
        amtOfTickets = 1;
        _cost = 0.01 ether;
    }

    function checkIfUserInCompetition() private view returns (bool) {
        for (uint256 i = 0; i < usersInCompetition.length; i++) {
            if(msg.sender == usersInCompetition[i]) 
                return true;
        }
        return false;
    }

    function buyin() public payable{
        require(!checkIfUserInCompetition(), "User has already purchased a ticket.");
        
    }


}