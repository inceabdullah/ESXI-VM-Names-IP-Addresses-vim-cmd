import { parseArgsStringToArgv } from 'string-argv'
import { spawner } from "./spawner.js"
import _conf from './config/index.js'

const conf = _conf()

let vmMasterIP = conf.vmMasterIP;
let sshUsername = conf.sshUsername || ""
let sshPassword = conf.sshPassword || ""
let guestIP;
let guestName;
let ignoreCaseGuestName;

if (conf.args["vm-master-ip"]) vmMasterIP = conf.args["vm-master-ip"]
if (conf.args["ssh-username"]) sshUsername = conf.args["ssh-username"]

if (conf.args["ssh-password"]) sshPassword = conf.args["ssh-password"]
if (conf.args["guest-ip"]) guestIP = conf.args["guest-ip"]
if (conf.args["guest-name"]) guestName = conf.args["guest-name"]
if (conf.args["ignore-case-guest-name"]) ignoreCaseGuestName = conf.args["ignore-case-guest-name"]

if (!vmMasterIP || !sshUsername) {
    console.log("vm Master IP or ssh username are not found.\t--vm-master-ip=<IP>\t--ssh-username=<username>")
    console.log("\nnode index --vm-master-ip=<IP> --ssh-username=<username> --ssh-password=<password> --guest-ip=<IP> --guest-name=<name> --ignore-case-guest-name=<1|0>")
    process.exit(1)
}

const main = async () => {
    const sshCommandPrefix = `sshpass -p "${sshPassword}" ssh -o StrictHostKeyChecking=no ${sshUsername}@${vmMasterIP}`

    const _vmCommand = `vim-cmd vmsvc/getallvms`
    const _command = `${sshCommandPrefix} "${_vmCommand}"`
    const parsedCommand = parseArgsStringToArgv(_command)
    const vmList = await spawner(parsedCommand, {slient:true}).catch(err=>{
            console.error("err in getallvms")
            console.error(err)
            process.exit(1)
    })
    let vmListLines = vmList.data.split("\n").map(line=>line.trim()).filter(line=>(line.length>0 && /^\d+/.test(line)))
    // parse names and get IPs
    for (let i=0; i<vmListLines.length; i++) {
        const vmLine = vmListLines[i]      
        const vid = vmLine.split(/\s+/)[0]
        const vmName = vmLine.split(/\s+/)[1]
        // get IPs
        const _getGuestCommand = `vim-cmd vmsvc/get.guest ${vid}`
        const _command = `${sshCommandPrefix} "${_getGuestCommand}"`
        const parsedCommand = parseArgsStringToArgv(_command)
        const guestInfo = await spawner(parsedCommand, {slient:true}).catch(err=>{
            console.error("err in guest info")
            console.error(err)
            process.exit(1)
        }
        )
        let guestInfoLines = guestInfo.data.split("\n").map(line=>line.trim()).filter(line=>(line.length>0 && /ipaddress \= "/i.test(line)))
        let IPAddressList = []
        if (guestInfoLines.length>0) {
            IPAddressList = guestInfoLines.map(line=>{
                const _match = line.match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/)
                if (_match) return _match[0]
                else return ""
            }).filter(_=>_)
        }
        if (IPAddressList.length){
            //guest IP Filter
            if (guestIP){
                if (IPAddressList.indexOf(guestIP)<0) continue
            }
            //guest name Filter
            if (guestName){
                if (!new RegExp(`${guestName}`, ignoreCaseGuestName ? "i" : "").test(vmName)) continue
            }

            console.log(`${IPAddressList.join(",")} ${vmName} ${vid}`)
        }
        
    }
     

}

main().then(() => {
}
).catch(err => {
    console.log(err)
}
)

