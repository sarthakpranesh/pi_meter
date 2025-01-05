import express from 'express'
import cors from 'cors'
import expressWs from 'express-ws'
import { $ } from 'bun'


const {app, getWss} = expressWs(express())

const port = 8011

app.use(cors())

app.get('/health', (req, res) => {
    res.send('good')
})
const configForData = {
    cpu_current_frequency: {
        path: "/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq"
    },
    cpu_max_frequency: {
        path: "/sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq"
    },
    cpu_min_frequency: {
        path: "/sys/devices/system/cpu/cpu0/cpufreq/scaling_min_freq"
    },
    soc_temp: {
        path: "/sys/class/thermal/thermal_zone0/temp"
    },
    fan_speed: {
        path: "/sys/devices/platform/cooling_fan/hwmon/*/fan1_input"
    },
    os_pretty_name: {
        path: "/etc/os-release",
        grep: "PRETTY_NAME",
        replace: ["PRETTY_NAME=", ""]
    },
    board_model: {
        path: "/proc/cpuinfo",
        grep: "Model",
        replace: ["Model\t\t:", ""]
    }
}
const quietCat = async (path: string, grep?: string, _replace?: [string, string]) => {
    try {
        let output = ""
        if (grep) {
            output = (await $`cat ${"/pi_host" + path} | grep "${grep}"`.quiet().text()).replaceAll("\n", "")
        } else {
            output = (await $`cat ${"/pi_host" + path}`.quiet().text()).replaceAll("\n", "")
        }
        if (_replace) {
            output = output.replace(_replace[0], _replace[1])
        }
        return output.replace('"', "").trim()
    } catch (err) {
        return ''
    }
}
const dataGetter = async () => {
    const data: any = {}
    for (const key of Object.keys(configForData)) {
        const value = configForData[key];
        data[key] = await quietCat(value.path, value?.grep, value?.replace)
    }
    return data
}
const dataEmitter = async () => {
    const data = await dataGetter()
    const wss = getWss()
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data))
        }
    });
}
const emitWithHeartBeat = (() => {
    let timer: null | Timer = null;
    return {
        start: () => {
            if (timer) return
            timer = setInterval(dataEmitter, 1000)
        },
        stop: () => {
            const wss = getWss()
            if (timer && wss.clients.size === 0) {
                clearInterval(timer)
                timer = null
            }
        }
    }
})();
app.ws('/socket', (ws, req) => {
    ws.on('error', console.error);

    ws.on('open', () => {
        console.log('Connection open')
    })

    ws.on('close', () => {
        console.log('Connection closed')
        emitWithHeartBeat.stop()
    })

    ws.on('message', () => {
        emitWithHeartBeat.start()
        dataGetter().then((d) => ws.send(JSON.stringify(d)))
    })
})

app.listen(port, () => console.log('Listening'))