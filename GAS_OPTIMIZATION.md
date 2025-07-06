# Gas Optimization Guide for Event Ticketing DApp

This guide explains the gas optimization techniques implemented in this project to reduce deployment and transaction costs on Sepolia testnet.

## Contract Optimizations

### Storage Optimizations

1. **Use smaller data types**:
   - Changed `uint256` to `uint128` for variables that don't need the full range
   - This reduces storage costs as multiple variables can be packed into a single storage slot

2. **Efficient token tracking**:
   - Added `_userTokens` mapping to track which tokens each user owns
   - This eliminates the need for expensive loops when retrieving a user's tokens

3. **Simplified inheritance**:
   - Replaced `ERC721URIStorage` with basic `ERC721` and custom URI storage
   - This reduces contract size and deployment cost

4. **Optimized token existence checks**:
   - Added `_exists` mapping to quickly check if a token exists
   - This is more gas-efficient than try/catch blocks

### Function Optimizations

1. **Combined require statements**:
   - Merged multiple require statements into one where possible
   - This reduces gas costs by having fewer SLOAD operations

2. **Used _mint instead of _safeMint**:
   - `_safeMint` performs additional checks that cost gas
   - `_mint` is used when we trust the recipient is not a contract that can't handle NFTs

3. **Efficient array operations**:
   - When removing items from arrays, we swap with the last element and pop
   - This is more gas-efficient than shifting elements

## Deployment Optimizations

1. **Set custom gas price**:
   - Used 3 gwei instead of the default (which can be much higher)
   - This significantly reduces deployment costs while ensuring the transaction is accepted

2. **Set gas limit**:
   - Specified a higher gas limit (5,000,000) to ensure successful deployment
   - This prevents "out of gas" errors during contract creation

3. **Deployment options**:
   - Added deployment options to the deploy script as overrides
   - This gives more control over gas usage without affecting the contract constructor

## Transaction Optimizations

1. **Hardhat config optimizations**:
   - Set lower gas price in hardhat.config.js
   - Set appropriate gas limit

2. **Efficient data structures**:
   - Optimized mappings and arrays to reduce gas costs for common operations

## Frontend Optimizations

1. **Batch operations**:
   - Consider implementing batch minting if you need to create multiple tickets at once
   - This would share the fixed gas costs across multiple operations

2. **Lazy minting**:
   - Consider implementing lazy minting patterns for production
   - This defers gas costs until the token is actually needed

## Monitoring Gas Usage

The deployment script now includes detailed gas usage reporting:
- Gas used for deployment
- Gas price used
- Total cost in ETH
- Remaining balance

## Gas Prices on Sepolia

Sepolia testnet typically accepts very low gas prices:
- 1 gwei is usually sufficient (compared to 10-100+ gwei on mainnet)
- This makes testing much cheaper

## Additional Tips

1. **Use calldata instead of memory**:
   - For function parameters that are not modified, use calldata instead of memory
   - This is especially important for arrays and strings

2. **Avoid unnecessary storage**:
   - Only store what's absolutely necessary on-chain
   - Consider storing metadata off-chain (e.g., on IPFS)

3. **Minimize on-chain operations**:
   - Move complex calculations off-chain when possible
   - Use events to emit data that doesn't need to be stored

4. **Optimize loops**:
   - Avoid unbounded loops that could run out of gas
   - Use mappings for O(1) lookups instead of iterating through arrays

5. **Use view functions**:
   - View functions don't cost gas when called externally
   - They only cost gas when called by other contract functions

## Testing Gas Optimizations

To verify gas savings:
1. Deploy the original contract and note the gas used
2. Deploy the optimized contract and compare
3. Test common operations (mint, transfer) and compare gas usage

Remember that while these optimizations reduce gas costs, they may make the code more complex. Always ensure that the optimizations don't introduce bugs or security vulnerabilities.
