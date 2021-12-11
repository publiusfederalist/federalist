const {app, BrowserWindow, shell} = require('electron');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const ipcMain = require('electron').ipcMain;
const WebTorrent = require('webtorrent');
const hresolver = require("./include/hresolver.js");
const crypto = require('crypto');
const ed = require('supercop.js');
const url = require('url');

const client = new WebTorrent();
var mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight:600,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname,"include/preload.js")
    }
  })
  mainWindow.on('ready-to-show', function() {
    mainWindow.show();
  });
  mainWindow.loadFile('assets/index.html')
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})


var TEMP_FOLDER = app.getPath('appData')+"/federalist/"; 
if(!fs.existsSync(TEMP_FOLDER))
  fs.mkdirSync(TEMP_FOLDER);
TEMP_FOLDER+="torrents/";
if(!fs.existsSync(TEMP_FOLDER))
  fs.mkdirSync(TEMP_FOLDER);


var current = {
  host: "",
  name: "",
  pos: -1
};
function go(hash,path,name) {
  let files = fs.readdirSync(TEMP_FOLDER+hash+'/web3root');
  let displayed = false;
  let directory = "# Directory listing";

  if(!path || path=="")
    path="/index.html";

  current.host = hash;
  current.name = name;

  files.forEach((file)=> {
    if(file==path.substr(1)) {
      displayed=true;
      mainWindow.webContents.send('show','file:///'+TEMP_FOLDER+hash+'/web3root'+path);
    }
    directory+="- "+file;
  });
  if(!displayed) {
    if(path != "/") {
      mainWindow.webContents.send('notfound','404');
      mainWindow.webContents.send('updateAddress','404 Not Found');
      mainWindow.webContents.send('enableAddress');
      return;
    }
    else
      mainWindow.webContents.send('show','file:///'+TEMP_FOLDER+current.host+'/web3root'+path);
  }
  if(name=='')
    mainWindow.webContents.send('updateAddress',"magnet:?xt=urn:btih:"+hash+path);
  else
    mainWindow.webContents.send('updateAddress',"federalist://"+name+path);
  mainWindow.webContents.send('enableAddress');
}
ipcMain.on('title',(event,arg) => {
  mainWindow.setTitle(arg);
});
ipcMain.on('external',(event,arg) => { shell.openExternal(arg); });
ipcMain.on('go',async (event,arg) => {
  mainWindow.webContents.send('disableAddress');
  var federalistData={};
  var name='';
  var target={};

  if(arg.startsWith('federalist')) {
    _tmp = await parseFederalist(arg);
    if(_tmp.err) {
      mainWindow.webContents.send('enableAddress');
      mainWindow.webContents.send('notfound','DNS Error');
      mainWindow.webContents.send('updateAddress','DNS Error');
      return;
    }
    arg = _tmp.url;
    name = _tmp.name;
  }
  if(decodeURI(arg).startsWith('file://'+TEMP_FOLDER)) {
    arg=decodeURI(arg).substr(('file://'+TEMP_FOLDER).length);
    target.hash=arg.substr(0,40);
    target.path=arg.substr(49);
    target.name=current.name;
  }
  else {
    target = await parseAddress(arg,name);
    mainWindow.webContents.send('enableAddress');
    mainWindow.webContents.send('notfound','DHT Error');
    mainWindow.webContents.send('updateAddress','DHT Error');
  }
  if(!fs.existsSync(TEMP_FOLDER+target.hash)) {
    if(!client.get(target.hash)) {
      client.add("magnet:?xt=urn:btih:"+target.hash,{path:TEMP_FOLDER+target.hash},(torrent) => {
        if(torrent.length>25000000) {
          client.remove(torrent.infoHash);
          mainWindow.webContents.send('show','Over 25MB');
          return;
        }
        torrent.on('done',()=> {
          go(target.hash,target.path,target.name);
        });
      });
    }
  }
  else {
    let seeding=false;
    if (client.get(target.hash))
      seeding=true;
    if(!seeding) {
      client.add("magnet:?xt=urn:btih:"+target.hash,{path:TEMP_FOLDER+target.hash});
    }
    go(target.hash,target.path,target.name);
  }
});

async function parseAddress(arg,name) {
  var target = {};

  if(!arg || arg.length==0)
    target.error = true;
  else if (arg.startsWith('file://')) {
    target.path = arg.substr(("file://"+__dirname).length);
    target.hash = current.host;
    target.name = current.name;
  }
  else if (arg.startsWith('magnet:?xt=urn:btih:')) {
    target.hash = arg.substr(20,40);
    target.path = arg.substr(60);
    target.name = name;
  }
  else if (arg.startsWith('magnet:?xs=urn:btpk:')) {
    let tmp = arg.substr(20);
    if (tmp.indexOf('/')>0) {
      target.hash = await runConsume(arg.substr(20,arg.indexOf('/')));
      if(target.hash==="error")
        target.err = true;
      else {
        target.path = tmp.substr(tmp.indexOf('/'));
        target.name = name;
      }
    }
    else {
      target.hash = await runConsume(arg.substr(20));
      if(target.hash==="error")
        target.err = true;
      else {
        target.path = '';
        target.name = name;
      }
    }
  }
  else
    target.err = true;

  return target;
}

async function parseFederalist(arg) {
  let err=false;
  let name,path,destination;
  if(arg.startsWith('federalist://')) {
    let tmp = arg.substr(13);
    if(tmp.indexOf('/')>0) {
      name = tmp.substr(0,tmp.indexOf('/'));
      path = tmp.substr(tmp.indexOf('/'));
    }
    else {
      name = tmp;
      path = '';
    }

    destination = (await hresolver(name));

    if(!destination || destination == "")
      err = true;
    else
      destination=destination.toString().trim();

  }
  else
    err = true;

  if(err)
    return {err:err};
  else
    return {url:destination + path, name:name};
}

async function runConsume(publicKey) {
  var buffPubKey = Buffer.from(publicKey, 'hex')
  var targetID = crypto.createHash('sha1').update(buffPubKey).digest('hex') // XXX missing salt
  var client = new WebTorrent({ dht: {verify: ed.verify }})
  client.on('error', () => {
    return "error";
  });

  var dht = client.dht
  return new Promise((resolve,reject) => {
    dht.on('ready', async function () {
      dht.get(targetID, async function (err, res) {
        if (err || !res) {
          client.destroy();
          reject("error");
        }
        else {
          client.destroy();
          resolve(res.v.ih.toString('hex'));
        }
      });
    });
  });
}



