module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                productName: "Leaflet",
                appId: 'com.vsolberg.leaflet',
                win: {
                    "target": [
                        "nsis"
                    ],
                    icon: 'src/assets/icon.png'
                }
            }
        }
    }
}