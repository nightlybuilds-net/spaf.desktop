/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2020
 * @compiler Bridge.NET 17.10.1
 */
Bridge.assembly("spaf.desktop", function ($asm, globals) {
    "use strict";

    Bridge.define("spaf.desktop.Class1");

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
                System.Console.WriteLine(obj);
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJzcGFmLmRlc2t0b3AuanMiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbIlNvY2tldHRvbmUuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkFZWUEsY0FBY0EsSUFBSUEsVUFBVUE7O2dCQUU1QkEsMkRBQXNCQTtnQkFDdEJBLDZEQUF1QkE7Z0JBQ3ZCQSxpRUFBeUJBO2dCQUN6QkEsNkRBQXVCQTs7Ozs7OztxQ0FRQUE7Z0JBRXZCQSx5QkFBa0JBOzt1Q0FHT0E7Z0JBRXpCQSx5QkFBa0JBOztxQ0FHS0E7Z0JBRXZCQSx5QkFBa0JBOztvQ0FHSUE7Z0JBRXRCQSx5QkFBa0JBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIFN5c3RlbTtcbnVzaW5nIEJyaWRnZS5IdG1sNTtcblxubmFtZXNwYWNlIHNwYWYuZGVza3RvcFxue1xuICAgIHB1YmxpYyBjbGFzcyBTb2NrZXR0b25lXG4gICAge1xuICAgICAgICBwcml2YXRlIGNvbnN0IHN0cmluZyBSUENfVVJJID0gXCJ3czovL2xvY2FsaG9zdDo4MDgwL3JwY1wiO1xuICAgICAgICBwdWJsaWMgV2ViU29ja2V0IFNvY2tldCB7IGdldDsgIHByaXZhdGUgc2V0OyAgfVxuXG4gICAgICAgIHB1YmxpYyBTb2NrZXR0b25lKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5Tb2NrZXQgPSBuZXcgV2ViU29ja2V0KFJQQ19VUkkpO1xuXG4gICAgICAgICAgICB0aGlzLlNvY2tldC5Pbk9wZW4gKz0gdGhpcy5PblNvY2tldE9wZW47XG4gICAgICAgICAgICB0aGlzLlNvY2tldC5PbkNsb3NlICs9IHRoaXMuT25Tb2NrZXRDbG9zZTtcbiAgICAgICAgICAgIHRoaXMuU29ja2V0Lk9uTWVzc2FnZSArPSB0aGlzLk9uU29ja2V0TWVzc2FnZTtcbiAgICAgICAgICAgIHRoaXMuU29ja2V0Lk9uRXJyb3IgKz0gdGhpcy5PblNvY2tldEVycm9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgQ29ubmVjdCgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0RXJyb3IoRXZlbnQgb2JqKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0TWVzc2FnZShNZXNzYWdlRXZlbnQgb2JqKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0Q2xvc2UoQ2xvc2VFdmVudCBvYmopXG4gICAgICAgIHtcbiAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKG9iaik7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHZvaWQgT25Tb2NrZXRPcGVuKEV2ZW50IG9iailcbiAgICAgICAge1xuICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUob2JqKTtcbiAgICAgICAgfVxuXG4gICAgfVxufSJdCn0K
