// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Competition is Ownable{

    address[] public usersInCompetition;
    uint public spotsInCompetition = 100;
    uint256 private _cost = 0.01 ether; 

    function checkIfUserInCompetition() private view returns (bool) {
        for (uint256 i = 0; i < usersInCompetition.length; i++) {
            if(msg.sender == usersInCompetition[i]) 
                return true;
        }
        return false;
    }

    function buyin() public payable{
        require(!checkIfUserInCompetition(), "User has already purchased a ticket.");
        require(msg.value == _cost, "Incorrect payment amount");
        usersInCompetition.push(msg.sender);
        spotsInCompetition -= 1;
    }

    function getAllFromCompetition() public view returns (address[] memory){
        return usersInCompetition;
    }

    function getSpotsRemaining() public view returns (uint){
        return spotsInCompetition;
    }

    function getBalanceOfContract() public view returns  (uint){
        return address(this).balance;
    }

    function resetCompetition() public onlyOwner {
        delete usersInCompetition;
        spotsInCompetition = 100;
    }

    function withdrawMoney() public onlyOwner {
        address payable to = payable(msg.sender);
        to.transfer(getBalanceOfContract());
    }
}