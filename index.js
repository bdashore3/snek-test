const DiscordRPC = require('discord-rpc');
const { app, BrowserWindow, ipcMain } = require('electron');



/*
 * Case 1
 *
 * RPC sets fine, but if the client ID is invalid, connection closes
 * and the user can't enter/send the correct client ID without getting a
 * connection closed error
 */
const rpc = new DiscordRPC.Client({ transport: 'ipc' });

/*
 * Case 2
 *
 * When overwriting the client with the registerId function,
 * the connection looks like it sucessfully forms, but there is no
 * RPC status on discord.
 */ 
// let rpc = new DiscordRPC.Client({ transport: 'ipc' });

/*
 * Case 3
 *
 * When setting a client with the registerId function,
 * the connection looks like it sucessfully forms like case 2, but
 * there is no RPC status on discord
 */ 
// let rpc;

async function registerId(clientId) {
    // Uncomment to see cases 2 and 3
    // rpc = new DiscordRPC.Client({ transport: 'ipc' });
    DiscordRPC.register(clientId);
    rpc.login({ clientId }).catch(console.error);
}


async function setActivity() {
    if (typeof rpc !== 'undefined') {
        rpc.setActivity({
            details: 'Hey, this is pretty cool',
            state: 'RPCing',
            instance: false,
        });
    }
}

if (typeof rpc !== 'undefined') {
    rpc.on('ready', () => {
        setActivity();
      
        // activity can only be set every 15 seconds
        setInterval(() => {
            setActivity();
        }, 15e3);
    });
}

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
  
    win.loadFile('index.html');
}
  
app.whenReady().then(createWindow);
  
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
  
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

ipcMain.on('clientId:value', function(event, value) {
    registerId(value);
});
