# Subgraph

## Subgraph Studio

[Subgraph Studio](https://thegraph.com/studio/), connect wallet and create a subgraph.

pr1s0nart

## Install

### Rust, IPFS, and PostgreSQL

[Quick Start](https://github.com/graphprotocol/graph-node#quick-start)

### Install Linux packages

```bash
sudo apt-get install -y clang libpq-dev libssl-dev pkg-config
```

### Initialize the IPFS server

```bash
ipfs init
```

### Create the database, graph-node

```bash
sudo systemctl start postgresql@12-main
sudo -u postgres psql
create database "graph-node";
```

## Clone the graph-node repo

```bash
git clone https://github.com/graphprotocol/graph-node
```

## Run The Graph on localhost

### Start the local node

Start HTTP and WebSocket JSON-RPC server at <http://127.0.0.1:8545/>

Terminal 1:

```bash
pnpm hardhat:localnode
```

### Start the IPFS server

Start IPFS on <http://127.0.0.1:5001>

Terminal 2:

```bash
ipfs daemon
```

### Start the graph

Terminal 3:

```bash
cd ../graph-node
cargo run -p graph-node --release -- --postgres-url postgresql://postgres:password@localhost:5432/graph-node --ethereum-rpc localhost:http://127.0.0.1:8545 --ipfs 127.0.0.1:5001
```

if you receive "Not starting block ingestor (chain is defective)", drop the database, then re-run graph command

```bash
sudo -u postgres psql
drop database "graph-node";
create database "graph-node";
\q
```

### Create a graph on localhost

Terminal 4:

```bash
cd packages/subgraph
pnpm create:local
pnpm deploy:local
```

### Query

<http://localhost:8000/subgraphs/name/pr1s0nart/pr1s0nart-subgraph-localhost/graphql>

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
