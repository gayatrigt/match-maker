export interface WordPair {
  term: string;
  definition: string;
}

export const ALL_WORD_PAIRS: WordPair[][] = [
  // Set 1 - Blockchain Basics
  [
    { term: "Blockchain", definition: "A distributed ledger that records transactions across a network of computers" },
    { term: "Block", definition: "A collection of transactions bundled together and added to the chain" },
    { term: "Consensus", definition: "Agreement between nodes on the true state of the network" },
    { term: "DApp", definition: "Decentralized Application that runs on a blockchain network" },
    { term: "Mining", definition: "Process of validating transactions and creating new blocks" }
  ],
  // Set 2 - Ethereum Concepts
  [
    { term: "Gas", definition: "Computational fee required to execute transactions on Ethereum" },
    { term: "Wei", definition: "Smallest denomination of Ether (1 ETH = 10^18 Wei)" },
    { term: "gwei", definition: "Unit of Ether commonly used for gas prices (1 gwei = 10^9 Wei)" },
    { term: "EVM", definition: "Ethereum Virtual Machine that executes smart contract code" },
    { term: "Mainnet", definition: "Primary network where actual transactions occur" }
  ],
  // Set 3 - Smart Contracts
  [
    { term: "Smart Contract", definition: "Self-executing code that automatically enforces digital agreements" },
    { term: "Solidity", definition: "Primary programming language for writing Ethereum smart contracts" },
    { term: "Event", definition: "Logging mechanism in smart contracts to track state changes" },
    { term: "Oracle", definition: "External data source that provides information to smart contracts" },
    { term: "Trustless", definition: "System where participants don't need to trust each other to transact" }
  ],
  // Set 4 - Accounts & Wallets
  [
    { term: "Address", definition: "Unique identifier for sending and receiving cryptocurrency" },
    { term: "Private Key", definition: "Secret code that gives access to cryptocurrency and proves ownership" },
    { term: "HD Wallet", definition: "Hierarchical deterministic wallet that generates keys from a seed phrase" },
    { term: "EOA", definition: "Externally Owned Account controlled by private keys" },
    { term: "Zero Address", definition: "Special Ethereum address (0x0) used for contract creation" }
  ],
  // Set 5 - DeFi Concepts
  [
    { term: "DeFi", definition: "Decentralized Finance applications built on blockchain" },
    { term: "Impermanent Loss", definition: "Temporary loss of funds when providing liquidity to trading pools" },
    { term: "DAO", definition: "Decentralized Autonomous Organization governed by smart contracts" },
    { term: "Staking", definition: "Locking up tokens to support network operations and earn rewards" },
    { term: "Yield Farming", definition: "Strategy of lending or staking assets to maximize returns" }
  ],
  // Set 6 - NFT & Digital Assets
  [
    { term: "NFT", definition: "Non-Fungible Token representing unique digital assets" },
    { term: "IPFS", definition: "InterPlanetary File System for decentralized storage" },
    { term: "Metadata", definition: "Additional information describing NFT properties" },
    { term: "Minting", definition: "Process of creating new tokens or NFTs" },
    { term: "Royalties", definition: "Automatic payments to creators on secondary NFT sales" }
  ],
  // Set 7 - Security Concepts
  [
    { term: "Re-entrancy", definition: "Smart contract vulnerability where functions can be called repeatedly before completion" },
    { term: "Double Spend", definition: "Attack attempting to use the same funds twice" },
    { term: "Slashing", definition: "Penalty mechanism in proof of stake for malicious behavior" },
    { term: "Hash", definition: "Cryptographic function that generates fixed-size output from input" },
    { term: "ECDSA", definition: "Elliptic Curve Digital Signature Algorithm for transaction signing" }
  ],
  // Set 8 - Network Types
  [
    { term: "Testnet", definition: "Test network for development without real value at stake" },
    { term: "Sidechain", definition: "Separate blockchain connected to main chain for scaling" },
    { term: "Layer 2", definition: "Scaling solution built on top of main blockchain" },
    { term: "Sharding", definition: "Splitting blockchain into multiple pieces for better scalability" },
    { term: "Bridge", definition: "Connection allowing assets to move between different blockchains" }
  ],
  // Set 9 - Transaction Components
  [
    { term: "Nonce", definition: "Number used once to prevent transaction replay" },
    { term: "Gas Limit", definition: "Maximum amount of gas willing to spend on transaction" },
    { term: "Gas Price", definition: "Amount of ether per unit of gas for transaction" },
    { term: "Signature", definition: "Cryptographic proof of transaction authorization" },
    { term: "Block Time", definition: "Average time between new blocks being added" }
  ],
  // Set 10 - Development Tools
  [
    { term: "Web3.js", definition: "JavaScript library for interacting with Ethereum" },
    { term: "Hardhat", definition: "Development environment for building and testing smart contracts" },
    { term: "Truffle", definition: "Framework for smart contract development and testing" },
    { term: "Ganache", definition: "Personal blockchain for Ethereum development" },
    { term: "Remix", definition: "Web-based IDE for Solidity development" }
  ],
  // Set 11 - Token Standards
  [
    { term: "ERC20", definition: "Standard interface for fungible tokens on Ethereum" },
    { term: "ERC721", definition: "Standard interface for non-fungible tokens (NFTs)" },
    { term: "ERC1155", definition: "Multi-token standard supporting both fungible and non-fungible tokens" },
    { term: "ERC4626", definition: "Tokenized vault standard for yield-bearing tokens" },
    { term: "ERC2981", definition: "NFT royalty standard for on-chain royalty info" }
  ],
  // Set 12 - Consensus Mechanisms
  [
    { term: "Proof of Work", definition: "Consensus mechanism requiring computational work to validate blocks" },
    { term: "Proof of Stake", definition: "Consensus mechanism where validators stake tokens to secure network" },
    { term: "Proof of Authority", definition: "Consensus mechanism where approved validators confirm transactions" },
    { term: "Delegated Proof of Stake", definition: "Stake-based consensus where token holders vote for validators" },
    { term: "Byzantine Fault Tolerance", definition: "Ability of a system to handle malicious actors in consensus" }
  ],
  // Set 13 - Cryptography Concepts
  [
    { term: "Public Key", definition: "Publicly shared key for receiving transactions" },
    { term: "Digital Signature", definition: "Cryptographic proof of message authenticity and ownership" },
    { term: "Merkle Tree", definition: "Data structure for efficient verification of large datasets" },
    { term: "Zero Knowledge Proof", definition: "Method to prove knowledge without revealing the information" },
    { term: "SHA256", definition: "Cryptographic hash function used in blockchain systems" }
  ],
  // Set 14 - Governance & Voting
  [
    { term: "Governance Token", definition: "Token granting voting rights in protocol decisions" },
    { term: "Proposal", definition: "Suggested change to protocol parameters or code" },
    { term: "Quorum", definition: "Minimum participation required for valid governance vote" },
    { term: "Timelock", definition: "Delay period before governance changes take effect" },
    { term: "Snapshot", definition: "Record of token holdings at specific block for voting power" }
  ],
  // Set 15 - DEX Concepts
  [
    { term: "Liquidity Pool", definition: "Smart contract holding token pairs for trading" },
    { term: "AMM", definition: "Automated Market Maker system for token price determination" },
    { term: "Slippage", definition: "Price difference between expected and executed trade" },
    { term: "Trading Pair", definition: "Two tokens that can be traded against each other" },
    { term: "Price Impact", definition: "Effect of trade size on token price in liquidity pool" }
  ],
  // Set 16 - Cross-chain Technology
  [
    { term: "Bridge Contract", definition: "Smart contract enabling cross-chain asset transfers" },
    { term: "Wrapped Token", definition: "Token representing asset from another blockchain" },
    { term: "Relay Chain", definition: "Central chain coordinating multiple parallel chains" },
    { term: "Cross-chain Message", definition: "Communication between different blockchain networks" },
    { term: "Atomic Swap", definition: "Trustless exchange of tokens across different chains" }
  ],
  // Set 17 - Web3 Infrastructure
  [
    { term: "RPC Node", definition: "Server providing access to blockchain network" },
    { term: "IPFS Gateway", definition: "Access point for decentralized storage system" },
    { term: "ENS", definition: "Ethereum Name Service for human-readable addresses" },
    { term: "Indexer", definition: "Service organizing blockchain data for efficient queries" },
    { term: "Subgraph", definition: "Data indexing schema for blockchain events" }
  ],
  // Set 18 - Privacy Solutions
  [
    { term: "Ring Signature", definition: "Cryptographic method hiding sender among group" },
    { term: "Mixer", definition: "Protocol for obscuring transaction source and destination" },
    { term: "Stealth Address", definition: "One-time address generation for privacy" },
    { term: "Confidential Transaction", definition: "Transaction hiding amount while proving validity" },
    { term: "ZK-Rollup", definition: "Layer 2 scaling with private transaction data" }
  ],
  // Set 19 - Tokenomics
  [
    { term: "Token Supply", definition: "Total number of tokens in circulation" },
    { term: "Vesting", definition: "Gradual release of tokens over time" },
    { term: "Emission Rate", definition: "Speed at which new tokens are created" },
    { term: "Token Burn", definition: "Permanent removal of tokens from circulation" },
    { term: "Token Lock", definition: "Restriction on token transfer for a period" }
  ],
  // Set 20 - MEV Concepts
  [
    { term: "MEV", definition: "Maximal Extractable Value from transaction ordering" },
    { term: "Frontrunning", definition: "Placing transaction ahead of pending transaction" },
    { term: "Sandwich Attack", definition: "Profiting from trades by manipulating token price" },
    { term: "Flashbots", definition: "Infrastructure for fair transaction ordering" },
    { term: "Arbitrage", definition: "Profiting from price differences across markets" }
  ]
]; 