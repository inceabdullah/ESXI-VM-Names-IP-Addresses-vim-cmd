import {spawn} from 'child_process'


export const spawner = (_parsedCommand, options={}) => new Promise((resolve, reject)=>{
    const { slient } = options
    const printStdOut = (data) => {
        if (slient) return
        console.log(data)
    }
    let chunkedData = ""
    const _process = (spawn(_parsedCommand[0], _parsedCommand.slice(1), {
        cwd: process.cwd(),
        detached: false,
        shell: true,
        stdio: "pipe"
    }));

    _process.stdout.on('data', data => {
        data = data.toString()
        chunkedData += data
        printStdOut(data)
    })

    _process.stdout.on('end', code => {
        if (!code || code === 0) return resolve({data: chunkedData, code})
        reject(code)
    })
})

export default {
    spawner
}