// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Competition is ERC721URIStorage, Ownable{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address[] public usersInCompetition;
    uint public spotsInCompetition = 100;
    uint256 private _cost = 0.01 ether; 

    constructor() ERC721("MyNFT", "WPOOL") {
    }

    modifier isInComp(){
        require(checkIfUserInCompetition(), "User is not a part of the current competition and therefore cannot mint.");
        _;
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
        require(msg.value == _cost, "Incorrect payment amount");
        usersInCompetition.push(msg.sender);
        spotsInCompetition -= 1;
    }

    function mintNFT(string memory tokenURI) public isInComp returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
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