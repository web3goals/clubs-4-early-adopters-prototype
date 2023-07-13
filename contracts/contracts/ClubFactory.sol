// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Club.sol";

contract ClubFactory {
    event ClubCreated(address club);

    function createClubAndSendEther(
        string memory _uri,
        address _application
    ) external payable {
        Club club = (new Club){value: msg.value}(_uri, _application);
        club.transferOwnership(msg.sender);
        emit ClubCreated(address(club));
    }
}
