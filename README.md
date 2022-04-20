# WTF-SERVER

A server for publishing incredible delights on dylan.wtf.

### Service setup on raspberry pi

```
$ sudo cp wtf.service /etc/systemd/system
$ sudo systemctl enable wtf.service
$ sudo systemctl start wtf.service
```

### Viewing logs
```
$ journalctl -u wtf
```
