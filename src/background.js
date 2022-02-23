'use strict'

import {app, protocol, BrowserWindow, ipcMain, dialog, remote, ipcRenderer} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import StateService from "@/service/StateService"
import SearchService from "@/service/SearchService"

const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs');

let trailingFile = undefined
let applicationWindow = undefined

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  applicationWindow = new BrowserWindow({
    frame: false,
    width: 1600,
    height: 800,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  applicationWindow.setIcon(__dirname + '\\..\\assets\\icon.png')

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await applicationWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) applicationWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    applicationWindow.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('minimize', event => {
  event.sender.getOwnerBrowserWindow().minimize()
})

ipcMain.on('maximize', event => {
  const window = event.sender.getOwnerBrowserWindow()

  window.isMaximized() ? window.unmaximize() : window.maximize()
})

ipcMain.on('close', event => {
  event.sender.getOwnerBrowserWindow().close()
})

ipcMain.on('devtools', event => {
  event.sender.getOwnerBrowserWindow().openDevTools()
})

function resolveWorkspaceTree(path, parent) {
  let workspaceName = path.split("\\").pop()
  let children = []

  const files = fs.readdirSync(path);

  files.forEach(file => {
    let filePath = path + '\\' + file;
    let fileProps = fs.lstatSync(filePath);

    if(fileProps.isDirectory()) {
      children.push({
        name: file,
        path: filePath,
        children: [],
        parent: path,
        isFolder: true,
        isExpanded: false
      })
    } else if (fileProps.isFile() && file.split('.').pop() === 'log') {
      children.push({
        name: file,
        path: filePath,
        children: [],
        parent: path,
        isFolder: false,
        isExpanded: false
      })
    }
  })

  children = children.map(child => {
    if (child.isFolder) {
      return resolveWorkspaceTree(child.path, workspaceName)
    } else {
      return child
    }
  })

  return {
    name: workspaceName,
    path: path,
    parent: parent,
    children: children,
    isFolder: true,
    isExpanded: false
  }
}

ipcMain.on('load-workspace', (event, workspace) => {
  event.sender.send('selected-workspace', workspace)
})

ipcMain.on('workspace-changed', (event, updatedWorkspace) => {
  StateService.setWorkspace(updatedWorkspace)
})

ipcMain.on('close-workspace', event => {
  StateService.setWorkspace(undefined)
  StateService.setActiveLogFile(undefined)

  trailingFile.watch.close()
  fs.close(trailingFile.handle, (err) => {
    if (err) {
      console.log('Failed to close active logfile!')
      console.log(err)
    }
  })

  event.sender.send('clear-log')
  event.sender.send('close-workspace')
})

ipcMain.on('select-workspace', event => {
  let state = StateService

  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(root => {
    let workspace = resolveWorkspaceTree(root.filePaths[0], undefined)
    state.setWorkspace(workspace)
    event.sender.send('selected-workspace', workspace)
  });
})

function updateFileContents(event) {
  setTimeout(() => {
    let readLength = 0

    fs.stat(trailingFile.path, (err, stats) => {
      readLength = stats.size - trailingFile.offset

      if (readLength <= 0 || trailingFile.lastFileSize === stats.size)
        return

      trailingFile.lastFileSize = stats.size
      const buffer = Buffer.alloc(readLength)

      fs.read(trailingFile.handle, buffer, 0, readLength, trailingFile.offset, (err, bytes) => {
        if (err) {
          console.log(err)
        }

        if (bytes > 0) {
          let logLines = buffer.toString('utf-8')
              .split(/\r\n|\r|\n/)
              .filter(it => it !== '')

          let response = {
            filename: trailingFile.name,
            payload: logLines
          }

          event.sender.send('log-update', response)
          trailingFile.offset += readLength
        }
      })
    })
  }, 100);
}

ipcMain.on('selected-log', (event, file) => {
  if (trailingFile !== undefined)
    trailingFile.watch.close()

  const fileWatch = fs.watch(file.path, (eventType) => {
    if(eventType === 'change') {
      updateFileContents(event)
    }
  })

  fs.open(file.path, 'r', (err, f) => {
    if (err)  {
      console.log(err)
    }

    trailingFile = {
      path: file.path,
      name: file.name,
      handle: f,
      watch: fileWatch,
      lastFileSize: 0,
      offset: 0
    }

    event.sender.send('clear-log')
    updateFileContents(event)
  })

  StateService.setActiveLogFile(file)
});

function applySearchFilter (request) {
  return new Promise((resolve, reject) => {
    if (request.filter === '' || request.logs === undefined || request.filter === undefined) {
      resolve(request.logs)
    } else {
      resolve(SearchService.search(request.filter, request.logs))
    }
  });
}

ipcMain.handle('filter-request', async (event, request) => {
  return applySearchFilter(request)
})