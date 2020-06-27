using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using EmbedIO.WebSockets;
using mjm.nethelpers.Extensions;

namespace spaf.desktop.core
{
    /// <summary>
    /// Defines a very simple chat server.
    /// </summary>
    public class RpcServer : WebSocketModule
    {
        public RpcServer(string urlPath)
            : base(urlPath, true)
        {
            // placeholder
        }

        /// <inheritdoc />
        protected override Task OnMessageReceivedAsync(
            IWebSocketContext context,
            byte[] rxBuffer,
            IWebSocketReceiveResult rxResult)
        {
            var text = this.Encoding.GetString(rxBuffer);
            var request = text.FromJson<RpcRequest>();
            Console.WriteLine(request.PropertiesToString());

            var des = new ObjectDeserializer();
            var valueinds = request.Parameters.Select(s => s.To<JsonElement>());
                
            var objects = new List<object>();
            foreach (var jsonElement in valueinds)
            {
                
                if (jsonElement.ValueKind == JsonValueKind.Number)
                {
                    var oki = jsonElement.TryGetInt32(out var vali);
                    if (oki)
                    {
                        objects.Add(vali);
                        continue;
                    }
                    var okl = jsonElement.TryGetInt64(out var vall);
                    if (okl)
                    {
                        objects.Add(vall);
                        continue;
                    }
                    var okd = jsonElement.TryGetDouble(out var val);
                    if (okd)
                    {
                        objects.Add(val);
                        continue;
                    }
                }
                
                if (jsonElement.ValueKind == JsonValueKind.String)
                {
                    objects.Add(jsonElement.GetString());
                }

            }
            
            var resovledServce = new RemoteTest();

            var method = resovledServce.GetType().GetMethod(request.Method);
            method.Invoke(resovledServce, objects.ToArray());


            return Task.CompletedTask;
        }
            // => SendToOthersAsync(context, Encoding.GetString(rxBuffer));

        /// <inheritdoc />
        protected override Task OnClientConnectedAsync(IWebSocketContext context)
            => Task.WhenAll(
                SendAsync(context, "Welcome to the chat room!"),
                SendToOthersAsync(context, "Someone joined the chat room."));

        /// <inheritdoc />
        protected override Task OnClientDisconnectedAsync(IWebSocketContext context)
            => SendToOthersAsync(context, "Someone left the chat room.");

        private Task SendToOthersAsync(IWebSocketContext context, string payload)
            => BroadcastAsync(payload, c => c != context);
    }
    
    
    
}