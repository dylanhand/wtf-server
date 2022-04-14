# WTF-SERVER

A server for publishing incredible stuff on dylan.wtf.

### Service setup on raspberry pi

```
$ sudo cp postie.service /etc/systemd/system
$ sudo systemctl enable postie.service
$ sudo systemctl start postie.service
```

### Viewing logs
```
$ journalctl -u postie
```
