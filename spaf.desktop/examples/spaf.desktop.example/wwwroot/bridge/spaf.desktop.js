/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2020
 * @compiler Bridge.NET 17.10.1
 */
Bridge.assembly("spaf.desktop", function ($asm, globals) {
    "use strict";

    Bridge.define("spaf.desktop.RpcRequest", {
        fields: {
            Service: null,
            Method: null,
            Parameters: null
        }
    });

    Bridge.define("spaf.desktop.Sockettone", {
        statics: {
            fields: {
                RPC_URI: null
            },
            ctors: {
                init: function () {
                    this.RPC_URI = "ws://localhost:8080/rpc";
                }
            }
        },
        fields: {
            Socket: null
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                this.Socket = new WebSocket(spaf.desktop.Sockettone.RPC_URI);

                this.Socket.onopen = Bridge.fn.combine(this.Socket.onopen, Bridge.fn.cacheBind(this, this.OnSocketOpen));
                this.Socket.onclose = Bridge.fn.combine(this.Socket.onclose, Bridge.fn.cacheBind(this, this.OnSocketClose));
                this.Socket.onmessage = Bridge.fn.combine(this.Socket.onmessage, Bridge.fn.cacheBind(this, this.OnSocketMessage));
                this.Socket.onerror = Bridge.fn.combine(this.Socket.onerror, Bridge.fn.cacheBind(this, this.OnSocketError));

            }
        },
        methods: {
            Connect: function () {

            },
            OnSocketError: function (obj) {
                System.Console.WriteLine(obj);
            },
            OnSocketMessage: function (obj) {
                System.Console.WriteLine(obj);
            },
            OnSocketClose: function (obj) {
                System.Console.WriteLine(obj);
            },
            OnSocketOpen: function (obj) {
                var $t;
                System.Console.WriteLine(obj);
                var rpcRequest = ($t = new spaf.desktop.RpcRequest(), $t.Service = "RemoteTest", $t.Method = "Prova", $t.Parameters = System.Array.init(["franco", Bridge.box(1, System.Int32)], System.Object), $t);
                this.Socket.send(Newtonsoft.Json.JsonConvert.SerializeObject(rpcRequest));
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJzcGFmLmRlc2t0b3AuanMiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbIlNvY2tldHRvbmUuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkFhWUEsY0FBY0EsSUFBSUEsVUFBVUE7O2dCQUU1QkEsMkRBQXNCQTtnQkFDdEJBLDZEQUF1QkE7Z0JBQ3ZCQSxpRUFBeUJBO2dCQUN6QkEsNkRBQXVCQTs7Ozs7Ozs7cUNBU0FBO2dCQUV2QkEseUJBQWtCQTs7dUNBR09BO2dCQUV6QkEseUJBQWtCQTs7cUNBR0tBO2dCQUV2QkEseUJBQWtCQTs7b0NBR0lBOztnQkFFdEJBLHlCQUFrQkE7Z0JBQ2xCQSxpQkFBaUJBLFVBQUlBLDJGQUlKQTtnQkFFakJBLGlCQUFpQkEsNENBQTRCQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBTeXN0ZW07XG51c2luZyBCcmlkZ2UuSHRtbDU7XG51c2luZyBOZXd0b25zb2Z0Lkpzb247XG5cbm5hbWVzcGFjZSBzcGFmLmRlc2t0b3BcbntcbiAgICBwdWJsaWMgY2xhc3MgU29ja2V0dG9uZVxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgUlBDX1VSSSA9IFwid3M6Ly9sb2NhbGhvc3Q6ODA4MC9ycGNcIjtcbiAgICAgICAgcHVibGljIFdlYlNvY2tldCBTb2NrZXQgeyBnZXQ7ICBwcml2YXRlIHNldDsgIH1cblxuICAgICAgICBwdWJsaWMgU29ja2V0dG9uZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuU29ja2V0ID0gbmV3IFdlYlNvY2tldChSUENfVVJJKTtcblxuICAgICAgICAgICAgdGhpcy5Tb2NrZXQuT25PcGVuICs9IHRoaXMuT25Tb2NrZXRPcGVuO1xuICAgICAgICAgICAgdGhpcy5Tb2NrZXQuT25DbG9zZSArPSB0aGlzLk9uU29ja2V0Q2xvc2U7XG4gICAgICAgICAgICB0aGlzLlNvY2tldC5Pbk1lc3NhZ2UgKz0gdGhpcy5PblNvY2tldE1lc3NhZ2U7XG4gICAgICAgICAgICB0aGlzLlNvY2tldC5PbkVycm9yICs9IHRoaXMuT25Tb2NrZXRFcnJvcjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgQ29ubmVjdCgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0RXJyb3IoRXZlbnQgb2JqKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0TWVzc2FnZShNZXNzYWdlRXZlbnQgb2JqKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0Q2xvc2UoQ2xvc2VFdmVudCBvYmopXG4gICAgICAgIHtcbiAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKG9iaik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHZvaWQgT25Tb2NrZXRPcGVuKEV2ZW50IG9iailcbiAgICAgICAge1xuICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUob2JqKTtcbiAgICAgICAgICAgIHZhciBycGNSZXF1ZXN0ID0gbmV3IFJwY1JlcXVlc3RcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBTZXJ2aWNlID0gXCJSZW1vdGVUZXN0XCIsXG4gICAgICAgICAgICAgICAgTWV0aG9kID0gXCJQcm92YVwiLFxuICAgICAgICAgICAgICAgIFBhcmFtZXRlcnMgPSBuZXcgb2JqZWN0W117XCJmcmFuY29cIiwxfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuU29ja2V0LlNlbmQoSnNvbkNvbnZlcnQuU2VyaWFsaXplT2JqZWN0KHJwY1JlcXVlc3QpKTtcbiAgICAgICAgfVxuXG4gICAgfVxufSJdCn0K
