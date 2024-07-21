// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.8.20;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract NSwap {
    ISwapRouter public immutable swapRouter;

    address public constant WETH9 = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9;
    uint24 public constant poolFee = 3000;

    event Debug(string message, uint256 value);

    constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

    /// @notice Swaps multiple tokens for a single token (WETH)
    /// @param tokens The array of token addresses to swap from.
    /// @param amountsIn The array of amounts to swap from each token.
    /// @return amountsOut The array of amounts of WETH received for each token swapped.
    function swapMultipleTokensForWETH(address[] calldata tokens, uint256[] calldata amountsIn) external returns (uint256[] memory amountsOut) {
        require(tokens.length == amountsIn.length, "Arrays must be of equal length");

        amountsOut = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            // Check balance of the token for msg.sender
            uint256 tokenBalance = IERC20(tokens[i]).balanceOf(msg.sender);
            require(tokenBalance >= amountsIn[i], "Insufficient token balance");

            // Check allowance
            uint256 tokenAllowance = IERC20(tokens[i]).allowance(msg.sender, address(this));
            require(tokenAllowance >= amountsIn[i], "Allowance not set or insufficient");

            // Transfer the specified amount of the token to this contract
            TransferHelper.safeTransferFrom(tokens[i], msg.sender, address(this), amountsIn[i]);

            // Approve the router to spend the token
            TransferHelper.safeApprove(tokens[i], address(swapRouter), amountsIn[i]);

            ISwapRouter.ExactInputSingleParams memory params =
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: tokens[i],
                    tokenOut: WETH9,
                    fee: poolFee,
                    recipient: msg.sender,
                    deadline: block.timestamp,
                    amountIn: amountsIn[i],
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });

            // Execute the swap
            amountsOut[i] = swapRouter.exactInputSingle(params);

            // Reset the token approval to 0 for security reasons
            TransferHelper.safeApprove(tokens[i], address(swapRouter), 0);
        }
    }
}
