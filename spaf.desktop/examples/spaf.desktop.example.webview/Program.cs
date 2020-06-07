using System;
using System.Drawing;
using Webview;

namespace spaf.desktop.example.webview
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            App.Start(null);
            
            new WebviewBuilder(new Uri("http://localhost:8080"))
                .WithSize(new Size(1024, 768))
                .Resizeable()
                .Debug()
                .WithInvokeCallback((webview, action) => {
                    Console.WriteLine("Action: {0}", action);
                })
                .Build()
                .Run();
            // Webview.Webview.Simple("Window Title", new Content("https://google.com"))    
        }
    }
}