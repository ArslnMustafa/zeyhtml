# CyberPanel deployment notes

Dieses Paket benötigt keinen Node.js-Prozess oder Reverse Proxy: CyberPanel liefert die statischen Dateien direkt aus, während PHP `notify.php` für die Resend-Benachrichtigungen ausführt.

Für die produktive Domain müssen PHP und die Erweiterung `curl` aktiviert sein. Das Paket wurde lokal mit erfolgreichem `visit`- und `date`-Payload gegen den Resend-Endpunkt geprüft.

Wenn statt der statischen Variante später eine Node.js-Anwendung hinter OpenLiteSpeed betrieben wird, erfolgt dies in CyberPanel über **External App** und einen **Proxy Context**; die maßgeblichen Einrichtungsdetails finden sich in der unten verlinkten Anleitung. [1]

## References

[1]: https://stackoverflow.com/questions/77583620/how-to-use-reverse-proxy-in-openlitespeed "How to use Reverse Proxy in OpenLiteSpeed?"
