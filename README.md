# federalist
## Access files on the web3 swarm.

### Short Description

federalist uses webtorrent to access web3 swarm websites.


### Long Description

federalist is a proof of concept to show that it's possible, today, to create an uncensorable and generally unblockable, distributed high performance
viewable page.  federalist achieves this by using several amazing technologies and weaves them together:

- [WebTorrent](https://github.com/webtorrent) - Provides torrenting capabilities and the bulk of the system.  federalist pages are torrents that are
distributed via magnet links and DHT is used to find peers.

- [Handshake](https://github.com/handshake-org/) - Provides decentralized DNS

- [nodeJS](https://github.com/nodejs) - Provides the Javascript engine built on V8 by Chrome

- [Electron](https://github.com/electron) - Provides the GUI


### Screenshot

![Federalist Screenshot](https://github.com/publiusfederalist/federalist/blob/master/federalist.png?raw=true)

## Use Cases

- Create an unblockable blog

- Whistleblow

- Share information

- Share meta information about other torrents

- Create an unblockable personal link site

## federalist

The federalist app is used to browse.  You can use the [publius](https://github.com/publiusfederalist/publius) app to share/seed your page and get the infohash to which an on-chain Handshake name will be resolved.

## Installation

Required
```
npm
nodejs
```

1. Clone this repo
```
git clone https://github.com/publiusfederalist/federalist
cd federalist
```

2. Install npm modules
```
npm install
```

3. Run federalist
```
npm start
```

4. Access a web3 swarm site.
```
federalist://federalistpapers
```

## Copyright and License

(c) 2021 Publius

MIT LICENSED
