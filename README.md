# federalist
## Access a new kind of decentralized website on the DHT

### Short Description

federalist uses webtorrent with BEP 46 and Handshake domain resolution to access truly decentralized, unblockable swarm websites.

### Long Description

federalist is a proof of concept to show that it's possible, today, to create a decentralized, uncensorable and generally unblockable, distributed high performance
viewable page.  federalist achieves this by using several amazing technologies and weaves them together:

- [WebTorrent](https://github.com/webtorrent) - Provides torrenting capabilities and the bulk of the system.  federalist pages are torrents that are
distributed via magnet links and DHT is used to find peers.

- [DMT](https://github.com/lmatteis/dmt) - Reference implementation of decentralized mutable torrents, [BEP 46](https://github.com/lmatteis/bittorrent.org/blob/master/beps/bep_0046.rst).

- [Handshake](https://github.com/handshake-org/) - Provides decentralized DNS

- [nodeJS](https://github.com/nodejs) - Provides the Javascript engine built on V8 by Chrome

- [Electron](https://github.com/electron) - Provides the GUI

- [Chromium](https://github.com/chromium/chromium) - Electron uses this really cool software to deliver GUI applications that can be made with HTML, CSS and Javascript.

### Features

- Update your unblockable swarm site without updating your DNS, as often as you'd like.

- Use HTML, CSS and Javascript

- Unblockable

### Status

This software is a POC and is in version 0.1a.  This is an upgrade from the previous version which worked with markdown files and only immutable destinations.

### Screenshot

![Federalist Screenshot](https://github.com/publiusfederalist/federalist/blob/master/federalist.png?raw=true)

Note: This is an older version and the current version does not parse markdown unless a publisher wishes to include marked, etc. (They can)

## Use Cases

- Create an unblockable blog

- Whistleblow

- Share information

- Share meta information about other torrents

- Create an unblockable personal link site

- Save bandwidth and CDN costs

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

4. Access a decentralized, unblockable swarm site.
```
federalist://federalistpapers
```

which points to:

```
magnet:?xs=urn:btpk:e239849106256aad20b0ddadd9f2cb013910dab3207f3b200fbe2e76899cb6c2
```

## Copyright and License

(c) 2021 Publius

MIT LICENSED
