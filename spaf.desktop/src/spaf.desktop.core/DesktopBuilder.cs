using System;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using EmbedIO;
using EmbedIO.Files;
using spaf.desktop.core.Exceptions;

namespace spaf.desktop.core
{
    public class DesktopBuilder
    {
        private IGenericContainer _genericContainer;
        private WebServer _webServer;
        private bool _staticFolderSetupped;

        private DesktopBuilder(int webport)
        {
            this._webServer = new WebServer(HttpListenerMode.Microsoft, $"http://*:{webport}");
        }

        public static DesktopBuilder Create(int webport)
        {
            return new DesktopBuilder(webport);
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
            this._staticFolderSetupped = true;
            return this;
        }


        /// <summary>
        /// </summary>
        /// <param name="genericContainer"></param>
        /// <param name="registerPlatformSpecific"></param>
        public DesktopBuilder WithContainer(IGenericContainer genericContainer, Action<IGenericContainer> registerPlatformSpecific)
        {
            this._genericContainer = genericContainer;
            registerPlatformSpecific?.Invoke(this._genericContainer);
            return this;
        }

        public IDisposable Start()
        {
            if(!this._staticFolderSetupped)
                throw new SpafException("Static Folder Must be setupped");
            
            Ioc.UseContainer(this._genericContainer);
            Task.Factory.StartNew(async () =>
            {
                await this._webServer.RunAsync();
            });
            return this._webServer;
        }
    }
}