using System.Collections.Generic;
using Bridge.jQuery2;
using Bridge.Navigation;
using Bridge.Spaf.ViewModels;

namespace Bridge.Spaf
{
    class CustomRoutesConfig : BridgeNavigatorConfigBase
    {
        public override IList<IPageDescriptor> CreateRoutes()
        {
            return new List<IPageDescriptor>
            {
                new PageDescriptor
                {
                    CanBeDirectLoad = ()=>true,
                    HtmlLocation = ()=>"pages/home.html", // yout html location
                    Key = SpafApp.HomeId,
                    PageController = () => SpafApp.Container.Resolve<HomeViewModel>()
                },
                new PageDescriptor
                {
                    CanBeDirectLoad = ()=>true,
                    HtmlLocation = ()=>"pages/second.html", // yout html location
                    Key = SpafApp.SecondId,
                    PageController = () => SpafApp.Container.Resolve<SecondViewModel>()
                },
              
            };
        }

        public override bool DisableAutoSpafAnchorsOnNavigate { get; } = true;

        public override jQuery Body { get; } = jQuery.Select("#pageBody");
        public override string HomeId { get; } = SpafApp.HomeId;
    }
}
