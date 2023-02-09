// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

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
        uint256 compId;
        bool isCompStarted;
        string typeOfComp;
    }

    constructor() ERC721("wavpool NFT", "WAVP") {
        _comps[_compIds].isCompStarted = false;
    }

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

    // Starts/resets competition.
    function startCompetition(
        uint256 spots,
        uint256 cost,
        string memory typeComp
    ) public onlyOwner {
        if (_comps[_compIds].usersInComp.length > 0) _compIds += 1;
        delete _comps[_compIds].usersInComp;
        _comps[_compIds].totalSpotsInComp = spots;
        _comps[_compIds].typeOfComp = typeComp;
        _comps[_compIds].costToJoin = cost;
        _comps[_compIds].compId = _compIds;
        _comps[_compIds].isCompStarted = true;
    }

    // Returns all stats.
    // Competition Id (uint), All users in competition array (address[]), Type of competition (string),
    // Total spots in competiion (uint), and Cost to join the competition (uint).
    // spots, cost , and type set by owner for now.
    function getCompetitionStats()
        public
        view
        returns (
            uint256,
            address[] memory,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            _comps[_compIds].compId,
            _comps[_compIds].usersInComp,
            _comps[_compIds].typeOfComp,
            _comps[_compIds].totalSpotsInComp,
            _comps[_compIds].costToJoin
        );
    }

    // Returns current balance of contract.
    function getBalanceOfContract() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    // Withdraws money from contract to owner.
    function withdrawMoney() public onlyOwner {
        address payable to = payable(msg.sender);
        to.transfer(getBalanceOfContract());
    }
}
