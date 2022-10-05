// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

/// @title DisputePool
/// @author Ogubuike Alexandra
/// @notice Handles Functionalities involved in Resolutio's Dispute Resolution

import "./ArbiterSelection.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Disputepool {
    uint256 private _itemIds;
    uint256 private resolvedItemsIds;

    uint8 public allowedArbiters = 3;
    uint256 public stake = 0.02 ether;

    IRandomizer _random;
    ArbiterWhitelister _arbiterWhitelist;

    /// @dev A structure to hold the state of a given dispute.
    /// @param disputeId The Id that identifies a particular dispute within the contract.
    /// @param resolved A boolean to tell if dispute has been resolved.
    /// @param isOpenForApplication A boolean to tell if arbiters can still apply to resolve dispute.
    /// @param HasSelectedArbiters A boolean to tell if arbiters have been selected for dispute
    struct Dispute {
        uint8 arbiterCount;
        uint8 winningProposal;
        State state;
        address creator;
        uint256 createdAt;
        uint256 disputeId;
        string uri;
        address[] selectedArbiters;
        address[] disputePool;
    }

    struct DisputeToDecision {
        Decision decision;
        bool isSelected;
        bool hasStaked;
        uint256 disputeId;
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
        uint256 disputeId,
        address indexed arbiter,
        uint256 timestamp
    );
    event Voted(
        Decision indexed decision,
        uint256 indexed disputeId,
        address indexed arbiter
    );

    event AssignedArbiters(
        uint256 disputeId,
        address[] selectedArbiters,
        uint256 timeStatmp
    );

    /// @dev links an arbiter to a DisputeToDecision (i.e a dispute and his decision for that dispute. The mapping is from the disputeId to the Decision)
    mapping(address => mapping(uint256 => DisputeToDecision))
        public arbiterToDisputes;

    //// @dev links the ItemId (disputeId) to a dispute
    mapping(uint256 => Dispute) public itemIdToDispute;

