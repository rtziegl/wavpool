// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Competition is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Comp, Competitor, Admin mappings.
    mapping(address => Competitor) private _users;
    mapping(address => Admin) private _admins;
    mapping(uint256 => Comp) private _comps;
    uint256 private _compIds;

    // Voting and Leader States.
    address private _voteLeader;
    int256 private _amtOfVotesForLeader;
    uint256 private _leaderIndex;
    uint256 private _leaderCount;

    // No user Address.
    address private constant _DELETEDUSER =
        0x0000000000000000000000000000000000000000;

    // Owner address.
    address private owner;

    // Events.
    event Start(uint256, uint256, string, string);
    event Payout(address, uint256, uint256);
    event End(address[], string);

    struct Competitor {
        address user;
        uint256 nftCountPerComp;
        uint256 nftCountAllTime;
        uint256 allotedVotesPerComp;
        int256 gainedVotesPerComp;
        int256 gainedVotesAllTime;
        uint256[3] amtOfLeaderPlacements;
        uint256 amtOfCompsEntered;
    }

    struct Comp {
        address[] usersInComp;
        address[] winners;
        uint256 costToJoin;
        uint256 totalSpotsInComp;
        uint256 compId;
        bool isCompStarted;
        string typeOfComp;
    }

    struct Admin {
        address adminAddress;
    }

    constructor() ERC721("wavpool NFT", "WAVP") {
        _comps[_compIds].isCompStarted = false;
        owner = msg.sender;
    }

    // Ensuring admin or Owner is using a function.
    modifier onlyAdmins() {
        require(
            msg.sender == _admins[msg.sender].adminAddress ||
                msg.sender == owner,
            "Not Admin or Owner. Therefore, not allowed."
        );
        _;
    }

    // Allows me to ensure ownership.
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner, not allowed.");
        _;
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
            _users[msg.sender].nftCountPerComp < 1,
            "User has already minted.  Only one mint per user allowed per competition."
        );
        _;
    }

    // Ensures user has not already voted.
    modifier canVote() {
        require(
            _users[msg.sender].allotedVotesPerComp == 1,
            "User has already voted.  Can only vote once per competition."
        );
        _;
    }

    // Allows an ownership check to be returned.
    function checkIfOwner() public view returns (bool) {
        if (owner == msg.sender) return true;
        else return false;
    }

    // Allows an admin check to be returned.
    function checkIfAdmin() public view returns (bool) {
        if (msg.sender == _admins[msg.sender].adminAddress) return true;
        else return false;
    }

    // Checks if user is in the competition.
    function checkIfUserInCompetition() private view returns (bool) {
        for (uint256 i = 0; i < _comps[_compIds].usersInComp.length; i++) {
            if (msg.sender == _comps[_compIds].usersInComp[i]) return true;
        }
        return false;
    }

    // Adds up total votes for each competitor for each competition.
    function addUpVotes() private {
        for (uint256 i = 0; i < _comps[_compIds].usersInComp.length; i++) {
            _users[_comps[_compIds].usersInComp[i]]
                .gainedVotesAllTime += _users[_comps[_compIds].usersInComp[i]]
                .gainedVotesPerComp;
        }
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

        uint256[3] memory dummyArray;
        // If competitor doesn't exist make a new competitor.
        if (_users[msg.sender].user != msg.sender) {
            _users[msg.sender] = Competitor(
                msg.sender,
                0,
                0,
                1,
                0,
                0,
                dummyArray,
                0
            );
            console.log("new");
        }
        // If competitior does already exist reset their alloted votes, gained votes and nft count.
        else {
            _users[msg.sender].allotedVotesPerComp = 1;
            _users[msg.sender].gainedVotesPerComp = 0;
            _users[msg.sender].nftCountPerComp = 0;
        }

        _comps[_compIds].usersInComp.push(msg.sender);
        _comps[_compIds].totalSpotsInComp -= 1;

        _users[msg.sender].amtOfCompsEntered += 1;
    }

    // Mints an NFT as long as isInComp is true.
    function mintNFT(
        string memory tokenURI
    ) public isInComp hasNotMinted returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _users[msg.sender].nftCountPerComp += 1;
        _users[msg.sender].nftCountAllTime += 1;
        return newItemId;
    }

    // Starts competition.
    function startCompetition(
        uint256 spots,
        uint256 cost,
        string memory typeComp
    ) public onlyAdmins {
        address[] memory dummyArray;
        _comps[_compIds] = Comp(
            dummyArray,
            dummyArray,
            cost,
            spots,
            _compIds,
            true,
            typeComp
        );

        // Emit start event.
        emit Start(
            spots,
            cost,
            typeComp,
            string.concat(
                "Competition ",
                Strings.toString(_compIds),
                "has started."
            )
        );
    }

    // Ends a competition and finds winners.
    function endCompetition() public onlyAdmins {
        // Only three winners allowed.
        if (_leaderCount <= 2) {
            // Finds leader.
            for (uint256 i = 0; i < _comps[_compIds].usersInComp.length; i++) {
                if (
                    _users[_comps[_compIds].usersInComp[i]].gainedVotesPerComp >
                    _amtOfVotesForLeader &&
                    _comps[_compIds].usersInComp[i] != _DELETEDUSER
                ) {
                    _voteLeader = _users[_comps[_compIds].usersInComp[i]].user;
                    _amtOfVotesForLeader = _users[
                        _comps[_compIds].usersInComp[i]
                    ].gainedVotesPerComp;
                    _leaderIndex = i;
                }
            }
            // Adds top vote leader, tie goes to earlier buyin.
            _comps[_compIds].winners.push(_voteLeader);
            // Deletes user from comp.
            delete _comps[_compIds].usersInComp[_leaderIndex];
            // Resets votes for leader to -1 which allows 2nd and third to be no votes
            // just whoever bought in first (rare case).
            _amtOfVotesForLeader = -1;
            // Winner found.
            _leaderCount += 1;
            endCompetition();
        } else {
            // Half of competition buyin price stays in contract.  Other half dispersed among winners.
            uint256 compBalance = (_comps[_compIds].costToJoin *
                _comps[_compIds].usersInComp.length) / 2;

            // Making payouts decreasing by half for 1st, 2nd, and 3rd place.
            for (uint256 i = 0; i < _comps[_compIds].winners.length; i++) {
                compBalance /= 2;
                address payable payoutAddress = payable(
                    _comps[_compIds].winners[i]
                );
                payoutAddress.transfer(compBalance);

                // Adds 1 to amtOfLeaderPlacements[i] which means they came in 1st, 2nd or, 3rd.
                _users[_comps[_compIds].winners[i]].amtOfLeaderPlacements[
                    i
                ] += 1;

                //Emit Payout event which is the winners address, the amount payed and the place the user came in.
                emit Payout(
                    _users[_comps[_compIds].winners[i]].user,
                    compBalance,
                    i
                );
            }

            // Gather up all gained votes for each competitor.
            addUpVotes();
            //Increasing ID for next competition.
            _compIds += 1;
            // Resets _leaderCount.
            _leaderCount = 0;
            // Emit end event which is the array of winners.
            emit End(_comps[_compIds].winners, "Competition Ended.");
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
        _users[msg.sender].allotedVotesPerComp -= 1;
        _users[voteFor].gainedVotesPerComp += 1;
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

    //Returns the winner after the first competition ends and every competition after that ends.
    function getWinners() public view returns (address[] memory) {
        require(_compIds >= 1, "The first competition hasn't ended.");
        return _comps[_compIds - 1].winners;
    }

    //Used to return competitor stats for each competitor.
    function getCompetitorStats(
        address competitors
    )
        public
        view
        returns (address, int256, int256, uint256[3] memory, uint256, uint256)
    {
        return (
            _users[competitors].user,
            _users[competitors].gainedVotesPerComp,
            _users[competitors].gainedVotesAllTime,
            _users[competitors].amtOfLeaderPlacements,
            _users[competitors].amtOfCompsEntered,
            _users[competitors].nftCountAllTime
        );
    }

    // Adds an admin.
    function addAdmin(address admin) public onlyOwner {
        _admins[admin] = Admin(admin);
    }

    // Deletes an admin.
    function delAdmin(address admin) public onlyOwner {
        delete _admins[admin];
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
