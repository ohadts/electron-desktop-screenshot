const electron = require('electron');
const {app, BrowserWindow, Tray, Menu, ipcMain, desktopCapturer, screen} = electron;

let tray = null;

const createCaptureWindow = ()=>{
    const captureWindow = new BrowserWindow({   
        width: 1650,  
        height: 1050,  
        webPreferences:{
            preload: `${__dirname}/preload.js`
        }
    });
    captureWindow.loadURL(`file://${__dirname}/mainWindow.html`); 
    return captureWindow;
}

app.whenReady().then(()=>{
    tray = new Tray(`${__dirname}/iconTemplate.png`);
    desktopCapturer.getSources({ 
        types: ['screen'], thumbnailSize: {    
            height: screen.getAllDisplays()[1].size.height,  
            width: screen.getAllDisplays()[1].size.width
        } 
    }).then(sources => { 
   
        const contextMenu = Menu.buildFromTemplate(
            sources.map((source)=>{ return {label: source.name, click:()=>{
                const captureWindow = createCaptureWindow();
                captureWindow.webContents.once('dom-ready', () => {
                    captureWindow.webContents.send("screenshot", source.thumbnail.toDataURL());
                });
                
            }}})
            )
            tray.setToolTip('This is my application.')
            tray.setContextMenu(contextMenu) 
        
        })

    })
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})





