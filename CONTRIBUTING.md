# Restoring Justice Together

Welcome to our contributing guide. We are delighted to host you and welcome any questions you have. Feel free to create an issue if you can't get something in here to work and we will be sure to help you out.

Because we care about decentralization, this repo can be a little more difficult to get running than your normal set of smart contracts. Have patience and see the road which lies before you as a learning opportunity.

We have our own custom contracts, our own subgraph, all our tests and tasks are written in hardhat-ts, and the frontend application uses Angular and typescript. This means there are a lot of moving parts. Again, developing with us is about patience and a good sense of humor and perspective.

## Preflight Checks

Both of us use **linux** distros, and both of us are running **Node v16**, using [nvm](https://github.com/nvm-sh/nvm). It's likely that you can get this all working on a Mac without too much trouble. We can't speak for Windows users: good luck to you.

Let's start at the beginning. That way, if you run into a problem, you'll know about it early on. The biggest thing to get going is TheGraph. **NOTE: To build graph-node with cargo, 8GB RAM are required**. Let's see if you can get it all set up:

1. Install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Make sure you hav [postgres installed](https://www.postgresql.org/download/). Most modern Linux distros come with it pre-installed. Running Ubuntu 20.04 LTS I did not need to do anything further.

3. Install [IPFS](https://docs.ipfs.io/install/command-line/#official-distributions) from your home directory. These instructions are for Linux users only. Follow the link on "IPFS" to get instructions for other OS:

```bash
wget https://dist.ipfs.io/go-ipfs/v0.12.0/go-ipfs_v0.12.0_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.12.0_linux-amd64.tar.gz
cd go-ipfs
sudo bash install.sh

# test that it's all working
ipfs --version

```

4. Install further dependencies if you're on Ubuntu:

```bash
sudo apt-get install -y clang libpq-dev libssl-dev pkg-config
```

5. Clone the `graph-node` repo into a directory of your choice. I chose to call it `TheGraph/graph-node`:

```bash
git clone https://github.com/graphprotocol/graph-node
```

1. Make sure yu have [yarn](https://classic.yarnpkg.com/lang/en/docs/install) installed:

```bash
npm i -g yarn
```

7. Make sure you have hardhat installed globally (using the same node version you will use for this project, we recommend Node v16):

```bash
npm i -g hardhat
```

## Get Started

Yes, we're only now getting started. We hope you made it through the above relatively unscathed. Now you can clone this repo and install its various dependencies:

1. Clone restore:

```bash
git clone https://github.com/PrisonArt/restore.git
cd restore
```

2. Install the dependencies using yarn:

```bash
yarn install
```

## Terminal Dancing

Now for all the fun stuff. You will be juggling many terminal windows by the end of this, so take a deep breath and let's dive deep:

1. Test you hardhat setup and ensure that the contracts are working as intended:

```bash
TS_NODE_TRANSPILE_ONLY=1 yarn hardhat:compile

# marvel at our tests
yarn hardhat:test

# run a local node 
yarn hardhat:localnode
```

2. Open a new terminal and start the IPFS daemon:

```bash
ipfs daemon
```

3. Open a new terminal and start your postgres DB:

```bash
sudo -u postgres psql
create database "graph-node";
```

A word to the wise here. Postgres comes standard with an ADMIN user called "postgres". However, we'll also need a password and I could not figure out how to get that, so needed to create a new ADMIN user with a password I knew for the next step. In order to do that, run:

```bash
CREATE USER yourname WITH SUPERUSER PASSWORD 'pswd';

# you can use the below command to see all users
\du
```

4. Open a new terminal and start your local graph-node. In order to do this, you will need to ensure you are in the directory you installed it in. Also make sure to replace `yourname` and `pswd` with the appropriate values you set in the previous step:

```bash
cd ~/TheGraph/graph-node
cargo run -p graph-node --release -- --postgres-url postgresql://<yourname>:<pswd>@localhost:5432/graph-node --ethereum-rpc localhost:http://127.0.0.1:8545 --ipfs 127.0.0.1:5001
```

5. Before we build the frontend querying application for our graph node, we need to get some data into it. Let's mint an NFT and prepare it for auction:

```bash
cd ~/Pr1s0nArt/restore/packages/hardhat-ts

npx hardhat mint --network localhost --metadata-uri ar://eID4sKkQL9klqC3-0TShafiQgDbzDgMIq1hRBMG13Vs

npx hardhat createauction --network localhost --token-id 0 --creator-addr 0x911753aB62fFd27B78C6db07685DBf0089634eb4 --split 70,20,10
```

6. Open a new terminal and build the frontend application for your graph-node. In order to do this, you will need to be back in the subgraph package of this repo:

```bash
cd ~/Pr1s0nArt/restore/packages/subgraph
yarn create:local
yarn deploy:local
```

You can navigate to http://localhost:8000/subgraphs/name/pr1s0nart/pr1s0nart-subgraph-localhost/graphql to see your graph query engine. Put the below query into the left-hand pane and then click the Play button at the top to see your NFT and the auction we just created:

```graphql
query MyQuery {
  nfts {
    id
    metadataURI
    data
    isFrozen    
    owner {
      id
    }
  }
  auctions {
    id
    startTime
    endTime
    settled    
    amount
    saleSplit    
    nft {
      id
    }
    winner {
      id
    }
    bidder {
      id
    }
    bids {
      id
      amount
      bidder
      blockNumber
      blockTimestamp
    }
    creator {
      id
    }
  }
}
```

7. Now, at long last, we can fire up the frontend and get to work making it truly beautiful:

```bash
cd ~/Pr1s0nArt/restore
yarn dapp:start
```

This should automatically open http://localhost:4200/ for you, where you can see the gallery and help us improve it.