//0x15C89FAa1b28BA3D667F05aA871484254e01C9EE - Randomizer
    constructor(address randomizer, address arbiterWhitelist) {
        _random = IRandomizer(randomizer);
        _arbiterWhitelist = ArbiterWhitelister(arbiterWhitelist);
    }

    /// @notice Create a new dispute (Initializiing its state to created)
    /// @dev Increments current ItemId and uses new value as disputeId
    /// @param uri The URI that holds the metadata of the dispute being created
    function createDispute(string memory uri) external payable {
        require(msg.value == stake, "Invalid stake");
        //require we are not creating the token twice!
        uint256 count = _itemIds;
        count += 1;

        address[] memory _arbiters;

        itemIdToDispute[count] = Dispute({
            state: State.IsCreated,
            creator: msg.sender,
            arbiterCount: allowedArbiters,
            winningProposal: 0,
            createdAt: block.timestamp,
            disputeId: count,
            uri: uri,
            selectedArbiters: _arbiters,
            disputePool: _arbiters
        });

        _itemIds = count;
        emit DisputeCreated(count, msg.sender, block.timestamp);
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

        //If its been more than 3 days after dispute creation change state to can vote
        if (_dispute.createdAt + 3 days > block.timestamp) {
            _dispute.state = State.ArbiterSelection;
            itemIdToDispute[id] = _dispute;
            revert("Invalid State");
        }

        //initialize disputesTodecision for the caller, It does not exist at this point 
        DisputeToDecision memory _arbiterToDisputes = arbiterToDisputes[
            msg.sender
        ][id];

        //Set the dispute Id and confirm that arbiter has staked
        _arbiterToDisputes.disputeId = id;
        _arbiterToDisputes.hasStaked = true;

        //get the number of addresses in the dispute pool of the dispute
        uint256 poolLength = _dispute.disputePool.length;

        //Add caller to the dispute pool of this dispute
        itemIdToDispute[id].disputePool[poolLength] = msg.sender;

        //Add dispute to the list of disputes for this arbiter
        arbiterToDisputes[msg.sender][id] = _arbiterToDisputes;

        emit DisputePoolJoined(id, msg.sender, block.timestamp);
    }

    /// @dev assigns arbiters that corresponds to the index being passed as parameters
    /// @param id The disputeId for the dispute
    function assignRandomArbiters(uint256 id) external {
        Dispute memory _dispute = itemIdToDispute[id];

        // //Extract
        if (_dispute.createdAt + 3 days > block.timestamp) {
            _dispute.state = State.ArbiterSelection;
            itemIdToDispute[id] = _dispute;
            revert();
        }

        require(_dispute.state == State.ArbiterSelection, "Invalid state");
        address[] memory addresses = _dispute.disputePool;

        _random.requestRandomWords();
        uint256[] memory randomvalues = _random.s_randomWords();

        for (uint256 i = 0; i < randomvalues.length; i++) {           
            //get a random index
            uint256 randomIndex = randomvalues[i];
            //use the random index to get an address-- Addresses must correspond to random index to avoid error
            address selected = addresses[randomIndex];
            //Add that address to the list of selected arbiters
            _dispute.selectedArbiters[i] = selected;
        }

        _dispute.state = State.CanVote;
        itemIdToDispute[id] = _dispute;

        emit AssignedArbiters(id, _dispute.selectedArbiters, block.timestamp);
    }

    /**
     * @dev Give your vote to proposal 'proposals[proposal].name'.
     * @param decision index of proposal in the proposals array
     * @param disputeId The id for the dispute
     */
    function vote(Decision decision, uint256 disputeId) external {
        //Initialize a dispute to deciaion for arbiter
        DisputeToDecision memory _disputeToDecision = arbiterToDisputes[
            msg.sender
        ][disputeId];

        //Require that arbiter has been selected for 
        require(_disputeToDecision.isSelected, "Unauthorized!");
        require(decision != Decision.Null, "Invalid input");

        Dispute memory _dispute = itemIdToDispute[disputeId];

        require(_dispute.state == State.CanVote, "Invalid State");

        _disputeToDecision.decision = decision;
        arbiterToDisputes[msg.sender][disputeId] = _disputeToDecision;

        //Bot should be able to listen that all vot has been cast and change the state
        emit Voted(decision, disputeId, msg.sender);
    }

    
    /**
     * @dev End voting process and refund arbiters that voted the winning proposal
     * @param disputeId The id for the dispute
     */
    function endVoting(uint256 disputeId) external {
        Dispute memory _dispute = itemIdToDispute[disputeId];

        require(_dispute.state == State.ComputeResult, "Invalid State");

        address[] memory _selectedArbiters = _dispute.selectedArbiters;
        uint8 validated = 0;
        uint8 invalidated = 0;
        address[] memory validatedArbiters;
        address[] memory invalidatedArbiters;

        for (uint256 i = 0; i < _selectedArbiters.length; i++) {
            //get the list of selctedArbietrs and require that each of them have made a decision
            //then change state for the dispute
            address arbiterAddress = _selectedArbiters[i];
            DisputeToDecision memory _disputeToDecision = arbiterToDisputes[
                arbiterAddress
            ][disputeId];

            if (_disputeToDecision.decision == Decision.Null) {
                revert("decision not made");
            } else if (_disputeToDecision.decision == Decision.Validate) {
                validatedArbiters[validated] = arbiterAddress;
                validated += 1;
            } else if (_disputeToDecision.decision == Decision.Invalidate) {
                invalidatedArbiters[invalidated] = arbiterAddress;
                invalidated += 1;
            }
        }

        //Arbiter number must always be an odd number so we cannot have a tie
        if (validated > invalidated) {
            _dispute.winningProposal = validated;
        } else {
            _dispute.winningProposal = invalidated;
        }

        _dispute.state = State.End;
        itemIdToDispute[disputeId] = _dispute;

        if (_dispute.winningProposal == validated) {
            for (uint256 i = 0; i < validatedArbiters.length; i++) {
                (bool success, ) = validatedArbiters[i].call{value: stake}("");
                require(success, "Refund Error!");
            }
        } else if (_dispute.winningProposal == invalidated) {
            for (uint256 i = 0; i < invalidatedArbiters.length; i++) {
                (bool success, ) = invalidatedArbiters[i].call{value: stake}(
                    ""
                );
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
        returns (address[] memory)
    {
        return itemIdToDispute[disputeId].selectedArbiters;
    }

    /// @dev Gets all dispute ever created in the smart contract
    /// @return an array of disputes
    function getAllDisputes() public view returns (Dispute[] memory) {
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
}

interface IRandomizer {
    function s_randomWords() external returns (uint256[] calldata);
    function requestRandomWords() external returns (uint256 requestId); 
    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords);   
}