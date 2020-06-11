Bridge.assembly("spaf.desktop", function ($asm, globals) {
    "use strict";


    var $m = Bridge.setMetadata,
        $n = ["System"];
    $m("spaf.desktop.Class1", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"}]}; }, $n);
    $m("spaf.desktop.Sockettone", function () { return {"att":1048577,"a":2,"m":[{"a":2,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Connect","t":8,"sn":"Connect","rt":$n[0].Void},{"a":1,"n":"OnSocketClose","t":8,"pi":[{"n":"obj","pt":CloseEvent,"ps":0}],"sn":"OnSocketClose","rt":$n[0].Void,"p":[CloseEvent]},{"a":1,"n":"OnSocketError","t":8,"pi":[{"n":"obj","pt":Event,"ps":0}],"sn":"OnSocketError","rt":$n[0].Void,"p":[Event]},{"a":1,"n":"OnSocketMessage","t":8,"pi":[{"n":"obj","pt":MessageEvent,"ps":0}],"sn":"OnSocketMessage","rt":$n[0].Void,"p":[MessageEvent]},{"a":1,"n":"OnSocketOpen","t":8,"pi":[{"n":"obj","pt":Event,"ps":0}],"sn":"OnSocketOpen","rt":$n[0].Void,"p":[Event]},{"a":2,"n":"Socket","t":16,"rt":WebSocket,"g":{"a":2,"n":"get_Socket","t":8,"rt":WebSocket,"fg":"Socket"},"fn":"Socket"},{"a":1,"n":"RPC_URI","is":true,"t":4,"rt":$n[0].String,"sn":"RPC_URI"},{"a":1,"backing":true,"n":"<Socket>k__BackingField","t":4,"rt":WebSocket,"sn":"Socket"}]}; }, $n);
});
