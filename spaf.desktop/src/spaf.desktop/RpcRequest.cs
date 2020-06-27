using System;

namespace spaf.desktop
{
    public class RpcRequest
    {
        public string Service { get; set; }
        public string Method { get; set; }
        public object[] Parameters { get; set; }

    }

}