const Store = require('electron-store')
const store = new Store()

class StateService {
    setWorkspace (workspace) {
        if (workspace === undefined)
            store.delete('workspace')
        else
            store.set('workspace', workspace)
    }

    getWorkspace () {
        return store.get('workspace')
    }

    setActiveLogFile (logFilePath) {
        if (logFilePath === undefined)
            store.delete('file')
        else
            store.set('file', logFilePath)
    }

    getActiveLogFile () {
        return store.get('file')
    }

    setLogPattern (pattern) {
        if (pattern === undefined)
            store.unset('log-pattern')
        else
            store.set('log-pattern', pattern)
    }

    getLogPattern () {
        return store.get('log-pattern')
    }
}

export default new StateService()