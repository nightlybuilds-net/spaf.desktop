/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2020
 * @compiler Bridge.NET 17.10.1
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
                var sockettone = new spaf.desktop.Sockettone();

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJzcGFmLmRlc2t0b3Auc3BhZmFwcC5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiU3BhZi9OYXZpZ2F0aW9uL05hdmlnYXRpb25VdGlsaXR5LmNzIiwiU3BhZi9OYXZpZ2F0aW9uL1V0aWxpdHkuY3MiLCJTcGFmL1ZpZXdNb2RlbEJhc2UuY3MiLCJTcGFmQXBwLmNzIiwiU3BhZi9Jb2MvQnJpZGdlSW9jLmNzIiwiU3BhZi9Jb2MvUmVzb2x2ZXJzL0Z1bmNSZXNvbHZlci5jcyIsIlNwYWYvSW9jL1Jlc29sdmVycy9JbnN0YW5jZVJlc29sdmVyLmNzIiwiU3BhZi9Jb2MvUmVzb2x2ZXJzL1NpbmdsZUluc3RhbmNlUmVzb2x2ZXIuY3MiLCJTcGFmL0lvYy9SZXNvbHZlcnMvVHJhbnNpZW50UmVzb2x2ZXIuY3MiLCJTcGFmL01lc3Nlbmdlci9NZXNzZW5nZXIuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9CcmlkZ2VOYXZpZ2F0b3IuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9CcmlkZ2VOYXZpZ2F0b3JDb25maWdCYXNlLmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvQ29tcGxleE9iamVjdE5hdmlnYXRpb25IaXN0b3J5LmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvUGFnZURlc2NyaXB0b3IuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9RdWVyeVBhcmFtZXRlck5hdmlnYXRpb25IaXN0b3J5LmNzIiwiU3BhZi9Mb2FkYWJsZVZpZXdNb2RlbC5jcyIsIlNwYWYvUGFydGlhbE1vZGVsLmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvQnJpZGdlTmF2aWdhdG9yV2l0aFJvdXRpbmcuY3MiLCJDdXN0b21Sb3V0ZXNDb25maWcuY3MiLCJWaWV3TW9kZWxzL0hvbWVWaWV3TW9kZWwuY3MiLCJWaWV3TW9kZWxzL1NlY29uZFZpZXdNb2RlbC5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7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QUEsc0RBQXlCQTs7Ozs7Ozs7Ozs7OzRCQy9CTkE7OztnQkFFbkJBLGtCQUFrQkE7Ozs7O2dCQUoxQkEsT0FBT0E7O3FDQU9nQ0E7Z0JBRS9CQTs7O2dCQUtBQSxzREFBeUJBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgQnJpZGdlLkh0bWw1O1xuXG5uYW1lc3BhY2UgQnJpZGdlLk5hdmlnYXRpb25cbntcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIE5hdmlnYXRpb25VdGlsaXR5XG4gICAge1xuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBEZWZpbmUgdmlydHVhbCBkaXJlY3RvcnkgZm9yIHNvbWV0aGluZyBsaWtlOlxuICAgICAgICAvLy8gcHJvdG9jb2w6Ly9hd2Vzb21lc2l0ZS5pby9zb21lZGlyZWN0b3J5XG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIFZpcnR1YWxEaXJlY3RvcnkgPSBudWxsO1xuXG4gICAgICAgXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIEdldCBwYXJhbWV0ZXIga2V5IGZyb20gcGFyYW1ldGVycyBkaWN0aW9uYXJ5XG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUXCI+PC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhcmFtZXRlcnNcIj48L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwYXJhbUtleVwiPjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cmV0dXJucz48L3JldHVybnM+XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVCBHZXRQYXJhbWV0ZXI8VD4odGhpcyBEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzLCBzdHJpbmcgcGFyYW1LZXkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJzID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlBhcmFtZXRlcnMgaXMgbnVsbCFcIik7XG5cbiAgICAgICAgICAgIGlmICghcGFyYW1ldGVycy5Db250YWluc0tleShwYXJhbUtleSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihzdHJpbmcuRm9ybWF0KFwiTm8gcGFyYW1ldGVyIHdpdGgga2V5IHswfSBmb3VuZCFcIixwYXJhbUtleSkpO1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbWV0ZXJzW3BhcmFtS2V5XTtcblxuICAgICAgICAgICAgaWYgKCEodmFsdWUgaXMgc3RyaW5nKSkgcmV0dXJuIChUKSB2YWx1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHBhcnNlTWV0aG9kID0gdHlwZW9mKFQpLkdldE1ldGhvZChcIlBhcnNlXCIsIG5ldyBUeXBlW10geyB0eXBlb2Yoc3RyaW5nKSB9ICk7XG5cbiAgICAgICAgICAgIGlmIChwYXJzZU1ldGhvZCAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiAoVClwYXJzZU1ldGhvZC5JbnZva2UobnVsbCwgbmV3IG9iamVjdFtdIHsgdmFsdWUgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiAoVCkgdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIEJ1aWxkIGJhc2UgdXJsIHVzaW5nIHBhZ2UgaWQgYW5kIHZpcnR1YWwgZGlyZWN0b3J5XG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhZ2VJZFwiPjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cmV0dXJucz48L3JldHVybnM+XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEJ1aWxkQmFzZVVybChzdHJpbmcgcGFnZUlkKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYmFzZVVybCA9IHN0cmluZy5Gb3JtYXQoXCJ7MH0vL3sxfVwiLFdpbmRvdy5Mb2NhdGlvbi5Qcm90b2NvbCxXaW5kb3cuTG9jYXRpb24uSG9zdCk7XG4gICAgICAgICAgICBiYXNlVXJsID0gc3RyaW5nLklzTnVsbE9yRW1wdHkoVmlydHVhbERpcmVjdG9yeSlcbiAgICAgICAgICAgICAgICA/IHN0cmluZy5Gb3JtYXQoXCJ7MH0jezF9XCIsYmFzZVVybCxwYWdlSWQpICAgICAgICAgICAgICAgIDogc3RyaW5nLkZvcm1hdChcInswfS97MX0jezJ9XCIsYmFzZVVybCxWaXJ0dWFsRGlyZWN0b3J5LHBhZ2VJZCk7XG4gICAgICAgICAgICByZXR1cm4gYmFzZVVybDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLkxpbnE7XG51c2luZyBCcmlkZ2UualF1ZXJ5MjtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBVdGlsaXR5XG4gICAge1xuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBMb2FkIHNjcmlwdCBzZXF1ZW50aWFsbHlcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic2NyaXB0c1wiPjwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTZXF1ZW50aWFsU2NyaXB0TG9hZChMaXN0PHN0cmluZz4gc2NyaXB0cylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCFTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkFueTxzdHJpbmc+KHNjcmlwdHMpKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgdG9Mb2FkID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdDxzdHJpbmc+KHNjcmlwdHMpO1xuICAgICAgICAgICAgalF1ZXJ5LkdldFNjcmlwdCh0b0xvYWQsIChTeXN0ZW0uQWN0aW9uPG9iamVjdCxzdHJpbmcsanFYSFI+KSgobywgcywgYXJnMykgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzY3JpcHRzLlJlbW92ZSh0b0xvYWQpO1xuICAgICAgICAgICAgICAgIFNlcXVlbnRpYWxTY3JpcHRMb2FkKHNjcmlwdHMpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufSIsInVzaW5nIFJldHlwZWQ7XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLlNwYWZcclxue1xyXG4gICAgcHVibGljIGFic3RyYWN0IGNsYXNzIFZpZXdNb2RlbEJhc2VcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIGRvbS5IVE1MRWxlbWVudCBfcGFnZU5vZGU7XHJcblxyXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cclxuICAgICAgICAvLy8gRWxlbWVudCBpZCBvZiB0aGUgcGFnZSBcclxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgICAgIC8vLyA8cmV0dXJucz48L3JldHVybnM+XHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN0cmluZyBFbGVtZW50SWQoKTtcclxucHVibGljIGRvbS5IVE1MRWxlbWVudCBQYWdlTm9kZVxyXG57XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gX3BhZ2VOb2RlID8/ICh0aGlzLl9wYWdlTm9kZSA9IGRvbS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChFbGVtZW50SWQoKSkpO1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgcHVibGljIHZvaWQgQXBwbHlCaW5kaW5ncygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBrbm9ja291dC5rby5hcHBseUJpbmRpbmdzKHRoaXMsIHRoaXMuUGFnZU5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVtb3ZlQmluZGluZ3MoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAga25vY2tvdXQua28ucmVtb3ZlTm9kZSh0aGlzLlBhZ2VOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlJlZmxlY3Rpb247XHJcbnVzaW5nIEJyaWRnZTtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBCcmlkZ2UuSW9jO1xyXG51c2luZyBCcmlkZ2UuTWVzc2VuZ2VyO1xyXG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbjtcclxudXNpbmcgQnJpZGdlLlNwYWYuQXR0cmlidXRlcztcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuU3BhZlxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU3BhZkFwcFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgSUlvYyBDb250YWluZXI7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENvbnRhaW5lciA9IG5ldyBCcmlkZ2VJb2MoKTtcclxuICAgICAgICAgICAgQ29udGFpbmVyQ29uZmlnKCk7IC8vIGNvbmZpZyBjb250YWluZXJcclxuICAgICAgICAgICAgQ29udGFpbmVyLlJlc29sdmU8SU5hdmlnYXRvcj4oKS5Jbml0TmF2aWdhdGlvbigpOyAvLyBpbml0IG5hdmlnYXRpb25cclxuXHJcbiAgICAgICAgICAgIFdpbmRvdy5PbkVycm9yID0gKG1lc3NhZ2UsIHVybCwgbnVtYmVyLCBjb2x1bW5OdW1iZXIsIGVycm9yKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBDb250YWluZXJDb25maWcoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gbmF2aWdhdG9yXHJcbiAgICAgICAgICAgIENvbnRhaW5lci5SZWdpc3RlclNpbmdsZUluc3RhbmNlPElOYXZpZ2F0b3IsIEJyaWRnZU5hdmlnYXRvcldpdGhSb3V0aW5nPigpO1xyXG4gICAgICAgICAgICBDb250YWluZXIuUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZTxJQnJvd3Nlckhpc3RvcnlNYW5hZ2VyLCBRdWVyeVBhcmFtZXRlck5hdmlnYXRpb25IaXN0b3J5PigpO1xyXG4vLyAgICAgICAgICAgIENvbnRhaW5lci5SZWdpc3RlclNpbmdsZUluc3RhbmNlPElCcm93c2VySGlzdG9yeU1hbmFnZXIsIENvbXBsZXhPYmplY3ROYXZpZ2F0aW9uSGlzdG9yeT4oKTsgLy8gaWYgeW91IGRvbid0IG5lZWQgcXVlcnkgcGFyYW1ldGVyc1xyXG4gICAgICAgICAgICBDb250YWluZXIuUmVnaXN0ZXI8SU5hdmlnYXRvckNvbmZpZ3VyYXRvciwgQ3VzdG9tUm91dGVzQ29uZmlnPigpOyBcclxuXHJcbiAgICAgICAgICAgIC8vIG1lc3NlbmdlclxyXG4gICAgICAgICAgICBDb250YWluZXIuUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZTxJTWVzc2VuZ2VyLCBNZXNzZW5nZXIuTWVzc2VuZ2VyPigpO1xyXG5cclxuICAgICAgICAgICAgLy8gdmlld21vZGVsc1xyXG4gICAgICAgICAgICBSZWdpc3RlckFsbFZpZXdNb2RlbHMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlZ2lzdGVyIGN1c3RvbSByZXNvdXJjZSwgc2VydmljZXMuLlxyXG5cclxuICAgICAgICB9XHJcbiNyZWdpb24gUEFHRVMgSURTXHJcbi8vIHN0YXRpYyBwYWdlcyBpZFxyXG5wdWJsaWMgc3RhdGljIHN0cmluZyBIb21lSWRcclxue1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFwiaG9tZVwiO1xyXG4gICAgfVxyXG59cHVibGljIHN0YXRpYyBzdHJpbmcgU2Vjb25kSWRcclxue1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFwic2Vjb25kXCI7XHJcbiAgICB9XHJcbn0gICAgICAgXHJcbiAgICAgICAgI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAjcmVnaW9uIE1FU1NBR0VTXHJcbiAgICAgICAgLy8gbWVzc2VuZ2VyIGhlbHBlciBmb3IgZ2xvYmFsIG1lc3NhZ2VzIGFuZCBtZXNzYWdlcyBpZHNcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjbGFzcyBNZXNzYWdlc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcHVibGljIGNsYXNzIEdsb2JhbFNlbmRlciB7IH07XHJcblxyXG4gICAgICAgICAgICBwdWJsaWMgc3RhdGljIEdsb2JhbFNlbmRlciBTZW5kZXIgPSBuZXcgR2xvYmFsU2VuZGVyKCk7XHJcbnB1YmxpYyBzdGF0aWMgc3RyaW5nIExvZ2luRG9uZVxyXG57XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gXCJMb2dpbkRvbmVcIjtcclxuICAgIH1cclxufVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxyXG4gICAgICAgIC8vLyBSZWdpc3RlciBhbGwgdHlwZXMgdGhhdCBlbmQgd2l0aCBcInZpZXdtb2RlbFwiLlxyXG4gICAgICAgIC8vLyBZb3UgY2FuIHJlZ2lzdGVyIGEgdmlld21vZGUgYXMgU2luZ2xyIEluc3RhbmNlIGFkZGluZyBcIlNpbmdsZUluc3RhbmNlQXR0cmlidXRlXCIgdG8gdGhlIGNsYXNzXHJcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFJlZ2lzdGVyQWxsVmlld01vZGVscygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgdHlwZXMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlNlbGVjdE1hbnk8QXNzZW1ibHksVHlwZT4oQXBwRG9tYWluLkN1cnJlbnREb21haW4uR2V0QXNzZW1ibGllcygpLChGdW5jPEFzc2VtYmx5LFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljLklFbnVtZXJhYmxlPFR5cGU+PikocyA9PiBzLkdldFR5cGVzKCkpKVxyXG4gICAgICAgICAgICAgICAgLldoZXJlKChGdW5jPFR5cGUsYm9vbD4pKHcgPT4gdy5OYW1lLlRvTG93ZXIoKS5FbmRzV2l0aChcInZpZXdtb2RlbFwiKSkpLlRvTGlzdCgpO1xyXG5cclxuICAgICAgICAgICAgdHlwZXMuRm9yRWFjaCgoQWN0aW9uPFR5cGU+KShmID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBhdHRyaWJ1dGVzID0gZi5HZXRDdXN0b21BdHRyaWJ1dGVzKHR5cGVvZihTaW5nbGVJbnN0YW5jZUF0dHJpYnV0ZSksIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkFueTxvYmplY3Q+KGF0dHJpYnV0ZXMpKVxyXG4gICAgICAgICAgICAgICAgICAgIENvbnRhaW5lci5SZWdpc3RlclNpbmdsZUluc3RhbmNlKGYpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIENvbnRhaW5lci5SZWdpc3RlcihmKTtcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuSW9jXHJcbntcclxuICAgIC8vLyA8c3VtbWFyeT5cclxuICAgIC8vLyBJbXBsZW1lbnRhdGlvbiBvZiBJSW9jXHJcbiAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgcHVibGljIGNsYXNzIEJyaWRnZUlvYyA6IElJb2NcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IERpY3Rpb25hcnk8VHlwZSwgSVJlc29sdmVyPiBfcmVzb2x2ZXJzID0gbmV3IERpY3Rpb25hcnk8VHlwZSwgSVJlc29sdmVyPigpO1xyXG5cclxuICAgICAgICAjcmVnaW9uIFJFR0lTVFJBVElPTlxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlcihUeXBlIHR5cGUsIElSZXNvbHZlciByZXNvbHZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrQWxyZWFkeUFkZGVkKHR5cGUpO1xyXG4gICAgICAgICAgICBfcmVzb2x2ZXJzLkFkZCh0eXBlLCByZXNvbHZlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlcihUeXBlIHR5cGUsIFR5cGUgaW1wbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrQWxyZWFkeUFkZGVkKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc29sdmVyID0gbmV3IFRyYW5zaWVudFJlc29sdmVyKHRoaXMsIGltcGwpO1xyXG4gICAgICAgICAgICBfcmVzb2x2ZXJzLkFkZCh0eXBlLCByZXNvbHZlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlcjxUVHlwZSwgVEltcGxlbWVudGF0aW9uPigpIHdoZXJlIFRJbXBsZW1lbnRhdGlvbiA6IGNsYXNzLCBUVHlwZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVnaXN0ZXIodHlwZW9mKFRUeXBlKSwgdHlwZW9mKFRJbXBsZW1lbnRhdGlvbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXIoVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVnaXN0ZXIodHlwZSwgdHlwZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlcjxUVHlwZT4oKSB3aGVyZSBUVHlwZSA6IGNsYXNzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWdpc3Rlcih0eXBlb2YoVFR5cGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyU2luZ2xlSW5zdGFuY2UoVHlwZSB0eXBlLCBUeXBlIGltcGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja0FscmVhZHlBZGRlZCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNvbHZlciA9IG5ldyBTaW5nbGVJbnN0YW5jZVJlc29sdmVyKHRoaXMsIGltcGwpO1xyXG4gICAgICAgICAgICBfcmVzb2x2ZXJzLkFkZCh0eXBlLCByZXNvbHZlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlclNpbmdsZUluc3RhbmNlPFRUeXBlLCBUSW1wbGVtZW50YXRpb24+KCkgd2hlcmUgVEltcGxlbWVudGF0aW9uIDogY2xhc3MsIFRUeXBlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWdpc3RlclNpbmdsZUluc3RhbmNlKHR5cGVvZihUVHlwZSksIHR5cGVvZihUSW1wbGVtZW50YXRpb24pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyU2luZ2xlSW5zdGFuY2UoVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZSh0eXBlLCB0eXBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyU2luZ2xlSW5zdGFuY2U8VFR5cGU+KCkgd2hlcmUgVFR5cGUgOiBjbGFzc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZSh0eXBlb2YoVFR5cGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyRnVuYzxUVHlwZT4oRnVuYzxUVHlwZT4gZnVuYylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrQWxyZWFkeUFkZGVkPFRUeXBlPigpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc29sdmVyID0gbmV3IEZ1bmNSZXNvbHZlcjxUVHlwZT4oZnVuYyk7XHJcbiAgICAgICAgICAgIF9yZXNvbHZlcnMuQWRkKHR5cGVvZihUVHlwZSksIHJlc29sdmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVySW5zdGFuY2UoVHlwZSB0eXBlLCBvYmplY3QgaW5zdGFuY2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja0FscmVhZHlBZGRlZCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNvbHZlciA9IG5ldyBJbnN0YW5jZVJlc29sdmVyKGluc3RhbmNlKTtcclxuICAgICAgICAgICAgX3Jlc29sdmVycy5BZGQodHlwZSwgcmVzb2x2ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXJJbnN0YW5jZShvYmplY3QgaW5zdGFuY2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWdpc3Rlckluc3RhbmNlKGluc3RhbmNlLkdldFR5cGUoKSwgaW5zdGFuY2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXJJbnN0YW5jZTxUVHlwZT4oVFR5cGUgaW5zdGFuY2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWdpc3Rlckluc3RhbmNlKHR5cGVvZihUVHlwZSksIGluc3RhbmNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgI2VuZHJlZ2lvblxyXG5cclxuXHJcbiAgICAgICAgI3JlZ2lvbiBSRVNPTFZFXHJcbiAgICAgICAgcHVibGljIFRUeXBlIFJlc29sdmU8VFR5cGU+KCkgd2hlcmUgVFR5cGUgOiBjbGFzc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tOb3RSZWdpc3RlcmVkPFRUeXBlPigpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc29sdmVyID0gX3Jlc29sdmVyc1t0eXBlb2YoVFR5cGUpXTtcclxuICAgICAgICAgICAgcmV0dXJuIChUVHlwZSlyZXNvbHZlci5SZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb2JqZWN0IFJlc29sdmUoVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tOb3RSZWdpc3RlcmVkKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc29sdmVyID0gX3Jlc29sdmVyc1t0eXBlXTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVyLlJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgI2VuZHJlZ2lvblxyXG5cclxuXHJcbiAgICAgICAgI3JlZ2lvbiBQUklWQVRFXHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDaGVja0FscmVhZHlBZGRlZChUeXBlIHR5cGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoX3Jlc29sdmVycy5Db250YWluc0tleSh0eXBlKSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oc3RyaW5nLkZvcm1hdChcInswfSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQhXCIsdHlwZS5GdWxsTmFtZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENoZWNrQWxyZWFkeUFkZGVkPFRUeXBlPigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja0FscmVhZHlBZGRlZCh0eXBlb2YoVFR5cGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDaGVja05vdFJlZ2lzdGVyZWQoVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCFfcmVzb2x2ZXJzLkNvbnRhaW5zS2V5KHR5cGUpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihzdHJpbmcuRm9ybWF0KFwiQ2Fubm90IHJlc29sdmUgezB9LCBpdCdzIG5vdCByZWdpc3RlcmVkIVwiLHR5cGUuRnVsbE5hbWUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDaGVja05vdFJlZ2lzdGVyZWQ8VFR5cGU+KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrTm90UmVnaXN0ZXJlZCh0eXBlb2YoVFR5cGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICNlbmRyZWdpb25cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuSW9jXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBGdW5jUmVzb2x2ZXI8VD4gOiBJUmVzb2x2ZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgRnVuYzxvYmplY3Q+IFJlc29sdmUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgRnVuY1Jlc29sdmVyKEZ1bmM8VD4gcmVzb2x2ZUZ1bmMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLlJlc29sdmUgPSAoKSA9PiByZXNvbHZlRnVuYygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuSW9jXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBJbnN0YW5jZVJlc29sdmVyIDogSVJlc29sdmVyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEZ1bmM8b2JqZWN0PiBSZXNvbHZlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIEluc3RhbmNlUmVzb2x2ZXIob2JqZWN0IHJlc29sdmVkT2JqKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVzb2x2ZSA9ICgpID0+IHJlc29sdmVkT2JqO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xhc3MgSW5zdGFuY2VSZXNvbHZlcjxUPiA6IEluc3RhbmNlUmVzb2x2ZXJcclxuICAgIHtcclxuXHJcbiAgICAgICAgcHVibGljIEluc3RhbmNlUmVzb2x2ZXIoVCByZXNvbHZlZE9iaikgOiBiYXNlKHJlc29sdmVkT2JqKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwidXNpbmcgU3lzdGVtO1xyXG5cclxubmFtZXNwYWNlIEJyaWRnZS5Jb2Ncclxue1xyXG4gICAgcHVibGljIGNsYXNzIFNpbmdsZUluc3RhbmNlUmVzb2x2ZXIgOiBJUmVzb2x2ZXJcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIG9iamVjdCBfc2luZ2xlSW5zdGFuY2U7XHJcblxyXG4gICAgICAgIHB1YmxpYyBGdW5jPG9iamVjdD4gUmVzb2x2ZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBTaW5nbGVJbnN0YW5jZVJlc29sdmVyKElJb2MgaW9jLCBUeXBlIHR5cGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZXNvbHZlID0gKCkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgcmVzb2x2ZS4gVXNpbmcgdHJhbnNpZW50IHJlc29sdmVyXHJcbiAgICAgICAgICAgICAgICBpZiAoX3NpbmdsZUluc3RhbmNlID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zaWVudFJlc29sdmVyID0gbmV3IFRyYW5zaWVudFJlc29sdmVyKGlvYywgdHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3NpbmdsZUluc3RhbmNlID0gdHJhbnNpZW50UmVzb2x2ZXIuUmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBfc2luZ2xlSW5zdGFuY2U7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGFzcyBTaW5nbGVJbnN0YW5jZVJlc29sdmVyPFQ+IDogU2luZ2xlSW5zdGFuY2VSZXNvbHZlclxyXG4gICAge1xyXG5cclxuICAgICAgICBwdWJsaWMgU2luZ2xlSW5zdGFuY2VSZXNvbHZlcihJSW9jIGlvYykgOiBiYXNlKGlvYywgdHlwZW9mKFQpKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59IiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLklvY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgVHJhbnNpZW50UmVzb2x2ZXIgOiBJUmVzb2x2ZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgRnVuYzxvYmplY3Q+IFJlc29sdmUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgVHJhbnNpZW50UmVzb2x2ZXIoSUlvYyBpb2MsIFR5cGUgdG9yZXNvbHZlVHlwZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuUmVzb2x2ZSA9ICgpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIGdldCBjdG9yXHJcbiAgICAgICAgICAgICAgICB2YXIgY3RvciA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuRmlyc3RPckRlZmF1bHQ8U3lzdGVtLlJlZmxlY3Rpb24uQ29uc3RydWN0b3JJbmZvPih0b3Jlc29sdmVUeXBlLkdldENvbnN0cnVjdG9ycygpKTtcclxuICAgICAgICAgICAgICAgIGlmIChjdG9yID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihzdHJpbmcuRm9ybWF0KFwiTm8gY3RvciBmb3VuZCBmb3IgdHlwZSB7MH0hXCIsdG9yZXNvbHZlVHlwZS5GdWxsTmFtZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGdldCBjdG9yIHBhcmFtc1xyXG4gICAgICAgICAgICAgICAgdmFyIGN0b3JQYXJhbXMgPSBjdG9yLkdldFBhcmFtZXRlcnMoKTtcclxuICAgICAgICAgICAgICAgIGlmICghU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Bbnk8U3lzdGVtLlJlZmxlY3Rpb24uUGFyYW1ldGVySW5mbz4oY3RvclBhcmFtcykpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEFjdGl2YXRvci5DcmVhdGVJbnN0YW5jZSh0b3Jlc29sdmVUeXBlKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyByZWN1cnNpdmUgcmVzb2x2ZVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gbmV3IExpc3Q8b2JqZWN0PihjdG9yUGFyYW1zLkxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKHZhciBwYXJhbWV0ZXJJbmZvIGluIGN0b3JQYXJhbXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuQWRkKGlvYy5SZXNvbHZlKHBhcmFtZXRlckluZm8uUGFyYW1ldGVyVHlwZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3Rvci5JbnZva2UocGFyYW1ldGVycy5Ub0FycmF5KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xhc3MgVHJhbnNpZW50UmVzb2x2ZXI8VD4gOiBUcmFuc2llbnRSZXNvbHZlclxyXG4gICAge1xyXG5cclxuICAgICAgICBwdWJsaWMgVHJhbnNpZW50UmVzb2x2ZXIoSUlvYyBpb2MpIDogYmFzZShpb2MsIHR5cGVvZihUKSlcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5MaW5xO1xudXNpbmcgU3lzdGVtLlRleHQ7XG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xuXG5uYW1lc3BhY2UgQnJpZGdlLk1lc3Nlbmdlclxue1xuICAgIHB1YmxpYyBjbGFzcyBNZXNzZW5nZXIgOiBJTWVzc2VuZ2VyXG4gICAge1xuICAgICAgICBwcml2YXRlIHJlYWRvbmx5XG4gICAgICAgICAgICBEaWN0aW9uYXJ5PFR1cGxlPHN0cmluZywgVHlwZSwgVHlwZT4sIExpc3Q8VHVwbGU8b2JqZWN0LCBBY3Rpb248b2JqZWN0LCBvYmplY3Q+Pj4+IF9jYWxscyA9XG4gICAgICAgICAgICAgICAgbmV3IERpY3Rpb25hcnk8VHVwbGU8c3RyaW5nLCBUeXBlLCBUeXBlPiwgTGlzdDxUdXBsZTxvYmplY3QsIEFjdGlvbjxvYmplY3QsIG9iamVjdD4+Pj4oKTtcblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBTZW5kIE1lc3NhZ2Ugd2l0aCBhcmdzXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUU2VuZGVyXCI+VFNlbmRlcjwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVEFyZ3NcIj5UTWVzc2FnZUFyZ3M8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic2VuZGVyXCI+U2VuZGVyPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwibWVzc2FnZVwiPk1lc3NhZ2U8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJhcmdzXCI+QXJnczwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2b2lkIFNlbmQ8VFNlbmRlciwgVEFyZ3M+KFRTZW5kZXIgc2VuZGVyLCBzdHJpbmcgbWVzc2FnZSwgVEFyZ3MgYXJncykgd2hlcmUgVFNlbmRlciA6IGNsYXNzXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChzZW5kZXIgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwic2VuZGVyXCIpO1xuICAgICAgICAgICAgdGhpcy5Jbm5lclNlbmQobWVzc2FnZSwgdHlwZW9mKFRTZW5kZXIpLCB0eXBlb2YoVEFyZ3MpLCBzZW5kZXIsIGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gU2VuZCBNZXNzYWdlIHdpdGhvdXQgYXJnc1xuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVFNlbmRlclwiPlRTZW5kZXI8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic2VuZGVyXCI+U2VuZGVyPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwibWVzc2FnZVwiPk1lc3NhZ2U8L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdm9pZCBTZW5kPFRTZW5kZXI+KFRTZW5kZXIgc2VuZGVyLCBzdHJpbmcgbWVzc2FnZSkgd2hlcmUgVFNlbmRlciA6IGNsYXNzXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChzZW5kZXIgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwic2VuZGVyXCIpO1xuICAgICAgICAgICAgdGhpcy5Jbm5lclNlbmQobWVzc2FnZSwgdHlwZW9mKFRTZW5kZXIpLCBudWxsLCBzZW5kZXIsIG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gU3Vic2NyaWJlIE1lc3NhZ2Ugd2l0aCBhcmdzXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUU2VuZGVyXCI+VFNlbmRlcjwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVEFyZ3NcIj5UQXJnczwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzdWJzY3JpYmVyXCI+U3Vic2NyaWJlcjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1lc3NhZ2VcIj5NZXNzYWdlPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiY2FsbGJhY2tcIj5BY3Rpb248L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzb3VyY2VcIj5zb3VyY2U8L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdm9pZCBTdWJzY3JpYmU8VFNlbmRlciwgVEFyZ3M+KG9iamVjdCBzdWJzY3JpYmVyLCBzdHJpbmcgbWVzc2FnZSwgQWN0aW9uPFRTZW5kZXIsIFRBcmdzPiBjYWxsYmFjayxcbiAgICAgICAgICAgIFRTZW5kZXIgc291cmNlID0gbnVsbCkgd2hlcmUgVFNlbmRlciA6IGNsYXNzXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVyID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcInN1YnNjcmliZXJcIik7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwiY2FsbGJhY2tcIik7XG5cbiAgICAgICAgICAgIEFjdGlvbjxvYmplY3QsIG9iamVjdD4gd3JhcCA9IChzZW5kZXIsIGFyZ3MpID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbmQgPSAoVFNlbmRlcilzZW5kZXI7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZSA9PSBudWxsIHx8IHNlbmQgPT0gc291cmNlKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygoVFNlbmRlcilzZW5kZXIsIChUQXJncylhcmdzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuSW5uZXJTdWJzY3JpYmUoc3Vic2NyaWJlciwgbWVzc2FnZSwgdHlwZW9mKFRTZW5kZXIpLCB0eXBlb2YoVEFyZ3MpLCAoQWN0aW9uPG9iamVjdCxvYmplY3Q+KXdyYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gU3Vic2NyaWJlIE1lc3NhZ2Ugd2l0aG91dCBhcmdzXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUU2VuZGVyXCI+VFNlbmRlcjwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzdWJzY3JpYmVyXCI+U3Vic2NyaWJlcjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1lc3NhZ2VcIj5NZXNzYWdlPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiY2FsbGJhY2tcIj5BY3Rpb248L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzb3VyY2VcIj5zb3VyY2U8L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdm9pZCBTdWJzY3JpYmU8VFNlbmRlcj4ob2JqZWN0IHN1YnNjcmliZXIsIHN0cmluZyBtZXNzYWdlLCBBY3Rpb248VFNlbmRlcj4gY2FsbGJhY2ssXG4gICAgICAgICAgICBUU2VuZGVyIHNvdXJjZSA9IG51bGwpIHdoZXJlIFRTZW5kZXIgOiBjbGFzc1xuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlciA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJzdWJzY3JpYmVyXCIpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcImNhbGxiYWNrXCIpO1xuXG4gICAgICAgICAgICBBY3Rpb248b2JqZWN0LCBvYmplY3Q+IHdyYXAgPSAoc2VuZGVyLCBhcmdzKSA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBzZW5kID0gKFRTZW5kZXIpc2VuZGVyO1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2UgPT0gbnVsbCB8fCBzZW5kID09IHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKFRTZW5kZXIpc2VuZGVyKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuSW5uZXJTdWJzY3JpYmUoc3Vic2NyaWJlciwgbWVzc2FnZSwgdHlwZW9mKFRTZW5kZXIpLCBudWxsLCAoQWN0aW9uPG9iamVjdCxvYmplY3Q+KXdyYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gVW5zdWJzY3JpYmUgYWN0aW9uIHdpdGggYXJnc1xuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVFNlbmRlclwiPlRTZW5kZXI8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRBcmdzXCI+VEFyZ3M8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic3Vic2NyaWJlclwiPlN1YnNjcmliZXI8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJtZXNzYWdlXCI+TWVzc2FnZTwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2b2lkIFVuc3Vic2NyaWJlPFRTZW5kZXIsIFRBcmdzPihvYmplY3Qgc3Vic2NyaWJlciwgc3RyaW5nIG1lc3NhZ2UpIHdoZXJlIFRTZW5kZXIgOiBjbGFzc1xuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLklubmVyVW5zdWJzY3JpYmUobWVzc2FnZSwgdHlwZW9mKFRTZW5kZXIpLCB0eXBlb2YoVEFyZ3MpLCBzdWJzY3JpYmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIFVuc3Vic2NyaWJlIGFjdGlvbiB3aXRob3V0IGFyZ3NcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRTZW5kZXJcIj5UU2VuZGVyPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN1YnNjcmliZXJcIj5TdWJzY3JpYmVyPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwibWVzc2FnZVwiPk1lc3NhZ2U8L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdm9pZCBVbnN1YnNjcmliZTxUU2VuZGVyPihvYmplY3Qgc3Vic2NyaWJlciwgc3RyaW5nIG1lc3NhZ2UpIHdoZXJlIFRTZW5kZXIgOiBjbGFzc1xuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLklubmVyVW5zdWJzY3JpYmUobWVzc2FnZSwgdHlwZW9mKFRTZW5kZXIpLCBudWxsLCBzdWJzY3JpYmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIFJlbW92ZSBhbGwgY2FsbGJhY2tzXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIHB1YmxpYyB2b2lkIFJlc2V0TWVzc2VuZ2VyKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fY2FsbHMuQ2xlYXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgdm9pZCBJbm5lclNlbmQoc3RyaW5nIG1lc3NhZ2UsIFR5cGUgc2VuZGVyVHlwZSwgVHlwZSBhcmdUeXBlLCBvYmplY3Qgc2VuZGVyLCBvYmplY3QgYXJncylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwibWVzc2FnZVwiKTtcbiAgICAgICAgICAgIHZhciBrZXkgPSBuZXcgVHVwbGU8c3RyaW5nLCBUeXBlLCBUeXBlPihtZXNzYWdlLCBzZW5kZXJUeXBlLCBhcmdUeXBlKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fY2FsbHMuQ29udGFpbnNLZXkoa2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IHRoaXMuX2NhbGxzW2tleV07XG4gICAgICAgICAgICBpZiAoYWN0aW9ucyA9PSBudWxsIHx8ICFTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkFueTxUdXBsZTxvYmplY3QsQWN0aW9uPG9iamVjdCxvYmplY3Q+Pj4oYWN0aW9ucykpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB2YXIgYWN0aW9uc0NvcHkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlRvTGlzdDxUdXBsZTxvYmplY3QsQWN0aW9uPG9iamVjdCxvYmplY3Q+Pj4oYWN0aW9ucyk7XG4gICAgICAgICAgICBmb3JlYWNoICh2YXIgYWN0aW9uIGluIGFjdGlvbnNDb3B5KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChhY3Rpb25zLkNvbnRhaW5zKGFjdGlvbikpXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbi5JdGVtMihzZW5kZXIsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIElubmVyU3Vic2NyaWJlKG9iamVjdCBzdWJzY3JpYmVyLCBzdHJpbmcgbWVzc2FnZSwgVHlwZSBzZW5kZXJUeXBlLCBUeXBlIGFyZ1R5cGUsXG4gICAgICAgICAgICBBY3Rpb248b2JqZWN0LCBvYmplY3Q+IGNhbGxiYWNrKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJtZXNzYWdlXCIpO1xuICAgICAgICAgICAgdmFyIGtleSA9IG5ldyBUdXBsZTxzdHJpbmcsIFR5cGUsIFR5cGU+KG1lc3NhZ2UsIHNlbmRlclR5cGUsIGFyZ1R5cGUpO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IFR1cGxlPG9iamVjdCwgQWN0aW9uPG9iamVjdCwgb2JqZWN0Pj4oc3Vic2NyaWJlciwgY2FsbGJhY2spO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NhbGxzLkNvbnRhaW5zS2V5KGtleSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FsbHNba2V5XS5BZGQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkNhbGxGb3IobmV3IExpc3Q8VHVwbGU8b2JqZWN0LCBBY3Rpb248b2JqZWN0LCBvYmplY3Q+Pj4oKSwoX28xKT0+e19vMS5BZGQodmFsdWUpO3JldHVybiBfbzE7fSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FsbHNba2V5XSA9IGxpc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHZvaWQgSW5uZXJVbnN1YnNjcmliZShzdHJpbmcgbWVzc2FnZSwgVHlwZSBzZW5kZXJUeXBlLCBUeXBlIGFyZ1R5cGUsIG9iamVjdCBzdWJzY3JpYmVyKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlciA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJzdWJzY3JpYmVyXCIpO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwibWVzc2FnZVwiKTtcblxuICAgICAgICAgICAgdmFyIGtleSA9IG5ldyBUdXBsZTxzdHJpbmcsIFR5cGUsIFR5cGU+KG1lc3NhZ2UsIHNlbmRlclR5cGUsIGFyZ1R5cGUpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9jYWxscy5Db250YWluc0tleShrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIHRvcmVtb3ZlID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxUdXBsZTxvYmplY3QsQWN0aW9uPG9iamVjdCxvYmplY3Q+Pj4odGhpcy5fY2FsbHNba2V5XSwoRnVuYzxUdXBsZTxvYmplY3QsQWN0aW9uPG9iamVjdCxvYmplY3Q+Pixib29sPikodHVwbGUgPT4gdHVwbGUuSXRlbTEgPT0gc3Vic2NyaWJlcikpLlRvTGlzdCgpO1xuXG4gICAgICAgICAgICBmb3JlYWNoICh2YXIgdHVwbGUgaW4gdG9yZW1vdmUpXG4gICAgICAgICAgICAgICAgdGhpcy5fY2FsbHNba2V5XS5SZW1vdmUodHVwbGUpO1xuXG4gICAgICAgICAgICBpZiAoIVN5c3RlbS5MaW5xLkVudW1lcmFibGUuQW55PFR1cGxlPG9iamVjdCxBY3Rpb248b2JqZWN0LG9iamVjdD4+Pih0aGlzLl9jYWxsc1trZXldKSlcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWxscy5SZW1vdmUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLkxpbnE7XG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xudXNpbmcgQnJpZGdlLkh0bWw1O1xudXNpbmcgQnJpZGdlLmpRdWVyeTI7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuTmF2aWdhdGlvblxue1xuICAgIC8vLyA8c3VtbWFyeT5cbiAgICAvLy8gSU5hdmlnYXRvciBpbXBsZW1lbnRhdGlvblxuICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgcHVibGljIGNsYXNzIEJyaWRnZU5hdmlnYXRvciA6IElOYXZpZ2F0b3JcbiAgICB7XG4gICAgICAgIHByaXZhdGUgc3RhdGljIElBbUxvYWRhYmxlIF9hY3R1YWxDb250cm9sbGVyO1xuXG4gICAgICAgIHByb3RlY3RlZCByZWFkb25seSBJTmF2aWdhdG9yQ29uZmlndXJhdG9yIENvbmZpZ3VyYXRpb247XG4gICAgICAgIHB1YmxpYyBCcmlkZ2VOYXZpZ2F0b3IoSU5hdmlnYXRvckNvbmZpZ3VyYXRvciBjb25maWd1cmF0aW9uKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIEVuYWJsZVNwYWZBbmNob3JzKClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGFsbEFuY2hvcnMgPSBqUXVlcnkuU2VsZWN0KFwiYVwiKTtcbiAgICAgICAgICAgIGFsbEFuY2hvcnMuT2ZmKEV2ZW50VHlwZS5DbGljay5Ub1N0cmluZygpKTtcbiAgICAgICAgICAgIGFsbEFuY2hvcnMuQ2xpY2soKEFjdGlvbjxqUXVlcnlNb3VzZUV2ZW50PikoZXYgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xpY2tlZEVsZW1lbnQgPSBldi5UYXJnZXQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2xpY2tlZEVsZW1lbnQuR2V0VHlwZSgpICE9IHR5cGVvZihIVE1MQW5jaG9yRWxlbWVudCkpXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrZWRFbGVtZW50ID0galF1ZXJ5LkVsZW1lbnQoZXYuVGFyZ2V0KS5QYXJlbnRzKFwiYVwiKS5HZXQoMCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgaHJlZiA9IGNsaWNrZWRFbGVtZW50LkdldEF0dHJpYnV0ZShcImhyZWZcIik7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RyaW5nLklzTnVsbE9yRW1wdHkoaHJlZikpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHZhciBpc015SHJlZiA9IGhyZWYuU3RhcnRzV2l0aChcInNwYWY6XCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgaXMgbXkgaHJlZlxuICAgICAgICAgICAgICAgIGlmIChpc015SHJlZilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGV2LlByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYWdlSWQgPSBocmVmLlJlcGxhY2UoXCJzcGFmOlwiLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5OYXZpZ2F0ZShwYWdlSWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGFuY2hvciBkZWZhdWx0IGJlaGF2aW91clxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gTmF2aWdhdGUgdG8gYSBwYWdlIElELlxuICAgICAgICAvLy8gVGhlIElEIG11c3QgYmUgcmVnaXN0ZXJlZC5cbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwicGFnZUlkXCI+PC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBOYXZpZ2F0ZShzdHJpbmcgcGFnZUlkLCBEaWN0aW9uYXJ5PHN0cmluZyxvYmplY3Q+IHBhcmFtZXRlcnMgPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgcGFnZSA9IHRoaXMuQ29uZmlndXJhdGlvbi5HZXRQYWdlRGVzY3JpcHRvckJ5S2V5KHBhZ2VJZCk7XG4gICAgICAgICAgICBpZiAocGFnZSA9PSBudWxsKSB0aHJvdyBuZXcgRXhjZXB0aW9uKHN0cmluZy5Gb3JtYXQoXCJQYWdlIG5vdCBmb3VuZCB3aXRoIElEIHswfVwiLHBhZ2VJZCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBjaGVjayByZWRpcmVjdCBydWxlXG4gICAgICAgICAgICB2YXIgcmVkaXJlY3RLZXkgPSBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuVG9UZW1wKFwia2V5MVwiLHBhZ2UuUmVkaXJlY3RSdWxlcykhPW51bGw/Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21UZW1wPEZ1bmM8c3RyaW5nPj4oXCJrZXkxXCIpLkludm9rZSgpOihzdHJpbmcpbnVsbDtcbiAgICAgICAgICAgIGlmICghc3RyaW5nLklzTnVsbE9yRW1wdHkocmVkaXJlY3RLZXkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuTmF2aWdhdGUocmVkaXJlY3RLZXkscGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYm9keSA9IHRoaXMuQ29uZmlndXJhdGlvbi5Cb2R5O1xuICAgICAgICAgICAgaWYoYm9keSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJDYW5ub3QgZmluZCBuYXZpZ2F0aW9uIGJvZHkgZWxlbWVudC5cIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGxlYXZlIGFjdHVhbCBjb250cm9sZWxyXG4gICAgICAgICAgICBpZiAodGhpcy5MYXN0TmF2aWdhdGVDb250cm9sbGVyICE9IG51bGwpXG4gICAgICAgICAgICAgICAgdGhpcy5MYXN0TmF2aWdhdGVDb250cm9sbGVyLk9uTGVhdmUoKTtcblxuICAgICAgICAgICAgdGhpcy5Db25maWd1cmF0aW9uLkJvZHkuTG9hZChwYWdlLkh0bWxMb2NhdGlvbi5JbnZva2UoKSxudWxsLCAoQWN0aW9uPHN0cmluZyxzdHJpbmcsanFYSFI+KShhc3luYyAobyxzLGEpID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gbG9hZCBkZXBlbmRlbmNpZXNcbiAgICAgICAgICAgICAgICBpZiAocGFnZS5EZXBlbmRlbmNpZXNTY3JpcHRzICE9IG51bGwpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2NyaXB0cyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuVG9MaXN0PHN0cmluZz4oKHBhZ2UuRGVwZW5kZW5jaWVzU2NyaXB0cy5JbnZva2UoKSkpO1xuICAgICAgICAgICAgICAgICAgICBpZihwYWdlLlNlcXVlbnRpYWxEZXBlbmRlbmNpZXNTY3JpcHRMb2FkKVxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbGl0eS5TZXF1ZW50aWFsU2NyaXB0TG9hZChzY3JpcHRzKTtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGFyYWxsZWwgbG9hZFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcmlwdHNUYXNrID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3Q8c3RyaW5nLFRhc2s8b2JqZWN0W10+PihzY3JpcHRzLChGdW5jPHN0cmluZyxUYXNrPG9iamVjdFtdPj4pKHVybCA9PiBUYXNrLkZyb21Qcm9taXNlKGpRdWVyeS5HZXRTY3JpcHQodXJsKSkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFRhc2suV2hlbkFsbDxvYmplY3RbXT4oc2NyaXB0c1Rhc2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBwcmVwYXJlIHBhZ2VcbiAgICAgICAgICAgICAgICBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuVG9UZW1wKFwia2V5MlwiLHBhZ2UuUHJlcGFyZVBhZ2UpIT1udWxsP2dsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tTGFtYmRhKCgpPT5nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbVRlbXA8QWN0aW9uPihcImtleTJcIikuSW52b2tlKCkpOm51bGw7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gc2hvdyBhcyBmdWxsc2NyZWVuXG4gICAgICAgICAgICAgICAgaWYgKHBhZ2UuRnVsbFNjcmVlbilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuU2hvd0FzRnVsbFNjcmVlbihib2R5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBhdXRvIGVuYWJsZSBzcGFmIGFuY2hvcnNcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuQ29uZmlndXJhdGlvbi5EaXNhYmxlQXV0b1NwYWZBbmNob3JzT25OYXZpZ2F0ZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmFibGVBbmNob3JzID0gZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LlRvVGVtcChcImtleTNcIixwYWdlLkF1dG9FbmFibGVTcGFmQW5jaG9ycykhPW51bGw/Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21UZW1wPEZ1bmM8Ym9vbD4+KFwia2V5M1wiKS5JbnZva2UoKTooYm9vbD8pbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYoZW5hYmxlQW5jaG9ycy5IYXNWYWx1ZSAmJiBlbmFibGVBbmNob3JzLlZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5FbmFibGVTcGFmQW5jaG9ycygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwYWdlLlBhZ2VDb250cm9sbGVyICE9IG51bGwpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBsb2FkIG5ldyBjb250cm9sbGVyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb250cm9sbGVyID0gcGFnZS5QYWdlQ29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5PbkJlZm9yZUJpbmRpbmcocGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuT25Mb2FkKHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLk9uQmluZGluZ0RvbmUocGFyYW1ldGVycyk7XG5cbiAgICAgICAgICAgICAgICAgICAgX2FjdHVhbENvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5Pbk5hdmlnYXRlZCE9bnVsbD9nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbUxhbWJkYSgoKT0+dGhpcy5Pbk5hdmlnYXRlZC5JbnZva2UodGhpcyxjb250cm9sbGVyKSk6bnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KSk7IFxuICAgICAgICB9XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gQ29udGVudCBwYWdlIGlzIHRoZSBmaXJzdCBjaGlsZCBvZiBib2R5XG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImJvZHlcIj48L3BhcmFtPlxuICAgICAgICBwcml2YXRlIHZvaWQgU2hvd0FzRnVsbFNjcmVlbihqUXVlcnkgYm9keSlcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHRoZURpdiA9IGJvZHkuQ2hpbGRyZW4oKS5GaXJzdCgpO1xuICAgICAgICAgICAgdGhlRGl2LkNzcyhcIndpZHRoXCIgLCBcIjEwMCVcIik7XG4gICAgICAgICAgICB0aGVEaXYuQ3NzKFwiaGVpZ2h0XCIgLCBcIjEwMCVcIik7XG4gICAgICAgICAgICB0aGVEaXYuQ3NzKFwibGVmdFwiICwgXCIwXCIpO1xuICAgICAgICAgICAgdGhlRGl2LkNzcyhcInRvcFwiICwgXCIwXCIpO1xuICAgICAgICAgICAgdGhlRGl2LkNzcyhcInotaW5kZXhcIiAsIFwiOTk5OTk5XCIpO1xuICAgICAgICAgICAgdGhlRGl2LkNzcyhcInBvc2l0aW9uXCIgLCBcImFic29sdXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGV2ZW50IEV2ZW50SGFuZGxlcjxJQW1Mb2FkYWJsZT4gT25OYXZpZ2F0ZWQ7XG5wdWJsaWMgSUFtTG9hZGFibGUgTGFzdE5hdmlnYXRlQ29udHJvbGxlclxyXG57XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gX2FjdHVhbENvbnRyb2xsZXI7XHJcbiAgICB9XHJcbn1cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gU3Vic2NyaWJlIHRvIGFuY2hvcnMgY2xpY2tcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBJbml0TmF2aWdhdGlvbigpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuRW5hYmxlU3BhZkFuY2hvcnMoKTtcblxuICAgICAgICAgICAgLy8gZ28gaG9tZVxuICAgICAgICAgICAgdGhpcy5OYXZpZ2F0ZSh0aGlzLkNvbmZpZ3VyYXRpb24uSG9tZUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgXG4gICAgfVxufSIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLkxpbnE7XG51c2luZyBCcmlkZ2UualF1ZXJ5MjtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgLy8vIDxzdW1tYXJ5PlxuICAgIC8vLyBJTmF2aWdhdG9yQ29uZmlndXJhdG9yIEltcGxlbWVudGF0aW9uLiBNdXN0IGJlIGV4dGVuZGVkLlxuICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgcHVibGljIGFic3RyYWN0IGNsYXNzIEJyaWRnZU5hdmlnYXRvckNvbmZpZ0Jhc2UgOiBJTmF2aWdhdG9yQ29uZmlndXJhdG9yXG4gICAge1xuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IElMaXN0PElQYWdlRGVzY3JpcHRvcj4gX3JvdXRlcztcblxuICAgICAgICBwdWJsaWMgYWJzdHJhY3QgSUxpc3Q8SVBhZ2VEZXNjcmlwdG9yPiBDcmVhdGVSb3V0ZXMoKTtcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGpRdWVyeSBCb2R5IHsgZ2V0OyB9XG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBzdHJpbmcgSG9tZUlkIHsgZ2V0OyB9XG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBib29sIERpc2FibGVBdXRvU3BhZkFuY2hvcnNPbk5hdmlnYXRlIHsgZ2V0OyB9XG5cblxuXG4gICAgICAgIHByb3RlY3RlZCBCcmlkZ2VOYXZpZ2F0b3JDb25maWdCYXNlKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fcm91dGVzID0gdGhpcy5DcmVhdGVSb3V0ZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBJUGFnZURlc2NyaXB0b3IgR2V0UGFnZURlc2NyaXB0b3JCeUtleShzdHJpbmcga2V5KVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TaW5nbGVPckRlZmF1bHQ8SVBhZ2VEZXNjcmlwdG9yPih0aGlzLl9yb3V0ZXMsKEZ1bmM8SVBhZ2VEZXNjcmlwdG9yLGJvb2w+KShzPT4gc3RyaW5nLkVxdWFscyhzLktleSwga2V5LCBTdHJpbmdDb21wYXJpc29uLkN1cnJlbnRDdWx0dXJlSWdub3JlQ2FzZSkpKTtcbiAgICAgICAgfVxuXG4gICAgfVxufSIsInVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgQnJpZGdlLkh0bWw1O1xudXNpbmcgQnJpZGdlLk5hdmlnYXRpb24uTW9kZWw7XG51c2luZyBOZXd0b25zb2Z0Lkpzb247XG5cbm5hbWVzcGFjZSBCcmlkZ2UuTmF2aWdhdGlvblxue1xuICAgIHB1YmxpYyBjbGFzcyBDb21wbGV4T2JqZWN0TmF2aWdhdGlvbkhpc3RvcnkgOiBJQnJvd3Nlckhpc3RvcnlNYW5hZ2VyXG4gICAge1xuICAgICAgICBwdWJsaWMgdm9pZCBQdXNoU3RhdGUoc3RyaW5nIHBhZ2VJZCwgRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycyA9IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBiYXNlVXJsID0gTmF2aWdhdGlvblV0aWxpdHkuQnVpbGRCYXNlVXJsKHBhZ2VJZCk7XG5cbiAgICAgICAgICAgIFdpbmRvdy5IaXN0b3J5LlB1c2hTdGF0ZShudWxsLCBzdHJpbmcuRW1wdHksXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVycyAhPSBudWxsXG4gICAgICAgICAgICAgICAgICAgID8gc3RyaW5nLkZvcm1hdChcInswfT17MX1cIixiYXNlVXJsLEdsb2JhbC5CdG9hKEpzb25Db252ZXJ0LlNlcmlhbGl6ZU9iamVjdChwYXJhbWV0ZXJzKSkpOiBiYXNlVXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBVcmxEZXNjcmlwdG9yIFBhcnNlVXJsKClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHJlcyA9IG5ldyBVcmxEZXNjcmlwdG9yKCk7XG5cbiAgICAgICAgICAgIHZhciBoYXNoID0gV2luZG93LkxvY2F0aW9uLkhhc2g7XG4gICAgICAgICAgICBoYXNoID0gaGFzaC5SZXBsYWNlKFwiI1wiLCBcIlwiKTtcblxuICAgICAgICAgICAgaWYgKHN0cmluZy5Jc051bGxPckVtcHR5KGhhc2gpKSByZXR1cm4gcmVzO1xuXG4gICAgICAgICAgICB2YXIgZXF1YWxJbmRleCA9IGhhc2guSW5kZXhPZignPScpO1xuICAgICAgICAgICAgaWYgKGVxdWFsSW5kZXggPT0gLTEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVzLlBhZ2VJZCA9IGhhc2g7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzLlBhZ2VJZCA9IGhhc2guU3Vic3RyaW5nKDAsIGVxdWFsSW5kZXgpOyAgXG5cbiAgICAgICAgICAgIHZhciBkb3VibGVQb2ludHNJbmR4ID0gZXF1YWxJbmRleCArIDE7XG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IGhhc2guU3Vic3RyaW5nKGRvdWJsZVBvaW50c0luZHgsIGhhc2guTGVuZ3RoIC0gZG91YmxlUG9pbnRzSW5keCk7XG5cbiAgICAgICAgICAgIGlmIChzdHJpbmcuSXNOdWxsT3JFbXB0eShwYXJhbWV0ZXJzKSkgcmV0dXJuIHJlczsgLy8gbm8gcGFyYW1ldGVyc1xuXG4gICAgICAgICAgICB2YXIgZGVjb2RlZCA9IEdsb2JhbC5BdG9iKHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgdmFyIGRlc2VyaWFsaXplZCA9IEpzb25Db252ZXJ0LkRlc2VyaWFsaXplT2JqZWN0PERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+PihkZWNvZGVkKTtcblxuICAgICAgICAgICAgcmVzLlBhcmFtZXRlcnMgPSBkZXNlcmlhbGl6ZWQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICB9XG59IiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uTGlucTtcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XG51c2luZyBCcmlkZ2UualF1ZXJ5MjtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgcHVibGljIGNsYXNzIFBhZ2VEZXNjcmlwdG9yIDogSVBhZ2VEZXNjcmlwdG9yXG4gICAge1xuICAgICAgICBwdWJsaWMgUGFnZURlc2NyaXB0b3IoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLkF1dG9FbmFibGVTcGFmQW5jaG9ycyA9ICgpID0+IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RyaW5nIEtleSB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBGdW5jPHN0cmluZz4gSHRtbExvY2F0aW9uIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIEZ1bmM8SUFtTG9hZGFibGU+IFBhZ2VDb250cm9sbGVyIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIEZ1bmM8Ym9vbD4gQ2FuQmVEaXJlY3RMb2FkIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIEFjdGlvbiBQcmVwYXJlUGFnZSB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBib29sIFNlcXVlbnRpYWxEZXBlbmRlbmNpZXNTY3JpcHRMb2FkIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIEZ1bmM8c3RyaW5nPiBSZWRpcmVjdFJ1bGVzIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIEZ1bmM8Ym9vbD4gQXV0b0VuYWJsZVNwYWZBbmNob3JzIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIEZ1bmM8SUVudW1lcmFibGU8c3RyaW5nPj4gRGVwZW5kZW5jaWVzU2NyaXB0cyB7IGdldDsgc2V0OyB9XG4gICAgICAgXG4gICAgICAgIHB1YmxpYyBib29sIEZ1bGxTY3JlZW4geyBnZXQ7IHNldDsgfVxuICAgIH1cblxuICAgIFxufSIsInVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLkxpbnE7XG51c2luZyBTeXN0ZW0uVGV4dDtcbnVzaW5nIEJyaWRnZS5IdG1sNTtcbnVzaW5nIEJyaWRnZS5OYXZpZ2F0aW9uLk1vZGVsO1xuXG5uYW1lc3BhY2UgQnJpZGdlLk5hdmlnYXRpb25cbntcbiAgICBwdWJsaWMgY2xhc3MgUXVlcnlQYXJhbWV0ZXJOYXZpZ2F0aW9uSGlzdG9yeSA6IElCcm93c2VySGlzdG9yeU1hbmFnZXJcbiAgICB7XG4gICAgICAgIHB1YmxpYyB2b2lkIFB1c2hTdGF0ZShzdHJpbmcgcGFnZUlkLCBEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzID0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGJhc2VVcmwgPSBOYXZpZ2F0aW9uVXRpbGl0eS5CdWlsZEJhc2VVcmwocGFnZUlkKTtcblxuICAgICAgICAgICAgV2luZG93Lkhpc3RvcnkuUHVzaFN0YXRlKG51bGwsIHN0cmluZy5FbXB0eSxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzICE9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgPyBzdHJpbmcuRm9ybWF0KFwiezB9ezF9XCIsYmFzZVVybCxCdWlsZFF1ZXJ5UGFyYW1ldGVyKHBhcmFtZXRlcnMpKTogYmFzZVVybCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgVXJsRGVzY3JpcHRvciBQYXJzZVVybCgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciByZXMgPSBuZXcgVXJsRGVzY3JpcHRvcigpO1xuICAgICAgICAgICAgcmVzLlBhcmFtZXRlcnMgPSBuZXcgRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4oKTtcblxuICAgICAgICAgICAgdmFyIGhhc2ggPSBXaW5kb3cuTG9jYXRpb24uSGFzaDtcbiAgICAgICAgICAgIGhhc2ggPSBoYXNoLlJlcGxhY2UoXCIjXCIsIFwiXCIpO1xuXG4gICAgICAgICAgICBpZiAoc3RyaW5nLklzTnVsbE9yRW1wdHkoaGFzaCkpIHJldHVybiByZXM7XG5cbiAgICAgICAgICAgIHZhciBlcXVhbEluZGV4ID0gaGFzaC5JbmRleE9mKCc/Jyk7XG4gICAgICAgICAgICBpZiAoZXF1YWxJbmRleCA9PSAtMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXMuUGFnZUlkID0gaGFzaDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXMuUGFnZUlkID0gaGFzaC5TdWJzdHJpbmcoMCwgZXF1YWxJbmRleCk7ICBcblxuICAgICAgICAgICAgdmFyIGRvdWJsZVBvaW50c0luZHggPSBlcXVhbEluZGV4ICsgMTtcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gaGFzaC5TdWJzdHJpbmcoZG91YmxlUG9pbnRzSW5keCwgaGFzaC5MZW5ndGggLSBkb3VibGVQb2ludHNJbmR4KTtcblxuICAgICAgICAgICAgaWYgKHN0cmluZy5Jc051bGxPckVtcHR5KHBhcmFtZXRlcnMpKSByZXR1cm4gcmVzOyAvLyBubyBwYXJhbWV0ZXJzXG5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHNwbGl0dGVkQnlEb3VibGVBbmQgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlRvTGlzdDxzdHJpbmc+KHBhcmFtZXRlcnMuU3BsaXQoXCImXCIpKTtcbiAgICAgICAgICAgIHNwbGl0dGVkQnlEb3VibGVBbmQuRm9yRWFjaCgoU3lzdGVtLkFjdGlvbjxzdHJpbmc+KShmID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHNwbGl0dGVkID0gZi5TcGxpdChcIj1cIik7XG4gICAgICAgICAgICAgICAgcmVzLlBhcmFtZXRlcnMuQWRkKHNwbGl0dGVkWzBdLEdsb2JhbC5EZWNvZGVVUklDb21wb25lbnQoc3BsaXR0ZWRbMV0pKTtcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgc3RyaW5nIEJ1aWxkUXVlcnlQYXJhbWV0ZXIoRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHBhcmFtZXRlcnMgPT0gbnVsbCB8fCAhU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Bbnk8S2V5VmFsdWVQYWlyPHN0cmluZyxvYmplY3Q+PihwYXJhbWV0ZXJzKSkgcmV0dXJuIHN0cmluZy5FbXB0eTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHN0ckJ1aWxkZXIgPSBuZXcgU3RyaW5nQnVpbGRlcihcIj9cIik7XG4gICAgICAgICAgICBmb3JlYWNoICh2YXIga2V5VmFsdWVQYWlyIGluIHBhcmFtZXRlcnMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RyQnVpbGRlci5BcHBlbmQoR2xvYmFsLkVuY29kZVVSSUNvbXBvbmVudChrZXlWYWx1ZVBhaXIuS2V5KSk7XG4gICAgICAgICAgICAgICAgc3RyQnVpbGRlci5BcHBlbmQoXCI9XCIpO1xuICAgICAgICAgICAgICAgIHN0ckJ1aWxkZXIuQXBwZW5kKEdsb2JhbC5FbmNvZGVVUklDb21wb25lbnQoa2V5VmFsdWVQYWlyLlZhbHVlLlRvU3RyaW5nKCkpKTtcbiAgICAgICAgICAgICAgICBzdHJCdWlsZGVyLkFwcGVuZChcIiZcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZXMgPSBzdHJCdWlsZGVyLlRvU3RyaW5nKCkuVHJpbUVuZCgnJicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuXG4gICAgICAgIH1cblxuICAgIH1cbn0iLCJ1c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgQnJpZGdlLk5hdmlnYXRpb247XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLlNwYWZcclxue1xyXG4gICAgcHVibGljIGFic3RyYWN0IGNsYXNzIExvYWRhYmxlVmlld01vZGVsIDogVmlld01vZGVsQmFzZSwgSUFtTG9hZGFibGVcclxuICAgIHtcclxuICAgICAgICBwcm90ZWN0ZWQgTGlzdDxJVmlld01vZGVsTGlmZUN5Y2xlPiBQYXJ0aWFscyB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIE9uTG9hZChEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYmFzZS5BcHBseUJpbmRpbmdzKCk7XHJcbiAgICAgICAgICAgIGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5Ub1RlbXAoXCJrZXkxXCIsdGhpcy5QYXJ0aWFscykhPW51bGw/Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21MYW1iZGEoKCk9Pmdsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tVGVtcDxMaXN0PElWaWV3TW9kZWxMaWZlQ3ljbGU+PihcImtleTFcIikuRm9yRWFjaCgoU3lzdGVtLkFjdGlvbjxJVmlld01vZGVsTGlmZUN5Y2xlPikoZj0+IGYuSW5pdChwYXJhbWV0ZXJzKSkpKTpudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBPbkxlYXZlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5Ub1RlbXAoXCJrZXkyXCIsdGhpcy5QYXJ0aWFscykhPW51bGw/Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21MYW1iZGEoKCk9Pmdsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tVGVtcDxMaXN0PElWaWV3TW9kZWxMaWZlQ3ljbGU+PihcImtleTJcIikuRm9yRWFjaCgoU3lzdGVtLkFjdGlvbjxJVmlld01vZGVsTGlmZUN5Y2xlPikoZj0+Zi5EZUluaXQoKSkpKTpudWxsO1xyXG4gICAgICAgICAgICBiYXNlLlJlbW92ZUJpbmRpbmdzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIE9uQmVmb3JlQmluZGluZyhEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgT25CaW5kaW5nRG9uZShEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcblxuICAgIFxucHJpdmF0ZSBMaXN0PElWaWV3TW9kZWxMaWZlQ3ljbGU+IF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19QYXJ0aWFscz1uZXcgTGlzdDxJVmlld01vZGVsTGlmZUN5Y2xlPigpO31cclxufSIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgQnJpZGdlLmpRdWVyeTI7XG51c2luZyBSZXR5cGVkO1xuXG5uYW1lc3BhY2UgQnJpZGdlLlNwYWZcbntcbiAgICBwdWJsaWMgYWJzdHJhY3QgY2xhc3MgUGFydGlhbE1vZGVsIDogIElWaWV3TW9kZWxMaWZlQ3ljbGVcbiAgICB7XG4gICAgICAgIHByaXZhdGUgZG9tLkhUTUxEaXZFbGVtZW50IF9wYXJ0aWFsRWxlbWVudDtcblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBFbGVtZW50IGlkIG9mIHRoZSBwYWdlIFxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHJldHVybnM+PC9yZXR1cm5zPlxuICAgICAgICBwdWJsaWMgYWJzdHJhY3Qgc3RyaW5nIEVsZW1lbnRJZCgpO1xuICAgICAgICBcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gSHRtbExvY2F0aW9uXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBzdHJpbmcgSHRtbFVybCB7IGdldDsgfVxuXG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gSW5pdCBwYXJ0aWFsXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhcmFtZXRlcnNcIj5kYXRhIGZvciBpbml0IHRoZSBwYXJ0aWFsczwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgSW5pdChEaWN0aW9uYXJ5PHN0cmluZyxvYmplY3Q+IHBhcmFtZXRlcnMpXG4gICAgICAgIHtcblxuICAgICAgICAgICAgalF1ZXJ5LkdldCh0aGlzLkh0bWxVcmwsIG51bGwsIChBY3Rpb248b2JqZWN0LHN0cmluZyxqcVhIUj4pKChvLCBzLCBhcmczKSA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuT25CZWZvcmVCaW5kaW5nKHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhcnRpYWxFbGVtZW50ID0gbmV3IGRvbS5IVE1MRGl2RWxlbWVudFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJIVE1MID0gby5Ub1N0cmluZygpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IGRvbS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChFbGVtZW50SWQoKSk7XG4gICAgICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZDxkb20uSFRNTERpdkVsZW1lbnQ+KHRoaXMuX3BhcnRpYWxFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBrbm9ja291dC5rby5hcHBseUJpbmRpbmdzKHRoaXMsIHRoaXMuX3BhcnRpYWxFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLk9uQmluZGluZ0RvbmUocGFyYW1ldGVycyk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIENhbGxlZCB3aGVuIGh0bWwgaXMgbG9hZGVkIGJ1dCBrbyBpcyBub3QgYmluZGVkXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhcmFtZXRlcnNcIj48L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIE9uQmVmb3JlQmluZGluZyhEaWN0aW9uYXJ5PHN0cmluZyxvYmplY3Q+IHBhcmFtZXRlcnMpe31cbiAgICAgICAgXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIENhbGxlZCB3aGVuIGh0bWwgaXMgbG9hZGVkIGFuZCBrbyBpcyBiaW5kZWQgXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhcmFtZXRlcnNcIj48L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIE9uQmluZGluZ0RvbmUoRGljdGlvbmFyeTxzdHJpbmcsb2JqZWN0PiBwYXJhbWV0ZXJzKXt9XG5cbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBEZUluaXQoKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiBrbyBjb250YWlucyB0aGlzIG5vZGVcbiAgICAgICAgICAgIGlmICh0aGlzLl9wYXJ0aWFsRWxlbWVudCA9PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGtub2Nrb3V0LmtvLmRhdGFGb3IodGhpcy5fcGFydGlhbEVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBrbm9ja291dC5rby5yZW1vdmVOb2RlKHRoaXMuX3BhcnRpYWxFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnRlcmZhY2UgSVZpZXdNb2RlbExpZmVDeWNsZVxuICAgIHtcbiAgICAgICAgdm9pZCBJbml0KERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMpO1xuICAgICAgICB2b2lkIERlSW5pdCgpO1xuICAgIH1cbn1cblxuXG5cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgQnJpZGdlLkh0bWw1O1xudXNpbmcgQnJpZGdlLk5hdmlnYXRpb24uTW9kZWw7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuTmF2aWdhdGlvblxue1xuICAgIHB1YmxpYyBjbGFzcyBCcmlkZ2VOYXZpZ2F0b3JXaXRoUm91dGluZyA6IEJyaWRnZU5hdmlnYXRvclxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBJQnJvd3Nlckhpc3RvcnlNYW5hZ2VyIF9icm93c2VySGlzdG9yeU1hbmFnZXI7XG5cbiAgICAgICAgcHVibGljIEJyaWRnZU5hdmlnYXRvcldpdGhSb3V0aW5nKElOYXZpZ2F0b3JDb25maWd1cmF0b3IgY29uZmlndXJhdGlvbiwgSUJyb3dzZXJIaXN0b3J5TWFuYWdlciBicm93c2VySGlzdG9yeU1hbmFnZXIpIDogYmFzZShjb25maWd1cmF0aW9uKVxuICAgICAgICB7XG4gICAgICAgICAgICBfYnJvd3Nlckhpc3RvcnlNYW5hZ2VyID0gYnJvd3Nlckhpc3RvcnlNYW5hZ2VyO1xuICAgICAgICAgICAgV2luZG93Lk9uUG9wU3RhdGUgKz0gZSA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB1cmxJbmZvID0gX2Jyb3dzZXJIaXN0b3J5TWFuYWdlci5QYXJzZVVybCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuTmF2aWdhdGVXaXRob3V0UHVzaFN0YXRlKHN0cmluZy5Jc051bGxPckVtcHR5KHVybEluZm8uUGFnZUlkKSA/IGNvbmZpZ3VyYXRpb24uSG9tZUlkIDogdXJsSW5mby5QYWdlSWQsIHVybEluZm8uUGFyYW1ldGVycyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIE5hdmlnYXRlV2l0aG91dFB1c2hTdGF0ZShzdHJpbmcgcGFnZUlkLCBEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzID0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgYmFzZS5OYXZpZ2F0ZShwYWdlSWQsIHBhcmFtZXRlcnMpO1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIE5hdmlnYXRlKHN0cmluZyBwYWdlSWQsIERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMgPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICBfYnJvd3Nlckhpc3RvcnlNYW5hZ2VyLlB1c2hTdGF0ZShwYWdlSWQscGFyYW1ldGVycyk7XG4gICAgICAgICAgICBiYXNlLk5hdmlnYXRlKHBhZ2VJZCwgcGFyYW1ldGVycyk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBJbml0TmF2aWdhdGlvbigpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBwYXJzZWQgPSBfYnJvd3Nlckhpc3RvcnlNYW5hZ2VyLlBhcnNlVXJsKCk7XG5cbiAgICAgICAgICAgIGlmIChzdHJpbmcuSXNOdWxsT3JFbXB0eShwYXJzZWQuUGFnZUlkKSlcbiAgICAgICAgICAgICAgICBiYXNlLkluaXROYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmFzZS5FbmFibGVTcGFmQW5jaG9ycygpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzLkNvbmZpZ3VyYXRpb24uR2V0UGFnZURlc2NyaXB0b3JCeUtleShwYXJzZWQuUGFnZUlkKTtcbiAgICAgICAgICAgICAgICBpZiAocGFnZSA9PSBudWxsKSB0aHJvdyBuZXcgRXhjZXB0aW9uKHN0cmluZy5Gb3JtYXQoXCJQYWdlIG5vdCBmb3VuZCB3aXRoIElEIHswfVwiLHBhcnNlZC5QYWdlSWQpKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIG5vdCBudWxsIGFuZCBldmFsdWF0aW9uIGlzIGZhbHNlIGZhbGxiYWNrIHRvIGhvbWVcbiAgICAgICAgICAgICAgICBpZiAocGFnZS5DYW5CZURpcmVjdExvYWQgIT0gbnVsbCAmJiAhcGFnZS5DYW5CZURpcmVjdExvYWQuSW52b2tlKCkpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBfYnJvd3Nlckhpc3RvcnlNYW5hZ2VyLlB1c2hTdGF0ZSh0aGlzLkNvbmZpZ3VyYXRpb24uSG9tZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5OYXZpZ2F0ZVdpdGhvdXRQdXNoU3RhdGUodGhpcy5Db25maWd1cmF0aW9uLkhvbWVJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5OYXZpZ2F0ZShwYXJzZWQuUGFnZUlkLHBhcnNlZC5QYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIFxuICAgICBcbiAgICAgICAgXG4gICAgfVxufSIsInVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBCcmlkZ2UualF1ZXJ5MjtcclxudXNpbmcgQnJpZGdlLk5hdmlnYXRpb247XHJcbnVzaW5nIEJyaWRnZS5TcGFmLlZpZXdNb2RlbHM7XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLlNwYWZcclxue1xyXG4gICAgY2xhc3MgQ3VzdG9tUm91dGVzQ29uZmlnIDogQnJpZGdlTmF2aWdhdG9yQ29uZmlnQmFzZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBJTGlzdDxJUGFnZURlc2NyaXB0b3I+IENyZWF0ZVJvdXRlcygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkNhbGxGb3IobmV3IExpc3Q8SVBhZ2VEZXNjcmlwdG9yPigpLChfbzEpPT57X28xLkFkZChuZXcgUGFnZURlc2NyaXB0b3JcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBDYW5CZURpcmVjdExvYWQgPSAoKT0+dHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBIdG1sTG9jYXRpb24gPSAoKT0+XCJwYWdlcy9ob21lLmh0bWxcIiwgLy8geW91dCBodG1sIGxvY2F0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgS2V5ID0gU3BhZkFwcC5Ib21lSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgUGFnZUNvbnRyb2xsZXIgPSAoKSA9PiBTcGFmQXBwLkNvbnRhaW5lci5SZXNvbHZlPEhvbWVWaWV3TW9kZWw+KClcclxuICAgICAgICAgICAgICAgIH0pO19vMS5BZGQobmV3IFBhZ2VEZXNjcmlwdG9yXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2FuQmVEaXJlY3RMb2FkID0gKCk9PnRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgSHRtbExvY2F0aW9uID0gKCk9PlwicGFnZXMvc2Vjb25kLmh0bWxcIiwgLy8geW91dCBodG1sIGxvY2F0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgS2V5ID0gU3BhZkFwcC5TZWNvbmRJZCxcclxuICAgICAgICAgICAgICAgICAgICBQYWdlQ29udHJvbGxlciA9ICgpID0+IFNwYWZBcHAuQ29udGFpbmVyLlJlc29sdmU8U2Vjb25kVmlld01vZGVsPigpXHJcbiAgICAgICAgICAgICAgICB9KTtyZXR1cm4gX28xO30pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIGJvb2wgRGlzYWJsZUF1dG9TcGFmQW5jaG9yc09uTmF2aWdhdGUgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgalF1ZXJ5IEJvZHkgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgSG9tZUlkIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxuXG4gICAgXG5wcml2YXRlIGJvb2wgX19Qcm9wZXJ0eV9fSW5pdGlhbGl6ZXJfX0Rpc2FibGVBdXRvU3BhZkFuY2hvcnNPbk5hdmlnYXRlPXRydWU7cHJpdmF0ZSBqUXVlcnkgX19Qcm9wZXJ0eV9fSW5pdGlhbGl6ZXJfX0JvZHk9alF1ZXJ5LlNlbGVjdChcIiNwYWdlQm9keVwiKTtwcml2YXRlIHN0cmluZyBfX1Byb3BlcnR5X19Jbml0aWFsaXplcl9fSG9tZUlkPVNwYWZBcHAuSG9tZUlkO31cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIEJyaWRnZS5IdG1sNTtcbnVzaW5nIEJyaWRnZS5OYXZpZ2F0aW9uO1xudXNpbmcgc3BhZi5kZXNrdG9wO1xuXG5uYW1lc3BhY2UgQnJpZGdlLlNwYWYuVmlld01vZGVsc1xue1xuICAgIHB1YmxpYyBjbGFzcyBIb21lVmlld01vZGVsIDogTG9hZGFibGVWaWV3TW9kZWxcbiAgICB7XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgSU5hdmlnYXRvciBfbmF2aWdhdG9yO1xucHVibGljIG92ZXJyaWRlIHN0cmluZyBFbGVtZW50SWQoKVxyXG57XHJcbiAgICByZXR1cm4gU3BhZkFwcC5Ib21lSWQ7XHJcbn1cbiAgICAgICAgcHVibGljIHN0cmluZyBUZXN0IHsgZ2V0OyBzZXQ7IH1cblxuICAgICAgICBwdWJsaWMgSG9tZVZpZXdNb2RlbChJTmF2aWdhdG9yIG5hdmlnYXRvcilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fbmF2aWdhdG9yID0gbmF2aWdhdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgT25CZWZvcmVCaW5kaW5nKERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBzb2NrZXR0b25lID0gbmV3IFNvY2tldHRvbmUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5UZXN0ID0gXCJBbnRhbmkhXCI7XG4gICAgICAgICAgICBiYXNlLk9uQmVmb3JlQmluZGluZyhwYXJhbWV0ZXJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIE9uQmluZGluZ0RvbmUoRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycylcbiAgICAgICAge1xuICAgICAgICAgICAgYmFzZS5PbkJpbmRpbmdEb25lKHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoXCJCaW5kaW5nIERvbmVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBTYXlIZWxsb0pzKClcbiAgICAgICAge1xuICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoXCJoZWxsb1wiKTtcblxuICAgICAgICAgICAgR2xvYmFsLkFsZXJ0KFwiSGVsbG8hXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgR29Ub1BhZ2UyKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fbmF2aWdhdG9yLk5hdmlnYXRlKFNwYWZBcHAuU2Vjb25kSWQpO1xuICAgICAgICB9XG4gICAgfVxufSIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgQnJpZGdlLkh0bWw1O1xudXNpbmcgQnJpZGdlLk5hdmlnYXRpb247XG5cbm5hbWVzcGFjZSBCcmlkZ2UuU3BhZi5WaWV3TW9kZWxzXG57XG4gICAgcHVibGljIGNsYXNzIFNlY29uZFZpZXdNb2RlbCA6IExvYWRhYmxlVmlld01vZGVsXG4gICAge1xuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IElOYXZpZ2F0b3IgX25hdmlnYXRvcjtcbnB1YmxpYyBvdmVycmlkZSBzdHJpbmcgRWxlbWVudElkKClcclxue1xyXG4gICAgcmV0dXJuIFNwYWZBcHAuU2Vjb25kSWQ7XHJcbn1cbiAgICAgICAgcHVibGljIFNlY29uZFZpZXdNb2RlbChJTmF2aWdhdG9yIG5hdmlnYXRvcilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fbmF2aWdhdG9yID0gbmF2aWdhdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgT25CaW5kaW5nRG9uZShEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIldlbGNvbWUhXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgQmFja1RvSG9tZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX25hdmlnYXRvci5OYXZpZ2F0ZShTcGFmQXBwLkhvbWVJZCk7XG4gICAgICAgIH1cbiAgICB9XG59Il0KfQo=
