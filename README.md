# VMWare IP Name Vid

```bash
node index.js --vm-master-ip=172.16.1.15 --ssh-username root --ssh-password password
```
or pre conf. in [config/config.json](config/config.json)
```JavaScript
{
    "vmMasterIP": "172.16.1.15",
    "sshUsername": "root",
    "sshPassword": "password"
}
```

```bash
node index.js

```

```bash
10.71.1.2,10.71.1.2,172.16.101.37,172.16.101.48,172.16.101.1 MySQL 1
10.71.1.16,10.71.1.16,172.18.0.1,10.71.1.1 Back-end 2
172.16.101.26,172.16.101.26,172.18.0.1,172.16.101.1 Front-end 3
172.16.101.13,172.16.101.13,172.16.101.41,10.71.1.1,172.18.0.1,172.16.101.1 Back-up 4
```
