using System;
using Bridge.Html5;

namespace spaf.desktop
{
    public class Sockettone
    {
        private const string RPC_URI = "ws://localhost:8080/rpc";
        public WebSocket Socket { get;  }

        public Sockettone()
        {
            this.Socket = new WebSocket(RPC_URI);

            this.Socket.OnOpen += this.OnSocketOpen;
            this.Socket.OnClose += this.OnSocketClose;
            this.Socket.OnMessage += this.OnSocketMessage;
            this.Socket.OnError += this.OnSocketError;
        }

        public void Connect()
        {
            
        }

        private void OnSocketError(Event obj)
        {
            Console.WriteLine(obj);
        }

        private void OnSocketMessage(MessageEvent obj)
        {
            Console.WriteLine(obj);
        }

        private void OnSocketClose(CloseEvent obj)
        {
            Console.WriteLine(obj);
        }

        private void OnSocketOpen(Event obj)
        {
            Console.WriteLine(obj);
        }

    }
}