// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


/****************************************************/
/*  
    Error Codes:
    NAO -> Not admin or owner. Therefore, not allowed.
    NO -> Not owner. Not allowed.
    UNIC -> User not in competition and cannot mint for free.
    UAM -> User has already minted.  Only one mint per user allowed per competition.
    UAV -> User has already voted.  Can only vote once per competition.
    UAT -> User has already purchased a ticket.
    NSL -> No spots left in competition.
    IPA -> Incorrect Payment Amount.
    CVS -> Not allowed to vote for yourself to win competition.
    FHE -> The first competition hasn't ended.
*/
/****************************************************/

contract Competition is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    error NotAdminOrOwner();
    error NotOwner();
    error NotInCompetition();
    error AlreadyMinted();
    error AlreadyVoted();
    error AlreadyPurchasedTicket();
    error NoSpotsLeft();
    error IncorrectPaymentAmount();
    error CannotVoteForSelf();
    error FirstCompetitionNotEnded();

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

    //Holds all users addresses that have bought in.
    address[] private _allCompetitors;

    // Events.
    event Start(uint256, uint256, string, string);
    event Buyin(address);
    event Payout(address, uint256, uint256);
    event End(address[], string);

    struct Competitor {
        address user;
        uint32 nftCountPerComp;
        uint256 nftCountAllTime;
        uint8 allotedVotesPerComp;
        int32 gainedVotesPerComp;
        int256 gainedVotesAllTime;
        uint256[3] amtOfLeaderPlacements;
        uint256 amtOfCompsEntered;
    }

    struct Comp {
        address[] usersInComp;
        address[] winners;
        string[] uris;
        uint256 costToJoin;
        uint256 totalSpotsInComp;
        uint256 compId;
        bool isCompStarted;
        bool hasCompEnded;
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
        if(msg.sender == _admins[msg.sender].adminAddress ||
                msg.sender == owner)
                _;
        else 
            revert NotAdminOrOwner();
    }

    // Allows me to ensure ownership.
    modifier onlyOwner() {
        if(msg.sender == owner)
            _;
        else
            revert NotOwner();
    }

    // Ensures user is in competition before being able to mint an nft.
    modifier isInComp() {
        require(
            checkIfUserInCompetition(),
            "UNIC"
        );
        _;
    }

    // Ensures user has not already minted during the competition.
    modifier hasNotMinted() {
        require(
            _users[msg.sender].nftCountPerComp < 1,
            "UAM"
        );
        _;
    }

    // Ensures user has not already voted.
    modifier canVote() {
        if (_users[msg.sender].allotedVotesPerComp == 1)
            _;
        else 
            revert AlreadyVoted();
    }

    // Ensures first competition has ended.
    modifier firstCompHasEnded(){
         //require(_compIds >= 1, "FHE");
        if (_compIds >= 1)
            _;
        else
            revert FirstCompetitionNotEnded();
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
    function tallyVotes() private {
        for (uint256 i = 0; i < _comps[_compIds].usersInComp.length; i++) {
            _users[_comps[_compIds].usersInComp[i]]
                .gainedVotesAllTime += _users[_comps[_compIds].usersInComp[i]]
                .gainedVotesPerComp;
        }
    }

    // Allows for buyin to competition.
    function buyin() public payable {
        if (checkIfUserInCompetition())
            revert AlreadyPurchasedTicket();
        else if (_comps[_compIds].totalSpotsInComp == 0)
            revert NoSpotsLeft();
        else if (msg.value != _comps[_compIds].costToJoin)
            revert IncorrectPaymentAmount();
        else {

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

                _allCompetitors.push(msg.sender);
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

            emit Buyin(msg.sender);
        }
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
        _comps[_compIds].uris.push(tokenURI);
        return newItemId;
    }

    // Starts competition.
    function startCompetition(
        uint256 spots,
        uint256 cost,
        string memory typeComp
    ) public onlyAdmins {
        address[] memory emptyAddress;
        string[] memory emptyString;
        _comps[_compIds] = Comp(
            emptyAddress,
            emptyAddress,
            emptyString,
            cost,
            spots,
            _compIds,
            true,
            false,
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
                " has started."
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
            tallyVotes();
            //Increasing ID for next competition.
            _compIds += 1;
            // Resets _leaderCount.
            _leaderCount = 0;
            // Sets hasCompEnded to true;
            _comps[_compIds].hasCompEnded = true;
            // Emit end event which is the array of winners.
            emit End(_comps[_compIds].winners, "Competition Ended.");
        }
    }

    // ALlows admins to cancel the competition by deleting the comp.
    function cancelCompetition() public onlyAdmins{
        delete _comps[_compIds];
    }

    // Allows users in competition to vote for a winning beat.
    // Subtracts the one vote alloted on buyin (cannot vote again).
    // Adds one vote to the user thats been voted for.
    function vote(address voteFor) public isInComp canVote {
        /*require(
            msg.sender != voteFor,
            "CVS"
        );*/
        if (msg.sender == voteFor)
            revert CannotVoteForSelf();
        else {
        _users[msg.sender].allotedVotesPerComp -= 1;
        _users[voteFor].gainedVotesPerComp += 1;
        }
    }

    // Returns all competitors that have ever bought in.
    function getAllUsers() public view returns (address[] memory) {
        return _allCompetitors;
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
            string[] memory,
            string memory,
            uint256,
            uint256,
            bool,
            bool
        )
    {
        return (
            _comps[_compIds].compId,
            _comps[_compIds].usersInComp,
            _comps[_compIds].uris,
            _comps[_compIds].typeOfComp,
            _comps[_compIds].totalSpotsInComp,
            _comps[_compIds].costToJoin,
            _comps[_compIds].isCompStarted,
            _comps[_compIds].hasCompEnded
        );
    }

    //Returns the winner after the first competition ends and every competition after that ends.
    function getWinners() public firstCompHasEnded view returns (address[] memory) {
        return _comps[_compIds - 1].winners;
    }

    //Used to return competitor stats for each competitor.
    function getCompetitorStats(
        address competitors
    )
        public
        view
        returns (address, int256, uint256[3] memory, uint256, uint256)
    {
        return (
            _users[competitors].user,
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
