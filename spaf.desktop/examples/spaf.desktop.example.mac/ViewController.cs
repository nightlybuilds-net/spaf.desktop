using System;
using System.Threading.Tasks;
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

        public override async void ViewDidLoad()
        {
            try
            {
                base.ViewDidLoad();

                await Task.Delay(1000);
                
                

                var webView = new WKWebView(this.View.Frame,new WKWebViewConfiguration());
                
                this.View.AddSubview(webView);

                this.View.AutoresizesSubviews = true;
                // NSLayoutConstraint.Create(this.View, NSLayoutAttribute.Bottom, NSLayoutRelation.Equal, 1f, 0f).Active = true;
                // NSLayoutConstraint.Create(this.View, NSLayoutAttribute.Top, NSLayoutRelation.Equal, 1f, 1f).Active=true;
                // webView.AddConstraint(NSLayoutConstraint.Create(this.View, NSLayoutAttribute.Bottom,NSLayoutRelation.Equal,0,0));
                // webView.AddConstraint(NSLayoutConstraint.Create(this.View, NSLayoutAttribute.Top,NSLayoutRelation.Equal,0,0));
                // webView.AddConstraint(NSLayoutConstraint.Create(this.View, NSLayoutAttribute.Left,NSLayoutRelation.Equal,0,0));
                // webView.AddConstraint(NSLayoutConstraint.Create(this.View, NSLayoutAttribute.Right,NSLayoutRelation.Equal,0,0));
                // webView. AlignmentRectInsets = new NSEdgeInsets(0,0,0,0);
                webView.LoadRequest(new NSUrlRequest(new NSUrl("http://localhost:8080")));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;    
            }
           
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