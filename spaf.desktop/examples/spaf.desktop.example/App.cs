using System;
using DryIoc;
using icontainer.dryioc;
using spaf.desktop.core;

namespace spaf.desktop.example
{
    public class App
    {
        public static readonly Container Container = new Container(rules => rules.WithoutThrowOnRegisteringDisposableTransient());
        
        public static void Start(Action<IGenericContainer> registerPlatformSpecific)
        {
            SetupContainer();
            DesktopBuilder.Create(8080)
                .WithContainer(DryIocContainer.Build(Container), registerPlatformSpecific)
                .WithStatic("/","wwwroot")
                .Start();
        }


        private static void SetupContainer()
        {
            
        }
    }
}