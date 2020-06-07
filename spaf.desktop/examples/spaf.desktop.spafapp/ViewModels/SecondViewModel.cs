using System;
using System.Collections.Generic;
using Bridge.Html5;
using Bridge.Navigation;

namespace Bridge.Spaf.ViewModels
{
    public class SecondViewModel : LoadableViewModel
    {
        private readonly INavigator _navigator;
        public override string ElementId() => SpafApp.SecondId;

        public SecondViewModel(INavigator navigator)
        {
            this._navigator = navigator;
        }

        public override void OnBindingDone(Dictionary<string, object> parameters)
        {
            Console.WriteLine("Welcome!");
        }

        public void BackToHome()
        {
            this._navigator.Navigate(SpafApp.HomeId);
        }
    }
}