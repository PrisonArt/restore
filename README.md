# Restore

Made with love at [pr1s0n.art](https://pr1s0n.art).

Having separate records for our finances and our stories has, for many millenia, meant that we cannot enact justice in both the sociopolitical and economic realms simultaneously. Web3 enables us to do this. The mechanism is simple:

1. We sell art made by justice-involved people as NFTs.
2. We use the funds raised to pay their Legal Financial Obligations (LFOs).
3. The exact split of funds is encoded in the contract. It is transparent and verifiable.
4. The crypto is exchanged and payments in USD are done through a 501(c)3, registered in Florida.
5. We attach the receipts for the exchange and payments back to the original artwork using the [safeTransfer](https://medium.com/kanon-log/unleashing-god-mode-for-all-nfts-f432955b4c42) function.
6. All of the work done, and infrastructure required, is an [open source shared plural good](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763).

This enables us to illuminate restorative stories, both social and financial. Holding the artwork is simultaneously a statement of principles, aesthetics, and economic action. Restorative justice is not limited to those who have "served time": it is collective. Such financial narrative tools allow us to begin healing the separation we project between the incarcerated and ourselves, allowing us to recognise that - unless we are all involved with justice - it will never be fully realised.

## Architecture

```
          ,-.                  ,-.
          `-'                  `-'
          /|\                  /|\
           |                    |                         ,---------.              ,---------.
          / \                  / \                        | Restore |              | Justice |
         Buyer               pr1s0n art                   `----+----'              `----+----'
           |                    |        mints new NFT        |                         |     
           |                    |---------------------------->|                         |     
           |                    |                             |                         |     
           |                    |                             |                         |     
           |                    |        sets up auction      |                         |     
           |                    |------------------------------------------------------>|     
           |                    |                             |                         |     
           |    makes bid       |                             |                         |     
           |--------------------------------------------------------------------------->|     
           |                    |                             |                         |     
           |                    |                             | winning bid freezes NFT |     
           |                    |                             |<------------------------|     
           |                    |___________________          |   funds to PA payment   |     
        ________                |      |<-----------|---------|-------------------------|     
       |   |    |  exchange + pay LFOs |            |         |      10% to PA Fund     |     
       |   |    |<---------------------|            |<--------|-------------------------|     
       |   |    |               |      |            |         |                         |     
    Artist |  State             |  pr1s0n art       |         |                         |     
           |                    |   payment         |         |                         |     
     ,-.   |                    |     ,-.           |         |                         |     
     `-'   |                    |     `-'  reattach |         |                         |     
     /|\   |                    |-----/|\-----------|-------->|                         |     
      |    |                           |   receipt  |         |                         |     
     / \   |                          / \           |         |                         |     
           |                                        |         |                         |     
           |           safeTransfer to buyer        |         |                         |     
           |<-------------------------------------------------|                         |     
           |                                       ,-.        |                         |     
           |                                       `-'        |                         |     
           |                                       /|\        |                         |     
           |                                        |         |                         |     
           |                                       / \        |                         |     
           |                                    pr1s0n art    |                         |     
           |                                       fund       |                         |         
```

## Develop

Please read our [contributing guide](./CONTRIBUTING.md) to get up and running if you'd like to help out.

## Features

This repo began life as a clone of the [Zora Custom Auction House](https://docs.zora.co/docs/guides/create-auction-house). Great love and thanks to them. The contracts began life as a clone of the [NounsDAO](https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-contracts) work. Equal amounts of admiration, thanks, and love to them too.
