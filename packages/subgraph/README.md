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

```bash
pnpm hardhat:localnode
```

### Start the IPFS server

Start IPFS on <http://127.0.0.1:5001>

```bash
ipfs daemon
```

### Start the database

```bash
sudo systemctl start postgresql@12-main
```

### Start the graph

```bash
cd ../graph-node
cargo run -p graph-node --release -- --postgres-url postgresql://postgres:password@localhost:5432/graph-node --ethereum-rpc localhost:http://127.0.0.1:8545 --ipfs 127.0.0.1:5001
```

### Create a graph on localhost

```bash
cd packages/subgraph
pnpm deploy:local
```

### Query

<http://localhost:8000/subgraphs/name/pr1s0nart/pr1s0nart-subgraph-localhost/graphql>


## TODO

* Map all the events in  `src/justice-mapping.ts` and `src/restore-mapping.ts`