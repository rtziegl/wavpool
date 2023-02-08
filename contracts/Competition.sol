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
    uint public spotsInCompetition = 50;
    uint256 private _cost = 0.01 ether; 
    bool private competitionStarted = false;

    constructor() ERC721("wavpool NFT", "WAVP") {}

    // Ensures user is in competition before being able to mint an nft.
    modifier isInComp(){
        require(checkIfUserInCompetition(), "User is not a part of the current competition and therefore cannot mint.");
        _;
    }

    // Checks if user is in the competition.
    function checkIfUserInCompetition() private view returns (bool) {
        for (uint256 i = 0; i < usersInCompetition.length; i++) {
            if(msg.sender == usersInCompetition[i]) 
                return true;
        }
        return false;
    }

    // Allows for buyin to competition.
    function buyin() public payable{
        require(!checkIfUserInCompetition(), "User has already purchased a ticket.");
        require(spotsInCompetition > 0, "No spots left in competition.");
        require(msg.value == _cost, "Incorrect payment amount.");
        usersInCompetition.push(msg.sender);
        spotsInCompetition -= 1;
    }

    // Mints an NFT as long as isInComp is true.
    function mintNFT(string memory tokenURI) public isInComp returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    // Returns list of all competitors.
    function getAllFromCompetition() public view returns (address[] memory){
        return usersInCompetition;
    }

    // Returns amount of spots remaining in current competition.
    function getSpotsRemaining() public view returns (uint){
        return spotsInCompetition;
    }

    // Returns true if competition is started and false if competition has not started.
    function getStatusOfCompetition() public view returns (bool){
        return competitionStarted;
    }

    // Returns current balance of contract.
    function getBalanceOfContract() public view onlyOwner returns  (uint){
        return address(this).balance;
    }

    // Starts/resets competition.
    function startCompetition() public onlyOwner {
        if(usersInCompetition.length > 0)
            delete usersInCompetition;
        spotsInCompetition = 50;
        competitionStarted = true;
    }

    function withdrawMoney() public onlyOwner {
        address payable to = payable(msg.sender);
        to.transfer(getBalanceOfContract());
    }
}