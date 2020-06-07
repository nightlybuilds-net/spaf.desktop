/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2020
 * @compiler Bridge.NET 17.10.0
 */
Bridge.assembly("spaf.desktop.spafapp", function ($asm, globals) {
    "use strict";

    Bridge.define("Bridge.Ioc.IIoc", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Ioc.IResolver", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Messenger.IMessenger", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Navigation.INavigator", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Navigation.INavigatorConfigurator", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Navigation.IBrowserHistoryManager", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Navigation.IAmLoadable", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Navigation.IPageDescriptor", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Navigation.Model.UrlDescriptor", {
        fields: {
            PageId: null,
            Parameters: null
        }
    });

    Bridge.define("Bridge.Navigation.NavigationUtility", {
        statics: {
            fields: {
                /**
                 * Define virtual directory for something like:
                 protocol://awesomesite.io/somedirectory
                 *
                 * @static
                 * @public
                 * @memberof Bridge.Navigation.NavigationUtility
                 * @type string
                 */
                VirtualDirectory: null
            },
            methods: {
                /**
                 * Get parameter key from parameters dictionary
                 *
                 * @static
                 * @public
                 * @this Bridge.Navigation.NavigationUtility
                 * @memberof Bridge.Navigation.NavigationUtility
                 * @param   {Function}                                   T             
                 * @param   {System.Collections.Generic.Dictionary$2}    parameters    
                 * @param   {string}                                     paramKey
                 * @return  {T}
                 */
                GetParameter: function (T, parameters, paramKey) {
                    if (parameters == null) {
                        throw new System.Exception("Parameters is null!");
                    }

                    if (!parameters.containsKey(paramKey)) {
                        throw new System.Exception(System.String.format("No parameter with key {0} found!", [paramKey]));
                    }

                    var value = parameters.getItem(paramKey);

                    if (!(Bridge.is(value, System.String))) {
                        return Bridge.cast(Bridge.unbox(value, T), T);
                    }

                    var parseMethod = Bridge.Reflection.getMembers(T, 8, 284, "Parse", System.Array.init([System.String], System.Type));

                    if (parseMethod != null) {
                        return Bridge.cast(Bridge.unbox(Bridge.Reflection.midel(parseMethod, null).apply(null, Bridge.unbox(System.Array.init([value], System.Object))), T), T);
                    }

                    return Bridge.cast(Bridge.unbox(value, T), T);
                },
                /**
                 * Build base url using page id and virtual directory
                 *
                 * @static
                 * @public
                 * @this Bridge.Navigation.NavigationUtility
                 * @memberof Bridge.Navigation.NavigationUtility
                 * @param   {string}    pageId
                 * @return  {string}
                 */
                BuildBaseUrl: function (pageId) {
                    var baseUrl = System.String.format("{0}//{1}", window.location.protocol, window.location.host);
                    baseUrl = System.String.isNullOrEmpty(Bridge.Navigation.NavigationUtility.VirtualDirectory) ? System.String.format("{0}#{1}", baseUrl, pageId) : System.String.format("{0}/{1}#{2}", baseUrl, Bridge.Navigation.NavigationUtility.VirtualDirectory, pageId);
                    return baseUrl;
                }
            }
        }
    });

    Bridge.define("Bridge.Navigation.Utility", {
        statics: {
            methods: {
                /**
                 * Load script sequentially
                 *
                 * @static
                 * @public
                 * @this Bridge.Navigation.Utility
                 * @memberof Bridge.Navigation.Utility
                 * @param   {System.Collections.Generic.List$1}    scripts
                 * @return  {void}
                 */
                SequentialScriptLoad: function (scripts) {
                    if (!System.Linq.Enumerable.from(scripts, System.String).any()) {
                        return;
                    }
                    var toLoad = System.Linq.Enumerable.from(scripts, System.String).first();
                    $.getScript(toLoad, function (o, s, arg3) {
                        scripts.remove(toLoad);
                        Bridge.Navigation.Utility.SequentialScriptLoad(scripts);
                    });
                }
            }
        }
    });

    Bridge.define("Bridge.Spaf.Attributes.SingleInstanceAttribute", {
        inherits: [System.Attribute]
    });

    Bridge.define("Bridge.Spaf.IViewModelLifeCycle", {
        $kind: "interface"
    });

    Bridge.define("Bridge.Spaf.ViewModelBase", {
        fields: {
            _pageNode: null
        },
        props: {
            PageNode: {
                get: function () {
                    return this._pageNode || ((this._pageNode = document.getElementById(this.ElementId())));
                }
            }
        },
        methods: {
            ApplyBindings: function () {
                ko.applyBindings(this, this.PageNode);
            },
            RemoveBindings: function () {
                ko.removeNode(this.PageNode);
            }
        }
    });

    Bridge.define("Bridge.Spaf.SpafApp", {
        main: function Main () {
            Bridge.Spaf.SpafApp.Container = new Bridge.Ioc.BridgeIoc();
            Bridge.Spaf.SpafApp.ContainerConfig();
            Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$Resolve(Bridge.Navigation.INavigator).Bridge$Navigation$INavigator$InitNavigation();

            window.onerror = function (message, url, number, columnNumber, error) {
                System.Console.WriteLine(error);
                return false;
            };

        },
        statics: {
            fields: {
                Container: null
            },
            props: {
                HomeId: {
                    get: function () {
                        return "home";
                    }
                },
                SecondId: {
                    get: function () {
                        return "second";
                    }
                }
            },
            methods: {
                ContainerConfig: function () {
                    Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$RegisterSingleInstance$3(Bridge.Navigation.INavigator, Bridge.Navigation.BridgeNavigatorWithRouting);
                    Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$RegisterSingleInstance$3(Bridge.Navigation.IBrowserHistoryManager, Bridge.Navigation.QueryParameterNavigationHistory);
                    Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$Register$4(Bridge.Navigation.INavigatorConfigurator, Bridge.Spaf.CustomRoutesConfig);

                    Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$RegisterSingleInstance$3(Bridge.Messenger.IMessenger, Bridge.Messenger.Messenger);

                    Bridge.Spaf.SpafApp.RegisterAllViewModels();


                },
                /**
                 * Register all types that end with "viewmodel".
                 You can register a viewmode as Singlr Instance adding "SingleInstanceAttribute" to the class
                 *
                 * @static
                 * @private
                 * @this Bridge.Spaf.SpafApp
                 * @memberof Bridge.Spaf.SpafApp
                 * @return  {void}
                 */
                RegisterAllViewModels: function () {
                    var types = System.Linq.Enumerable.from(System.AppDomain.getAssemblies(), System.Reflection.Assembly).selectMany(function (s) {
                            return Bridge.Reflection.getAssemblyTypes(s);
                        }).where(function (w) {
                        return System.String.endsWith(Bridge.Reflection.getTypeName(w).toLowerCase(), "viewmodel");
                    }).toList(System.Type);

                    types.ForEach(function (f) {
                        var attributes = Bridge.Reflection.getAttributes(f, Bridge.Spaf.Attributes.SingleInstanceAttribute, true);

                        if (System.Linq.Enumerable.from(attributes, System.Object).any()) {
                            Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$RegisterSingleInstance(f);
                        } else {
                            Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$Register(f);
                        }
                    });

                }
            }
        }
    });

    Bridge.define("Bridge.Spaf.SpafApp.Messages", {
        $kind: "nested class",
        statics: {
            fields: {
                Sender: null
            },
            props: {
                LoginDone: {
                    get: function () {
                        return "LoginDone";
                    }
                }
            },
            ctors: {
                init: function () {
                    this.Sender = new Bridge.Spaf.SpafApp.Messages.GlobalSender();
                }
            }
        }
    });

    Bridge.define("Bridge.Spaf.SpafApp.Messages.GlobalSender", {
        $kind: "nested class"
    });

    /** @namespace Bridge.Ioc */

    /**
     * Implementation of IIoc
     *
     * @public
     * @class Bridge.Ioc.BridgeIoc
     * @implements  Bridge.Ioc.IIoc
     */
    Bridge.define("Bridge.Ioc.BridgeIoc", {
        inherits: [Bridge.Ioc.IIoc],
        fields: {
            _resolvers: null
        },
        alias: [
            "Register$1", "Bridge$Ioc$IIoc$Register$1",
            "Register$2", "Bridge$Ioc$IIoc$Register$2",
            "Register$4", "Bridge$Ioc$IIoc$Register$4",
            "Register", "Bridge$Ioc$IIoc$Register",
            "Register$3", "Bridge$Ioc$IIoc$Register$3",
            "RegisterSingleInstance$1", "Bridge$Ioc$IIoc$RegisterSingleInstance$1",
            "RegisterSingleInstance$3", "Bridge$Ioc$IIoc$RegisterSingleInstance$3",
            "RegisterSingleInstance", "Bridge$Ioc$IIoc$RegisterSingleInstance",
            "RegisterSingleInstance$2", "Bridge$Ioc$IIoc$RegisterSingleInstance$2",
            "RegisterFunc", "Bridge$Ioc$IIoc$RegisterFunc",
            "RegisterInstance$1", "Bridge$Ioc$IIoc$RegisterInstance$1",
            "RegisterInstance", "Bridge$Ioc$IIoc$RegisterInstance",
            "RegisterInstance$2", "Bridge$Ioc$IIoc$RegisterInstance$2",
            "Resolve", "Bridge$Ioc$IIoc$Resolve",
            "Resolve$1", "Bridge$Ioc$IIoc$Resolve$1"
        ],
        ctors: {
            init: function () {
                this._resolvers = new (System.Collections.Generic.Dictionary$2(System.Type,Bridge.Ioc.IResolver)).ctor();
            }
        },
        methods: {
            Register$1: function (type, resolver) {
                this.CheckAlreadyAdded(type);
                this._resolvers.add(type, resolver);
            },
            Register$2: function (type, impl) {
                this.CheckAlreadyAdded(type);

                var resolver = new Bridge.Ioc.TransientResolver(this, impl);
                this._resolvers.add(type, resolver);
            },
            Register$4: function (TType, TImplementation) {
                this.Register$2(TType, TImplementation);
            },
            Register: function (type) {
                this.Register$2(type, type);
            },
            Register$3: function (TType) {
                this.Register(TType);
            },
            RegisterSingleInstance$1: function (type, impl) {
                this.CheckAlreadyAdded(type);

                var resolver = new Bridge.Ioc.SingleInstanceResolver(this, impl);
                this._resolvers.add(type, resolver);
            },
            RegisterSingleInstance$3: function (TType, TImplementation) {
                this.RegisterSingleInstance$1(TType, TImplementation);
            },
            RegisterSingleInstance: function (type) {
                this.RegisterSingleInstance$1(type, type);
            },
            RegisterSingleInstance$2: function (TType) {
                this.RegisterSingleInstance(TType);
            },
            RegisterFunc: function (TType, func) {
                this.CheckAlreadyAdded$1(TType);

                var resolver = new (Bridge.Ioc.FuncResolver$1(TType))(func);
                this._resolvers.add(TType, resolver);
            },
            RegisterInstance$1: function (type, instance) {
                this.CheckAlreadyAdded(type);

                var resolver = new Bridge.Ioc.InstanceResolver(instance);
                this._resolvers.add(type, resolver);
            },
            RegisterInstance: function (instance) {
                this.RegisterInstance$1(Bridge.getType(instance), instance);
            },
            RegisterInstance$2: function (TType, instance) {
                this.RegisterInstance$1(TType, instance);
            },
            Resolve: function (TType) {
                this.CheckNotRegistered$1(TType);

                var resolver = this._resolvers.getItem(TType);
                return Bridge.cast(resolver.Bridge$Ioc$IResolver$Resolve(), TType);
            },
            Resolve$1: function (type) {
                this.CheckNotRegistered(type);

                var resolver = this._resolvers.getItem(type);
                return resolver.Bridge$Ioc$IResolver$Resolve();
            },
            CheckAlreadyAdded: function (type) {
                if (this._resolvers.containsKey(type)) {
                    throw new System.Exception(System.String.format("{0} is already registered!", [Bridge.Reflection.getTypeFullName(type)]));
                }
            },
            CheckAlreadyAdded$1: function (TType) {
                this.CheckAlreadyAdded(TType);
            },
            CheckNotRegistered: function (type) {
                if (!this._resolvers.containsKey(type)) {
                    throw new System.Exception(System.String.format("Cannot resolve {0}, it's not registered!", [Bridge.Reflection.getTypeFullName(type)]));
                }
            },
            CheckNotRegistered$1: function (TType) {
                this.CheckNotRegistered(TType);
            }
        }
    });

    Bridge.define("Bridge.Ioc.FuncResolver$1", function (T) { return {
        inherits: [Bridge.Ioc.IResolver],
        fields: {
            Resolve: null
        },
        alias: ["Resolve", "Bridge$Ioc$IResolver$Resolve"],
        ctors: {
            ctor: function (resolveFunc) {
                this.$initialize();
                this.Resolve = function () {
                    return resolveFunc();
                };
            }
        }
    }; });

    Bridge.define("Bridge.Ioc.InstanceResolver", {
        inherits: [Bridge.Ioc.IResolver],
        fields: {
            Resolve: null
        },
        alias: ["Resolve", "Bridge$Ioc$IResolver$Resolve"],
        ctors: {
            ctor: function (resolvedObj) {
                this.$initialize();
                this.Resolve = function () {
                    return resolvedObj;
                };
            }
        }
    });

    Bridge.define("Bridge.Ioc.SingleInstanceResolver", {
        inherits: [Bridge.Ioc.IResolver],
        fields: {
            _singleInstance: null,
            Resolve: null
        },
        alias: ["Resolve", "Bridge$Ioc$IResolver$Resolve"],
        ctors: {
            ctor: function (ioc, type) {
                this.$initialize();
                this.Resolve = Bridge.fn.bind(this, function () {
                    if (this._singleInstance == null) {
                        var transientResolver = new Bridge.Ioc.TransientResolver(ioc, type);
                        this._singleInstance = transientResolver.Resolve();
                    }

                    return this._singleInstance;
                });
            }
        }
    });

    Bridge.define("Bridge.Ioc.TransientResolver", {
        inherits: [Bridge.Ioc.IResolver],
        fields: {
            Resolve: null
        },
        alias: ["Resolve", "Bridge$Ioc$IResolver$Resolve"],
        ctors: {
            ctor: function (ioc, toresolveType) {
                this.$initialize();
                this.Resolve = function () {
                    var $t;
                    var $ctor = System.Linq.Enumerable.from(Bridge.Reflection.getMembers(toresolveType, 1, 28), System.Reflection.ConstructorInfo).firstOrDefault(null, null);
                    if ($ctor == null) {
                        throw new System.Exception(System.String.format("No ctor found for type {0}!", [Bridge.Reflection.getTypeFullName(toresolveType)]));
                    }

                    var ctorParams = ($ctor.pi || []);
                    if (!System.Linq.Enumerable.from(ctorParams, System.Object).any()) {
                        return Bridge.createInstance(toresolveType);
                    } else {
                        var parameters = new (System.Collections.Generic.List$1(System.Object)).$ctor2(ctorParams.length);

                        $t = Bridge.getEnumerator(ctorParams);
                        try {
                            while ($t.moveNext()) {
                                var parameterInfo = $t.Current;
                                parameters.add(ioc.Bridge$Ioc$IIoc$Resolve$1(parameterInfo.pt));
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$Dispose();
                            }
                        }

                        return Bridge.Reflection.invokeCI($ctor, Bridge.unbox(parameters.ToArray()));
                    }
                };
            }
        }
    });

    /** @namespace System */

    /**
     * @memberof System
     * @callback System.Action
     * @param   {TSender}    arg1    
     * @param   {TArgs}      arg2
     * @return  {void}
     */

    Bridge.define("Bridge.Messenger.Messenger", {
        inherits: [Bridge.Messenger.IMessenger],
        fields: {
            _calls: null
        },
        alias: [
            "Send$1", "Bridge$Messenger$IMessenger$Send$1",
            "Send", "Bridge$Messenger$IMessenger$Send",
            "Subscribe$1", "Bridge$Messenger$IMessenger$Subscribe$1",
            "Subscribe", "Bridge$Messenger$IMessenger$Subscribe",
            "Unsubscribe$1", "Bridge$Messenger$IMessenger$Unsubscribe$1",
            "Unsubscribe", "Bridge$Messenger$IMessenger$Unsubscribe",
            "ResetMessenger", "Bridge$Messenger$IMessenger$ResetMessenger"
        ],
        ctors: {
            init: function () {
                this._calls = new (System.Collections.Generic.Dictionary$2(System.Tuple$3(System.String,System.Type,System.Type),System.Collections.Generic.List$1(System.Tuple$2(System.Object,Function)))).ctor();
            }
        },
        methods: {
            /**
             * Send Message with args
             *
             * @instance
             * @public
             * @this Bridge.Messenger.Messenger
             * @memberof Bridge.Messenger.Messenger
             * @param   {Function}    TSender    TSender
             * @param   {Function}    TArgs      TMessageArgs
             * @param   {TSender}     sender     Sender
             * @param   {string}      message    Message
             * @param   {TArgs}       args       Args
             * @return  {void}
             */
            Send$1: function (TSender, TArgs, sender, message, args) {
                if (sender == null) {
                    throw new System.ArgumentNullException.$ctor1("sender");
                }
                this.InnerSend(message, TSender, TArgs, sender, args);
            },
            /**
             * Send Message without args
             *
             * @instance
             * @public
             * @this Bridge.Messenger.Messenger
             * @memberof Bridge.Messenger.Messenger
             * @param   {Function}    TSender    TSender
             * @param   {TSender}     sender     Sender
             * @param   {string}      message    Message
             * @return  {void}
             */
            Send: function (TSender, sender, message) {
                if (sender == null) {
                    throw new System.ArgumentNullException.$ctor1("sender");
                }
                this.InnerSend(message, TSender, null, sender, null);
            },
            /**
             * Subscribe Message with args
             *
             * @instance
             * @public
             * @this Bridge.Messenger.Messenger
             * @memberof Bridge.Messenger.Messenger
             * @param   {Function}         TSender       TSender
             * @param   {Function}         TArgs         TArgs
             * @param   {System.Object}    subscriber    Subscriber
             * @param   {string}           message       Message
             * @param   {System.Action}    callback      Action
             * @param   {TSender}          source        source
             * @return  {void}
             */
            Subscribe$1: function (TSender, TArgs, subscriber, message, callback, source) {
                if (source === void 0) { source = Bridge.getDefaultValue(TSender); }
                if (subscriber == null) {
                    throw new System.ArgumentNullException.$ctor1("subscriber");
                }
                if (Bridge.staticEquals(callback, null)) {
                    throw new System.ArgumentNullException.$ctor1("callback");
                }

                var wrap = function (sender, args) {
                    var send = Bridge.cast(sender, TSender);
                    if (source == null || Bridge.referenceEquals(send, source)) {
                        callback(Bridge.cast(sender, TSender), Bridge.cast(Bridge.unbox(args, TArgs), TArgs));
                    }
                };

                this.InnerSubscribe(subscriber, message, TSender, TArgs, wrap);
            },
            /**
             * Subscribe Message without args
             *
             * @instance
             * @public
             * @this Bridge.Messenger.Messenger
             * @memberof Bridge.Messenger.Messenger
             * @param   {Function}         TSender       TSender
             * @param   {System.Object}    subscriber    Subscriber
             * @param   {string}           message       Message
             * @param   {System.Action}    callback      Action
             * @param   {TSender}          source        source
             * @return  {void}
             */
            Subscribe: function (TSender, subscriber, message, callback, source) {
                if (source === void 0) { source = Bridge.getDefaultValue(TSender); }
                if (subscriber == null) {
                    throw new System.ArgumentNullException.$ctor1("subscriber");
                }
                if (Bridge.staticEquals(callback, null)) {
                    throw new System.ArgumentNullException.$ctor1("callback");
                }

                var wrap = function (sender, args) {
                    var send = Bridge.cast(sender, TSender);
                    if (source == null || Bridge.referenceEquals(send, source)) {
                        callback(Bridge.cast(sender, TSender));
                    }
                };

                this.InnerSubscribe(subscriber, message, TSender, null, wrap);
            },
            /**
             * Unsubscribe action with args
             *
             * @instance
             * @public
             * @this Bridge.Messenger.Messenger
             * @memberof Bridge.Messenger.Messenger
             * @param   {Function}         TSender       TSender
             * @param   {Function}         TArgs         TArgs
             * @param   {System.Object}    subscriber    Subscriber
             * @param   {string}           message       Message
             * @return  {void}
             */
            Unsubscribe$1: function (TSender, TArgs, subscriber, message) {
                this.InnerUnsubscribe(message, TSender, TArgs, subscriber);
            },
            /**
             * Unsubscribe action without args
             *
             * @instance
             * @public
             * @this Bridge.Messenger.Messenger
             * @memberof Bridge.Messenger.Messenger
             * @param   {Function}         TSender       TSender
             * @param   {System.Object}    subscriber    Subscriber
             * @param   {string}           message       Message
             * @return  {void}
             */
            Unsubscribe: function (TSender, subscriber, message) {
                this.InnerUnsubscribe(message, TSender, null, subscriber);
            },
            /**
             * Remove all callbacks
             *
             * @instance
             * @public
             * @this Bridge.Messenger.Messenger
             * @memberof Bridge.Messenger.Messenger
             * @return  {void}
             */
            ResetMessenger: function () {
                this._calls.clear();
            },
            InnerSend: function (message, senderType, argType, sender, args) {
                var $t, $t1;
                if (message == null) {
                    throw new System.ArgumentNullException.$ctor1("message");
                }
                var key = { Item1: message, Item2: senderType, Item3: argType };
                if (!this._calls.containsKey(key)) {
                    return;
                }
                var actions = this._calls.getItem(key);
                if (actions == null || !System.Linq.Enumerable.from(actions, System.Tuple$2(System.Object,Function)).any()) {
                    return;
                }

                var actionsCopy = ($t = System.Tuple$2(System.Object,Function), System.Linq.Enumerable.from(actions, $t).toList($t));
                $t1 = Bridge.getEnumerator(actionsCopy);
                try {
                    while ($t1.moveNext()) {
                        var action = $t1.Current;
                        if (actions.contains(action)) {
                            action.Item2(sender, args);
                        }
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$Dispose();
                    }
                }
            },
            InnerSubscribe: function (subscriber, message, senderType, argType, callback) {
                if (message == null) {
                    throw new System.ArgumentNullException.$ctor1("message");
                }
                var key = { Item1: message, Item2: senderType, Item3: argType };
                var value = { Item1: subscriber, Item2: callback };
                if (this._calls.containsKey(key)) {
                    this._calls.getItem(key).add(value);
                } else {
                    var list = function (_o1) {
                            _o1.add(value);
                            return _o1;
                        }(new (System.Collections.Generic.List$1(System.Tuple$2(System.Object,Function))).ctor());
                    this._calls.setItem(key, list);
                }
            },
            InnerUnsubscribe: function (message, senderType, argType, subscriber) {
                var $t;
                if (subscriber == null) {
                    throw new System.ArgumentNullException.$ctor1("subscriber");
                }
                if (message == null) {
                    throw new System.ArgumentNullException.$ctor1("message");
                }

                var key = { Item1: message, Item2: senderType, Item3: argType };
                if (!this._calls.containsKey(key)) {
                    return;
                }

                var toremove = System.Linq.Enumerable.from(this._calls.getItem(key), System.Tuple$2(System.Object,Function)).where(function (tuple) {
                        return Bridge.referenceEquals(tuple.Item1, subscriber);
                    }).toList(System.Tuple$2(System.Object,Function));

                $t = Bridge.getEnumerator(toremove);
                try {
                    while ($t.moveNext()) {
                        var tuple = $t.Current;
                        this._calls.getItem(key).remove(tuple);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                if (!System.Linq.Enumerable.from(this._calls.getItem(key), System.Tuple$2(System.Object,Function)).any()) {
                    this._calls.remove(key);
                }
            }
        }
    });

    /** @namespace Bridge.Navigation */

    /**
     * INavigator implementation
     *
     * @public
     * @class Bridge.Navigation.BridgeNavigator
     * @implements  Bridge.Navigation.INavigator
     */
    Bridge.define("Bridge.Navigation.BridgeNavigator", {
        inherits: [Bridge.Navigation.INavigator],
        statics: {
            fields: {
                _actualController: null
            }
        },
        fields: {
            Configuration: null
        },
        events: {
            OnNavigated: null
        },
        props: {
            LastNavigateController: {
                get: function () {
                    return Bridge.Navigation.BridgeNavigator._actualController;
                }
            }
        },
        alias: [
            "EnableSpafAnchors", "Bridge$Navigation$INavigator$EnableSpafAnchors",
            "Navigate", "Bridge$Navigation$INavigator$Navigate",
            "addOnNavigated", "Bridge$Navigation$INavigator$addOnNavigated",
            "removeOnNavigated", "Bridge$Navigation$INavigator$removeOnNavigated",
            "LastNavigateController", "Bridge$Navigation$INavigator$LastNavigateController",
            "InitNavigation", "Bridge$Navigation$INavigator$InitNavigation"
        ],
        ctors: {
            ctor: function (configuration) {
                this.$initialize();
                this.Configuration = configuration;
            }
        },
        methods: {
            EnableSpafAnchors: function () {
                var allAnchors = $("a");
                allAnchors.off(System.Enum.toString(System.String, "click"));
                allAnchors.click(Bridge.fn.bind(this, function (ev) {
                    var clickedElement = ev.target;

                    if (!Bridge.referenceEquals(Bridge.getType(clickedElement), HTMLAnchorElement)) {
                        clickedElement = $(ev.target).parents("a").get(0);
                    }

                    var href = clickedElement.getAttribute("href");

                    if (System.String.isNullOrEmpty(href)) {
                        return;
                    }

                    var isMyHref = System.String.startsWith(href, "spaf:");

                    if (isMyHref) {
                        ev.preventDefault();
                        var pageId = System.String.replaceAll(href, "spaf:", "");
                        this.Navigate(pageId);
                    }

                }));
            },
            /**
             * Navigate to a page ID.
             The ID must be registered.
             *
             * @instance
             * @public
             * @this Bridge.Navigation.BridgeNavigator
             * @memberof Bridge.Navigation.BridgeNavigator
             * @param   {string}                                     pageId        
             * @param   {System.Collections.Generic.Dictionary$2}    parameters
             * @return  {void}
             */
            Navigate: function (pageId, parameters) {
                var $t;
                if (parameters === void 0) { parameters = null; }
                var page = this.Configuration.Bridge$Navigation$INavigatorConfigurator$GetPageDescriptorByKey(pageId);
                if (page == null) {
                    throw new System.Exception(System.String.format("Page not found with ID {0}", [pageId]));
                }

                var redirectKey = !Bridge.staticEquals(($t = page.Bridge$Navigation$IPageDescriptor$RedirectRules), null) ? $t() : null;
                if (!System.String.isNullOrEmpty(redirectKey)) {
                    this.Navigate(redirectKey, parameters);
                    return;
                }

                var body = this.Configuration.Bridge$Navigation$INavigatorConfigurator$Body;
                if (body == null) {
                    throw new System.Exception("Cannot find navigation body element.");
                }

                if (this.LastNavigateController != null) {
                    this.LastNavigateController.Bridge$Navigation$IAmLoadable$OnLeave();
                }

                this.Configuration.Bridge$Navigation$INavigatorConfigurator$Body.load(page.Bridge$Navigation$IPageDescriptor$HtmlLocation(), null, Bridge.fn.bind(this, function (o, s, a) {
                    var $step = 0,
                        $task1, 
                        $taskResult1, 
                        $jumpFromFinally, 
                        scripts, 
                        $t1, 
                        scriptsTask, 
                        $t2, 
                        enableAnchors, 
                        $t3, 
                        controller, 
                        $asyncBody = Bridge.fn.bind(this, function () {
                            for (;;) {
                                $step = System.Array.min([0,1,2,3], $step);
                                switch ($step) {
                                    case 0: {
                                        if (!Bridge.staticEquals(page.Bridge$Navigation$IPageDescriptor$DependenciesScripts, null)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 3;
                                        continue;
                                    }
                                    case 1: {
                                        scripts = ($t1 = System.String, System.Linq.Enumerable.from((page.Bridge$Navigation$IPageDescriptor$DependenciesScripts()), $t1).toList($t1));
                                        if (page.Bridge$Navigation$IPageDescriptor$SequentialDependenciesScriptLoad) {
                                            Bridge.Navigation.Utility.SequentialScriptLoad(scripts);
                                        }
                                        scriptsTask = System.Linq.Enumerable.from(scripts, System.String).select(function (url) {
                                            return System.Threading.Tasks.Task.fromPromise($.getScript(url));
                                        });
                                        $task1 = System.Threading.Tasks.Task.whenAll(scriptsTask);
                                        $step = 2;
                                        if ($task1.isCompleted()) {
                                            continue;
                                        }
                                        $task1.continue($asyncBody);
                                        return;
                                    }
                                    case 2: {
                                        $taskResult1 = $task1.getAwaitedResult();
                                        $step = 3;
                                        continue;
                                    }
                                    case 3: {
                                        !Bridge.staticEquals(($t2 = page.Bridge$Navigation$IPageDescriptor$PreparePage), null) ? $t2() : null;

                                        if (page.Bridge$Navigation$IPageDescriptor$FullScreen) {
                                            this.ShowAsFullScreen(body);
                                        }

                                        if (!this.Configuration.Bridge$Navigation$INavigatorConfigurator$DisableAutoSpafAnchorsOnNavigate) {
                                            enableAnchors = !Bridge.staticEquals(($t3 = page.Bridge$Navigation$IPageDescriptor$AutoEnableSpafAnchors), null) ? $t3() : null;
                                            if (System.Nullable.hasValue(enableAnchors) && System.Nullable.getValue(enableAnchors)) {
                                                this.EnableSpafAnchors();
                                            }
                                        }

                                        if (!Bridge.staticEquals(page.Bridge$Navigation$IPageDescriptor$PageController, null)) {
                                            controller = page.Bridge$Navigation$IPageDescriptor$PageController();

                                            controller.Bridge$Navigation$IAmLoadable$OnBeforeBinding(parameters);
                                            controller.Bridge$Navigation$IAmLoadable$OnLoad(parameters);
                                            controller.Bridge$Navigation$IAmLoadable$OnBindingDone(parameters);

                                            Bridge.Navigation.BridgeNavigator._actualController = controller;

                                            !Bridge.staticEquals(this.OnNavigated, null) ? this.OnNavigated(this, controller) : null;
                                        }
                                        return;
                                    }
                                    default: {
                                        return;
                                    }
                                }
                            }
                        }, arguments);

                    $asyncBody();
                }));
            },
            /**
             * Content page is the first child of body
             *
             * @instance
             * @private
             * @this Bridge.Navigation.BridgeNavigator
             * @memberof Bridge.Navigation.BridgeNavigator
             * @param   {$}       body
             * @return  {void}
             */
            ShowAsFullScreen: function (body) {
                var theDiv = body.children().first();
                theDiv.css("width", "100%");
                theDiv.css("height", "100%");
                theDiv.css("left", "0");
                theDiv.css("top", "0");
                theDiv.css("z-index", "999999");
                theDiv.css("position", "absolute");
            },
            /**
             * Subscribe to anchors click
             *
             * @instance
             * @public
             * @this Bridge.Navigation.BridgeNavigator
             * @memberof Bridge.Navigation.BridgeNavigator
             * @return  {void}
             */
            InitNavigation: function () {
                this.EnableSpafAnchors();

                this.Navigate(this.Configuration.Bridge$Navigation$INavigatorConfigurator$HomeId);
            }
        }
    });

    /**
     * INavigatorConfigurator Implementation. Must be extended.
     *
     * @abstract
     * @public
     * @class Bridge.Navigation.BridgeNavigatorConfigBase
     * @implements  Bridge.Navigation.INavigatorConfigurator
     */
    Bridge.define("Bridge.Navigation.BridgeNavigatorConfigBase", {
        inherits: [Bridge.Navigation.INavigatorConfigurator],
        fields: {
            _routes: null
        },
        alias: ["GetPageDescriptorByKey", "Bridge$Navigation$INavigatorConfigurator$GetPageDescriptorByKey"],
        ctors: {
            ctor: function () {
                this.$initialize();
                this._routes = this.CreateRoutes();
            }
        },
        methods: {
            GetPageDescriptorByKey: function (key) {
                return System.Linq.Enumerable.from(this._routes, Bridge.Navigation.IPageDescriptor).singleOrDefault(function (s) {
                        return System.String.equals(s.Bridge$Navigation$IPageDescriptor$Key, key, 1);
                    }, null);
            }
        }
    });

    Bridge.define("Bridge.Navigation.ComplexObjectNavigationHistory", {
        inherits: [Bridge.Navigation.IBrowserHistoryManager],
        alias: [
            "PushState", "Bridge$Navigation$IBrowserHistoryManager$PushState",
            "ParseUrl", "Bridge$Navigation$IBrowserHistoryManager$ParseUrl"
        ],
        methods: {
            PushState: function (pageId, parameters) {
                if (parameters === void 0) { parameters = null; }
                var baseUrl = Bridge.Navigation.NavigationUtility.BuildBaseUrl(pageId);

                window.history.pushState(null, "", parameters != null ? System.String.format("{0}={1}", baseUrl, Bridge.global.btoa(Newtonsoft.Json.JsonConvert.SerializeObject(parameters))) : baseUrl);
            },
            ParseUrl: function () {
                var res = new Bridge.Navigation.Model.UrlDescriptor();

                var hash = window.location.hash;
                hash = System.String.replaceAll(hash, "#", "");

                if (System.String.isNullOrEmpty(hash)) {
                    return res;
                }

                var equalIndex = System.String.indexOf(hash, String.fromCharCode(61));
                if (equalIndex === -1) {
                    res.PageId = hash;
                    return res;
                }

                res.PageId = hash.substr(0, equalIndex);

                var doublePointsIndx = (equalIndex + 1) | 0;
                var parameters = hash.substr(doublePointsIndx, ((hash.length - doublePointsIndx) | 0));

                if (System.String.isNullOrEmpty(parameters)) {
                    return res;
                }

                var decoded = Bridge.global.atob(parameters);
                var deserialized = Newtonsoft.Json.JsonConvert.DeserializeObject(decoded, System.Collections.Generic.Dictionary$2(System.String,System.Object));

                res.Parameters = deserialized;

                return res;
            }
        }
    });

    Bridge.define("Bridge.Navigation.PageDescriptor", {
        inherits: [Bridge.Navigation.IPageDescriptor],
        fields: {
            Key: null,
            HtmlLocation: null,
            PageController: null,
            CanBeDirectLoad: null,
            PreparePage: null,
            SequentialDependenciesScriptLoad: false,
            RedirectRules: null,
            AutoEnableSpafAnchors: null,
            DependenciesScripts: null,
            FullScreen: false
        },
        alias: [
            "Key", "Bridge$Navigation$IPageDescriptor$Key",
            "HtmlLocation", "Bridge$Navigation$IPageDescriptor$HtmlLocation",
            "PageController", "Bridge$Navigation$IPageDescriptor$PageController",
            "CanBeDirectLoad", "Bridge$Navigation$IPageDescriptor$CanBeDirectLoad",
            "PreparePage", "Bridge$Navigation$IPageDescriptor$PreparePage",
            "SequentialDependenciesScriptLoad", "Bridge$Navigation$IPageDescriptor$SequentialDependenciesScriptLoad",
            "RedirectRules", "Bridge$Navigation$IPageDescriptor$RedirectRules",
            "AutoEnableSpafAnchors", "Bridge$Navigation$IPageDescriptor$AutoEnableSpafAnchors",
            "DependenciesScripts", "Bridge$Navigation$IPageDescriptor$DependenciesScripts",
            "FullScreen", "Bridge$Navigation$IPageDescriptor$FullScreen"
        ],
        ctors: {
            ctor: function () {
                this.$initialize();
                this.AutoEnableSpafAnchors = function () {
                    return true;
                };
            }
        }
    });

    Bridge.define("Bridge.Navigation.QueryParameterNavigationHistory", {
        inherits: [Bridge.Navigation.IBrowserHistoryManager],
        alias: [
            "PushState", "Bridge$Navigation$IBrowserHistoryManager$PushState",
            "ParseUrl", "Bridge$Navigation$IBrowserHistoryManager$ParseUrl"
        ],
        methods: {
            PushState: function (pageId, parameters) {
                if (parameters === void 0) { parameters = null; }
                var baseUrl = Bridge.Navigation.NavigationUtility.BuildBaseUrl(pageId);

                window.history.pushState(null, "", parameters != null ? System.String.format("{0}{1}", baseUrl, this.BuildQueryParameter(parameters)) : baseUrl);
            },
            ParseUrl: function () {
                var $t;
                var res = new Bridge.Navigation.Model.UrlDescriptor();
                res.Parameters = new (System.Collections.Generic.Dictionary$2(System.String,System.Object)).ctor();

                var hash = window.location.hash;
                hash = System.String.replaceAll(hash, "#", "");

                if (System.String.isNullOrEmpty(hash)) {
                    return res;
                }

                var equalIndex = System.String.indexOf(hash, String.fromCharCode(63));
                if (equalIndex === -1) {
                    res.PageId = hash;
                    return res;
                }

                res.PageId = hash.substr(0, equalIndex);

                var doublePointsIndx = (equalIndex + 1) | 0;
                var parameters = hash.substr(doublePointsIndx, ((hash.length - doublePointsIndx) | 0));

                if (System.String.isNullOrEmpty(parameters)) {
                    return res;
                }


                var splittedByDoubleAnd = ($t = System.String, System.Linq.Enumerable.from(parameters.split("&"), $t).toList($t));
                splittedByDoubleAnd.ForEach(function (f) {
                    var splitted = f.split("=");
                    res.Parameters.add(splitted[System.Array.index(0, splitted)], decodeURIComponent(splitted[System.Array.index(1, splitted)]));
                });

                return res;
            },
            BuildQueryParameter: function (parameters) {
                var $t;
                if (parameters == null || !System.Linq.Enumerable.from(parameters, System.Collections.Generic.KeyValuePair$2(System.String,System.Object)).any()) {
                    return "";
                }

                var strBuilder = new System.Text.StringBuilder("?");
                $t = Bridge.getEnumerator(parameters);
                try {
                    while ($t.moveNext()) {
                        var keyValuePair = $t.Current;
                        strBuilder.append(encodeURIComponent(keyValuePair.key));
                        strBuilder.append("=");
                        strBuilder.append(encodeURIComponent(Bridge.toString(keyValuePair.value)));
                        strBuilder.append("&");
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                var res = System.String.trimEnd(strBuilder.toString(), [38]);

                return res;

            }
        }
    });

    Bridge.define("Bridge.Spaf.LoadableViewModel", {
        inherits: [Bridge.Spaf.ViewModelBase,Bridge.Navigation.IAmLoadable],
        fields: {
            Partials: null
        },
        alias: [
            "OnLoad", "Bridge$Navigation$IAmLoadable$OnLoad",
            "OnLeave", "Bridge$Navigation$IAmLoadable$OnLeave",
            "OnBeforeBinding", "Bridge$Navigation$IAmLoadable$OnBeforeBinding",
            "OnBindingDone", "Bridge$Navigation$IAmLoadable$OnBindingDone"
        ],
        ctors: {
            init: function () {
                this.Partials = new (System.Collections.Generic.List$1(Bridge.Spaf.IViewModelLifeCycle)).ctor();
            }
        },
        methods: {
            OnLoad: function (parameters) {
                var $t;
                this.ApplyBindings();
                ($t = this.Partials) != null ? $t.ForEach(function (f) {
                        f.Bridge$Spaf$IViewModelLifeCycle$Init(parameters);
                    }) : null;
            },
            OnLeave: function () {
                var $t;
                ($t = this.Partials) != null ? $t.ForEach(function (f) {
                        f.Bridge$Spaf$IViewModelLifeCycle$DeInit();
                    }) : null;
                this.RemoveBindings();
            },
            OnBeforeBinding: function (parameters) { },
            OnBindingDone: function (parameters) { }
        }
    });

    Bridge.define("Bridge.Spaf.PartialModel", {
        inherits: [Bridge.Spaf.IViewModelLifeCycle],
        fields: {
            _partialElement: null
        },
        alias: [
            "Init", "Bridge$Spaf$IViewModelLifeCycle$Init",
            "DeInit", "Bridge$Spaf$IViewModelLifeCycle$DeInit"
        ],
        methods: {
            /**
             * Init partial
             *
             * @instance
             * @public
             * @this Bridge.Spaf.PartialModel
             * @memberof Bridge.Spaf.PartialModel
             * @param   {System.Collections.Generic.Dictionary$2}    parameters    data for init the partials
             * @return  {void}
             */
            Init: function (parameters) {

                $.get(this.HtmlUrl, null, Bridge.fn.bind(this, function (o, s, arg3) {
                    var $t;
                    this.OnBeforeBinding(parameters);
                    this._partialElement = ($t = document.createElement("div"), $t.innerHTML = Bridge.toString(o), $t);
                    var node = document.getElementById(this.ElementId());
                    node.appendChild(this._partialElement);
                    ko.applyBindings(this, this._partialElement);
                    this.OnBindingDone(parameters);
                }));
            },
            /**
             * Called when html is loaded but ko is not binded
             *
             * @instance
             * @public
             * @this Bridge.Spaf.PartialModel
             * @memberof Bridge.Spaf.PartialModel
             * @param   {System.Collections.Generic.Dictionary$2}    parameters
             * @return  {void}
             */
            OnBeforeBinding: function (parameters) { },
            /**
             * Called when html is loaded and ko is binded
             *
             * @instance
             * @public
             * @this Bridge.Spaf.PartialModel
             * @memberof Bridge.Spaf.PartialModel
             * @param   {System.Collections.Generic.Dictionary$2}    parameters
             * @return  {void}
             */
            OnBindingDone: function (parameters) { },
            DeInit: function () {
                if (this._partialElement == null) {
                    return;
                }
                var data = ko.dataFor(this._partialElement);
                if (data == null) {
                    return;
                }

                ko.removeNode(this._partialElement);
            }
        }
    });

    Bridge.define("Bridge.Ioc.InstanceResolver$1", function (T) { return {
        inherits: [Bridge.Ioc.InstanceResolver],
        ctors: {
            ctor: function (resolvedObj) {
                this.$initialize();
                Bridge.Ioc.InstanceResolver.ctor.call(this, resolvedObj);

            }
        }
    }; });

    Bridge.define("Bridge.Ioc.SingleInstanceResolver$1", function (T) { return {
        inherits: [Bridge.Ioc.SingleInstanceResolver],
        ctors: {
            ctor: function (ioc) {
                this.$initialize();
                Bridge.Ioc.SingleInstanceResolver.ctor.call(this, ioc, T);
            }
        }
    }; });

    Bridge.define("Bridge.Ioc.TransientResolver$1", function (T) { return {
        inherits: [Bridge.Ioc.TransientResolver],
        ctors: {
            ctor: function (ioc) {
                this.$initialize();
                Bridge.Ioc.TransientResolver.ctor.call(this, ioc, T);

            }
        }
    }; });

    Bridge.define("Bridge.Navigation.BridgeNavigatorWithRouting", {
        inherits: [Bridge.Navigation.BridgeNavigator],
        fields: {
            _browserHistoryManager: null
        },
        alias: [
            "Navigate", "Bridge$Navigation$INavigator$Navigate",
            "InitNavigation", "Bridge$Navigation$INavigator$InitNavigation"
        ],
        ctors: {
            ctor: function (configuration, browserHistoryManager) {
                this.$initialize();
                Bridge.Navigation.BridgeNavigator.ctor.call(this, configuration);
                this._browserHistoryManager = browserHistoryManager;
                window.onpopstate = Bridge.fn.combine(window.onpopstate, Bridge.fn.bind(this, function (e) {
                    var urlInfo = this._browserHistoryManager.Bridge$Navigation$IBrowserHistoryManager$ParseUrl();
                    this.NavigateWithoutPushState(System.String.isNullOrEmpty(urlInfo.PageId) ? configuration.Bridge$Navigation$INavigatorConfigurator$HomeId : urlInfo.PageId, urlInfo.Parameters);
                }));
            }
        },
        methods: {
            NavigateWithoutPushState: function (pageId, parameters) {
                if (parameters === void 0) { parameters = null; }
                Bridge.Navigation.BridgeNavigator.prototype.Navigate.call(this, pageId, parameters);
            },
            Navigate: function (pageId, parameters) {
                if (parameters === void 0) { parameters = null; }
                this._browserHistoryManager.Bridge$Navigation$IBrowserHistoryManager$PushState(pageId, parameters);
                Bridge.Navigation.BridgeNavigator.prototype.Navigate.call(this, pageId, parameters);
            },
            InitNavigation: function () {
                var parsed = this._browserHistoryManager.Bridge$Navigation$IBrowserHistoryManager$ParseUrl();

                if (System.String.isNullOrEmpty(parsed.PageId)) {
                    Bridge.Navigation.BridgeNavigator.prototype.InitNavigation.call(this);
                } else {
                    this.EnableSpafAnchors();

                    var page = this.Configuration.Bridge$Navigation$INavigatorConfigurator$GetPageDescriptorByKey(parsed.PageId);
                    if (page == null) {
                        throw new System.Exception(System.String.format("Page not found with ID {0}", [parsed.PageId]));
                    }

                    if (!Bridge.staticEquals(page.Bridge$Navigation$IPageDescriptor$CanBeDirectLoad, null) && !page.Bridge$Navigation$IPageDescriptor$CanBeDirectLoad()) {
                        this._browserHistoryManager.Bridge$Navigation$IBrowserHistoryManager$PushState(this.Configuration.Bridge$Navigation$INavigatorConfigurator$HomeId, void 0);
                        this.NavigateWithoutPushState(this.Configuration.Bridge$Navigation$INavigatorConfigurator$HomeId);
                    } else {
                        this.Navigate(parsed.PageId, parsed.Parameters);
                    }
                }
            }
        }
    });

    Bridge.define("Bridge.Spaf.CustomRoutesConfig", {
        inherits: [Bridge.Navigation.BridgeNavigatorConfigBase],
        fields: {
            DisableAutoSpafAnchorsOnNavigate: false,
            Body: null,
            HomeId: null
        },
        alias: [
            "CreateRoutes", "Bridge$Navigation$INavigatorConfigurator$CreateRoutes",
            "DisableAutoSpafAnchorsOnNavigate", "Bridge$Navigation$INavigatorConfigurator$DisableAutoSpafAnchorsOnNavigate",
            "Body", "Bridge$Navigation$INavigatorConfigurator$Body",
            "HomeId", "Bridge$Navigation$INavigatorConfigurator$HomeId"
        ],
        ctors: {
            init: function () {
                this.DisableAutoSpafAnchorsOnNavigate = true;
                this.Body = $("#pageBody");
                this.HomeId = Bridge.Spaf.SpafApp.HomeId;
            }
        },
        methods: {
            CreateRoutes: function () {
                return function (_o1) {
                        var $t;
                        _o1.add(($t = new Bridge.Navigation.PageDescriptor(), $t.CanBeDirectLoad = function () {
                            return true;
                        }, $t.HtmlLocation = function () {
                            return "pages/home.html";
                        }, $t.Key = Bridge.Spaf.SpafApp.HomeId, $t.PageController = function () {
                            return Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$Resolve(Bridge.Spaf.ViewModels.HomeViewModel);
                        }, $t));
                        _o1.add(($t = new Bridge.Navigation.PageDescriptor(), $t.CanBeDirectLoad = function () {
                            return true;
                        }, $t.HtmlLocation = function () {
                            return "pages/second.html";
                        }, $t.Key = Bridge.Spaf.SpafApp.SecondId, $t.PageController = function () {
                            return Bridge.Spaf.SpafApp.Container.Bridge$Ioc$IIoc$Resolve(Bridge.Spaf.ViewModels.SecondViewModel);
                        }, $t));
                        return _o1;
                    }(new (System.Collections.Generic.List$1(Bridge.Navigation.IPageDescriptor)).ctor());
            }
        }
    });

    Bridge.define("Bridge.Spaf.ViewModels.HomeViewModel", {
        inherits: [Bridge.Spaf.LoadableViewModel],
        fields: {
            _navigator: null,
            Test: null
        },
        alias: [
            "OnBeforeBinding", "Bridge$Navigation$IAmLoadable$OnBeforeBinding",
            "OnBindingDone", "Bridge$Navigation$IAmLoadable$OnBindingDone"
        ],
        ctors: {
            ctor: function (navigator) {
                this.$initialize();
                Bridge.Spaf.LoadableViewModel.ctor.call(this);
                this._navigator = navigator;
            }
        },
        methods: {
            ElementId: function () {
                return Bridge.Spaf.SpafApp.HomeId;
            },
            OnBeforeBinding: function (parameters) {
                this.Test = "Antani!";
                Bridge.Spaf.LoadableViewModel.prototype.OnBeforeBinding.call(this, parameters);
            },
            OnBindingDone: function (parameters) {
                Bridge.Spaf.LoadableViewModel.prototype.OnBindingDone.call(this, parameters);
                System.Console.WriteLine("Binding Done");
            },
            SayHelloJs: function () {
                System.Console.WriteLine("hello");

                Bridge.global.alert("Hello!");
            },
            GoToPage2: function () {
                this._navigator.Bridge$Navigation$INavigator$Navigate(Bridge.Spaf.SpafApp.SecondId, void 0);
            }
        }
    });

    Bridge.define("Bridge.Spaf.ViewModels.SecondViewModel", {
        inherits: [Bridge.Spaf.LoadableViewModel],
        fields: {
            _navigator: null
        },
        alias: ["OnBindingDone", "Bridge$Navigation$IAmLoadable$OnBindingDone"],
        ctors: {
            ctor: function (navigator) {
                this.$initialize();
                Bridge.Spaf.LoadableViewModel.ctor.call(this);
                this._navigator = navigator;
            }
        },
        methods: {
            ElementId: function () {
                return Bridge.Spaf.SpafApp.SecondId;
            },
            OnBindingDone: function (parameters) {
                System.Console.WriteLine("Welcome!");
            },
            BackToHome: function () {
                this._navigator.Bridge$Navigation$INavigator$Navigate(Bridge.Spaf.SpafApp.HomeId, void 0);
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJzcGFmLmRlc2t0b3Auc3BhZmFwcC5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiU3BhZi9OYXZpZ2F0aW9uL05hdmlnYXRpb25VdGlsaXR5LmNzIiwiU3BhZi9OYXZpZ2F0aW9uL1V0aWxpdHkuY3MiLCJTcGFmL1ZpZXdNb2RlbEJhc2UuY3MiLCJTcGFmQXBwLmNzIiwiU3BhZi9Jb2MvQnJpZGdlSW9jLmNzIiwiU3BhZi9Jb2MvUmVzb2x2ZXJzL0Z1bmNSZXNvbHZlci5jcyIsIlNwYWYvSW9jL1Jlc29sdmVycy9JbnN0YW5jZVJlc29sdmVyLmNzIiwiU3BhZi9Jb2MvUmVzb2x2ZXJzL1NpbmdsZUluc3RhbmNlUmVzb2x2ZXIuY3MiLCJTcGFmL0lvYy9SZXNvbHZlcnMvVHJhbnNpZW50UmVzb2x2ZXIuY3MiLCJTcGFmL01lc3Nlbmdlci9NZXNzZW5nZXIuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9CcmlkZ2VOYXZpZ2F0b3IuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9CcmlkZ2VOYXZpZ2F0b3JDb25maWdCYXNlLmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvQ29tcGxleE9iamVjdE5hdmlnYXRpb25IaXN0b3J5LmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvUGFnZURlc2NyaXB0b3IuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9RdWVyeVBhcmFtZXRlck5hdmlnYXRpb25IaXN0b3J5LmNzIiwiU3BhZi9Mb2FkYWJsZVZpZXdNb2RlbC5jcyIsIlNwYWYvUGFydGlhbE1vZGVsLmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvQnJpZGdlTmF2aWdhdG9yV2l0aFJvdXRpbmcuY3MiLCJDdXN0b21Sb3V0ZXNDb25maWcuY3MiLCJWaWV3TW9kZWxzL0hvbWVWaWV3TW9kZWwuY3MiLCJWaWV3TW9kZWxzL1NlY29uZFZpZXdNb2RlbC5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7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QkM1Qk5BOzs7Z0JBRW5CQSxrQkFBa0JBOzs7OztnQkFKMUJBLE9BQU9BOztxQ0FPZ0NBO2dCQUUvQkE7OztnQkFLQUEsc0RBQXlCQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIEJyaWRnZS5IdG1sNTtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBOYXZpZ2F0aW9uVXRpbGl0eVxuICAgIHtcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gRGVmaW5lIHZpcnR1YWwgZGlyZWN0b3J5IGZvciBzb21ldGhpbmcgbGlrZTpcbiAgICAgICAgLy8vIHByb3RvY29sOi8vYXdlc29tZXNpdGUuaW8vc29tZWRpcmVjdG9yeVxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBWaXJ0dWFsRGlyZWN0b3J5ID0gbnVsbDtcblxuICAgICAgIFxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBHZXQgcGFyYW1ldGVyIGtleSBmcm9tIHBhcmFtZXRlcnMgZGljdGlvbmFyeVxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVFwiPjwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwYXJhbWV0ZXJzXCI+PC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwicGFyYW1LZXlcIj48L3BhcmFtPlxuICAgICAgICAvLy8gPHJldHVybnM+PC9yZXR1cm5zPlxuICAgICAgICBwdWJsaWMgc3RhdGljIFQgR2V0UGFyYW1ldGVyPFQ+KHRoaXMgRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycywgc3RyaW5nIHBhcmFtS2V5KVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAocGFyYW1ldGVycyA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJQYXJhbWV0ZXJzIGlzIG51bGwhXCIpO1xuXG4gICAgICAgICAgICBpZiAoIXBhcmFtZXRlcnMuQ29udGFpbnNLZXkocGFyYW1LZXkpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oc3RyaW5nLkZvcm1hdChcIk5vIHBhcmFtZXRlciB3aXRoIGtleSB7MH0gZm91bmQhXCIscGFyYW1LZXkpKTtcblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gcGFyYW1ldGVyc1twYXJhbUtleV07XG5cbiAgICAgICAgICAgIGlmICghKHZhbHVlIGlzIHN0cmluZykpIHJldHVybiAoVCkgdmFsdWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYXJzZU1ldGhvZCA9IHR5cGVvZihUKS5HZXRNZXRob2QoXCJQYXJzZVwiLCBuZXcgVHlwZVtdIHsgdHlwZW9mKHN0cmluZykgfSApO1xuXG4gICAgICAgICAgICBpZiAocGFyc2VNZXRob2QgIT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gKFQpcGFyc2VNZXRob2QuSW52b2tlKG51bGwsIG5ldyBvYmplY3RbXSB7IHZhbHVlIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gKFQpIHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBCdWlsZCBiYXNlIHVybCB1c2luZyBwYWdlIGlkIGFuZCB2aXJ0dWFsIGRpcmVjdG9yeVxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwYWdlSWRcIj48L3BhcmFtPlxuICAgICAgICAvLy8gPHJldHVybnM+PC9yZXR1cm5zPlxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBCdWlsZEJhc2VVcmwoc3RyaW5nIHBhZ2VJZClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGJhc2VVcmwgPSBzdHJpbmcuRm9ybWF0KFwiezB9Ly97MX1cIixXaW5kb3cuTG9jYXRpb24uUHJvdG9jb2wsV2luZG93LkxvY2F0aW9uLkhvc3QpO1xuICAgICAgICAgICAgYmFzZVVybCA9IHN0cmluZy5Jc051bGxPckVtcHR5KFZpcnR1YWxEaXJlY3RvcnkpXG4gICAgICAgICAgICAgICAgPyBzdHJpbmcuRm9ybWF0KFwiezB9I3sxfVwiLGJhc2VVcmwscGFnZUlkKSAgICAgICAgICAgICAgICA6IHN0cmluZy5Gb3JtYXQoXCJ7MH0vezF9I3syfVwiLGJhc2VVcmwsVmlydHVhbERpcmVjdG9yeSxwYWdlSWQpO1xuICAgICAgICAgICAgcmV0dXJuIGJhc2VVcmw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ1c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5MaW5xO1xudXNpbmcgQnJpZGdlLmpRdWVyeTI7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuTmF2aWdhdGlvblxue1xuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgVXRpbGl0eVxuICAgIHtcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gTG9hZCBzY3JpcHQgc2VxdWVudGlhbGx5XG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInNjcmlwdHNcIj48L3BhcmFtPlxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgU2VxdWVudGlhbFNjcmlwdExvYWQoTGlzdDxzdHJpbmc+IHNjcmlwdHMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICghU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Bbnk8c3RyaW5nPihzY3JpcHRzKSkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHRvTG9hZCA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuRmlyc3Q8c3RyaW5nPihzY3JpcHRzKTtcbiAgICAgICAgICAgIGpRdWVyeS5HZXRTY3JpcHQodG9Mb2FkLCAoU3lzdGVtLkFjdGlvbjxvYmplY3Qsc3RyaW5nLGpxWEhSPikoKG8sIHMsIGFyZzMpID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2NyaXB0cy5SZW1vdmUodG9Mb2FkKTtcbiAgICAgICAgICAgICAgICBTZXF1ZW50aWFsU2NyaXB0TG9hZChzY3JpcHRzKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJ1c2luZyBSZXR5cGVkO1xyXG5cclxubmFtZXNwYWNlIEJyaWRnZS5TcGFmXHJcbntcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBjbGFzcyBWaWV3TW9kZWxCYXNlXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBkb20uSFRNTEVsZW1lbnQgX3BhZ2VOb2RlO1xyXG5cclxuICAgICAgICAvLy8gPHN1bW1hcnk+XHJcbiAgICAgICAgLy8vIEVsZW1lbnQgaWQgb2YgdGhlIHBhZ2UgXHJcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cclxuICAgICAgICAvLy8gPHJldHVybnM+PC9yZXR1cm5zPlxyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBzdHJpbmcgRWxlbWVudElkKCk7XHJcbnB1YmxpYyBkb20uSFRNTEVsZW1lbnQgUGFnZU5vZGVcclxue1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIF9wYWdlTm9kZSA/PyAodGhpcy5fcGFnZU5vZGUgPSBkb20uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoRWxlbWVudElkKCkpKTtcclxuICAgIH1cclxufVxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEFwcGx5QmluZGluZ3MoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAga25vY2tvdXQua28uYXBwbHlCaW5kaW5ncyh0aGlzLCB0aGlzLlBhZ2VOb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlbW92ZUJpbmRpbmdzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGtub2Nrb3V0LmtvLnJlbW92ZU5vZGUodGhpcy5QYWdlTm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5SZWZsZWN0aW9uO1xyXG51c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgQnJpZGdlLklvYztcclxudXNpbmcgQnJpZGdlLk1lc3NlbmdlcjtcclxudXNpbmcgQnJpZGdlLk5hdmlnYXRpb247XHJcbnVzaW5nIEJyaWRnZS5TcGFmLkF0dHJpYnV0ZXM7XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLlNwYWZcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFNwYWZBcHBcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIElJb2MgQ29udGFpbmVyO1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgTWFpbigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb250YWluZXIgPSBuZXcgQnJpZGdlSW9jKCk7XHJcbiAgICAgICAgICAgIENvbnRhaW5lckNvbmZpZygpOyAvLyBjb25maWcgY29udGFpbmVyXHJcbiAgICAgICAgICAgIENvbnRhaW5lci5SZXNvbHZlPElOYXZpZ2F0b3I+KCkuSW5pdE5hdmlnYXRpb24oKTsgLy8gaW5pdCBuYXZpZ2F0aW9uXHJcblxyXG4gICAgICAgICAgICBXaW5kb3cuT25FcnJvciA9IChtZXNzYWdlLCB1cmwsIG51bWJlciwgY29sdW1uTnVtYmVyLCBlcnJvcikgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQ29udGFpbmVyQ29uZmlnKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIG5hdmlnYXRvclxyXG4gICAgICAgICAgICBDb250YWluZXIuUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZTxJTmF2aWdhdG9yLCBCcmlkZ2VOYXZpZ2F0b3JXaXRoUm91dGluZz4oKTtcclxuICAgICAgICAgICAgQ29udGFpbmVyLlJlZ2lzdGVyU2luZ2xlSW5zdGFuY2U8SUJyb3dzZXJIaXN0b3J5TWFuYWdlciwgUXVlcnlQYXJhbWV0ZXJOYXZpZ2F0aW9uSGlzdG9yeT4oKTtcclxuLy8gICAgICAgICAgICBDb250YWluZXIuUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZTxJQnJvd3Nlckhpc3RvcnlNYW5hZ2VyLCBDb21wbGV4T2JqZWN0TmF2aWdhdGlvbkhpc3Rvcnk+KCk7IC8vIGlmIHlvdSBkb24ndCBuZWVkIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgQ29udGFpbmVyLlJlZ2lzdGVyPElOYXZpZ2F0b3JDb25maWd1cmF0b3IsIEN1c3RvbVJvdXRlc0NvbmZpZz4oKTsgXHJcblxyXG4gICAgICAgICAgICAvLyBtZXNzZW5nZXJcclxuICAgICAgICAgICAgQ29udGFpbmVyLlJlZ2lzdGVyU2luZ2xlSW5zdGFuY2U8SU1lc3NlbmdlciwgTWVzc2VuZ2VyLk1lc3Nlbmdlcj4oKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHZpZXdtb2RlbHNcclxuICAgICAgICAgICAgUmVnaXN0ZXJBbGxWaWV3TW9kZWxzKCk7XHJcblxyXG4gICAgICAgICAgICAvLyByZWdpc3RlciBjdXN0b20gcmVzb3VyY2UsIHNlcnZpY2VzLi5cclxuXHJcbiAgICAgICAgfVxyXG4jcmVnaW9uIFBBR0VTIElEU1xyXG4vLyBzdGF0aWMgcGFnZXMgaWRcclxucHVibGljIHN0YXRpYyBzdHJpbmcgSG9tZUlkXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBcImhvbWVcIjtcclxuICAgIH1cclxufXB1YmxpYyBzdGF0aWMgc3RyaW5nIFNlY29uZElkXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBcInNlY29uZFwiO1xyXG4gICAgfVxyXG59ICAgICAgIFxyXG4gICAgICAgICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgI3JlZ2lvbiBNRVNTQUdFU1xyXG4gICAgICAgIC8vIG1lc3NlbmdlciBoZWxwZXIgZm9yIGdsb2JhbCBtZXNzYWdlcyBhbmQgbWVzc2FnZXMgaWRzXHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgTWVzc2FnZXNcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHB1YmxpYyBjbGFzcyBHbG9iYWxTZW5kZXIgeyB9O1xyXG5cclxuICAgICAgICAgICAgcHVibGljIHN0YXRpYyBHbG9iYWxTZW5kZXIgU2VuZGVyID0gbmV3IEdsb2JhbFNlbmRlcigpO1xyXG5wdWJsaWMgc3RhdGljIHN0cmluZyBMb2dpbkRvbmVcclxue1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFwiTG9naW5Eb25lXCI7XHJcbiAgICB9XHJcbn1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cclxuICAgICAgICAvLy8gUmVnaXN0ZXIgYWxsIHR5cGVzIHRoYXQgZW5kIHdpdGggXCJ2aWV3bW9kZWxcIi5cclxuICAgICAgICAvLy8gWW91IGNhbiByZWdpc3RlciBhIHZpZXdtb2RlIGFzIFNpbmdsciBJbnN0YW5jZSBhZGRpbmcgXCJTaW5nbGVJbnN0YW5jZUF0dHJpYnV0ZVwiIHRvIHRoZSBjbGFzc1xyXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBSZWdpc3RlckFsbFZpZXdNb2RlbHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHR5cGVzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3RNYW55PEFzc2VtYmx5LFR5cGU+KEFwcERvbWFpbi5DdXJyZW50RG9tYWluLkdldEFzc2VtYmxpZXMoKSwoRnVuYzxBc3NlbWJseSxTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYy5JRW51bWVyYWJsZTxUeXBlPj4pKHMgPT4gcy5HZXRUeXBlcygpKSlcclxuICAgICAgICAgICAgICAgIC5XaGVyZSgoRnVuYzxUeXBlLGJvb2w+KSh3ID0+IHcuTmFtZS5Ub0xvd2VyKCkuRW5kc1dpdGgoXCJ2aWV3bW9kZWxcIikpKS5Ub0xpc3QoKTtcclxuXHJcbiAgICAgICAgICAgIHR5cGVzLkZvckVhY2goKEFjdGlvbjxUeXBlPikoZiA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXR0cmlidXRlcyA9IGYuR2V0Q3VzdG9tQXR0cmlidXRlcyh0eXBlb2YoU2luZ2xlSW5zdGFuY2VBdHRyaWJ1dGUpLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Bbnk8b2JqZWN0PihhdHRyaWJ1dGVzKSlcclxuICAgICAgICAgICAgICAgICAgICBDb250YWluZXIuUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZShmKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBDb250YWluZXIuUmVnaXN0ZXIoZik7XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLklvY1xyXG57XHJcbiAgICAvLy8gPHN1bW1hcnk+XHJcbiAgICAvLy8gSW1wbGVtZW50YXRpb24gb2YgSUlvY1xyXG4gICAgLy8vIDwvc3VtbWFyeT5cclxuICAgIHB1YmxpYyBjbGFzcyBCcmlkZ2VJb2MgOiBJSW9jXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBEaWN0aW9uYXJ5PFR5cGUsIElSZXNvbHZlcj4gX3Jlc29sdmVycyA9IG5ldyBEaWN0aW9uYXJ5PFR5cGUsIElSZXNvbHZlcj4oKTtcclxuXHJcbiAgICAgICAgI3JlZ2lvbiBSRUdJU1RSQVRJT05cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXIoVHlwZSB0eXBlLCBJUmVzb2x2ZXIgcmVzb2x2ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja0FscmVhZHlBZGRlZCh0eXBlKTtcclxuICAgICAgICAgICAgX3Jlc29sdmVycy5BZGQodHlwZSwgcmVzb2x2ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXIoVHlwZSB0eXBlLCBUeXBlIGltcGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja0FscmVhZHlBZGRlZCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNvbHZlciA9IG5ldyBUcmFuc2llbnRSZXNvbHZlcih0aGlzLCBpbXBsKTtcclxuICAgICAgICAgICAgX3Jlc29sdmVycy5BZGQodHlwZSwgcmVzb2x2ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXI8VFR5cGUsIFRJbXBsZW1lbnRhdGlvbj4oKSB3aGVyZSBUSW1wbGVtZW50YXRpb24gOiBjbGFzcywgVFR5cGVcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlZ2lzdGVyKHR5cGVvZihUVHlwZSksIHR5cGVvZihUSW1wbGVtZW50YXRpb24pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyKFR5cGUgdHlwZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlZ2lzdGVyKHR5cGUsIHR5cGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXI8VFR5cGU+KCkgd2hlcmUgVFR5cGUgOiBjbGFzc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVnaXN0ZXIodHlwZW9mKFRUeXBlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlclNpbmdsZUluc3RhbmNlKFR5cGUgdHlwZSwgVHlwZSBpbXBsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tBbHJlYWR5QWRkZWQodHlwZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZXIgPSBuZXcgU2luZ2xlSW5zdGFuY2VSZXNvbHZlcih0aGlzLCBpbXBsKTtcclxuICAgICAgICAgICAgX3Jlc29sdmVycy5BZGQodHlwZSwgcmVzb2x2ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZTxUVHlwZSwgVEltcGxlbWVudGF0aW9uPigpIHdoZXJlIFRJbXBsZW1lbnRhdGlvbiA6IGNsYXNzLCBUVHlwZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZSh0eXBlb2YoVFR5cGUpLCB0eXBlb2YoVEltcGxlbWVudGF0aW9uKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlclNpbmdsZUluc3RhbmNlKFR5cGUgdHlwZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlZ2lzdGVyU2luZ2xlSW5zdGFuY2UodHlwZSwgdHlwZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlclNpbmdsZUluc3RhbmNlPFRUeXBlPigpIHdoZXJlIFRUeXBlIDogY2xhc3NcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlZ2lzdGVyU2luZ2xlSW5zdGFuY2UodHlwZW9mKFRUeXBlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlckZ1bmM8VFR5cGU+KEZ1bmM8VFR5cGU+IGZ1bmMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja0FscmVhZHlBZGRlZDxUVHlwZT4oKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNvbHZlciA9IG5ldyBGdW5jUmVzb2x2ZXI8VFR5cGU+KGZ1bmMpO1xyXG4gICAgICAgICAgICBfcmVzb2x2ZXJzLkFkZCh0eXBlb2YoVFR5cGUpLCByZXNvbHZlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3Rlckluc3RhbmNlKFR5cGUgdHlwZSwgb2JqZWN0IGluc3RhbmNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tBbHJlYWR5QWRkZWQodHlwZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZXIgPSBuZXcgSW5zdGFuY2VSZXNvbHZlcihpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIF9yZXNvbHZlcnMuQWRkKHR5cGUsIHJlc29sdmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVySW5zdGFuY2Uob2JqZWN0IGluc3RhbmNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVnaXN0ZXJJbnN0YW5jZShpbnN0YW5jZS5HZXRUeXBlKCksIGluc3RhbmNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVySW5zdGFuY2U8VFR5cGU+KFRUeXBlIGluc3RhbmNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVnaXN0ZXJJbnN0YW5jZSh0eXBlb2YoVFR5cGUpLCBpbnN0YW5jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICNlbmRyZWdpb25cclxuXHJcblxyXG4gICAgICAgICNyZWdpb24gUkVTT0xWRVxyXG4gICAgICAgIHB1YmxpYyBUVHlwZSBSZXNvbHZlPFRUeXBlPigpIHdoZXJlIFRUeXBlIDogY2xhc3NcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrTm90UmVnaXN0ZXJlZDxUVHlwZT4oKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNvbHZlciA9IF9yZXNvbHZlcnNbdHlwZW9mKFRUeXBlKV07XHJcbiAgICAgICAgICAgIHJldHVybiAoVFR5cGUpcmVzb2x2ZXIuUmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9iamVjdCBSZXNvbHZlKFR5cGUgdHlwZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrTm90UmVnaXN0ZXJlZCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNvbHZlciA9IF9yZXNvbHZlcnNbdHlwZV07XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlci5SZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICNlbmRyZWdpb25cclxuXHJcblxyXG4gICAgICAgICNyZWdpb24gUFJJVkFURVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQ2hlY2tBbHJlYWR5QWRkZWQoVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKF9yZXNvbHZlcnMuQ29udGFpbnNLZXkodHlwZSkpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKHN0cmluZy5Gb3JtYXQoXCJ7MH0gaXMgYWxyZWFkeSByZWdpc3RlcmVkIVwiLHR5cGUuRnVsbE5hbWUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDaGVja0FscmVhZHlBZGRlZDxUVHlwZT4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tBbHJlYWR5QWRkZWQodHlwZW9mKFRUeXBlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQ2hlY2tOb3RSZWdpc3RlcmVkKFR5cGUgdHlwZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghX3Jlc29sdmVycy5Db250YWluc0tleSh0eXBlKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oc3RyaW5nLkZvcm1hdChcIkNhbm5vdCByZXNvbHZlIHswfSwgaXQncyBub3QgcmVnaXN0ZXJlZCFcIix0eXBlLkZ1bGxOYW1lKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQ2hlY2tOb3RSZWdpc3RlcmVkPFRUeXBlPigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja05vdFJlZ2lzdGVyZWQodHlwZW9mKFRUeXBlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAjZW5kcmVnaW9uXHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLklvY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgRnVuY1Jlc29sdmVyPFQ+IDogSVJlc29sdmVyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEZ1bmM8b2JqZWN0PiBSZXNvbHZlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIEZ1bmNSZXNvbHZlcihGdW5jPFQ+IHJlc29sdmVGdW5jKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5SZXNvbHZlID0gKCkgPT4gcmVzb2x2ZUZ1bmMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLklvY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgSW5zdGFuY2VSZXNvbHZlciA6IElSZXNvbHZlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBGdW5jPG9iamVjdD4gUmVzb2x2ZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBJbnN0YW5jZVJlc29sdmVyKG9iamVjdCByZXNvbHZlZE9iailcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlc29sdmUgPSAoKSA9PiByZXNvbHZlZE9iajtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsYXNzIEluc3RhbmNlUmVzb2x2ZXI8VD4gOiBJbnN0YW5jZVJlc29sdmVyXHJcbiAgICB7XHJcblxyXG4gICAgICAgIHB1YmxpYyBJbnN0YW5jZVJlc29sdmVyKFQgcmVzb2x2ZWRPYmopIDogYmFzZShyZXNvbHZlZE9iailcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuSW9jXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTaW5nbGVJbnN0YW5jZVJlc29sdmVyIDogSVJlc29sdmVyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBvYmplY3QgX3NpbmdsZUluc3RhbmNlO1xyXG5cclxuICAgICAgICBwdWJsaWMgRnVuYzxvYmplY3Q+IFJlc29sdmUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgU2luZ2xlSW5zdGFuY2VSZXNvbHZlcihJSW9jIGlvYywgVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVzb2x2ZSA9ICgpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpcnN0IHJlc29sdmUuIFVzaW5nIHRyYW5zaWVudCByZXNvbHZlclxyXG4gICAgICAgICAgICAgICAgaWYgKF9zaW5nbGVJbnN0YW5jZSA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2llbnRSZXNvbHZlciA9IG5ldyBUcmFuc2llbnRSZXNvbHZlcihpb2MsIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9zaW5nbGVJbnN0YW5jZSA9IHRyYW5zaWVudFJlc29sdmVyLlJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX3NpbmdsZUluc3RhbmNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xhc3MgU2luZ2xlSW5zdGFuY2VSZXNvbHZlcjxUPiA6IFNpbmdsZUluc3RhbmNlUmVzb2x2ZXJcclxuICAgIHtcclxuXHJcbiAgICAgICAgcHVibGljIFNpbmdsZUluc3RhbmNlUmVzb2x2ZXIoSUlvYyBpb2MpIDogYmFzZShpb2MsIHR5cGVvZihUKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIEJyaWRnZS5Jb2Ncclxue1xyXG4gICAgcHVibGljIGNsYXNzIFRyYW5zaWVudFJlc29sdmVyIDogSVJlc29sdmVyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEZ1bmM8b2JqZWN0PiBSZXNvbHZlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIFRyYW5zaWVudFJlc29sdmVyKElJb2MgaW9jLCBUeXBlIHRvcmVzb2x2ZVR5cGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLlJlc29sdmUgPSAoKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBnZXQgY3RvclxyXG4gICAgICAgICAgICAgICAgdmFyIGN0b3IgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0T3JEZWZhdWx0PFN5c3RlbS5SZWZsZWN0aW9uLkNvbnN0cnVjdG9ySW5mbz4odG9yZXNvbHZlVHlwZS5HZXRDb25zdHJ1Y3RvcnMoKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3RvciA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oc3RyaW5nLkZvcm1hdChcIk5vIGN0b3IgZm91bmQgZm9yIHR5cGUgezB9IVwiLHRvcmVzb2x2ZVR5cGUuRnVsbE5hbWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBnZXQgY3RvciBwYXJhbXNcclxuICAgICAgICAgICAgICAgIHZhciBjdG9yUGFyYW1zID0gY3Rvci5HZXRQYXJhbWV0ZXJzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIVN5c3RlbS5MaW5xLkVudW1lcmFibGUuQW55PFN5c3RlbS5SZWZsZWN0aW9uLlBhcmFtZXRlckluZm8+KGN0b3JQYXJhbXMpKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBY3RpdmF0b3IuQ3JlYXRlSW5zdGFuY2UodG9yZXNvbHZlVHlwZSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVjdXJzaXZlIHJlc29sdmVcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IG5ldyBMaXN0PG9iamVjdD4oY3RvclBhcmFtcy5MZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoICh2YXIgcGFyYW1ldGVySW5mbyBpbiBjdG9yUGFyYW1zKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLkFkZChpb2MuUmVzb2x2ZShwYXJhbWV0ZXJJbmZvLlBhcmFtZXRlclR5cGUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN0b3IuSW52b2tlKHBhcmFtZXRlcnMuVG9BcnJheSgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsYXNzIFRyYW5zaWVudFJlc29sdmVyPFQ+IDogVHJhbnNpZW50UmVzb2x2ZXJcclxuICAgIHtcclxuXHJcbiAgICAgICAgcHVibGljIFRyYW5zaWVudFJlc29sdmVyKElJb2MgaW9jKSA6IGJhc2UoaW9jLCB0eXBlb2YoVCkpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59IiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uTGlucTtcbnVzaW5nIFN5c3RlbS5UZXh0O1xudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcblxubmFtZXNwYWNlIEJyaWRnZS5NZXNzZW5nZXJcbntcbiAgICBwdWJsaWMgY2xhc3MgTWVzc2VuZ2VyIDogSU1lc3NlbmdlclxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seVxuICAgICAgICAgICAgRGljdGlvbmFyeTxUdXBsZTxzdHJpbmcsIFR5cGUsIFR5cGU+LCBMaXN0PFR1cGxlPG9iamVjdCwgQWN0aW9uPG9iamVjdCwgb2JqZWN0Pj4+PiBfY2FsbHMgPVxuICAgICAgICAgICAgICAgIG5ldyBEaWN0aW9uYXJ5PFR1cGxlPHN0cmluZywgVHlwZSwgVHlwZT4sIExpc3Q8VHVwbGU8b2JqZWN0LCBBY3Rpb248b2JqZWN0LCBvYmplY3Q+Pj4+KCk7XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gU2VuZCBNZXNzYWdlIHdpdGggYXJnc1xuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVFNlbmRlclwiPlRTZW5kZXI8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRBcmdzXCI+VE1lc3NhZ2VBcmdzPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInNlbmRlclwiPlNlbmRlcjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1lc3NhZ2VcIj5NZXNzYWdlPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiYXJnc1wiPkFyZ3M8L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdm9pZCBTZW5kPFRTZW5kZXIsIFRBcmdzPihUU2VuZGVyIHNlbmRlciwgc3RyaW5nIG1lc3NhZ2UsIFRBcmdzIGFyZ3MpIHdoZXJlIFRTZW5kZXIgOiBjbGFzc1xuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoc2VuZGVyID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcInNlbmRlclwiKTtcbiAgICAgICAgICAgIHRoaXMuSW5uZXJTZW5kKG1lc3NhZ2UsIHR5cGVvZihUU2VuZGVyKSwgdHlwZW9mKFRBcmdzKSwgc2VuZGVyLCBhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIFNlbmQgTWVzc2FnZSB3aXRob3V0IGFyZ3NcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRTZW5kZXJcIj5UU2VuZGVyPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInNlbmRlclwiPlNlbmRlcjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1lc3NhZ2VcIj5NZXNzYWdlPC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZvaWQgU2VuZDxUU2VuZGVyPihUU2VuZGVyIHNlbmRlciwgc3RyaW5nIG1lc3NhZ2UpIHdoZXJlIFRTZW5kZXIgOiBjbGFzc1xuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoc2VuZGVyID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcInNlbmRlclwiKTtcbiAgICAgICAgICAgIHRoaXMuSW5uZXJTZW5kKG1lc3NhZ2UsIHR5cGVvZihUU2VuZGVyKSwgbnVsbCwgc2VuZGVyLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIFN1YnNjcmliZSBNZXNzYWdlIHdpdGggYXJnc1xuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVFNlbmRlclwiPlRTZW5kZXI8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRBcmdzXCI+VEFyZ3M8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic3Vic2NyaWJlclwiPlN1YnNjcmliZXI8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJtZXNzYWdlXCI+TWVzc2FnZTwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImNhbGxiYWNrXCI+QWN0aW9uPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic291cmNlXCI+c291cmNlPC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZvaWQgU3Vic2NyaWJlPFRTZW5kZXIsIFRBcmdzPihvYmplY3Qgc3Vic2NyaWJlciwgc3RyaW5nIG1lc3NhZ2UsIEFjdGlvbjxUU2VuZGVyLCBUQXJncz4gY2FsbGJhY2ssXG4gICAgICAgICAgICBUU2VuZGVyIHNvdXJjZSA9IG51bGwpIHdoZXJlIFRTZW5kZXIgOiBjbGFzc1xuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlciA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJzdWJzY3JpYmVyXCIpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcImNhbGxiYWNrXCIpO1xuXG4gICAgICAgICAgICBBY3Rpb248b2JqZWN0LCBvYmplY3Q+IHdyYXAgPSAoc2VuZGVyLCBhcmdzKSA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBzZW5kID0gKFRTZW5kZXIpc2VuZGVyO1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2UgPT0gbnVsbCB8fCBzZW5kID09IHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKFRTZW5kZXIpc2VuZGVyLCAoVEFyZ3MpYXJncyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLklubmVyU3Vic2NyaWJlKHN1YnNjcmliZXIsIG1lc3NhZ2UsIHR5cGVvZihUU2VuZGVyKSwgdHlwZW9mKFRBcmdzKSwgKEFjdGlvbjxvYmplY3Qsb2JqZWN0Pil3cmFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIFN1YnNjcmliZSBNZXNzYWdlIHdpdGhvdXQgYXJnc1xuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVFNlbmRlclwiPlRTZW5kZXI8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic3Vic2NyaWJlclwiPlN1YnNjcmliZXI8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJtZXNzYWdlXCI+TWVzc2FnZTwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImNhbGxiYWNrXCI+QWN0aW9uPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic291cmNlXCI+c291cmNlPC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZvaWQgU3Vic2NyaWJlPFRTZW5kZXI+KG9iamVjdCBzdWJzY3JpYmVyLCBzdHJpbmcgbWVzc2FnZSwgQWN0aW9uPFRTZW5kZXI+IGNhbGxiYWNrLFxuICAgICAgICAgICAgVFNlbmRlciBzb3VyY2UgPSBudWxsKSB3aGVyZSBUU2VuZGVyIDogY2xhc3NcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHN1YnNjcmliZXIgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwic3Vic2NyaWJlclwiKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJjYWxsYmFja1wiKTtcblxuICAgICAgICAgICAgQWN0aW9uPG9iamVjdCwgb2JqZWN0PiB3cmFwID0gKHNlbmRlciwgYXJncykgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VuZCA9IChUU2VuZGVyKXNlbmRlcjtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlID09IG51bGwgfHwgc2VuZCA9PSBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKChUU2VuZGVyKXNlbmRlcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLklubmVyU3Vic2NyaWJlKHN1YnNjcmliZXIsIG1lc3NhZ2UsIHR5cGVvZihUU2VuZGVyKSwgbnVsbCwgKEFjdGlvbjxvYmplY3Qsb2JqZWN0Pil3cmFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIFVuc3Vic2NyaWJlIGFjdGlvbiB3aXRoIGFyZ3NcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRTZW5kZXJcIj5UU2VuZGVyPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUQXJnc1wiPlRBcmdzPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN1YnNjcmliZXJcIj5TdWJzY3JpYmVyPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwibWVzc2FnZVwiPk1lc3NhZ2U8L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdm9pZCBVbnN1YnNjcmliZTxUU2VuZGVyLCBUQXJncz4ob2JqZWN0IHN1YnNjcmliZXIsIHN0cmluZyBtZXNzYWdlKSB3aGVyZSBUU2VuZGVyIDogY2xhc3NcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5Jbm5lclVuc3Vic2NyaWJlKG1lc3NhZ2UsIHR5cGVvZihUU2VuZGVyKSwgdHlwZW9mKFRBcmdzKSwgc3Vic2NyaWJlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBVbnN1YnNjcmliZSBhY3Rpb24gd2l0aG91dCBhcmdzXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUU2VuZGVyXCI+VFNlbmRlcjwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzdWJzY3JpYmVyXCI+U3Vic2NyaWJlcjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1lc3NhZ2VcIj5NZXNzYWdlPC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZvaWQgVW5zdWJzY3JpYmU8VFNlbmRlcj4ob2JqZWN0IHN1YnNjcmliZXIsIHN0cmluZyBtZXNzYWdlKSB3aGVyZSBUU2VuZGVyIDogY2xhc3NcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5Jbm5lclVuc3Vic2NyaWJlKG1lc3NhZ2UsIHR5cGVvZihUU2VuZGVyKSwgbnVsbCwgc3Vic2NyaWJlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBSZW1vdmUgYWxsIGNhbGxiYWNrc1xuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICBwdWJsaWMgdm9pZCBSZXNldE1lc3NlbmdlcigpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbGxzLkNsZWFyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHZvaWQgSW5uZXJTZW5kKHN0cmluZyBtZXNzYWdlLCBUeXBlIHNlbmRlclR5cGUsIFR5cGUgYXJnVHlwZSwgb2JqZWN0IHNlbmRlciwgb2JqZWN0IGFyZ3MpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcIm1lc3NhZ2VcIik7XG4gICAgICAgICAgICB2YXIga2V5ID0gbmV3IFR1cGxlPHN0cmluZywgVHlwZSwgVHlwZT4obWVzc2FnZSwgc2VuZGVyVHlwZSwgYXJnVHlwZSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2NhbGxzLkNvbnRhaW5zS2V5KGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSB0aGlzLl9jYWxsc1trZXldO1xuICAgICAgICAgICAgaWYgKGFjdGlvbnMgPT0gbnVsbCB8fCAhU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Bbnk8VHVwbGU8b2JqZWN0LEFjdGlvbjxvYmplY3Qsb2JqZWN0Pj4+KGFjdGlvbnMpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIGFjdGlvbnNDb3B5ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Ub0xpc3Q8VHVwbGU8b2JqZWN0LEFjdGlvbjxvYmplY3Qsb2JqZWN0Pj4+KGFjdGlvbnMpO1xuICAgICAgICAgICAgZm9yZWFjaCAodmFyIGFjdGlvbiBpbiBhY3Rpb25zQ29weSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9ucy5Db250YWlucyhhY3Rpb24pKVxuICAgICAgICAgICAgICAgICAgICBhY3Rpb24uSXRlbTIoc2VuZGVyLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgdm9pZCBJbm5lclN1YnNjcmliZShvYmplY3Qgc3Vic2NyaWJlciwgc3RyaW5nIG1lc3NhZ2UsIFR5cGUgc2VuZGVyVHlwZSwgVHlwZSBhcmdUeXBlLFxuICAgICAgICAgICAgQWN0aW9uPG9iamVjdCwgb2JqZWN0PiBjYWxsYmFjaylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwibWVzc2FnZVwiKTtcbiAgICAgICAgICAgIHZhciBrZXkgPSBuZXcgVHVwbGU8c3RyaW5nLCBUeXBlLCBUeXBlPihtZXNzYWdlLCBzZW5kZXJUeXBlLCBhcmdUeXBlKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBUdXBsZTxvYmplY3QsIEFjdGlvbjxvYmplY3QsIG9iamVjdD4+KHN1YnNjcmliZXIsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jYWxscy5Db250YWluc0tleShrZXkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbGxzW2tleV0uQWRkKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5DYWxsRm9yKG5ldyBMaXN0PFR1cGxlPG9iamVjdCwgQWN0aW9uPG9iamVjdCwgb2JqZWN0Pj4+KCksKF9vMSk9PntfbzEuQWRkKHZhbHVlKTtyZXR1cm4gX28xO30pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbGxzW2tleV0gPSBsaXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIElubmVyVW5zdWJzY3JpYmUoc3RyaW5nIG1lc3NhZ2UsIFR5cGUgc2VuZGVyVHlwZSwgVHlwZSBhcmdUeXBlLCBvYmplY3Qgc3Vic2NyaWJlcilcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHN1YnNjcmliZXIgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwic3Vic2NyaWJlclwiKTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcIm1lc3NhZ2VcIik7XG5cbiAgICAgICAgICAgIHZhciBrZXkgPSBuZXcgVHVwbGU8c3RyaW5nLCBUeXBlLCBUeXBlPihtZXNzYWdlLCBzZW5kZXJUeXBlLCBhcmdUeXBlKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fY2FsbHMuQ29udGFpbnNLZXkoa2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciB0b3JlbW92ZSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8VHVwbGU8b2JqZWN0LEFjdGlvbjxvYmplY3Qsb2JqZWN0Pj4+KHRoaXMuX2NhbGxzW2tleV0sKEZ1bmM8VHVwbGU8b2JqZWN0LEFjdGlvbjxvYmplY3Qsb2JqZWN0Pj4sYm9vbD4pKHR1cGxlID0+IHR1cGxlLkl0ZW0xID09IHN1YnNjcmliZXIpKS5Ub0xpc3QoKTtcblxuICAgICAgICAgICAgZm9yZWFjaCAodmFyIHR1cGxlIGluIHRvcmVtb3ZlKVxuICAgICAgICAgICAgICAgIHRoaXMuX2NhbGxzW2tleV0uUmVtb3ZlKHR1cGxlKTtcblxuICAgICAgICAgICAgaWYgKCFTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkFueTxUdXBsZTxvYmplY3QsQWN0aW9uPG9iamVjdCxvYmplY3Q+Pj4odGhpcy5fY2FsbHNba2V5XSkpXG4gICAgICAgICAgICAgICAgdGhpcy5fY2FsbHMuUmVtb3ZlKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5MaW5xO1xudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcbnVzaW5nIEJyaWRnZS5IdG1sNTtcbnVzaW5nIEJyaWRnZS5qUXVlcnkyO1xuXG5uYW1lc3BhY2UgQnJpZGdlLk5hdmlnYXRpb25cbntcbiAgICAvLy8gPHN1bW1hcnk+XG4gICAgLy8vIElOYXZpZ2F0b3IgaW1wbGVtZW50YXRpb25cbiAgICAvLy8gPC9zdW1tYXJ5PlxuICAgIHB1YmxpYyBjbGFzcyBCcmlkZ2VOYXZpZ2F0b3IgOiBJTmF2aWdhdG9yXG4gICAge1xuICAgICAgICBwcml2YXRlIHN0YXRpYyBJQW1Mb2FkYWJsZSBfYWN0dWFsQ29udHJvbGxlcjtcblxuICAgICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgSU5hdmlnYXRvckNvbmZpZ3VyYXRvciBDb25maWd1cmF0aW9uO1xuICAgICAgICBwdWJsaWMgQnJpZGdlTmF2aWdhdG9yKElOYXZpZ2F0b3JDb25maWd1cmF0b3IgY29uZmlndXJhdGlvbilcbiAgICAgICAge1xuICAgICAgICAgICAgQ29uZmlndXJhdGlvbiA9IGNvbmZpZ3VyYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBFbmFibGVTcGFmQW5jaG9ycygpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBhbGxBbmNob3JzID0galF1ZXJ5LlNlbGVjdChcImFcIik7XG4gICAgICAgICAgICBhbGxBbmNob3JzLk9mZihFdmVudFR5cGUuQ2xpY2suVG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBhbGxBbmNob3JzLkNsaWNrKChBY3Rpb248alF1ZXJ5TW91c2VFdmVudD4pKGV2ID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGNsaWNrZWRFbGVtZW50ID0gZXYuVGFyZ2V0O1xuXG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrZWRFbGVtZW50LkdldFR5cGUoKSAhPSB0eXBlb2YoSFRNTEFuY2hvckVsZW1lbnQpKVxuICAgICAgICAgICAgICAgICAgICBjbGlja2VkRWxlbWVudCA9IGpRdWVyeS5FbGVtZW50KGV2LlRhcmdldCkuUGFyZW50cyhcImFcIikuR2V0KDApO1xuXG4gICAgICAgICAgICAgICAgdmFyIGhyZWYgPSBjbGlja2VkRWxlbWVudC5HZXRBdHRyaWJ1dGUoXCJocmVmXCIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0cmluZy5Jc051bGxPckVtcHR5KGhyZWYpKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB2YXIgaXNNeUhyZWYgPSBocmVmLlN0YXJ0c1dpdGgoXCJzcGFmOlwiKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIGlzIG15IGhyZWZcbiAgICAgICAgICAgICAgICBpZiAoaXNNeUhyZWYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBldi5QcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFnZUlkID0gaHJlZi5SZXBsYWNlKFwic3BhZjpcIiwgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTmF2aWdhdGUocGFnZUlkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBhbmNob3IgZGVmYXVsdCBiZWhhdmlvdXJcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIE5hdmlnYXRlIHRvIGEgcGFnZSBJRC5cbiAgICAgICAgLy8vIFRoZSBJRCBtdXN0IGJlIHJlZ2lzdGVyZWQuXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhZ2VJZFwiPjwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgTmF2aWdhdGUoc3RyaW5nIHBhZ2VJZCwgRGljdGlvbmFyeTxzdHJpbmcsb2JqZWN0PiBwYXJhbWV0ZXJzID0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLkNvbmZpZ3VyYXRpb24uR2V0UGFnZURlc2NyaXB0b3JCeUtleShwYWdlSWQpO1xuICAgICAgICAgICAgaWYgKHBhZ2UgPT0gbnVsbCkgdGhyb3cgbmV3IEV4Y2VwdGlvbihzdHJpbmcuRm9ybWF0KFwiUGFnZSBub3QgZm91bmQgd2l0aCBJRCB7MH1cIixwYWdlSWQpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gY2hlY2sgcmVkaXJlY3QgcnVsZVxuICAgICAgICAgICAgdmFyIHJlZGlyZWN0S2V5ID0gZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LlRvVGVtcChcImtleTFcIixwYWdlLlJlZGlyZWN0UnVsZXMpIT1udWxsP2dsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tVGVtcDxGdW5jPHN0cmluZz4+KFwia2V5MVwiKS5JbnZva2UoKTooc3RyaW5nKW51bGw7XG4gICAgICAgICAgICBpZiAoIXN0cmluZy5Jc051bGxPckVtcHR5KHJlZGlyZWN0S2V5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLk5hdmlnYXRlKHJlZGlyZWN0S2V5LHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJvZHkgPSB0aGlzLkNvbmZpZ3VyYXRpb24uQm9keTtcbiAgICAgICAgICAgIGlmKGJvZHkgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiQ2Fubm90IGZpbmQgbmF2aWdhdGlvbiBib2R5IGVsZW1lbnQuXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBsZWF2ZSBhY3R1YWwgY29udHJvbGVsclxuICAgICAgICAgICAgaWYgKHRoaXMuTGFzdE5hdmlnYXRlQ29udHJvbGxlciAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHRoaXMuTGFzdE5hdmlnYXRlQ29udHJvbGxlci5PbkxlYXZlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuQ29uZmlndXJhdGlvbi5Cb2R5LkxvYWQocGFnZS5IdG1sTG9jYXRpb24uSW52b2tlKCksbnVsbCwgKEFjdGlvbjxzdHJpbmcsc3RyaW5nLGpxWEhSPikoYXN5bmMgKG8scyxhKSA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIGxvYWQgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICAgICAgaWYgKHBhZ2UuRGVwZW5kZW5jaWVzU2NyaXB0cyAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcmlwdHMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlRvTGlzdDxzdHJpbmc+KChwYWdlLkRlcGVuZGVuY2llc1NjcmlwdHMuSW52b2tlKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYocGFnZS5TZXF1ZW50aWFsRGVwZW5kZW5jaWVzU2NyaXB0TG9hZClcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxpdHkuU2VxdWVudGlhbFNjcmlwdExvYWQoc2NyaXB0cyk7XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBhcmFsbGVsIGxvYWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY3JpcHRzVGFzayA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PHN0cmluZyxUYXNrPG9iamVjdFtdPj4oc2NyaXB0cywoRnVuYzxzdHJpbmcsVGFzazxvYmplY3RbXT4+KSh1cmwgPT4gVGFzay5Gcm9tUHJvbWlzZShqUXVlcnkuR2V0U2NyaXB0KHVybCkpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBUYXNrLldoZW5BbGw8b2JqZWN0W10+KHNjcmlwdHNUYXNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBwYWdlXG4gICAgICAgICAgICAgICAgZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LlRvVGVtcChcImtleTJcIixwYWdlLlByZXBhcmVQYWdlKSE9bnVsbD9nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbUxhbWJkYSgoKT0+Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21UZW1wPEFjdGlvbj4oXCJrZXkyXCIpLkludm9rZSgpKTpudWxsO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIHNob3cgYXMgZnVsbHNjcmVlblxuICAgICAgICAgICAgICAgIGlmIChwYWdlLkZ1bGxTY3JlZW4pXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLlNob3dBc0Z1bGxTY3JlZW4oYm9keSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gYXV0byBlbmFibGUgc3BhZiBhbmNob3JzXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLkNvbmZpZ3VyYXRpb24uRGlzYWJsZUF1dG9TcGFmQW5jaG9yc09uTmF2aWdhdGUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW5hYmxlQW5jaG9ycyA9IGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5Ub1RlbXAoXCJrZXkzXCIscGFnZS5BdXRvRW5hYmxlU3BhZkFuY2hvcnMpIT1udWxsP2dsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tVGVtcDxGdW5jPGJvb2w+PihcImtleTNcIikuSW52b2tlKCk6KGJvb2w/KW51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmKGVuYWJsZUFuY2hvcnMuSGFzVmFsdWUgJiYgZW5hYmxlQW5jaG9ycy5WYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuRW5hYmxlU3BhZkFuY2hvcnMoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocGFnZS5QYWdlQ29udHJvbGxlciAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9hZCBuZXcgY29udHJvbGxlclxuICAgICAgICAgICAgICAgICAgICB2YXIgY29udHJvbGxlciA9IHBhZ2UuUGFnZUNvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuT25CZWZvcmVCaW5kaW5nKHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLk9uTG9hZChwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5PbkJpbmRpbmdEb25lKHBhcmFtZXRlcnMpO1xuXG4gICAgICAgICAgICAgICAgICAgIF9hY3R1YWxDb250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuT25OYXZpZ2F0ZWQhPW51bGw/Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21MYW1iZGEoKCk9PnRoaXMuT25OYXZpZ2F0ZWQuSW52b2tlKHRoaXMsY29udHJvbGxlcikpOm51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSkpOyBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIENvbnRlbnQgcGFnZSBpcyB0aGUgZmlyc3QgY2hpbGQgb2YgYm9keVxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJib2R5XCI+PC9wYXJhbT5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIFNob3dBc0Z1bGxTY3JlZW4oalF1ZXJ5IGJvZHkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciB0aGVEaXYgPSBib2R5LkNoaWxkcmVuKCkuRmlyc3QoKTtcbiAgICAgICAgICAgIHRoZURpdi5Dc3MoXCJ3aWR0aFwiICwgXCIxMDAlXCIpO1xuICAgICAgICAgICAgdGhlRGl2LkNzcyhcImhlaWdodFwiICwgXCIxMDAlXCIpO1xuICAgICAgICAgICAgdGhlRGl2LkNzcyhcImxlZnRcIiAsIFwiMFwiKTtcbiAgICAgICAgICAgIHRoZURpdi5Dc3MoXCJ0b3BcIiAsIFwiMFwiKTtcbiAgICAgICAgICAgIHRoZURpdi5Dc3MoXCJ6LWluZGV4XCIgLCBcIjk5OTk5OVwiKTtcbiAgICAgICAgICAgIHRoZURpdi5Dc3MoXCJwb3NpdGlvblwiICwgXCJhYnNvbHV0ZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBldmVudCBFdmVudEhhbmRsZXI8SUFtTG9hZGFibGU+IE9uTmF2aWdhdGVkO1xucHVibGljIElBbUxvYWRhYmxlIExhc3ROYXZpZ2F0ZUNvbnRyb2xsZXJcclxue1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIF9hY3R1YWxDb250cm9sbGVyO1xyXG4gICAgfVxyXG59XG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIFN1YnNjcmliZSB0byBhbmNob3JzIGNsaWNrXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgSW5pdE5hdmlnYXRpb24oKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLkVuYWJsZVNwYWZBbmNob3JzKCk7XG5cbiAgICAgICAgICAgIC8vIGdvIGhvbWVcbiAgICAgICAgICAgIHRoaXMuTmF2aWdhdGUodGhpcy5Db25maWd1cmF0aW9uLkhvbWVJZCk7XG4gICAgICAgIH1cblxuICAgICAgIFxuICAgIH1cbn0iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5MaW5xO1xudXNpbmcgQnJpZGdlLmpRdWVyeTI7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuTmF2aWdhdGlvblxue1xuICAgIC8vLyA8c3VtbWFyeT5cbiAgICAvLy8gSU5hdmlnYXRvckNvbmZpZ3VyYXRvciBJbXBsZW1lbnRhdGlvbi4gTXVzdCBiZSBleHRlbmRlZC5cbiAgICAvLy8gPC9zdW1tYXJ5PlxuICAgIHB1YmxpYyBhYnN0cmFjdCBjbGFzcyBCcmlkZ2VOYXZpZ2F0b3JDb25maWdCYXNlIDogSU5hdmlnYXRvckNvbmZpZ3VyYXRvclxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBJTGlzdDxJUGFnZURlc2NyaXB0b3I+IF9yb3V0ZXM7XG5cbiAgICAgICAgcHVibGljIGFic3RyYWN0IElMaXN0PElQYWdlRGVzY3JpcHRvcj4gQ3JlYXRlUm91dGVzKCk7XG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBqUXVlcnkgQm9keSB7IGdldDsgfVxuICAgICAgICBwdWJsaWMgYWJzdHJhY3Qgc3RyaW5nIEhvbWVJZCB7IGdldDsgfVxuICAgICAgICBwdWJsaWMgYWJzdHJhY3QgYm9vbCBEaXNhYmxlQXV0b1NwYWZBbmNob3JzT25OYXZpZ2F0ZSB7IGdldDsgfVxuXG5cblxuICAgICAgICBwcm90ZWN0ZWQgQnJpZGdlTmF2aWdhdG9yQ29uZmlnQmFzZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX3JvdXRlcyA9IHRoaXMuQ3JlYXRlUm91dGVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgSVBhZ2VEZXNjcmlwdG9yIEdldFBhZ2VEZXNjcmlwdG9yQnlLZXkoc3RyaW5nIGtleSlcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2luZ2xlT3JEZWZhdWx0PElQYWdlRGVzY3JpcHRvcj4odGhpcy5fcm91dGVzLChGdW5jPElQYWdlRGVzY3JpcHRvcixib29sPikocz0+IHN0cmluZy5FcXVhbHMocy5LZXksIGtleSwgU3RyaW5nQ29tcGFyaXNvbi5DdXJyZW50Q3VsdHVyZUlnbm9yZUNhc2UpKSk7XG4gICAgICAgIH1cblxuICAgIH1cbn0iLCJ1c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIEJyaWRnZS5IdG1sNTtcbnVzaW5nIEJyaWRnZS5OYXZpZ2F0aW9uLk1vZGVsO1xudXNpbmcgTmV3dG9uc29mdC5Kc29uO1xuXG5uYW1lc3BhY2UgQnJpZGdlLk5hdmlnYXRpb25cbntcbiAgICBwdWJsaWMgY2xhc3MgQ29tcGxleE9iamVjdE5hdmlnYXRpb25IaXN0b3J5IDogSUJyb3dzZXJIaXN0b3J5TWFuYWdlclxuICAgIHtcbiAgICAgICAgcHVibGljIHZvaWQgUHVzaFN0YXRlKHN0cmluZyBwYWdlSWQsIERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMgPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYmFzZVVybCA9IE5hdmlnYXRpb25VdGlsaXR5LkJ1aWxkQmFzZVVybChwYWdlSWQpO1xuXG4gICAgICAgICAgICBXaW5kb3cuSGlzdG9yeS5QdXNoU3RhdGUobnVsbCwgc3RyaW5nLkVtcHR5LFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMgIT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICA/IHN0cmluZy5Gb3JtYXQoXCJ7MH09ezF9XCIsYmFzZVVybCxHbG9iYWwuQnRvYShKc29uQ29udmVydC5TZXJpYWxpemVPYmplY3QocGFyYW1ldGVycykpKTogYmFzZVVybCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgVXJsRGVzY3JpcHRvciBQYXJzZVVybCgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciByZXMgPSBuZXcgVXJsRGVzY3JpcHRvcigpO1xuXG4gICAgICAgICAgICB2YXIgaGFzaCA9IFdpbmRvdy5Mb2NhdGlvbi5IYXNoO1xuICAgICAgICAgICAgaGFzaCA9IGhhc2guUmVwbGFjZShcIiNcIiwgXCJcIik7XG5cbiAgICAgICAgICAgIGlmIChzdHJpbmcuSXNOdWxsT3JFbXB0eShoYXNoKSkgcmV0dXJuIHJlcztcblxuICAgICAgICAgICAgdmFyIGVxdWFsSW5kZXggPSBoYXNoLkluZGV4T2YoJz0nKTtcbiAgICAgICAgICAgIGlmIChlcXVhbEluZGV4ID09IC0xKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlcy5QYWdlSWQgPSBoYXNoO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcy5QYWdlSWQgPSBoYXNoLlN1YnN0cmluZygwLCBlcXVhbEluZGV4KTsgIFxuXG4gICAgICAgICAgICB2YXIgZG91YmxlUG9pbnRzSW5keCA9IGVxdWFsSW5kZXggKyAxO1xuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBoYXNoLlN1YnN0cmluZyhkb3VibGVQb2ludHNJbmR4LCBoYXNoLkxlbmd0aCAtIGRvdWJsZVBvaW50c0luZHgpO1xuXG4gICAgICAgICAgICBpZiAoc3RyaW5nLklzTnVsbE9yRW1wdHkocGFyYW1ldGVycykpIHJldHVybiByZXM7IC8vIG5vIHBhcmFtZXRlcnNcblxuICAgICAgICAgICAgdmFyIGRlY29kZWQgPSBHbG9iYWwuQXRvYihwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIHZhciBkZXNlcmlhbGl6ZWQgPSBKc29uQ29udmVydC5EZXNlcmlhbGl6ZU9iamVjdDxEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0Pj4oZGVjb2RlZCk7XG5cbiAgICAgICAgICAgIHJlcy5QYXJhbWV0ZXJzID0gZGVzZXJpYWxpemVkO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgfVxufSIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLkxpbnE7XG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xudXNpbmcgQnJpZGdlLmpRdWVyeTI7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuTmF2aWdhdGlvblxue1xuICAgIHB1YmxpYyBjbGFzcyBQYWdlRGVzY3JpcHRvciA6IElQYWdlRGVzY3JpcHRvclxuICAgIHtcbiAgICAgICAgcHVibGljIFBhZ2VEZXNjcmlwdG9yKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5BdXRvRW5hYmxlU3BhZkFuY2hvcnMgPSAoKSA9PiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0cmluZyBLZXkgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgRnVuYzxzdHJpbmc+IEh0bWxMb2NhdGlvbiB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBGdW5jPElBbUxvYWRhYmxlPiBQYWdlQ29udHJvbGxlciB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBGdW5jPGJvb2w+IENhbkJlRGlyZWN0TG9hZCB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBBY3Rpb24gUHJlcGFyZVBhZ2UgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgYm9vbCBTZXF1ZW50aWFsRGVwZW5kZW5jaWVzU2NyaXB0TG9hZCB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBGdW5jPHN0cmluZz4gUmVkaXJlY3RSdWxlcyB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBGdW5jPGJvb2w+IEF1dG9FbmFibGVTcGFmQW5jaG9ycyB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBGdW5jPElFbnVtZXJhYmxlPHN0cmluZz4+IERlcGVuZGVuY2llc1NjcmlwdHMgeyBnZXQ7IHNldDsgfVxuICAgICAgIFxuICAgICAgICBwdWJsaWMgYm9vbCBGdWxsU2NyZWVuIHsgZ2V0OyBzZXQ7IH1cbiAgICB9XG5cbiAgICBcbn0iLCJ1c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5MaW5xO1xudXNpbmcgU3lzdGVtLlRleHQ7XG51c2luZyBCcmlkZ2UuSHRtbDU7XG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbi5Nb2RlbDtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgcHVibGljIGNsYXNzIFF1ZXJ5UGFyYW1ldGVyTmF2aWdhdGlvbkhpc3RvcnkgOiBJQnJvd3Nlckhpc3RvcnlNYW5hZ2VyXG4gICAge1xuICAgICAgICBwdWJsaWMgdm9pZCBQdXNoU3RhdGUoc3RyaW5nIHBhZ2VJZCwgRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycyA9IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBiYXNlVXJsID0gTmF2aWdhdGlvblV0aWxpdHkuQnVpbGRCYXNlVXJsKHBhZ2VJZCk7XG5cbiAgICAgICAgICAgIFdpbmRvdy5IaXN0b3J5LlB1c2hTdGF0ZShudWxsLCBzdHJpbmcuRW1wdHksXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVycyAhPSBudWxsXG4gICAgICAgICAgICAgICAgICAgID8gc3RyaW5nLkZvcm1hdChcInswfXsxfVwiLGJhc2VVcmwsQnVpbGRRdWVyeVBhcmFtZXRlcihwYXJhbWV0ZXJzKSk6IGJhc2VVcmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIFVybERlc2NyaXB0b3IgUGFyc2VVcmwoKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgcmVzID0gbmV3IFVybERlc2NyaXB0b3IoKTtcbiAgICAgICAgICAgIHJlcy5QYXJhbWV0ZXJzID0gbmV3IERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+KCk7XG5cbiAgICAgICAgICAgIHZhciBoYXNoID0gV2luZG93LkxvY2F0aW9uLkhhc2g7XG4gICAgICAgICAgICBoYXNoID0gaGFzaC5SZXBsYWNlKFwiI1wiLCBcIlwiKTtcblxuICAgICAgICAgICAgaWYgKHN0cmluZy5Jc051bGxPckVtcHR5KGhhc2gpKSByZXR1cm4gcmVzO1xuXG4gICAgICAgICAgICB2YXIgZXF1YWxJbmRleCA9IGhhc2guSW5kZXhPZignPycpO1xuICAgICAgICAgICAgaWYgKGVxdWFsSW5kZXggPT0gLTEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVzLlBhZ2VJZCA9IGhhc2g7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzLlBhZ2VJZCA9IGhhc2guU3Vic3RyaW5nKDAsIGVxdWFsSW5kZXgpOyAgXG5cbiAgICAgICAgICAgIHZhciBkb3VibGVQb2ludHNJbmR4ID0gZXF1YWxJbmRleCArIDE7XG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IGhhc2guU3Vic3RyaW5nKGRvdWJsZVBvaW50c0luZHgsIGhhc2guTGVuZ3RoIC0gZG91YmxlUG9pbnRzSW5keCk7XG5cbiAgICAgICAgICAgIGlmIChzdHJpbmcuSXNOdWxsT3JFbXB0eShwYXJhbWV0ZXJzKSkgcmV0dXJuIHJlczsgLy8gbm8gcGFyYW1ldGVyc1xuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzcGxpdHRlZEJ5RG91YmxlQW5kID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Ub0xpc3Q8c3RyaW5nPihwYXJhbWV0ZXJzLlNwbGl0KFwiJlwiKSk7XG4gICAgICAgICAgICBzcGxpdHRlZEJ5RG91YmxlQW5kLkZvckVhY2goKFN5c3RlbS5BY3Rpb248c3RyaW5nPikoZiA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBzcGxpdHRlZCA9IGYuU3BsaXQoXCI9XCIpO1xuICAgICAgICAgICAgICAgIHJlcy5QYXJhbWV0ZXJzLkFkZChzcGxpdHRlZFswXSxHbG9iYWwuRGVjb2RlVVJJQ29tcG9uZW50KHNwbGl0dGVkWzFdKSk7XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHN0cmluZyBCdWlsZFF1ZXJ5UGFyYW1ldGVyKERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJzID09IG51bGwgfHwgIVN5c3RlbS5MaW5xLkVudW1lcmFibGUuQW55PEtleVZhbHVlUGFpcjxzdHJpbmcsb2JqZWN0Pj4ocGFyYW1ldGVycykpIHJldHVybiBzdHJpbmcuRW1wdHk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzdHJCdWlsZGVyID0gbmV3IFN0cmluZ0J1aWxkZXIoXCI/XCIpO1xuICAgICAgICAgICAgZm9yZWFjaCAodmFyIGtleVZhbHVlUGFpciBpbiBwYXJhbWV0ZXJzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0ckJ1aWxkZXIuQXBwZW5kKEdsb2JhbC5FbmNvZGVVUklDb21wb25lbnQoa2V5VmFsdWVQYWlyLktleSkpO1xuICAgICAgICAgICAgICAgIHN0ckJ1aWxkZXIuQXBwZW5kKFwiPVwiKTtcbiAgICAgICAgICAgICAgICBzdHJCdWlsZGVyLkFwcGVuZChHbG9iYWwuRW5jb2RlVVJJQ29tcG9uZW50KGtleVZhbHVlUGFpci5WYWx1ZS5Ub1N0cmluZygpKSk7XG4gICAgICAgICAgICAgICAgc3RyQnVpbGRlci5BcHBlbmQoXCImXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVzID0gc3RyQnVpbGRlci5Ub1N0cmluZygpLlRyaW1FbmQoJyYnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHJlcztcblxuICAgICAgICB9XG5cbiAgICB9XG59IiwidXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIEJyaWRnZS5OYXZpZ2F0aW9uO1xyXG5cclxubmFtZXNwYWNlIEJyaWRnZS5TcGFmXHJcbntcclxuICAgIHB1YmxpYyBhYnN0cmFjdCBjbGFzcyBMb2FkYWJsZVZpZXdNb2RlbCA6IFZpZXdNb2RlbEJhc2UsIElBbUxvYWRhYmxlXHJcbiAgICB7XHJcbiAgICAgICAgcHJvdGVjdGVkIExpc3Q8SVZpZXdNb2RlbExpZmVDeWNsZT4gUGFydGlhbHMgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBPbkxvYWQoRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGJhc2UuQXBwbHlCaW5kaW5ncygpO1xyXG4gICAgICAgICAgICBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuVG9UZW1wKFwia2V5MVwiLHRoaXMuUGFydGlhbHMpIT1udWxsP2dsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tTGFtYmRhKCgpPT5nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbVRlbXA8TGlzdDxJVmlld01vZGVsTGlmZUN5Y2xlPj4oXCJrZXkxXCIpLkZvckVhY2goKFN5c3RlbS5BY3Rpb248SVZpZXdNb2RlbExpZmVDeWNsZT4pKGY9PiBmLkluaXQocGFyYW1ldGVycykpKSk6bnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgT25MZWF2ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuVG9UZW1wKFwia2V5MlwiLHRoaXMuUGFydGlhbHMpIT1udWxsP2dsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tTGFtYmRhKCgpPT5nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbVRlbXA8TGlzdDxJVmlld01vZGVsTGlmZUN5Y2xlPj4oXCJrZXkyXCIpLkZvckVhY2goKFN5c3RlbS5BY3Rpb248SVZpZXdNb2RlbExpZmVDeWNsZT4pKGY9PmYuRGVJbml0KCkpKSk6bnVsbDtcclxuICAgICAgICAgICAgYmFzZS5SZW1vdmVCaW5kaW5ncygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBPbkJlZm9yZUJpbmRpbmcoRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIE9uQmluZGluZ0RvbmUoRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG5cbiAgICBcbnByaXZhdGUgTGlzdDxJVmlld01vZGVsTGlmZUN5Y2xlPiBfX1Byb3BlcnR5X19Jbml0aWFsaXplcl9fUGFydGlhbHM9bmV3IExpc3Q8SVZpZXdNb2RlbExpZmVDeWNsZT4oKTt9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIEJyaWRnZS5qUXVlcnkyO1xudXNpbmcgUmV0eXBlZDtcblxubmFtZXNwYWNlIEJyaWRnZS5TcGFmXG57XG4gICAgcHVibGljIGFic3RyYWN0IGNsYXNzIFBhcnRpYWxNb2RlbCA6ICBJVmlld01vZGVsTGlmZUN5Y2xlXG4gICAge1xuICAgICAgICBwcml2YXRlIGRvbS5IVE1MRGl2RWxlbWVudCBfcGFydGlhbEVsZW1lbnQ7XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gRWxlbWVudCBpZCBvZiB0aGUgcGFnZSBcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxyZXR1cm5zPjwvcmV0dXJucz5cbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN0cmluZyBFbGVtZW50SWQoKTtcbiAgICAgICAgXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIEh0bWxMb2NhdGlvblxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc3RyaW5nIEh0bWxVcmwgeyBnZXQ7IH1cblxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIEluaXQgcGFydGlhbFxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwYXJhbWV0ZXJzXCI+ZGF0YSBmb3IgaW5pdCB0aGUgcGFydGlhbHM8L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIEluaXQoRGljdGlvbmFyeTxzdHJpbmcsb2JqZWN0PiBwYXJhbWV0ZXJzKVxuICAgICAgICB7XG5cbiAgICAgICAgICAgIGpRdWVyeS5HZXQodGhpcy5IdG1sVXJsLCBudWxsLCAoQWN0aW9uPG9iamVjdCxzdHJpbmcsanFYSFI+KSgobywgcywgYXJnMykgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLk9uQmVmb3JlQmluZGluZyhwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0aWFsRWxlbWVudCA9IG5ldyBkb20uSFRNTERpdkVsZW1lbnRcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlubmVySFRNTCA9IG8uVG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBkb20uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoRWxlbWVudElkKCkpO1xuICAgICAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQ8ZG9tLkhUTUxEaXZFbGVtZW50Pih0aGlzLl9wYXJ0aWFsRWxlbWVudCk7XG4gICAgICAgICAgICAgICAga25vY2tvdXQua28uYXBwbHlCaW5kaW5ncyh0aGlzLCB0aGlzLl9wYXJ0aWFsRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5PbkJpbmRpbmdEb25lKHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBDYWxsZWQgd2hlbiBodG1sIGlzIGxvYWRlZCBidXQga28gaXMgbm90IGJpbmRlZFxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwYXJhbWV0ZXJzXCI+PC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBPbkJlZm9yZUJpbmRpbmcoRGljdGlvbmFyeTxzdHJpbmcsb2JqZWN0PiBwYXJhbWV0ZXJzKXt9XG4gICAgICAgIFxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBDYWxsZWQgd2hlbiBodG1sIGlzIGxvYWRlZCBhbmQga28gaXMgYmluZGVkIFxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwYXJhbWV0ZXJzXCI+PC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBPbkJpbmRpbmdEb25lKERpY3Rpb25hcnk8c3RyaW5nLG9iamVjdD4gcGFyYW1ldGVycyl7fVxuXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgRGVJbml0KClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYga28gY29udGFpbnMgdGhpcyBub2RlXG4gICAgICAgICAgICBpZiAodGhpcy5fcGFydGlhbEVsZW1lbnQgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBrbm9ja291dC5rby5kYXRhRm9yKHRoaXMuX3BhcnRpYWxFbGVtZW50KTtcbiAgICAgICAgICAgIGlmIChkYXRhID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAga25vY2tvdXQua28ucmVtb3ZlTm9kZSh0aGlzLl9wYXJ0aWFsRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50ZXJmYWNlIElWaWV3TW9kZWxMaWZlQ3ljbGVcbiAgICB7XG4gICAgICAgIHZvaWQgSW5pdChEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKTtcbiAgICAgICAgdm9pZCBEZUluaXQoKTtcbiAgICB9XG59XG5cblxuXG4iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIEJyaWRnZS5IdG1sNTtcbnVzaW5nIEJyaWRnZS5OYXZpZ2F0aW9uLk1vZGVsO1xuXG5uYW1lc3BhY2UgQnJpZGdlLk5hdmlnYXRpb25cbntcbiAgICBwdWJsaWMgY2xhc3MgQnJpZGdlTmF2aWdhdG9yV2l0aFJvdXRpbmcgOiBCcmlkZ2VOYXZpZ2F0b3JcbiAgICB7XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgSUJyb3dzZXJIaXN0b3J5TWFuYWdlciBfYnJvd3Nlckhpc3RvcnlNYW5hZ2VyO1xuXG4gICAgICAgIHB1YmxpYyBCcmlkZ2VOYXZpZ2F0b3JXaXRoUm91dGluZyhJTmF2aWdhdG9yQ29uZmlndXJhdG9yIGNvbmZpZ3VyYXRpb24sIElCcm93c2VySGlzdG9yeU1hbmFnZXIgYnJvd3Nlckhpc3RvcnlNYW5hZ2VyKSA6IGJhc2UoY29uZmlndXJhdGlvbilcbiAgICAgICAge1xuICAgICAgICAgICAgX2Jyb3dzZXJIaXN0b3J5TWFuYWdlciA9IGJyb3dzZXJIaXN0b3J5TWFuYWdlcjtcbiAgICAgICAgICAgIFdpbmRvdy5PblBvcFN0YXRlICs9IGUgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgdXJsSW5mbyA9IF9icm93c2VySGlzdG9yeU1hbmFnZXIuUGFyc2VVcmwoKTtcbiAgICAgICAgICAgICAgICB0aGlzLk5hdmlnYXRlV2l0aG91dFB1c2hTdGF0ZShzdHJpbmcuSXNOdWxsT3JFbXB0eSh1cmxJbmZvLlBhZ2VJZCkgPyBjb25maWd1cmF0aW9uLkhvbWVJZCA6IHVybEluZm8uUGFnZUlkLCB1cmxJbmZvLlBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgdm9pZCBOYXZpZ2F0ZVdpdGhvdXRQdXNoU3RhdGUoc3RyaW5nIHBhZ2VJZCwgRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycyA9IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJhc2UuTmF2aWdhdGUocGFnZUlkLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBOYXZpZ2F0ZShzdHJpbmcgcGFnZUlkLCBEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzID0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgX2Jyb3dzZXJIaXN0b3J5TWFuYWdlci5QdXNoU3RhdGUocGFnZUlkLHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgYmFzZS5OYXZpZ2F0ZShwYWdlSWQsIHBhcmFtZXRlcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgSW5pdE5hdmlnYXRpb24oKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgcGFyc2VkID0gX2Jyb3dzZXJIaXN0b3J5TWFuYWdlci5QYXJzZVVybCgpO1xuXG4gICAgICAgICAgICBpZiAoc3RyaW5nLklzTnVsbE9yRW1wdHkocGFyc2VkLlBhZ2VJZCkpXG4gICAgICAgICAgICAgICAgYmFzZS5Jbml0TmF2aWdhdGlvbigpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJhc2UuRW5hYmxlU3BhZkFuY2hvcnMoKTtcblxuICAgICAgICAgICAgICAgIHZhciBwYWdlID0gdGhpcy5Db25maWd1cmF0aW9uLkdldFBhZ2VEZXNjcmlwdG9yQnlLZXkocGFyc2VkLlBhZ2VJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHBhZ2UgPT0gbnVsbCkgdGhyb3cgbmV3IEV4Y2VwdGlvbihzdHJpbmcuRm9ybWF0KFwiUGFnZSBub3QgZm91bmQgd2l0aCBJRCB7MH1cIixwYXJzZWQuUGFnZUlkKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBub3QgbnVsbCBhbmQgZXZhbHVhdGlvbiBpcyBmYWxzZSBmYWxsYmFjayB0byBob21lXG4gICAgICAgICAgICAgICAgaWYgKHBhZ2UuQ2FuQmVEaXJlY3RMb2FkICE9IG51bGwgJiYgIXBhZ2UuQ2FuQmVEaXJlY3RMb2FkLkludm9rZSgpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgX2Jyb3dzZXJIaXN0b3J5TWFuYWdlci5QdXNoU3RhdGUodGhpcy5Db25maWd1cmF0aW9uLkhvbWVJZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTmF2aWdhdGVXaXRob3V0UHVzaFN0YXRlKHRoaXMuQ29uZmlndXJhdGlvbi5Ib21lSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTmF2aWdhdGUocGFyc2VkLlBhZ2VJZCxwYXJzZWQuUGFyYW1ldGVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBcbiAgICAgXG4gICAgICAgIFxuICAgIH1cbn0iLCJ1c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgQnJpZGdlLmpRdWVyeTI7XHJcbnVzaW5nIEJyaWRnZS5OYXZpZ2F0aW9uO1xyXG51c2luZyBCcmlkZ2UuU3BhZi5WaWV3TW9kZWxzO1xyXG5cclxubmFtZXNwYWNlIEJyaWRnZS5TcGFmXHJcbntcclxuICAgIGNsYXNzIEN1c3RvbVJvdXRlc0NvbmZpZyA6IEJyaWRnZU5hdmlnYXRvckNvbmZpZ0Jhc2VcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgSUxpc3Q8SVBhZ2VEZXNjcmlwdG9yPiBDcmVhdGVSb3V0ZXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5DYWxsRm9yKG5ldyBMaXN0PElQYWdlRGVzY3JpcHRvcj4oKSwoX28xKT0+e19vMS5BZGQobmV3IFBhZ2VEZXNjcmlwdG9yXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2FuQmVEaXJlY3RMb2FkID0gKCk9PnRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgSHRtbExvY2F0aW9uID0gKCk9PlwicGFnZXMvaG9tZS5odG1sXCIsIC8vIHlvdXQgaHRtbCBsb2NhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIEtleSA9IFNwYWZBcHAuSG9tZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgIFBhZ2VDb250cm9sbGVyID0gKCkgPT4gU3BhZkFwcC5Db250YWluZXIuUmVzb2x2ZTxIb21lVmlld01vZGVsPigpXHJcbiAgICAgICAgICAgICAgICB9KTtfbzEuQWRkKG5ldyBQYWdlRGVzY3JpcHRvclxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENhbkJlRGlyZWN0TG9hZCA9ICgpPT50cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIEh0bWxMb2NhdGlvbiA9ICgpPT5cInBhZ2VzL3NlY29uZC5odG1sXCIsIC8vIHlvdXQgaHRtbCBsb2NhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIEtleSA9IFNwYWZBcHAuU2Vjb25kSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgUGFnZUNvbnRyb2xsZXIgPSAoKSA9PiBTcGFmQXBwLkNvbnRhaW5lci5SZXNvbHZlPFNlY29uZFZpZXdNb2RlbD4oKVxyXG4gICAgICAgICAgICAgICAgfSk7cmV0dXJuIF9vMTt9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBib29sIERpc2FibGVBdXRvU3BhZkFuY2hvcnNPbk5hdmlnYXRlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIGpRdWVyeSBCb2R5IHsgZ2V0OyBwcml2YXRlIHNldDsgfVxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIEhvbWVJZCB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cblxuICAgIFxucHJpdmF0ZSBib29sIF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19EaXNhYmxlQXV0b1NwYWZBbmNob3JzT25OYXZpZ2F0ZT10cnVlO3ByaXZhdGUgalF1ZXJ5IF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19Cb2R5PWpRdWVyeS5TZWxlY3QoXCIjcGFnZUJvZHlcIik7cHJpdmF0ZSBzdHJpbmcgX19Qcm9wZXJ0eV9fSW5pdGlhbGl6ZXJfX0hvbWVJZD1TcGFmQXBwLkhvbWVJZDt9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBCcmlkZ2UuSHRtbDU7XG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbjtcblxubmFtZXNwYWNlIEJyaWRnZS5TcGFmLlZpZXdNb2RlbHNcbntcbiAgICBwdWJsaWMgY2xhc3MgSG9tZVZpZXdNb2RlbCA6IExvYWRhYmxlVmlld01vZGVsXG4gICAge1xuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IElOYXZpZ2F0b3IgX25hdmlnYXRvcjtcbnB1YmxpYyBvdmVycmlkZSBzdHJpbmcgRWxlbWVudElkKClcclxue1xyXG4gICAgcmV0dXJuIFNwYWZBcHAuSG9tZUlkO1xyXG59XG4gICAgICAgIHB1YmxpYyBzdHJpbmcgVGVzdCB7IGdldDsgc2V0OyB9XG5cbiAgICAgICAgcHVibGljIEhvbWVWaWV3TW9kZWwoSU5hdmlnYXRvciBuYXZpZ2F0b3IpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX25hdmlnYXRvciA9IG5hdmlnYXRvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIE9uQmVmb3JlQmluZGluZyhEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLlRlc3QgPSBcIkFudGFuaSFcIjtcbiAgICAgICAgICAgIGJhc2UuT25CZWZvcmVCaW5kaW5nKHBhcmFtZXRlcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgT25CaW5kaW5nRG9uZShEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICBiYXNlLk9uQmluZGluZ0RvbmUocGFyYW1ldGVycyk7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIkJpbmRpbmcgRG9uZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIFNheUhlbGxvSnMoKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcImhlbGxvXCIpO1xuXG4gICAgICAgICAgICBHbG9iYWwuQWxlcnQoXCJIZWxsbyFcIik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBHb1RvUGFnZTIoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9uYXZpZ2F0b3IuTmF2aWdhdGUoU3BhZkFwcC5TZWNvbmRJZCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBCcmlkZ2UuSHRtbDU7XG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbjtcblxubmFtZXNwYWNlIEJyaWRnZS5TcGFmLlZpZXdNb2RlbHNcbntcbiAgICBwdWJsaWMgY2xhc3MgU2Vjb25kVmlld01vZGVsIDogTG9hZGFibGVWaWV3TW9kZWxcbiAgICB7XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgSU5hdmlnYXRvciBfbmF2aWdhdG9yO1xucHVibGljIG92ZXJyaWRlIHN0cmluZyBFbGVtZW50SWQoKVxyXG57XHJcbiAgICByZXR1cm4gU3BhZkFwcC5TZWNvbmRJZDtcclxufVxuICAgICAgICBwdWJsaWMgU2Vjb25kVmlld01vZGVsKElOYXZpZ2F0b3IgbmF2aWdhdG9yKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9uYXZpZ2F0b3IgPSBuYXZpZ2F0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBPbkJpbmRpbmdEb25lKERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiV2VsY29tZSFcIik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBCYWNrVG9Ib21lKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fbmF2aWdhdG9yLk5hdmlnYXRlKFNwYWZBcHAuSG9tZUlkKTtcbiAgICAgICAgfVxuICAgIH1cbn0iXQp9Cg==
