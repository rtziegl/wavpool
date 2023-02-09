// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// TODO
// 1. Restrict ability to mint only 1 nft per buy in. (Struct holding nft count for e competitor)
// 2. Possible Comp struct holding the array of users and competitionStarted.
// 2 cont. Need identifier for each competition.  Possible use of Counters.counter.

contract Competition is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => Competitor) private _users;
    mapping(uint256 => Comp) private _comps;
    uint256 private _compIds;

    struct Competitor {
        address users;
        uint256 nftCount;
    }

    struct Comp {
        address[] usersInComp;
        uint256 costToJoin;
        uint256 totalSpotsInComp;
        bool isCompStarted;
        uint256 compId;
    }

    constructor() ERC721("wavpool NFT", "WAVP") {}

    // Ensures user is in competition before being able to mint an nft.
    modifier isInComp() {
        require(
            checkIfUserInCompetition(),
            "User is not a part of the current competition and therefore cannot mint."
        );
        _;
    }

    // Ensures user has not already minted during the competition.
    modifier hasNotMinted() {
        require(
            _users[msg.sender].nftCount < 1,
            "User has already minted.  Only one mint per user allowed per competition."
        );
        _;
    }

    // Checks if user is in the competition.
    function checkIfUserInCompetition() private view returns (bool) {
        for (uint256 i = 0; i < _comps[_compIds].usersInComp.length; i++) {
            if (msg.sender == _comps[_compIds].usersInComp[i]) return true;
        }
        return false;
    }

    // Allows for buyin to competition.
    function buyin() public payable {
        require(
            !checkIfUserInCompetition(),
            "User has already purchased a ticket."
        );
        require(
            _comps[_compIds].totalSpotsInComp > 0,
            "No spots left in competition."
        );
        require(
            msg.value == _comps[_compIds].costToJoin,
            "Incorrect payment amount."
        );
        _users[msg.sender] = Competitor(msg.sender, 0);
        _comps[_compIds].usersInComp.push(msg.sender);
        _comps[_compIds].totalSpotsInComp -= 1;
    }

    // Mints an NFT as long as isInComp is true.
    function mintNFT(string memory tokenURI)
        public
        isInComp
        hasNotMinted
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _users[msg.sender].nftCount += 1;
        return newItemId;
    }

    // Returns list of all competitors.
    function getAllFromCompetition() public view returns (address[] memory) {
        return _comps[_compIds].usersInComp;
    }

    // Returns amount of spots remaining in current competition.
    function getSpotsRemaining() public view returns (uint256) {
        return _comps[_compIds].totalSpotsInComp;
    }

    // Returns true if competition is started and false if competition has not started.
    function getStatusOfCompetition() public view returns (bool) {
        return _comps[_compIds].isCompStarted;
    }

    // Returns current balance of contract.
    function getBalanceOfContract() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    // Starts/resets competition.
    function startCompetition(uint256 spots, uint256 cost) public onlyOwner {
        if (_comps[_compIds].usersInComp.length > 0) _compIds += 1;
        delete _comps[_compIds].usersInComp;
        _comps[_compIds].totalSpotsInComp = spots;
        _comps[_compIds].isCompStarted = true;
        _comps[_compIds].costToJoin = cost;
        _comps[_compIds].compId = _compIds;
    }

    function returnMap() public view returns (uint256) {
        return _comps[_compIds].compId;
    }

    // Withdraws money from contract to owner.
    function withdrawMoney() public onlyOwner {
        address payable to = payable(msg.sender);
        to.transfer(getBalanceOfContract());
    }
}
