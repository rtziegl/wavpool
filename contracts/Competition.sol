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

    address private _voteLeader;
    int256 private _amtOfVotesForLeader;
    address[] private _leaders;
    uint256 private _leaderIndex;
    uint256 private _leaderCount;

    address constant private _DELETEDUSER = 0x0000000000000000000000000000000000000000;

    struct Competitor {
        address user;
        uint256 nftCount;
        uint256 allotedVotes;
        int256 gainedVotes;
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

    // Ensures user has not already voted.
    modifier canVote() {
        require(
            _users[msg.sender].allotedVotes == 1,
            "User has already voted.  Can only vote once per competition."
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
        _users[msg.sender] = Competitor(msg.sender, 0, 1, 0);
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

    // Starts competition.
    function startCompetition(
        uint256 spots,
        uint256 cost,
        string memory typeComp
    ) public onlyOwner {
        address[] memory dummyArray;
        _comps[_compIds] = Comp(dummyArray, cost, spots, _compIds, true, typeComp);
        /* Edit for test.
        _comps[_compIds].totalSpotsInComp = spots;
        _comps[_compIds].typeOfComp = typeComp;
        _comps[_compIds].costToJoin = cost;
        _comps[_compIds].compId = _compIds;
        _comps[_compIds].isCompStarted = true;
        */
    }

    // Ends a competition and finds winners.
    function endCompetition() public onlyOwner{
        // Only three winners allowed.
        if (_leaderCount <=2) {
            // Finds leader.
            for (uint256 i = 0; i < _comps[_compIds].usersInComp.length; i++) {
                if (
                    _users[_comps[_compIds].usersInComp[i]].gainedVotes >
                    _amtOfVotesForLeader && _comps[_compIds].usersInComp[i] != _DELETEDUSER
                ) {
                    _voteLeader = _users[_comps[_compIds].usersInComp[i]].user;
                    _amtOfVotesForLeader = _users[
                        _comps[_compIds].usersInComp[i]
                    ].gainedVotes;
                    _leaderIndex = i;
                }
            }
            // Adds top vote leader, tie goes to earlier buyin.
            _leaders.push(_voteLeader);
            // Deletes user from comp.
            delete _comps[_compIds].usersInComp[_leaderIndex];
            // Resets votes for leader to -1 which allows 2nd and third to be no votes 
            // just whoever bought in first (rare case).
            _amtOfVotesForLeader = -1;
            console.log("Leader", _leaderIndex);
            // Winner found.
            _leaderCount += 1;
            endCompetition();
        }
        else{
            //Delete whole array storing users for competion.
            //delete _comps[_compIds].usersInComp;
            _compIds += 1;
        }
    }

    // Allows users in competition to vote for a winning beat.
    // Subtracts the one vote alloted on buyin (cannot vote again).
    // Adds one vote to the user thats been voted for.
    function vote(address voteFor) public isInComp canVote {
        require(
            msg.sender != voteFor,
            "Not allowed to vote for yourself to win."
        );
        _users[msg.sender].allotedVotes -= 1;
        _users[voteFor].gainedVotes += 1;
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
            uint256,
            bool
        )
    {
        return (
            _comps[_compIds].compId,
            _comps[_compIds].usersInComp,
            _comps[_compIds].typeOfComp,
            _comps[_compIds].totalSpotsInComp,
            _comps[_compIds].costToJoin,
            _comps[_compIds].isCompStarted
        );
    }

    function getWinners() public view returns(address[] memory){
        return _leaders;
    }

    // Allows owner to break a tie if not everyone votes.
    function breakTie(address voteFor) public onlyOwner {
        _users[voteFor].gainedVotes += 1;
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
