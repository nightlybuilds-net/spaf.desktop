using System;
using System.Collections.Generic;
using Bridge.Html5;
using Bridge.Navigation;
using spaf.desktop;

namespace Bridge.Spaf.ViewModels
{
    public class HomeViewModel : LoadableViewModel
    {
        private readonly INavigator _navigator;
        public override string ElementId() => SpafApp.HomeId;

        public string Test { get; set; }

        public HomeViewModel(INavigator navigator)
        {
            this._navigator = navigator;
        }

        public override void OnBeforeBinding(Dictionary<string, object> parameters)
        {
            var sockettone = new Sockettone();
            
            this.Test = "Antani!";
            base.OnBeforeBinding(parameters);
        }

        public override void OnBindingDone(Dictionary<string, object> parameters)
        {
            base.OnBindingDone(parameters);
            Console.WriteLine("Binding Done");
        }

        public void SayHelloJs()
        {
            Console.WriteLine("hello");

            Global.Alert("Hello!");
        }

        public void GoToPage2()
        {
            this._navigator.Navigate(SpafApp.SecondId);
        }
    }
}