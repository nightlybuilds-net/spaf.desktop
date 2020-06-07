﻿using System;
using System.Collections.Generic;
using Bridge.jQuery2;
using Retyped;

namespace Bridge.Spaf
{
    public abstract class PartialModel :  IViewModelLifeCycle
    {
        private dom.HTMLDivElement _partialElement;

        /// <summary>
        /// Element id of the page 
        /// </summary>
        /// <returns></returns>
        public abstract string ElementId();
        
        /// <summary>
        /// HtmlLocation
        /// </summary>
        protected abstract string HtmlUrl { get; }


        /// <summary>
        /// Init partial
        /// </summary>
        /// <param name="parameters">data for init the partials</param>
        public virtual void Init(Dictionary<string,object> parameters)
        {

            jQuery.Get(this.HtmlUrl, null, (o, s, arg3) =>
            {
                this.OnBeforeBinding(parameters);
                this._partialElement = new dom.HTMLDivElement
                {
                    innerHTML = o.ToString()
                };
                var node = dom.document.getElementById(ElementId());
                node.appendChild(this._partialElement);
                knockout.ko.applyBindings(this, this._partialElement);
                this.OnBindingDone(parameters);
            });
        }
        
        /// <summary>
        /// Called when html is loaded but ko is not binded
        /// </summary>
        /// <param name="parameters"></param>
        public virtual void OnBeforeBinding(Dictionary<string,object> parameters){}
        
        /// <summary>
        /// Called when html is loaded and ko is binded 
        /// </summary>
        /// <param name="parameters"></param>
        public virtual void OnBindingDone(Dictionary<string,object> parameters){}

        public virtual void DeInit()
        {
            // check if ko contains this node
            if (this._partialElement == null) return;
            var data = knockout.ko.dataFor(this._partialElement);
            if (data == null) return;
            
            knockout.ko.removeNode(this._partialElement);
        }
    }

    public interface IViewModelLifeCycle
    {
        void Init(Dictionary<string, object> parameters);
        void DeInit();
    }
}



