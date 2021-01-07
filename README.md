# Postie

A server for publishing static site blog posts.

### Service setup on raspberry pi

```
$ sudo cp postie.service /etc/systemd/system
$ sudo systemctl enable postie.service
$ sudo systemctl start postie.service
```

### Viewing logs
```
$ journalctl postie
```
