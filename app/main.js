const path  = require('path')

const {
    app,
    Menu,
    Tray,
    clipboard,
    globalShortcut,
    BrowserWindow
} = require('electron')

const clippings  = []
let tray = null
let browserWindow = null;

const getIcon = () => {
    if(process.platform === 'win32') return 'icon-light@2x.ico'
}

app.on('ready', () => {
    tray = new Tray(path.join(__dirname, getIcon()))

    if(process.platform === 'win32'){
        tray.on('click', tray.popUpContextMenu)
    }
    browserWindow = new BrowserWindow({
        show: false,
        });
        browserWindow.loadURL(`file://${__dirname}/index.html`);
    const activationShortcut = globalShortcut.register(
        'CommandOrControl+Option+C',
        () => { tray.popUpContextMenu() }
    )

    if(!activationShortcut){
        console.error('Global activation shortcut failed to register')
        const newClippingShortcut = globalShortcut.register(
            'CommandOrControl+Shift+Option+C',
            () => {
            const clipping = addClipping();
            if (clipping) {
            browserWindow.webContents.send(
            'show-notification',
            'Clipping Added',
            clipping,
            );
            }
            },
            );
    }

    const newClippingShortcut = globalShortcut.register(
        'CommandOrControl+Shift+Option+C',
        () => { addClipping() }
    )

    if(!newClippingShortcut) {
        console.error('Global new clipping shortcut failed to register')
    }

    updateMenu()
    tray.setPressedImage(path.join(__dirname, 'icon-light.png'));

    tray.setToolTip('Clipmaster')

})

const updateMenu = () => {
    const menu = Menu.buildFromTemplate([
        {
            label: 'Create New Clipping',
            click() { addClipping() },
            accelerator: 'commandOrControl+Shift+C'
        },
        {
            type: 'separator'
        },
        ...clippings.map(createClippingMenuItem),
        { type: 'separator' },
        {
            label: 'Quit',
            click() { app.quit() },
            accelerator: 'CommandOrControl+Q'
        }
    ])
    tray.setContextMenu(menu)
}

const addClipping = () => {
    const clipping = clipboard.readText()
    clippings.push(clipping)
    updateMenu()
    return clipping
}

const createClippingMenuItem = (clipping, index) => {
    return {
        label: clipping.length > 20 ? clipping.slice(0, 10) + '...': clipping,
        click() { clipboard.writeText(clipping) },
        accelerator: `CommandOrCOntrol+${index}`
    }
}