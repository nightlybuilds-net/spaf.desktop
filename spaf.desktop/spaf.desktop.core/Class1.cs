using System.Security.Cryptography.X509Certificates;
using EmbedIO;
using EmbedIO.Files;

namespace spaf.desktop.core
{
    public class DesktopBuilder
    {
        private IContainer _container;
        private WebServer _webServer;
        private bool _staticFilderSetupped;

        private DesktopBuilder()
        {
            this._webServer = new WebServer(HttpListenerMode.Microsoft);
        }

        public static DesktopBuilder Create()
        {
            return new DesktopBuilder();
        }

        public DesktopBuilder WithApi(string baseRoute)
        {
            // todo how register all controllers=?
            // this._webServer.WithWebApi(baseRoute, m => m.reg);
            return this;
        }
        
        public DesktopBuilder WithStatic(string baseRoute, string fileSystemPath)
        {
            this._webServer.WithStaticFolder(baseRoute, fileSystemPath, true, m => m
                .WithContentCaching());
            this._staticFilderSetupped = true;
            return this;
        }
        
        
        /// <summary>
        /// </summary>
        /// <param name="container"></param>
        public DesktopBuilder WithContainer(IContainer container)
        {
            this._container = container;
            return this;
        }

        public void Start()
        {
            Ioc.UseContainer(this._container);
        }
        
        
    }
}