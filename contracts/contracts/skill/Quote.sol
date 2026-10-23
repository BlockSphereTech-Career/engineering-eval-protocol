// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice BrickFi protocol claim quote: investor share of vault proceeds.
contract Quote {
    function quote(uint256 proceeds, uint256 shares, uint256 totalSold)
        external
        pure
        returns (uint256 claimable, bool canClaim)
    {
        return (0, false);
    }
}
