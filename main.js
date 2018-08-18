const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const router = require('dialog-router-api').create({
    gateway: '192.168.8.1'
})

const assetsDirectory = path.join(__dirname, 'assets')

let win, tray, token

const createWindow = () => {
    win = new BrowserWindow({
        width: 500,
        height: 250,
        frame: false,
        show: false,
        skipTaskbar: true
    })

    win.loadFile('index.html')

    //win.webContents.openDevTools()

    win.on('close', () => {
        win = null
    })
}

const createTray = () => {
    tray = new Tray(path.join(assetsDirectory, 'signal0.png'))
    tray.on('click', toggleWindow)
    tray.setToolTip('Dialog 4G')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'GitHub Repo'},
        { label: 'Exit', click: closeWindow}
    ])
    tray.setContextMenu(contextMenu)
}

const getWindowPosition = () => {
    const trayBounds = tray.getBounds()
    const x = Math.round(trayBounds.x - 255)
    const y = Math.round(trayBounds.y  - 255)
  
    return {x: x, y: y}
}

const showWindow = () => {
    const position = getWindowPosition()
    win.setPosition(position.x, position.y)
    win.show()
    win.focus()
}

const toggleWindow = () => {
    if(win.isVisible()) {
        win.hide()
    } else {
        showWindow()
    }
}

const closeWindow = () => {
    win.close()
}

const getToken = () => {
    router.getToken((err, TOKEN) => {
        token = TOKEN
    })
}

const getStrength = () => {
    if ( token !== undefined ) {
        router.getStatus(token, (err, res) => {
            if (err) throw err
            let name = 'signal'+res.SignalIcon[0]+'.png'
            tray.setImage(path.join(assetsDirectory, name))            
        })
    } else {
        getToken()
    }    
}

app.on('ready', () => {
    createWindow()
    createTray()
    getToken()
    setInterval(getStrength, 4000)
})

app.on('window-all-closed', () => {    
    app.quit()     
})


