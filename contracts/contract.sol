// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract GuessingGame is VRFConsumerBase {
    struct Rules {
        uint256 minGuess;
        uint256 maxGuess;
        uint256 minPlayers;
        uint256 entryFee;
    }

    mapping(address => uint256) private playersGuesses;
    mapping(address => uint256) private playersTarget;

    address[] public players;

    Rules public RULES;

    address public owner;
    address public winner;

    mapping(bytes32 => uint256) private randomNumbers;

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        uint256 _minGuess,
        uint256 _maxGuess,
        uint256 _minPlayers,
        uint256 _entryFee
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        owner = msg.sender;
        RULES = Rules(_minGuess, _maxGuess, _minPlayers, _entryFee);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only the owner can use this function.");
        _;
    }

    // sieht okay für mich aus
    function enterGuess(uint256 _guess) public payable {
        require(msg.value == RULES.entryFee, "Insufficient entry fee.");
        require(
            _guess >= RULES.minGuess && _guess <= RULES.maxGuess,
            "Check your input value."
        );
        require(
            playersGuesses[msg.sender] == 0,
            "You have already entered a guess."
        );
        players.push(msg.sender);
        playersGuesses[msg.sender] = _guess;
    }

    function sumGuesses() private view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < players.length; i++) {
            sum = playersGuesses[players[i]];
        }
        return sum;
    }

    function startGame() public onlyOwner {
        require(players.length >= RULES.minPlayers, "Not enough players.");
        uint256 target = ((sumGuesses() / players.length) * 66) / 100; // geändert von /3 * 2 wegen genauigkeit und rundung von solidity

        uint256 minDiff = RULES.maxGuess;
        for (uint256 i = 0; i < players.length; i++) {
            if (absDiff(playersGuesses[players[i]], target) <= minDiff) {
                minDiff = absDiff(playersGuesses[players[i]], target);
            }
        }

        uint256 count = 0;
        for (uint256 i = 0; i < players.length; i++) {
            if (minDiff == absDiff(playersGuesses[players[i]], target)) {
                count++;
            }
        }

        address[] memory winners = new address[](count);
        for (uint256 i = 0; i < players.length; i++) {
            if (minDiff == absDiff(playersGuesses[players[i]], target)) {
                winners[i] = players[i];
            }
        }

        uint256 winnerIndex = uint256(randomNumbers[0]) % (winners.length);
        winner = winners[winnerIndex];
        payout();
    }

    function absDiff(
        uint256 num1,
        uint256 num2
    ) private pure returns (uint256) {
        if (num1 >= num2) {
            return num1 - num2;
        } else {
            return num2 - num1;
        }
    }

    function payout() private {
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance to payout.");
        require(winner != address(0), "Winner has not been announced yet.");
        payable(winner).transfer(amount);
    }

    function getPlayerCount() public view returns (uint256) {
        return players.length;
    }

    function getMyGuess() public view returns (uint256) {
        return playersGuesses[msg.sender];
    }

    function requestRandomNumber() private returns (bytes32) {
        require(
            LINK.balanceOf(address(this)) >= 1,
            "Not enough LINK to fulfill request"
        );
        bytes memory encodedSeed = abi.encodePacked(
            block.timestamp,
            block.number
        );
        bytes32 requestId = requestRandomness(bytes32(encodedSeed), 0);
        randomNumbers[requestId] = 0;
        return requestId;
    }

    function fulfillRandomness(
        bytes32 requestId,
        uint256 randomness
    ) internal override {
        randomNumbers[requestId] = randomness;
    }

    receive() external payable {
        revert(
            "This contract does not accept Ether, if you don't participate in the Game."
        );
    }
}
