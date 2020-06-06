using AppKit;
using Foundation;
using spaf.desktop.macos;

namespace spaf.desktop.example.mac
{
    [Register("AppDelegate")]
    public class AppDelegate : NSApplicationDelegate
    {
        public AppDelegate()
        {
            /*caret*/
        }

        public override void DidFinishLaunching(NSNotification notification)
        {
            // Insert code here to initialize your application
            App.Start(SpafMacOs.PlatformSpecific);
        }

        public override void WillTerminate(NSNotification notification)
        {
            // Insert code here to tear down your application
        }
    }
}