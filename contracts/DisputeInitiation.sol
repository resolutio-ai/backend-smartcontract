// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

/// @title DisputePool
/// @author Ogubuike Alexandra
/// @notice Handles Functionalities involved in Resolutio's Dispute Resolution

import "./ArbiterSelection.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Disputepool is Ownable {
    uint256 private _itemIds;
    uint256 private resolvedItemsIds;

    uint8 public allowedArbiters = 3;
    uint256 public stake = 0.02 ether;

    ArbiterWhitelister _arbiterWhitelist;

    /// @dev A structure to hold the state of a given dispute.
    /// @param disputeId The Id that identifies a particular dispute within the contract.
    /// @param resolved A boolean to tell if dispute has been resolved.
    /// @param isOpenForApplication A boolean to tell if arbiters can still apply to resolve dispute.
    /// @param HasSelectedArbiters A boolean to tell if arbiters have been selected for dispute
    struct Dispute {
        uint8 arbiterCount;
        Proposal winningProposal;
        State state;
        address creator;
        uint256 createdAt;
        uint256 disputeId;
        string uri;
        DisputeToDecision[] selectedArbiters;
        address[] disputePool;
    }

    struct DisputeToDecision {
        Decision decision;
        bool hasVoted;
        address arbiter;
        uint256 disputeId;
    }

    enum Proposal {
        Validate,
        Invalidate
    }

    enum State {
        UnInitialized,
        IsCreated,
        ArbiterSelection,
        CanVote,
        ComputeResult,
        End
    }

    enum Decision {
        Null,
        Validate,
        Invalidate
    }

    modifier isArbiter(address caller) {
        //Should call the arbiter selection contract and confirm if a person is an arbiter
        if (_arbiterWhitelist.verifyUser(caller) == false) {
            revert("Unauthorized");
        }
        _;
    }

    event DisputeCreated(
        uint256 indexed disputeId,
        address indexed creator,
        uint256 timestamp
    );
    event DisputePoolJoined(
        uint256 indexed disputeId,
        address indexed arbiter,
        uint256 timestamp
    );
    event Voted(
        Decision decision,
        uint256 indexed disputeId,
        address indexed arbiter
    );

    event AssignedArbiters(
        uint256 disputeId,
        DisputeToDecision[] selectedArbiters,
        uint256 timeStatmp
    );

    /// @dev links an arbiter to a DisputeToDecision (i.e a dispute and his decision for that dispute. The mapping is from the disputeId to the Decision)
    mapping(address => mapping(uint256 => DisputeToDecision))
        public arbiterToDisputes;

    //// @dev links the ItemId (disputeId) to a dispute
    mapping(uint256 => Dispute) public itemIdToDispute;

    //0x15C89FAa1b28BA3D667F05aA871484254e01C9EE - Randomizer
    constructor(address arbiterWhitelist) {
        _arbiterWhitelist = ArbiterWhitelister(arbiterWhitelist);
    }

    /// @notice Create a new dispute (Initializiing its state to created)
    /// @dev Increments current ItemId and uses new value as disputeId
    /// @param uri The URI that holds the metadata of the dispute being created
    function createDispute(string memory uri) external payable {
        require(msg.value == stake, "Invalid stake");

        // //require we are not creating the token twice!
        _itemIds += 1;

        Dispute storage _dispute = itemIdToDispute[_itemIds];
        _dispute.state = State.IsCreated;
        _dispute.creator = msg.sender;
        _dispute.arbiterCount = allowedArbiters;
        _dispute.uri = uri;
        _dispute.disputeId = _itemIds;
        _dispute.createdAt = block.timestamp;

        emit DisputeCreated(_itemIds, msg.sender, block.timestamp);
    }

    function changeDisputeState(uint256 id, uint256 move) external onlyOwner {
        require(move == 1 || move == 2, "Invalid move");

        Dispute storage _dispute = itemIdToDispute[id];
        if (move == 1) {
            _dispute.state = State((uint256(_dispute.state)) + 1);
        } else {
            _dispute.state = State((uint256(_dispute.state)) - 1);
        }

        itemIdToDispute[id] = _dispute;
    }

    /// @dev Adds an arbiter to a dispute pool
    /// @param id The disputeId for the dispute
    function joinDisputePool(uint256 id)
        external
        payable
        isArbiter(msg.sender)
    {
        //Confirm Stake
        require(msg.value == stake, "Invalid stake");
        //Get a dispute
        Dispute memory _dispute = itemIdToDispute[id];

        require(_dispute.state == State.IsCreated, "Invalid State");

        //Add caller to the dispute pool of this dispute
        itemIdToDispute[id].disputePool.push(msg.sender);

        emit DisputePoolJoined(id, msg.sender, block.timestamp);
    }

    /// @dev assigns arbiters that corresponds to the index being passed as parameters
    /// @param id The disputeId for the dispute
    function assignRandomArbiters(uint256 id, uint256[] calldata randomvalues)
        external
        onlyOwner
    {
        Dispute storage _dispute = itemIdToDispute[id];

        require(_dispute.state == State.ArbiterSelection, "Invalid state");
        address[] memory addresses = _dispute.disputePool;

        for (uint256 i = 0; i < randomvalues.length; i++) {
            //get a random index
            uint256 randomIndex = randomvalues[i];

            if (randomIndex > addresses.length - 1 || randomIndex < 0) {
                revert("invalid index sent");
            }

            DisputeToDecision memory selected = DisputeToDecision({
                decision: Decision.Null,
                arbiter: addresses[randomIndex],
                disputeId: id,
                hasVoted: false
            });

            //Add that address to the list of selected arbiters
            _dispute.selectedArbiters.push(selected);
        }

        _dispute.state = State.CanVote;

        emit AssignedArbiters(id, _dispute.selectedArbiters, block.timestamp);
    }

    /**
     * @dev Give your vote to proposal 'proposals[proposal].name'.
     * @param decision index of proposal in the proposals array
     * @param disputeId The id for the dispute
     */
    function vote(Decision decision, uint256 disputeId)
        external
        isArbiter(msg.sender)
    {
        //Get a dispute and its selected arbiters
        Dispute storage _dispute = itemIdToDispute[disputeId];
        DisputeToDecision[] storage _disputeToDecision = itemIdToDispute[
            disputeId
        ].selectedArbiters;

        require(_dispute.state == State.CanVote, "Invalid State");
        require(decision != Decision.Null, "Invalid input");

        //Check for the sender in the dispute selected arbiters and if she is found change the decision for that person
        for (uint256 i = 0; i < _disputeToDecision.length; i++) {
            if (_disputeToDecision[i].arbiter == msg.sender) {
                require(!_disputeToDecision[i].hasVoted, "Already Voted");
                _disputeToDecision[i].decision = decision;
                _disputeToDecision[i].hasVoted = true;
                emit Voted(decision, disputeId, msg.sender);
                return;
            }
            continue;
        }

        revert("Unauthorized Voter!");
    }

    /**
     * @dev End voting process and refund arbiters that voted the winning proposal
     * @param disputeId The id for the dispute
     */
    function endVoting(uint256 disputeId) external onlyOwner {
        //Confirm dipute State
        Dispute storage _dispute = itemIdToDispute[disputeId];
        require(_dispute.state == State.ComputeResult, "Invalid State");

        //Get the selected arbiters form the dispute
        DisputeToDecision[] memory _disputeToDecision = itemIdToDispute[
            disputeId
        ].selectedArbiters;

        //Set variables for calculating valodations/Invalidations
        uint8 validated = 0;
        uint8 invalidated = 0;

        //Confirm that everyone has voted
        for (uint256 i = 0; i < _disputeToDecision.length; i++) {
            if (
                !_disputeToDecision[i].hasVoted ||
                _disputeToDecision[i].decision == Decision.Null
            ) {
                revert("Vote must be complete!");
            }

            //Calculate the number of validations versus invalidations
            if (_disputeToDecision[i].decision == Decision.Validate) {
                validated++;
            } else if (_disputeToDecision[i].decision == Decision.Invalidate) {
                invalidated;
            }
        }

        //Arbiter number must always be an odd number so we cannot have a tie
        if (validated > invalidated) {
            _dispute.winningProposal = Proposal.Validate;
        } else {
            _dispute.winningProposal = Proposal.Invalidate;
        }

        _dispute.state = State.End;
        itemIdToDispute[disputeId] = _dispute;

        for (uint256 i = 0; i < _disputeToDecision.length; i++) {
            if (_dispute.winningProposal == Proposal.Validate) {
                (bool success, ) = _disputeToDecision[i].arbiter.call{
                    value: stake
                }("");
                require(success, "Refund Error!");
            } else if (_dispute.winningProposal == Proposal.Invalidate) {
                (bool success, ) = _disputeToDecision[i].arbiter.call{
                    value: stake
                }("");
                require(success, "Refund Error!");
            }
        }
    }

    /// @dev Gets the selected addresses for a dispute
    /// @param disputeId The disputeId for the dispute
    /// @return an array of addresses belonging to selected arbiters
    function getAddressesForDispute(uint256 disputeId)
        external
        view
        returns (DisputeToDecision[] memory)
    {
        return itemIdToDispute[disputeId].selectedArbiters;
    }

    /// @dev Gets all dispute ever created in the smart contract
    /// @return an array of disputes
    function getAllDisputes() external view returns (Dispute[] memory) {
        uint256 itemCount = _itemIds;
        uint256 currentIndex = 0;

        Dispute[] memory items = new Dispute[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;
            Dispute memory currentDispute = itemIdToDispute[currentId];
            items[currentIndex] = currentDispute;
            currentIndex += 1;
        }
        return items;
    }

    /// @dev Gets A dispute
    /// @param disputeId The disputeId for the dispute
    /// @return an array of disputes
    function getDispute(uint256 disputeId)
        external
        view
        returns (Dispute memory)
    {
        return itemIdToDispute[disputeId];
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
