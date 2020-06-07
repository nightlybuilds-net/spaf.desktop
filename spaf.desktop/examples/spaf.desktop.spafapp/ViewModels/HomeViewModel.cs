using System;
using System.Collections.Generic;
using Bridge.Html5;

namespace Bridge.Spaf.ViewModels
{
    public class HomeViewModel : LoadableViewModel
    {
        public override string ElementId() => SpafApp.HomeId;

        public string Test { get; set; }

        public override void OnBeforeBinding(Dictionary<string, object> parameters)
        {
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
    }
}