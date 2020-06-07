using System;
using spaf.desktop.core;
using spaf.desktop.core.Services;
using spaf.desktop.macos.Services;

namespace spaf.desktop.macos
{
    public class SpafMacOs
    {
        public static void PlatformSpecific(IGenericContainer container)
        {
            container.Register<IDialogService, MacOsDialogService>(true);
        }
    }
}