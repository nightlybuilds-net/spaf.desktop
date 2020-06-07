using System;
using AppKit;
using Foundation;
using WebKit;

namespace spaf.desktop.example.mac
{
    public partial class ViewController : NSViewController
    {
        public ViewController(IntPtr handle) : base(handle)
        {
        }

        public override void ViewDidLoad()
        {
            base.ViewDidLoad();

            var webView = new WKWebView(this.View.Frame,new WKWebViewConfiguration());
            this.View.AddSubview(webView);
            webView.LoadRequest(new NSUrlRequest(new NSUrl("http://localhost:8080")));
        }

        public override NSObject RepresentedObject
        {
            get { return base.RepresentedObject; }
            set
            {
                base.RepresentedObject = value;
                // Update the view, if already loaded.
            }
        }
    }
}