//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "./CloneFactory.sol";
import "./GuessingGame.sol";

contract Factory is CloneFactory {
    mapping(address => address[]) public masterGameList;
    mapping(address => mapping(address => bool)) public isActiveGame;
    address[] public masters;

    address masterContract;

    constructor(address _masterContract) {
        masterContract = _masterContract;
    }

    function createGame(
        uint256 _minGuess,
        uint256 _maxGuess,
        uint256 _minPlayers,
        uint256 _entryFee
    ) external {
        GuessingGame game = GuessingGame(payable(createClone(masterContract)));
        game.init(_minGuess, _maxGuess, _minPlayers, _entryFee, msg.sender);
        if (masterGameList[msg.sender].length == 0) {
            masters.push(msg.sender);
        }
        masterGameList[msg.sender].push(address(game));
        isActiveGame[msg.sender][(address(game))] = true;
    }

    function getMasters() external view returns (address[] memory) {
        return masters;
    }

    function getMasterGameList(
        address master
    ) external view returns (address[] memory) {
        return masterGameList[master];
    }

    function getGameActivity(
        address master,
        address contractAddress
    ) external view returns (bool) {
        return isActiveGame[master][contractAddress];
    }

    function getAllActiveGames(
        address master
    ) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < masterGameList[master].length; i++) {
            if (isActiveGame[master][masterGameList[master][i]] == true) {
                count++;
            }
        }
        address[] memory array = new address[](count);
        count = 0;
        for (uint256 i = 0; i < masterGameList[master].length; i++) {
            if (isActiveGame[master][masterGameList[master][i]] == true) {
                array[count] = masterGameList[master][i];
                count++;
            }
        }
        return array;
    }

    function deactivateGame(address master, address contractAddress) external {
        require(msg.sender == master, "You can't deactivate that game.");
        isActiveGame[master][contractAddress] = false;
    }
}
