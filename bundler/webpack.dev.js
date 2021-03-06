const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const ip = import('internal-ip')
const portFinderSync = require('portfinder-sync')
const path = require('path')

const infoColor = (_message) =>
{
    return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`
}

module.exports = merge(
    commonConfiguration,
    {
        mode: 'development',
        entry: path.resolve(__dirname, '../demo/script.js'),
        devServer:
        {
            host: '0.0.0.0',
            port: portFinderSync.getPort(8080),
            contentBase: './dist',
            watchContentBase: true,
            open: true,
            https: false,
            useLocalIp: true,
            disableHostCheck: true,
            overlay: true,
            noInfo: true,
            after: async function(app, server, compiler)
            {
                let x = await ip;

                const port = server.options.port
                const https = server.options.https ? 's' : ''
                const localIp = x.internalIpV4Sync();
                const domain1 = `http${https}://${localIp}:${port}`
                const domain2 = `http${https}://localhost:${port}`
                
                console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`)
            }
        }
    }
)
