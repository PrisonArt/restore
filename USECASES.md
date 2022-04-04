# Use Cases

## Users

Deployer

- deploys the three contracts, owner of the contracts
- sets Juctice contract from Restore
- mints NFT for auction
- creates auction for an NFT, sets creator and percentage split
- settles auction
- transfers NFT to buyer with LFO information

Pr1s0nArt Payment

- receives % of sale that exchanges into USD and pays LFOs, set during contract creation

Pr1s0nArt Fund

- receives % of sale for onchain fund to cover operations, set during contract creation

Pr1s0nArt Creator

- receives % of sale, points to artist address if there is one, otherwise pr1s0nart, set during create auction

User

- view NFT list
- view NFT
- view auction details for an NFT
- connect wallet
- bid
- view add'l details about the artist and artwork
- view NFT LFO
- link to Discord
- calendar of events (podcast/twitter spaces)

## Accounts

Deployer Private Key: MM account (to create)

Payment Address: create another Gnosis Safe on ETH and Rinkeby

Fund Address: Gnosis Safe on ETH 0x911753aB62fFd27B78C6db07685DBf0089634eb4, Gnosis Safe on Rinkeby 0x911753aB62fFd27B78C6db07685DBf0089634eb4

Creator Address: if artist doesn't supply, then payment address above
