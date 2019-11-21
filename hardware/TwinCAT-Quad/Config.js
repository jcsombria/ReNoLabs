// TwinCAT Config
var options = {
    //The IP or hostname of the target machine
    host: "192.168.56.101",
    //The NetId of the target machine
    amsNetIdTarget: "10.255.2.15.1.1",
    //The NetId of the source machine.
    //You can choose anything in the form of x.x.x.x.x.x,
    //but on the target machine this must be added as a route.
    amsNetIdSource: "10.0.2.15.1.1",
    //OPTIONAL: (These are set by default)
    //The tcp destination port
    //port: 48898
    //The ams source port
    //amsPortSource: 32905
    //The ams target port
    amsPortTarget: 801,
};

module.exports = options;
