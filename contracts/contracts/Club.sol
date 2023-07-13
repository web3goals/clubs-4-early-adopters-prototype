// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol";
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

contract Club is IPaymaster, Ownable {
    string public uri;
    address public application;
    mapping(address => bool) public members;

    event MemberAdded(address member);
    event MemberRemoved(address member);

    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS,
            "Only bootloader can call this method"
        );
        _;
    }

    constructor(string memory _uri, address _application) payable {
        uri = _uri;
        application = _application;
    }

    function addMember(address _member) external onlyOwner {
        require(!members[_member], "Already added");
        members[_member] = true;
        emit MemberAdded(_member);
    }

    function removeMember(address _member) external onlyOwner {
        require(members[_member], "Not member");
        members[_member] = false;
        emit MemberRemoved(_member);
    }

    function isMember(address _member) external view returns (bool) {
        return members[_member];
    }

    function validateAndPayForPaymasterTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    )
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        // By default we consider the transaction as accepted.
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        require(
            _transaction.paymasterInput.length >= 4,
            "The standard paymaster input must be at least 4 bytes long"
        );

        bytes4 paymasterInputSelector = bytes4(
            _transaction.paymasterInput[0:4]
        );
        if (paymasterInputSelector == IPaymasterFlow.general.selector) {
            // Check that the from address is the member's address
            address fromAddress = address(uint160(_transaction.from));
            require(members[fromAddress], "Not from member");

            // Check that the to address is the application's address
            address to = address(uint160(_transaction.to));
            require(to == application, "Not to application");

            // Calculate required eth for transactions
            uint256 requiredETH = _transaction.gasLimit *
                _transaction.maxFeePerGas;

            // Send required eth to bootloader
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
                value: requiredETH
            }("");
            require(
                success,
                "Failed to transfer tx fee to the bootloader. Paymaster balance might not be enough."
            );
        } else {
            revert("Unsupported paymaster flow");
        }
    }

    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable override onlyBootloader {}

    receive() external payable {}
}
