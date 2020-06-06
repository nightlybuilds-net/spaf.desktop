using AppKit;
using Foundation;
using spaf.desktop.core.Services;

namespace spaf.desktop.macos.Services
{
    public class MacOsDialogService : NSObject, IDialogService
    {
        public string OpenFileDialog()
        {
            string destFile = null;

            this.InvokeOnMainThread(() => { InnerOpenFileDialog(out destFile); });

            return destFile;
        }

        public void InnerOpenFileDialog(out string outFile)
        {
            var dlg = new NSOpenPanel();
            dlg.Title = "Open Text File";
            dlg.AllowedFileTypes = new string[] {"txt", "html", "md", "css"};

            if (dlg.RunModal() == 1)
            {
                outFile = dlg.Filename;
                return;
                // var alert = new NSAlert()
                // {
                //     AlertStyle = NSAlertStyle.Critical,
                //     InformativeText = "We need to save the document here...",
                //     MessageText = "Save Document",
                // };
                // alert.RunModal();
            }

            outFile = null;
        }
    }
}