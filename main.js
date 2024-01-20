const { app, BrowserWindow, nativeImage } = require('electron')
const path = require('path')

const { desktopCapturer } = require('electron');
desktopCapturer.getSources({ types: ['window', 'screen'] });


//configuração default do electron, janela com tamanho fixo
function createWindow() {
    const win = new BrowserWindow({
        width: 1300,
        height: 900,
        webPreferences:{
            preload: path.join(__dirname, 'preloader.js'),
            enableRemoteModule: true,
            contextIsolation: false,
        }
    })

    win.setMinimumSize(1300, 900)
    win.setMaximumSize(1300, 900)

    const iconPath = nativeImage.createFromPath(`${app.getAppPath()}/public/dock.png`)
    app.dock.setIcon(iconPath)

    win.loadURL('http://localhost:3000') //espelho do servidor react
}

//cria a janela quando o app estiver pronto, verifica se a janela está aberta, se não cria uma nova
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

//encerra o app quando todas as janelas estiverem fechadas, exceto no mac (darwin) condiguração default do sistema mac
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
