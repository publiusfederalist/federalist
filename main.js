const {app, BrowserWindow, shell} = require('electron');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const ipcMain = require('electron').ipcMain;
const WebTorrent = require('webtorrent');
const marked = require('marked');
const hresolver = require("./hresolver.js");

let mainWindow;
const client = new WebTorrent();

var TEMP_FOLDER = app.getPath('appData')+"/federalist/"; 
if(!fs.existsSync(TEMP_FOLDER))
  fs.mkdirSync(TEMP_FOLDER);
TEMP_FOLDER+="torrents/";
if(!fs.existsSync(TEMP_FOLDER))
  fs.mkdirSync(TEMP_FOLDER);

var currentHost = "";
var currentName = "";
var history = [];
var history_count = 0;
var currentPos = -1;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight:600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname,"preload.js")
    }
  })
  mainWindow.loadFile('index.html')
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

function go(hash,path,name) {
  let files = fs.readdirSync(TEMP_FOLDER+hash+'/web3root');
  let displayed = false;
  let directory = "# Directory listing";

  if(!path || path=="")
    path="/index.md";

  currentHost = hash;
  currentName = name;

  files.forEach((file)=> {
    if(file==path.substr(1)) {
      displayed=true;
      mainWindow.webContents.send('show',marked.parse(fs.readFileSync(TEMP_FOLDER+hash+'/web3root'+path).toString()));
    }
    directory+="- "+file;
  });
  if(!displayed) {
    if(path != "/")
      mainWindow.webContents.send('show','Not found.');
    else if(path == "/")
      mainWindow.webContents.send('show',marked.parse(directory));
    else
      mainWindow.webContents.send('show',marked.parse(fs.readFileSync(TEMP_FOLDER+currentHost+'/web3root'+path).toString()));
  }
  if(name=='')
    mainWindow.webContents.send('updateAddress',"magnet:?xt=urn:btih:"+hash+path);
  else
    mainWindow.webContents.send('updateAddress',"federalist://"+name+path);
  mainWindow.webContents.send('enableAddress');
}

ipcMain.on('external',(event,arg) => {
  shell.openExternal(arg);
});

ipcMain.on('navigate',(event,arg) => {
  let _path,_hash;
  arg=parseInt(arg);
  if((currentPos + arg < 0) || (arg > 0 && (currentPos+1) == history_count))
    return;
  currentPos+=arg;
  go(history[currentPos].hash,history[currentPos].path,history[currentPos].name);
  toggleBackForward();
});

ipcMain.on('go',async (event,arg) => {
  let _path,_hash,_name;

  if(!arg || arg.length==0)
    return;
  else if (arg.startsWith('file://')) {
    _path = arg.substr(("file://"+__dirname).length);
    _hash = currentHost;
    _name = currentName;
  }
  else if (arg.startsWith('magnet:?xt=urn:btih:')) {
    _hash = arg.substr(20,40);
    _path = arg.substr(60);
    _name = currentName;
  }
  else if(arg.startsWith('federalist://')) {
    let tmp = arg.substr(13);
    if(tmp.indexOf('/')>0) {
      _name = tmp.substr(0,tmp.indexOf('/'));
      _path = tmp.substr(tmp.indexOf('/'));
    }
    else {
      _name = tmp;
      _path = '';
    }
    _hash = (await hresolver(_name)).toString().trim();
  }
  else
    return;

  if(!fs.existsSync(TEMP_FOLDER+_hash)) {
    if(!client.get(_hash))
      client.add("magnet:?xt=urn:btih:"+_hash,{path:TEMP_FOLDER+_hash},(torrent) => {
        if(torrent.length>1000000) {
          client.remove(torrent.infoHash);
          mainWindow.webContents.send('show','Over 1MB');
          return;
        }
        torrent.on('done',()=> {
          go(_hash,_path,_name);
        });
      });
  }
  else {
    let seeding=false;
    if (client.get(_hash))
      seeding=true;
    if(!seeding) {
      client.add("magnet:?xt=urn:btih:"+_hash,{path:TEMP_FOLDER+_hash});
    }
    go(_hash,_path,_name);
  }

  history_count=currentPos+1;
  history[history_count]={hash:_hash,path:_path,name:_name};
  history_count++;
  currentPos++;
  toggleBackForward();
});

function toggleBackForward() {
  if(currentPos==0)
    mainWindow.webContents.send('toggleButtonOff',"back");
  else
    mainWindow.webContents.send('toggleButtonOn',"back");

  if(currentPos+1==history_count)
    mainWindow.webContents.send('toggleButtonOff',"forward");
  else
    mainWindow.webContents.send('toggleButtonOn',"forward");
}
