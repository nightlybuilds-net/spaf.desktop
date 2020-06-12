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
            var antani = Bridge.Reflection.getMembers(Bridge.Navigation.BridgeNavigatorWithRouting, 1, 28);

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJzcGFmLmRlc2t0b3Auc3BhZmFwcC5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiU3BhZi9OYXZpZ2F0aW9uL05hdmlnYXRpb25VdGlsaXR5LmNzIiwiU3BhZi9OYXZpZ2F0aW9uL1V0aWxpdHkuY3MiLCJTcGFmL1ZpZXdNb2RlbEJhc2UuY3MiLCJTcGFmQXBwLmNzIiwiU3BhZi9Jb2MvQnJpZGdlSW9jLmNzIiwiU3BhZi9Jb2MvUmVzb2x2ZXJzL0Z1bmNSZXNvbHZlci5jcyIsIlNwYWYvSW9jL1Jlc29sdmVycy9JbnN0YW5jZVJlc29sdmVyLmNzIiwiU3BhZi9Jb2MvUmVzb2x2ZXJzL1NpbmdsZUluc3RhbmNlUmVzb2x2ZXIuY3MiLCJTcGFmL0lvYy9SZXNvbHZlcnMvVHJhbnNpZW50UmVzb2x2ZXIuY3MiLCJTcGFmL01lc3Nlbmdlci9NZXNzZW5nZXIuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9CcmlkZ2VOYXZpZ2F0b3IuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9CcmlkZ2VOYXZpZ2F0b3JDb25maWdCYXNlLmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvQ29tcGxleE9iamVjdE5hdmlnYXRpb25IaXN0b3J5LmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvUGFnZURlc2NyaXB0b3IuY3MiLCJTcGFmL05hdmlnYXRpb24vSW1wbC9RdWVyeVBhcmFtZXRlck5hdmlnYXRpb25IaXN0b3J5LmNzIiwiU3BhZi9Mb2FkYWJsZVZpZXdNb2RlbC5jcyIsIlNwYWYvUGFydGlhbE1vZGVsLmNzIiwiU3BhZi9OYXZpZ2F0aW9uL0ltcGwvQnJpZGdlTmF2aWdhdG9yV2l0aFJvdXRpbmcuY3MiLCJDdXN0b21Sb3V0ZXNDb25maWcuY3MiLCJWaWV3TW9kZWxzL0hvbWVWaWV3TW9kZWwuY3MiLCJWaWV3TW9kZWxzL1NlY29uZFZpZXdNb2RlbC5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7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Z0JBS0FBOztnQkFFQUE7OztnQkFLQUEsc0RBQXlCQTs7Ozs7Ozs7Ozs7OzRCQy9CTkE7OztnQkFFbkJBLGtCQUFrQkE7Ozs7O2dCQUoxQkEsT0FBT0E7O3FDQU9nQ0E7Z0JBRS9CQTs7O2dCQUtBQSxzREFBeUJBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgQnJpZGdlLkh0bWw1O1xuXG5uYW1lc3BhY2UgQnJpZGdlLk5hdmlnYXRpb25cbntcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIE5hdmlnYXRpb25VdGlsaXR5XG4gICAge1xuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBEZWZpbmUgdmlydHVhbCBkaXJlY3RvcnkgZm9yIHNvbWV0aGluZyBsaWtlOlxuICAgICAgICAvLy8gcHJvdG9jb2w6Ly9hd2Vzb21lc2l0ZS5pby9zb21lZGlyZWN0b3J5XG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIFZpcnR1YWxEaXJlY3RvcnkgPSBudWxsO1xuXG4gICAgICAgXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIEdldCBwYXJhbWV0ZXIga2V5IGZyb20gcGFyYW1ldGVycyBkaWN0aW9uYXJ5XG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUXCI+PC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhcmFtZXRlcnNcIj48L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwYXJhbUtleVwiPjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cmV0dXJucz48L3JldHVybnM+XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVCBHZXRQYXJhbWV0ZXI8VD4odGhpcyBEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzLCBzdHJpbmcgcGFyYW1LZXkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJzID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlBhcmFtZXRlcnMgaXMgbnVsbCFcIik7XG5cbiAgICAgICAgICAgIGlmICghcGFyYW1ldGVycy5Db250YWluc0tleShwYXJhbUtleSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihzdHJpbmcuRm9ybWF0KFwiTm8gcGFyYW1ldGVyIHdpdGgga2V5IHswfSBmb3VuZCFcIixwYXJhbUtleSkpO1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbWV0ZXJzW3BhcmFtS2V5XTtcblxuICAgICAgICAgICAgaWYgKCEodmFsdWUgaXMgc3RyaW5nKSkgcmV0dXJuIChUKSB2YWx1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHBhcnNlTWV0aG9kID0gdHlwZW9mKFQpLkdldE1ldGhvZChcIlBhcnNlXCIsIG5ldyBUeXBlW10geyB0eXBlb2Yoc3RyaW5nKSB9ICk7XG5cbiAgICAgICAgICAgIGlmIChwYXJzZU1ldGhvZCAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiAoVClwYXJzZU1ldGhvZC5JbnZva2UobnVsbCwgbmV3IG9iamVjdFtdIHsgdmFsdWUgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiAoVCkgdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIEJ1aWxkIGJhc2UgdXJsIHVzaW5nIHBhZ2UgaWQgYW5kIHZpcnR1YWwgZGlyZWN0b3J5XG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhZ2VJZFwiPjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cmV0dXJucz48L3JldHVybnM+XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEJ1aWxkQmFzZVVybChzdHJpbmcgcGFnZUlkKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYmFzZVVybCA9IHN0cmluZy5Gb3JtYXQoXCJ7MH0vL3sxfVwiLFdpbmRvdy5Mb2NhdGlvbi5Qcm90b2NvbCxXaW5kb3cuTG9jYXRpb24uSG9zdCk7XG4gICAgICAgICAgICBiYXNlVXJsID0gc3RyaW5nLklzTnVsbE9yRW1wdHkoVmlydHVhbERpcmVjdG9yeSlcbiAgICAgICAgICAgICAgICA/IHN0cmluZy5Gb3JtYXQoXCJ7MH0jezF9XCIsYmFzZVVybCxwYWdlSWQpICAgICAgICAgICAgICAgIDogc3RyaW5nLkZvcm1hdChcInswfS97MX0jezJ9XCIsYmFzZVVybCxWaXJ0dWFsRGlyZWN0b3J5LHBhZ2VJZCk7XG4gICAgICAgICAgICByZXR1cm4gYmFzZVVybDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLkxpbnE7XG51c2luZyBCcmlkZ2UualF1ZXJ5MjtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBVdGlsaXR5XG4gICAge1xuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBMb2FkIHNjcmlwdCBzZXF1ZW50aWFsbHlcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic2NyaXB0c1wiPjwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTZXF1ZW50aWFsU2NyaXB0TG9hZChMaXN0PHN0cmluZz4gc2NyaXB0cylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCFTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkFueTxzdHJpbmc+KHNjcmlwdHMpKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgdG9Mb2FkID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdDxzdHJpbmc+KHNjcmlwdHMpO1xuICAgICAgICAgICAgalF1ZXJ5LkdldFNjcmlwdCh0b0xvYWQsIChTeXN0ZW0uQWN0aW9uPG9iamVjdCxzdHJpbmcsanFYSFI+KSgobywgcywgYXJnMykgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzY3JpcHRzLlJlbW92ZSh0b0xvYWQpO1xuICAgICAgICAgICAgICAgIFNlcXVlbnRpYWxTY3JpcHRMb2FkKHNjcmlwdHMpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufSIsInVzaW5nIFJldHlwZWQ7XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLlNwYWZcclxue1xyXG4gICAgcHVibGljIGFic3RyYWN0IGNsYXNzIFZpZXdNb2RlbEJhc2VcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIGRvbS5IVE1MRWxlbWVudCBfcGFnZU5vZGU7XHJcblxyXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cclxuICAgICAgICAvLy8gRWxlbWVudCBpZCBvZiB0aGUgcGFnZSBcclxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgICAgIC8vLyA8cmV0dXJucz48L3JldHVybnM+XHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN0cmluZyBFbGVtZW50SWQoKTtcclxucHVibGljIGRvbS5IVE1MRWxlbWVudCBQYWdlTm9kZVxyXG57XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gX3BhZ2VOb2RlID8/ICh0aGlzLl9wYWdlTm9kZSA9IGRvbS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChFbGVtZW50SWQoKSkpO1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgcHVibGljIHZvaWQgQXBwbHlCaW5kaW5ncygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBrbm9ja291dC5rby5hcHBseUJpbmRpbmdzKHRoaXMsIHRoaXMuUGFnZU5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVtb3ZlQmluZGluZ3MoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAga25vY2tvdXQua28ucmVtb3ZlTm9kZSh0aGlzLlBhZ2VOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlJlZmxlY3Rpb247XHJcbnVzaW5nIEJyaWRnZTtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBCcmlkZ2UuSW9jO1xyXG51c2luZyBCcmlkZ2UuTWVzc2VuZ2VyO1xyXG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbjtcclxudXNpbmcgQnJpZGdlLlNwYWYuQXR0cmlidXRlcztcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuU3BhZlxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU3BhZkFwcFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgSUlvYyBDb250YWluZXI7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBhbnRhbmkgPSB0eXBlb2YoQnJpZGdlTmF2aWdhdG9yV2l0aFJvdXRpbmcpLkdldENvbnN0cnVjdG9ycygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgQ29udGFpbmVyID0gbmV3IEJyaWRnZUlvYygpO1xyXG4gICAgICAgICAgICBDb250YWluZXJDb25maWcoKTsgLy8gY29uZmlnIGNvbnRhaW5lclxyXG4gICAgICAgICAgICBDb250YWluZXIuUmVzb2x2ZTxJTmF2aWdhdG9yPigpLkluaXROYXZpZ2F0aW9uKCk7IC8vIGluaXQgbmF2aWdhdGlvblxyXG5cclxuICAgICAgICAgICAgV2luZG93Lk9uRXJyb3IgPSAobWVzc2FnZSwgdXJsLCBudW1iZXIsIGNvbHVtbk51bWJlciwgZXJyb3IpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIENvbnRhaW5lckNvbmZpZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBuYXZpZ2F0b3JcclxuICAgICAgICAgICAgQ29udGFpbmVyLlJlZ2lzdGVyU2luZ2xlSW5zdGFuY2U8SU5hdmlnYXRvciwgQnJpZGdlTmF2aWdhdG9yV2l0aFJvdXRpbmc+KCk7XHJcbiAgICAgICAgICAgIENvbnRhaW5lci5SZWdpc3RlclNpbmdsZUluc3RhbmNlPElCcm93c2VySGlzdG9yeU1hbmFnZXIsIFF1ZXJ5UGFyYW1ldGVyTmF2aWdhdGlvbkhpc3Rvcnk+KCk7XHJcbi8vICAgICAgICAgICAgQ29udGFpbmVyLlJlZ2lzdGVyU2luZ2xlSW5zdGFuY2U8SUJyb3dzZXJIaXN0b3J5TWFuYWdlciwgQ29tcGxleE9iamVjdE5hdmlnYXRpb25IaXN0b3J5PigpOyAvLyBpZiB5b3UgZG9uJ3QgbmVlZCBxdWVyeSBwYXJhbWV0ZXJzXHJcbiAgICAgICAgICAgIENvbnRhaW5lci5SZWdpc3RlcjxJTmF2aWdhdG9yQ29uZmlndXJhdG9yLCBDdXN0b21Sb3V0ZXNDb25maWc+KCk7IFxyXG5cclxuICAgICAgICAgICAgLy8gbWVzc2VuZ2VyXHJcbiAgICAgICAgICAgIENvbnRhaW5lci5SZWdpc3RlclNpbmdsZUluc3RhbmNlPElNZXNzZW5nZXIsIE1lc3Nlbmdlci5NZXNzZW5nZXI+KCk7XHJcblxyXG4gICAgICAgICAgICAvLyB2aWV3bW9kZWxzXHJcbiAgICAgICAgICAgIFJlZ2lzdGVyQWxsVmlld01vZGVscygpO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVnaXN0ZXIgY3VzdG9tIHJlc291cmNlLCBzZXJ2aWNlcy4uXHJcblxyXG4gICAgICAgIH1cclxuI3JlZ2lvbiBQQUdFUyBJRFNcclxuLy8gc3RhdGljIHBhZ2VzIGlkXHJcbnB1YmxpYyBzdGF0aWMgc3RyaW5nIEhvbWVJZFxyXG57XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gXCJob21lXCI7XHJcbiAgICB9XHJcbn1wdWJsaWMgc3RhdGljIHN0cmluZyBTZWNvbmRJZFxyXG57XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gXCJzZWNvbmRcIjtcclxuICAgIH1cclxufSAgICAgICBcclxuICAgICAgICAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgICNyZWdpb24gTUVTU0FHRVNcclxuICAgICAgICAvLyBtZXNzZW5nZXIgaGVscGVyIGZvciBnbG9iYWwgbWVzc2FnZXMgYW5kIG1lc3NhZ2VzIGlkc1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGNsYXNzIE1lc3NhZ2VzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwdWJsaWMgY2xhc3MgR2xvYmFsU2VuZGVyIHsgfTtcclxuXHJcbiAgICAgICAgICAgIHB1YmxpYyBzdGF0aWMgR2xvYmFsU2VuZGVyIFNlbmRlciA9IG5ldyBHbG9iYWxTZW5kZXIoKTtcclxucHVibGljIHN0YXRpYyBzdHJpbmcgTG9naW5Eb25lXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBcIkxvZ2luRG9uZVwiO1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLy8gPHN1bW1hcnk+XHJcbiAgICAgICAgLy8vIFJlZ2lzdGVyIGFsbCB0eXBlcyB0aGF0IGVuZCB3aXRoIFwidmlld21vZGVsXCIuXHJcbiAgICAgICAgLy8vIFlvdSBjYW4gcmVnaXN0ZXIgYSB2aWV3bW9kZSBhcyBTaW5nbHIgSW5zdGFuY2UgYWRkaW5nIFwiU2luZ2xlSW5zdGFuY2VBdHRyaWJ1dGVcIiB0byB0aGUgY2xhc3NcclxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgUmVnaXN0ZXJBbGxWaWV3TW9kZWxzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciB0eXBlcyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0TWFueTxBc3NlbWJseSxUeXBlPihBcHBEb21haW4uQ3VycmVudERvbWFpbi5HZXRBc3NlbWJsaWVzKCksKEZ1bmM8QXNzZW1ibHksU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWMuSUVudW1lcmFibGU8VHlwZT4+KShzID0+IHMuR2V0VHlwZXMoKSkpXHJcbiAgICAgICAgICAgICAgICAuV2hlcmUoKEZ1bmM8VHlwZSxib29sPikodyA9PiB3Lk5hbWUuVG9Mb3dlcigpLkVuZHNXaXRoKFwidmlld21vZGVsXCIpKSkuVG9MaXN0KCk7XHJcblxyXG4gICAgICAgICAgICB0eXBlcy5Gb3JFYWNoKChBY3Rpb248VHlwZT4pKGYgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBmLkdldEN1c3RvbUF0dHJpYnV0ZXModHlwZW9mKFNpbmdsZUluc3RhbmNlQXR0cmlidXRlKSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuQW55PG9iamVjdD4oYXR0cmlidXRlcykpXHJcbiAgICAgICAgICAgICAgICAgICAgQ29udGFpbmVyLlJlZ2lzdGVyU2luZ2xlSW5zdGFuY2UoZik7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgQ29udGFpbmVyLlJlZ2lzdGVyKGYpO1xyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG5cclxubmFtZXNwYWNlIEJyaWRnZS5Jb2Ncclxue1xyXG4gICAgLy8vIDxzdW1tYXJ5PlxyXG4gICAgLy8vIEltcGxlbWVudGF0aW9uIG9mIElJb2NcclxuICAgIC8vLyA8L3N1bW1hcnk+XHJcbiAgICBwdWJsaWMgY2xhc3MgQnJpZGdlSW9jIDogSUlvY1xyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgRGljdGlvbmFyeTxUeXBlLCBJUmVzb2x2ZXI+IF9yZXNvbHZlcnMgPSBuZXcgRGljdGlvbmFyeTxUeXBlLCBJUmVzb2x2ZXI+KCk7XHJcblxyXG4gICAgICAgICNyZWdpb24gUkVHSVNUUkFUSU9OXHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyKFR5cGUgdHlwZSwgSVJlc29sdmVyIHJlc29sdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tBbHJlYWR5QWRkZWQodHlwZSk7XHJcbiAgICAgICAgICAgIF9yZXNvbHZlcnMuQWRkKHR5cGUsIHJlc29sdmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyKFR5cGUgdHlwZSwgVHlwZSBpbXBsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tBbHJlYWR5QWRkZWQodHlwZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZXIgPSBuZXcgVHJhbnNpZW50UmVzb2x2ZXIodGhpcywgaW1wbCk7XHJcbiAgICAgICAgICAgIF9yZXNvbHZlcnMuQWRkKHR5cGUsIHJlc29sdmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyPFRUeXBlLCBUSW1wbGVtZW50YXRpb24+KCkgd2hlcmUgVEltcGxlbWVudGF0aW9uIDogY2xhc3MsIFRUeXBlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWdpc3Rlcih0eXBlb2YoVFR5cGUpLCB0eXBlb2YoVEltcGxlbWVudGF0aW9uKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3RlcihUeXBlIHR5cGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWdpc3Rlcih0eXBlLCB0eXBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyPFRUeXBlPigpIHdoZXJlIFRUeXBlIDogY2xhc3NcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlZ2lzdGVyKHR5cGVvZihUVHlwZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZShUeXBlIHR5cGUsIFR5cGUgaW1wbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrQWxyZWFkeUFkZGVkKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc29sdmVyID0gbmV3IFNpbmdsZUluc3RhbmNlUmVzb2x2ZXIodGhpcywgaW1wbCk7XHJcbiAgICAgICAgICAgIF9yZXNvbHZlcnMuQWRkKHR5cGUsIHJlc29sdmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlZ2lzdGVyU2luZ2xlSW5zdGFuY2U8VFR5cGUsIFRJbXBsZW1lbnRhdGlvbj4oKSB3aGVyZSBUSW1wbGVtZW50YXRpb24gOiBjbGFzcywgVFR5cGVcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlZ2lzdGVyU2luZ2xlSW5zdGFuY2UodHlwZW9mKFRUeXBlKSwgdHlwZW9mKFRJbXBsZW1lbnRhdGlvbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZShUeXBlIHR5cGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWdpc3RlclNpbmdsZUluc3RhbmNlKHR5cGUsIHR5cGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXJTaW5nbGVJbnN0YW5jZTxUVHlwZT4oKSB3aGVyZSBUVHlwZSA6IGNsYXNzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWdpc3RlclNpbmdsZUluc3RhbmNlKHR5cGVvZihUVHlwZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXJGdW5jPFRUeXBlPihGdW5jPFRUeXBlPiBmdW5jKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tBbHJlYWR5QWRkZWQ8VFR5cGU+KCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZXIgPSBuZXcgRnVuY1Jlc29sdmVyPFRUeXBlPihmdW5jKTtcclxuICAgICAgICAgICAgX3Jlc29sdmVycy5BZGQodHlwZW9mKFRUeXBlKSwgcmVzb2x2ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUmVnaXN0ZXJJbnN0YW5jZShUeXBlIHR5cGUsIG9iamVjdCBpbnN0YW5jZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrQWxyZWFkeUFkZGVkKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc29sdmVyID0gbmV3IEluc3RhbmNlUmVzb2x2ZXIoaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICBfcmVzb2x2ZXJzLkFkZCh0eXBlLCByZXNvbHZlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3Rlckluc3RhbmNlKG9iamVjdCBpbnN0YW5jZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlZ2lzdGVySW5zdGFuY2UoaW5zdGFuY2UuR2V0VHlwZSgpLCBpbnN0YW5jZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWdpc3Rlckluc3RhbmNlPFRUeXBlPihUVHlwZSBpbnN0YW5jZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlZ2lzdGVySW5zdGFuY2UodHlwZW9mKFRUeXBlKSwgaW5zdGFuY2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAjZW5kcmVnaW9uXHJcblxyXG5cclxuICAgICAgICAjcmVnaW9uIFJFU09MVkVcclxuICAgICAgICBwdWJsaWMgVFR5cGUgUmVzb2x2ZTxUVHlwZT4oKSB3aGVyZSBUVHlwZSA6IGNsYXNzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja05vdFJlZ2lzdGVyZWQ8VFR5cGU+KCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZXIgPSBfcmVzb2x2ZXJzW3R5cGVvZihUVHlwZSldO1xyXG4gICAgICAgICAgICByZXR1cm4gKFRUeXBlKXJlc29sdmVyLlJlc29sdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvYmplY3QgUmVzb2x2ZShUeXBlIHR5cGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDaGVja05vdFJlZ2lzdGVyZWQodHlwZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZXIgPSBfcmVzb2x2ZXJzW3R5cGVdO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZXIuUmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAjZW5kcmVnaW9uXHJcblxyXG5cclxuICAgICAgICAjcmVnaW9uIFBSSVZBVEVcclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENoZWNrQWxyZWFkeUFkZGVkKFR5cGUgdHlwZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChfcmVzb2x2ZXJzLkNvbnRhaW5zS2V5KHR5cGUpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihzdHJpbmcuRm9ybWF0KFwiezB9IGlzIGFscmVhZHkgcmVnaXN0ZXJlZCFcIix0eXBlLkZ1bGxOYW1lKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQ2hlY2tBbHJlYWR5QWRkZWQ8VFR5cGU+KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENoZWNrQWxyZWFkeUFkZGVkKHR5cGVvZihUVHlwZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENoZWNrTm90UmVnaXN0ZXJlZChUeXBlIHR5cGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIV9yZXNvbHZlcnMuQ29udGFpbnNLZXkodHlwZSkpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKHN0cmluZy5Gb3JtYXQoXCJDYW5ub3QgcmVzb2x2ZSB7MH0sIGl0J3Mgbm90IHJlZ2lzdGVyZWQhXCIsdHlwZS5GdWxsTmFtZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENoZWNrTm90UmVnaXN0ZXJlZDxUVHlwZT4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2hlY2tOb3RSZWdpc3RlcmVkKHR5cGVvZihUVHlwZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwidXNpbmcgU3lzdGVtO1xyXG5cclxubmFtZXNwYWNlIEJyaWRnZS5Jb2Ncclxue1xyXG4gICAgcHVibGljIGNsYXNzIEZ1bmNSZXNvbHZlcjxUPiA6IElSZXNvbHZlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBGdW5jPG9iamVjdD4gUmVzb2x2ZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBGdW5jUmVzb2x2ZXIoRnVuYzxUPiByZXNvbHZlRnVuYylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuUmVzb2x2ZSA9ICgpID0+IHJlc29sdmVGdW5jKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwidXNpbmcgU3lzdGVtO1xyXG5cclxubmFtZXNwYWNlIEJyaWRnZS5Jb2Ncclxue1xyXG4gICAgcHVibGljIGNsYXNzIEluc3RhbmNlUmVzb2x2ZXIgOiBJUmVzb2x2ZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgRnVuYzxvYmplY3Q+IFJlc29sdmUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgSW5zdGFuY2VSZXNvbHZlcihvYmplY3QgcmVzb2x2ZWRPYmopXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZXNvbHZlID0gKCkgPT4gcmVzb2x2ZWRPYmo7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGFzcyBJbnN0YW5jZVJlc29sdmVyPFQ+IDogSW5zdGFuY2VSZXNvbHZlclxyXG4gICAge1xyXG5cclxuICAgICAgICBwdWJsaWMgSW5zdGFuY2VSZXNvbHZlcihUIHJlc29sdmVkT2JqKSA6IGJhc2UocmVzb2x2ZWRPYmopXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcblxyXG5uYW1lc3BhY2UgQnJpZGdlLklvY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU2luZ2xlSW5zdGFuY2VSZXNvbHZlciA6IElSZXNvbHZlclxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgb2JqZWN0IF9zaW5nbGVJbnN0YW5jZTtcclxuXHJcbiAgICAgICAgcHVibGljIEZ1bmM8b2JqZWN0PiBSZXNvbHZlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIFNpbmdsZUluc3RhbmNlUmVzb2x2ZXIoSUlvYyBpb2MsIFR5cGUgdHlwZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlc29sdmUgPSAoKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCByZXNvbHZlLiBVc2luZyB0cmFuc2llbnQgcmVzb2x2ZXJcclxuICAgICAgICAgICAgICAgIGlmIChfc2luZ2xlSW5zdGFuY2UgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNpZW50UmVzb2x2ZXIgPSBuZXcgVHJhbnNpZW50UmVzb2x2ZXIoaW9jLCB0eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICBfc2luZ2xlSW5zdGFuY2UgPSB0cmFuc2llbnRSZXNvbHZlci5SZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9zaW5nbGVJbnN0YW5jZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsYXNzIFNpbmdsZUluc3RhbmNlUmVzb2x2ZXI8VD4gOiBTaW5nbGVJbnN0YW5jZVJlc29sdmVyXHJcbiAgICB7XHJcblxyXG4gICAgICAgIHB1YmxpYyBTaW5nbGVJbnN0YW5jZVJlc29sdmVyKElJb2MgaW9jKSA6IGJhc2UoaW9jLCB0eXBlb2YoVCkpXHJcbiAgICAgICAge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuSW9jXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBUcmFuc2llbnRSZXNvbHZlciA6IElSZXNvbHZlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBGdW5jPG9iamVjdD4gUmVzb2x2ZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBUcmFuc2llbnRSZXNvbHZlcihJSW9jIGlvYywgVHlwZSB0b3Jlc29sdmVUeXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5SZXNvbHZlID0gKCkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gZ2V0IGN0b3JcclxuICAgICAgICAgICAgICAgIHZhciBjdG9yID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdE9yRGVmYXVsdDxTeXN0ZW0uUmVmbGVjdGlvbi5Db25zdHJ1Y3RvckluZm8+KHRvcmVzb2x2ZVR5cGUuR2V0Q29uc3RydWN0b3JzKCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN0b3IgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKHN0cmluZy5Gb3JtYXQoXCJObyBjdG9yIGZvdW5kIGZvciB0eXBlIHswfSFcIix0b3Jlc29sdmVUeXBlLkZ1bGxOYW1lKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZ2V0IGN0b3IgcGFyYW1zXHJcbiAgICAgICAgICAgICAgICB2YXIgY3RvclBhcmFtcyA9IGN0b3IuR2V0UGFyYW1ldGVycygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkFueTxTeXN0ZW0uUmVmbGVjdGlvbi5QYXJhbWV0ZXJJbmZvPihjdG9yUGFyYW1zKSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQWN0aXZhdG9yLkNyZWF0ZUluc3RhbmNlKHRvcmVzb2x2ZVR5cGUpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlY3Vyc2l2ZSByZXNvbHZlXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBuZXcgTGlzdDxvYmplY3Q+KGN0b3JQYXJhbXMuTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAodmFyIHBhcmFtZXRlckluZm8gaW4gY3RvclBhcmFtcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVycy5BZGQoaW9jLlJlc29sdmUocGFyYW1ldGVySW5mby5QYXJhbWV0ZXJUeXBlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdG9yLkludm9rZShwYXJhbWV0ZXJzLlRvQXJyYXkoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGFzcyBUcmFuc2llbnRSZXNvbHZlcjxUPiA6IFRyYW5zaWVudFJlc29sdmVyXHJcbiAgICB7XHJcblxyXG4gICAgICAgIHB1YmxpYyBUcmFuc2llbnRSZXNvbHZlcihJSW9jIGlvYykgOiBiYXNlKGlvYywgdHlwZW9mKFQpKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLkxpbnE7XG51c2luZyBTeXN0ZW0uVGV4dDtcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuTWVzc2VuZ2VyXG57XG4gICAgcHVibGljIGNsYXNzIE1lc3NlbmdlciA6IElNZXNzZW5nZXJcbiAgICB7XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHlcbiAgICAgICAgICAgIERpY3Rpb25hcnk8VHVwbGU8c3RyaW5nLCBUeXBlLCBUeXBlPiwgTGlzdDxUdXBsZTxvYmplY3QsIEFjdGlvbjxvYmplY3QsIG9iamVjdD4+Pj4gX2NhbGxzID1cbiAgICAgICAgICAgICAgICBuZXcgRGljdGlvbmFyeTxUdXBsZTxzdHJpbmcsIFR5cGUsIFR5cGU+LCBMaXN0PFR1cGxlPG9iamVjdCwgQWN0aW9uPG9iamVjdCwgb2JqZWN0Pj4+PigpO1xuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIFNlbmQgTWVzc2FnZSB3aXRoIGFyZ3NcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRTZW5kZXJcIj5UU2VuZGVyPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUQXJnc1wiPlRNZXNzYWdlQXJnczwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzZW5kZXJcIj5TZW5kZXI8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJtZXNzYWdlXCI+TWVzc2FnZTwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImFyZ3NcIj5BcmdzPC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZvaWQgU2VuZDxUU2VuZGVyLCBUQXJncz4oVFNlbmRlciBzZW5kZXIsIHN0cmluZyBtZXNzYWdlLCBUQXJncyBhcmdzKSB3aGVyZSBUU2VuZGVyIDogY2xhc3NcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHNlbmRlciA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJzZW5kZXJcIik7XG4gICAgICAgICAgICB0aGlzLklubmVyU2VuZChtZXNzYWdlLCB0eXBlb2YoVFNlbmRlciksIHR5cGVvZihUQXJncyksIHNlbmRlciwgYXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBTZW5kIE1lc3NhZ2Ugd2l0aG91dCBhcmdzXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUU2VuZGVyXCI+VFNlbmRlcjwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzZW5kZXJcIj5TZW5kZXI8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJtZXNzYWdlXCI+TWVzc2FnZTwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2b2lkIFNlbmQ8VFNlbmRlcj4oVFNlbmRlciBzZW5kZXIsIHN0cmluZyBtZXNzYWdlKSB3aGVyZSBUU2VuZGVyIDogY2xhc3NcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHNlbmRlciA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJzZW5kZXJcIik7XG4gICAgICAgICAgICB0aGlzLklubmVyU2VuZChtZXNzYWdlLCB0eXBlb2YoVFNlbmRlciksIG51bGwsIHNlbmRlciwgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBTdWJzY3JpYmUgTWVzc2FnZSB3aXRoIGFyZ3NcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRTZW5kZXJcIj5UU2VuZGVyPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUQXJnc1wiPlRBcmdzPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN1YnNjcmliZXJcIj5TdWJzY3JpYmVyPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwibWVzc2FnZVwiPk1lc3NhZ2U8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJjYWxsYmFja1wiPkFjdGlvbjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInNvdXJjZVwiPnNvdXJjZTwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2b2lkIFN1YnNjcmliZTxUU2VuZGVyLCBUQXJncz4ob2JqZWN0IHN1YnNjcmliZXIsIHN0cmluZyBtZXNzYWdlLCBBY3Rpb248VFNlbmRlciwgVEFyZ3M+IGNhbGxiYWNrLFxuICAgICAgICAgICAgVFNlbmRlciBzb3VyY2UgPSBudWxsKSB3aGVyZSBUU2VuZGVyIDogY2xhc3NcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHN1YnNjcmliZXIgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwic3Vic2NyaWJlclwiKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJjYWxsYmFja1wiKTtcblxuICAgICAgICAgICAgQWN0aW9uPG9iamVjdCwgb2JqZWN0PiB3cmFwID0gKHNlbmRlciwgYXJncykgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VuZCA9IChUU2VuZGVyKXNlbmRlcjtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlID09IG51bGwgfHwgc2VuZCA9PSBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKChUU2VuZGVyKXNlbmRlciwgKFRBcmdzKWFyZ3MpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5Jbm5lclN1YnNjcmliZShzdWJzY3JpYmVyLCBtZXNzYWdlLCB0eXBlb2YoVFNlbmRlciksIHR5cGVvZihUQXJncyksIChBY3Rpb248b2JqZWN0LG9iamVjdD4pd3JhcCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBTdWJzY3JpYmUgTWVzc2FnZSB3aXRob3V0IGFyZ3NcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDx0eXBlcGFyYW0gbmFtZT1cIlRTZW5kZXJcIj5UU2VuZGVyPC90eXBlcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInN1YnNjcmliZXJcIj5TdWJzY3JpYmVyPC9wYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwibWVzc2FnZVwiPk1lc3NhZ2U8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJjYWxsYmFja1wiPkFjdGlvbjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInNvdXJjZVwiPnNvdXJjZTwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2b2lkIFN1YnNjcmliZTxUU2VuZGVyPihvYmplY3Qgc3Vic2NyaWJlciwgc3RyaW5nIG1lc3NhZ2UsIEFjdGlvbjxUU2VuZGVyPiBjYWxsYmFjayxcbiAgICAgICAgICAgIFRTZW5kZXIgc291cmNlID0gbnVsbCkgd2hlcmUgVFNlbmRlciA6IGNsYXNzXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVyID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcInN1YnNjcmliZXJcIik7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwiY2FsbGJhY2tcIik7XG5cbiAgICAgICAgICAgIEFjdGlvbjxvYmplY3QsIG9iamVjdD4gd3JhcCA9IChzZW5kZXIsIGFyZ3MpID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbmQgPSAoVFNlbmRlcilzZW5kZXI7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZSA9PSBudWxsIHx8IHNlbmQgPT0gc291cmNlKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygoVFNlbmRlcilzZW5kZXIpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5Jbm5lclN1YnNjcmliZShzdWJzY3JpYmVyLCBtZXNzYWdlLCB0eXBlb2YoVFNlbmRlciksIG51bGwsIChBY3Rpb248b2JqZWN0LG9iamVjdD4pd3JhcCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBVbnN1YnNjcmliZSBhY3Rpb24gd2l0aCBhcmdzXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8dHlwZXBhcmFtIG5hbWU9XCJUU2VuZGVyXCI+VFNlbmRlcjwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVEFyZ3NcIj5UQXJnczwvdHlwZXBhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJzdWJzY3JpYmVyXCI+U3Vic2NyaWJlcjwvcGFyYW0+XG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1lc3NhZ2VcIj5NZXNzYWdlPC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZvaWQgVW5zdWJzY3JpYmU8VFNlbmRlciwgVEFyZ3M+KG9iamVjdCBzdWJzY3JpYmVyLCBzdHJpbmcgbWVzc2FnZSkgd2hlcmUgVFNlbmRlciA6IGNsYXNzXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuSW5uZXJVbnN1YnNjcmliZShtZXNzYWdlLCB0eXBlb2YoVFNlbmRlciksIHR5cGVvZihUQXJncyksIHN1YnNjcmliZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gVW5zdWJzY3JpYmUgYWN0aW9uIHdpdGhvdXQgYXJnc1xuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHR5cGVwYXJhbSBuYW1lPVwiVFNlbmRlclwiPlRTZW5kZXI8L3R5cGVwYXJhbT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic3Vic2NyaWJlclwiPlN1YnNjcmliZXI8L3BhcmFtPlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJtZXNzYWdlXCI+TWVzc2FnZTwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2b2lkIFVuc3Vic2NyaWJlPFRTZW5kZXI+KG9iamVjdCBzdWJzY3JpYmVyLCBzdHJpbmcgbWVzc2FnZSkgd2hlcmUgVFNlbmRlciA6IGNsYXNzXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuSW5uZXJVbnN1YnNjcmliZShtZXNzYWdlLCB0eXBlb2YoVFNlbmRlciksIG51bGwsIHN1YnNjcmliZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gUmVtb3ZlIGFsbCBjYWxsYmFja3NcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgcHVibGljIHZvaWQgUmVzZXRNZXNzZW5nZXIoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9jYWxscy5DbGVhcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSB2b2lkIElubmVyU2VuZChzdHJpbmcgbWVzc2FnZSwgVHlwZSBzZW5kZXJUeXBlLCBUeXBlIGFyZ1R5cGUsIG9iamVjdCBzZW5kZXIsIG9iamVjdCBhcmdzKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJtZXNzYWdlXCIpO1xuICAgICAgICAgICAgdmFyIGtleSA9IG5ldyBUdXBsZTxzdHJpbmcsIFR5cGUsIFR5cGU+KG1lc3NhZ2UsIHNlbmRlclR5cGUsIGFyZ1R5cGUpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9jYWxscy5Db250YWluc0tleShrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHZhciBhY3Rpb25zID0gdGhpcy5fY2FsbHNba2V5XTtcbiAgICAgICAgICAgIGlmIChhY3Rpb25zID09IG51bGwgfHwgIVN5c3RlbS5MaW5xLkVudW1lcmFibGUuQW55PFR1cGxlPG9iamVjdCxBY3Rpb248b2JqZWN0LG9iamVjdD4+PihhY3Rpb25zKSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciBhY3Rpb25zQ29weSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuVG9MaXN0PFR1cGxlPG9iamVjdCxBY3Rpb248b2JqZWN0LG9iamVjdD4+PihhY3Rpb25zKTtcbiAgICAgICAgICAgIGZvcmVhY2ggKHZhciBhY3Rpb24gaW4gYWN0aW9uc0NvcHkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbnMuQ29udGFpbnMoYWN0aW9uKSlcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uLkl0ZW0yKHNlbmRlciwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHZvaWQgSW5uZXJTdWJzY3JpYmUob2JqZWN0IHN1YnNjcmliZXIsIHN0cmluZyBtZXNzYWdlLCBUeXBlIHNlbmRlclR5cGUsIFR5cGUgYXJnVHlwZSxcbiAgICAgICAgICAgIEFjdGlvbjxvYmplY3QsIG9iamVjdD4gY2FsbGJhY2spXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcIm1lc3NhZ2VcIik7XG4gICAgICAgICAgICB2YXIga2V5ID0gbmV3IFR1cGxlPHN0cmluZywgVHlwZSwgVHlwZT4obWVzc2FnZSwgc2VuZGVyVHlwZSwgYXJnVHlwZSk7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgVHVwbGU8b2JqZWN0LCBBY3Rpb248b2JqZWN0LCBvYmplY3Q+PihzdWJzY3JpYmVyLCBjYWxsYmFjayk7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2FsbHMuQ29udGFpbnNLZXkoa2V5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWxsc1trZXldLkFkZCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuQ2FsbEZvcihuZXcgTGlzdDxUdXBsZTxvYmplY3QsIEFjdGlvbjxvYmplY3QsIG9iamVjdD4+PigpLChfbzEpPT57X28xLkFkZCh2YWx1ZSk7cmV0dXJuIF9vMTt9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWxsc1trZXldID0gbGlzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgdm9pZCBJbm5lclVuc3Vic2NyaWJlKHN0cmluZyBtZXNzYWdlLCBUeXBlIHNlbmRlclR5cGUsIFR5cGUgYXJnVHlwZSwgb2JqZWN0IHN1YnNjcmliZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVyID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcInN1YnNjcmliZXJcIik7XG4gICAgICAgICAgICBpZiAobWVzc2FnZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJtZXNzYWdlXCIpO1xuXG4gICAgICAgICAgICB2YXIga2V5ID0gbmV3IFR1cGxlPHN0cmluZywgVHlwZSwgVHlwZT4obWVzc2FnZSwgc2VuZGVyVHlwZSwgYXJnVHlwZSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2NhbGxzLkNvbnRhaW5zS2V5KGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB2YXIgdG9yZW1vdmUgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPFR1cGxlPG9iamVjdCxBY3Rpb248b2JqZWN0LG9iamVjdD4+Pih0aGlzLl9jYWxsc1trZXldLChGdW5jPFR1cGxlPG9iamVjdCxBY3Rpb248b2JqZWN0LG9iamVjdD4+LGJvb2w+KSh0dXBsZSA9PiB0dXBsZS5JdGVtMSA9PSBzdWJzY3JpYmVyKSkuVG9MaXN0KCk7XG5cbiAgICAgICAgICAgIGZvcmVhY2ggKHZhciB0dXBsZSBpbiB0b3JlbW92ZSlcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWxsc1trZXldLlJlbW92ZSh0dXBsZSk7XG5cbiAgICAgICAgICAgIGlmICghU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Bbnk8VHVwbGU8b2JqZWN0LEFjdGlvbjxvYmplY3Qsb2JqZWN0Pj4+KHRoaXMuX2NhbGxzW2tleV0pKVxuICAgICAgICAgICAgICAgIHRoaXMuX2NhbGxzLlJlbW92ZShrZXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uTGlucTtcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XG51c2luZyBCcmlkZ2UuSHRtbDU7XG51c2luZyBCcmlkZ2UualF1ZXJ5MjtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgLy8vIDxzdW1tYXJ5PlxuICAgIC8vLyBJTmF2aWdhdG9yIGltcGxlbWVudGF0aW9uXG4gICAgLy8vIDwvc3VtbWFyeT5cbiAgICBwdWJsaWMgY2xhc3MgQnJpZGdlTmF2aWdhdG9yIDogSU5hdmlnYXRvclxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSUFtTG9hZGFibGUgX2FjdHVhbENvbnRyb2xsZXI7XG5cbiAgICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IElOYXZpZ2F0b3JDb25maWd1cmF0b3IgQ29uZmlndXJhdGlvbjtcbiAgICAgICAgcHVibGljIEJyaWRnZU5hdmlnYXRvcihJTmF2aWdhdG9yQ29uZmlndXJhdG9yIGNvbmZpZ3VyYXRpb24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIENvbmZpZ3VyYXRpb24gPSBjb25maWd1cmF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgRW5hYmxlU3BhZkFuY2hvcnMoKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYWxsQW5jaG9ycyA9IGpRdWVyeS5TZWxlY3QoXCJhXCIpO1xuICAgICAgICAgICAgYWxsQW5jaG9ycy5PZmYoRXZlbnRUeXBlLkNsaWNrLlRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgYWxsQW5jaG9ycy5DbGljaygoQWN0aW9uPGpRdWVyeU1vdXNlRXZlbnQ+KShldiA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBjbGlja2VkRWxlbWVudCA9IGV2LlRhcmdldDtcblxuICAgICAgICAgICAgICAgIGlmIChjbGlja2VkRWxlbWVudC5HZXRUeXBlKCkgIT0gdHlwZW9mKEhUTUxBbmNob3JFbGVtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tlZEVsZW1lbnQgPSBqUXVlcnkuRWxlbWVudChldi5UYXJnZXQpLlBhcmVudHMoXCJhXCIpLkdldCgwKTtcblxuICAgICAgICAgICAgICAgIHZhciBocmVmID0gY2xpY2tlZEVsZW1lbnQuR2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcblxuICAgICAgICAgICAgICAgIGlmIChzdHJpbmcuSXNOdWxsT3JFbXB0eShocmVmKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgdmFyIGlzTXlIcmVmID0gaHJlZi5TdGFydHNXaXRoKFwic3BhZjpcIik7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBpcyBteSBocmVmXG4gICAgICAgICAgICAgICAgaWYgKGlzTXlIcmVmKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZXYuUHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhZ2VJZCA9IGhyZWYuUmVwbGFjZShcInNwYWY6XCIsIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLk5hdmlnYXRlKHBhZ2VJZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gYW5jaG9yIGRlZmF1bHQgYmVoYXZpb3VyXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBOYXZpZ2F0ZSB0byBhIHBhZ2UgSUQuXG4gICAgICAgIC8vLyBUaGUgSUQgbXVzdCBiZSByZWdpc3RlcmVkLlxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJwYWdlSWRcIj48L3BhcmFtPlxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIE5hdmlnYXRlKHN0cmluZyBwYWdlSWQsIERpY3Rpb25hcnk8c3RyaW5nLG9iamVjdD4gcGFyYW1ldGVycyA9IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBwYWdlID0gdGhpcy5Db25maWd1cmF0aW9uLkdldFBhZ2VEZXNjcmlwdG9yQnlLZXkocGFnZUlkKTtcbiAgICAgICAgICAgIGlmIChwYWdlID09IG51bGwpIHRocm93IG5ldyBFeGNlcHRpb24oc3RyaW5nLkZvcm1hdChcIlBhZ2Ugbm90IGZvdW5kIHdpdGggSUQgezB9XCIscGFnZUlkKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNoZWNrIHJlZGlyZWN0IHJ1bGVcbiAgICAgICAgICAgIHZhciByZWRpcmVjdEtleSA9IGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5Ub1RlbXAoXCJrZXkxXCIscGFnZS5SZWRpcmVjdFJ1bGVzKSE9bnVsbD9nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbVRlbXA8RnVuYzxzdHJpbmc+PihcImtleTFcIikuSW52b2tlKCk6KHN0cmluZyludWxsO1xuICAgICAgICAgICAgaWYgKCFzdHJpbmcuSXNOdWxsT3JFbXB0eShyZWRpcmVjdEtleSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5OYXZpZ2F0ZShyZWRpcmVjdEtleSxwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBib2R5ID0gdGhpcy5Db25maWd1cmF0aW9uLkJvZHk7XG4gICAgICAgICAgICBpZihib2R5ID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIkNhbm5vdCBmaW5kIG5hdmlnYXRpb24gYm9keSBlbGVtZW50LlwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gbGVhdmUgYWN0dWFsIGNvbnRyb2xlbHJcbiAgICAgICAgICAgIGlmICh0aGlzLkxhc3ROYXZpZ2F0ZUNvbnRyb2xsZXIgIT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aGlzLkxhc3ROYXZpZ2F0ZUNvbnRyb2xsZXIuT25MZWF2ZSgpO1xuXG4gICAgICAgICAgICB0aGlzLkNvbmZpZ3VyYXRpb24uQm9keS5Mb2FkKHBhZ2UuSHRtbExvY2F0aW9uLkludm9rZSgpLG51bGwsIChBY3Rpb248c3RyaW5nLHN0cmluZyxqcVhIUj4pKGFzeW5jIChvLHMsYSkgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBsb2FkIGRlcGVuZGVuY2llc1xuICAgICAgICAgICAgICAgIGlmIChwYWdlLkRlcGVuZGVuY2llc1NjcmlwdHMgIT0gbnVsbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3JpcHRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Ub0xpc3Q8c3RyaW5nPigocGFnZS5EZXBlbmRlbmNpZXNTY3JpcHRzLkludm9rZSgpKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHBhZ2UuU2VxdWVudGlhbERlcGVuZGVuY2llc1NjcmlwdExvYWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsaXR5LlNlcXVlbnRpYWxTY3JpcHRMb2FkKHNjcmlwdHMpO1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBwYXJhbGxlbCBsb2FkXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NyaXB0c1Rhc2sgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlNlbGVjdDxzdHJpbmcsVGFzazxvYmplY3RbXT4+KHNjcmlwdHMsKEZ1bmM8c3RyaW5nLFRhc2s8b2JqZWN0W10+PikodXJsID0+IFRhc2suRnJvbVByb21pc2UoalF1ZXJ5LkdldFNjcmlwdCh1cmwpKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVGFzay5XaGVuQWxsPG9iamVjdFtdPihzY3JpcHRzVGFzayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgcGFnZVxuICAgICAgICAgICAgICAgIGdsb2JhbDo6QnJpZGdlLlNjcmlwdC5Ub1RlbXAoXCJrZXkyXCIscGFnZS5QcmVwYXJlUGFnZSkhPW51bGw/Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21MYW1iZGEoKCk9Pmdsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tVGVtcDxBY3Rpb24+KFwia2V5MlwiKS5JbnZva2UoKSk6bnVsbDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBzaG93IGFzIGZ1bGxzY3JlZW5cbiAgICAgICAgICAgICAgICBpZiAocGFnZS5GdWxsU2NyZWVuKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5TaG93QXNGdWxsU2NyZWVuKGJvZHkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGF1dG8gZW5hYmxlIHNwYWYgYW5jaG9yc1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5Db25maWd1cmF0aW9uLkRpc2FibGVBdXRvU3BhZkFuY2hvcnNPbk5hdmlnYXRlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVuYWJsZUFuY2hvcnMgPSBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuVG9UZW1wKFwia2V5M1wiLHBhZ2UuQXV0b0VuYWJsZVNwYWZBbmNob3JzKSE9bnVsbD9nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbVRlbXA8RnVuYzxib29sPj4oXCJrZXkzXCIpLkludm9rZSgpOihib29sPyludWxsO1xuICAgICAgICAgICAgICAgICAgICBpZihlbmFibGVBbmNob3JzLkhhc1ZhbHVlICYmIGVuYWJsZUFuY2hvcnMuVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkVuYWJsZVNwYWZBbmNob3JzKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBhZ2UuUGFnZUNvbnRyb2xsZXIgIT0gbnVsbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGxvYWQgbmV3IGNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBwYWdlLlBhZ2VDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLk9uQmVmb3JlQmluZGluZyhwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5PbkxvYWQocGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuT25CaW5kaW5nRG9uZShwYXJhbWV0ZXJzKTtcblxuICAgICAgICAgICAgICAgICAgICBfYWN0dWFsQ29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLk9uTmF2aWdhdGVkIT1udWxsP2dsb2JhbDo6QnJpZGdlLlNjcmlwdC5Gcm9tTGFtYmRhKCgpPT50aGlzLk9uTmF2aWdhdGVkLkludm9rZSh0aGlzLGNvbnRyb2xsZXIpKTpudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pKTsgXG4gICAgICAgIH1cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBDb250ZW50IHBhZ2UgaXMgdGhlIGZpcnN0IGNoaWxkIG9mIGJvZHlcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiYm9keVwiPjwvcGFyYW0+XG4gICAgICAgIHByaXZhdGUgdm9pZCBTaG93QXNGdWxsU2NyZWVuKGpRdWVyeSBib2R5KVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgdGhlRGl2ID0gYm9keS5DaGlsZHJlbigpLkZpcnN0KCk7XG4gICAgICAgICAgICB0aGVEaXYuQ3NzKFwid2lkdGhcIiAsIFwiMTAwJVwiKTtcbiAgICAgICAgICAgIHRoZURpdi5Dc3MoXCJoZWlnaHRcIiAsIFwiMTAwJVwiKTtcbiAgICAgICAgICAgIHRoZURpdi5Dc3MoXCJsZWZ0XCIgLCBcIjBcIik7XG4gICAgICAgICAgICB0aGVEaXYuQ3NzKFwidG9wXCIgLCBcIjBcIik7XG4gICAgICAgICAgICB0aGVEaXYuQ3NzKFwiei1pbmRleFwiICwgXCI5OTk5OTlcIik7XG4gICAgICAgICAgICB0aGVEaXYuQ3NzKFwicG9zaXRpb25cIiAsIFwiYWJzb2x1dGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgZXZlbnQgRXZlbnRIYW5kbGVyPElBbUxvYWRhYmxlPiBPbk5hdmlnYXRlZDtcbnB1YmxpYyBJQW1Mb2FkYWJsZSBMYXN0TmF2aWdhdGVDb250cm9sbGVyXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBfYWN0dWFsQ29udHJvbGxlcjtcclxuICAgIH1cclxufVxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBTdWJzY3JpYmUgdG8gYW5jaG9ycyBjbGlja1xuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIEluaXROYXZpZ2F0aW9uKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5FbmFibGVTcGFmQW5jaG9ycygpO1xuXG4gICAgICAgICAgICAvLyBnbyBob21lXG4gICAgICAgICAgICB0aGlzLk5hdmlnYXRlKHRoaXMuQ29uZmlndXJhdGlvbi5Ib21lSWQpO1xuICAgICAgICB9XG5cbiAgICAgICBcbiAgICB9XG59IiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uTGlucTtcbnVzaW5nIEJyaWRnZS5qUXVlcnkyO1xuXG5uYW1lc3BhY2UgQnJpZGdlLk5hdmlnYXRpb25cbntcbiAgICAvLy8gPHN1bW1hcnk+XG4gICAgLy8vIElOYXZpZ2F0b3JDb25maWd1cmF0b3IgSW1wbGVtZW50YXRpb24uIE11c3QgYmUgZXh0ZW5kZWQuXG4gICAgLy8vIDwvc3VtbWFyeT5cbiAgICBwdWJsaWMgYWJzdHJhY3QgY2xhc3MgQnJpZGdlTmF2aWdhdG9yQ29uZmlnQmFzZSA6IElOYXZpZ2F0b3JDb25maWd1cmF0b3JcbiAgICB7XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgSUxpc3Q8SVBhZ2VEZXNjcmlwdG9yPiBfcm91dGVzO1xuXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBJTGlzdDxJUGFnZURlc2NyaXB0b3I+IENyZWF0ZVJvdXRlcygpO1xuICAgICAgICBwdWJsaWMgYWJzdHJhY3QgalF1ZXJ5IEJvZHkgeyBnZXQ7IH1cbiAgICAgICAgcHVibGljIGFic3RyYWN0IHN0cmluZyBIb21lSWQgeyBnZXQ7IH1cbiAgICAgICAgcHVibGljIGFic3RyYWN0IGJvb2wgRGlzYWJsZUF1dG9TcGFmQW5jaG9yc09uTmF2aWdhdGUgeyBnZXQ7IH1cblxuXG5cbiAgICAgICAgcHJvdGVjdGVkIEJyaWRnZU5hdmlnYXRvckNvbmZpZ0Jhc2UoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9yb3V0ZXMgPSB0aGlzLkNyZWF0ZVJvdXRlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIElQYWdlRGVzY3JpcHRvciBHZXRQYWdlRGVzY3JpcHRvckJ5S2V5KHN0cmluZyBrZXkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlNpbmdsZU9yRGVmYXVsdDxJUGFnZURlc2NyaXB0b3I+KHRoaXMuX3JvdXRlcywoRnVuYzxJUGFnZURlc2NyaXB0b3IsYm9vbD4pKHM9PiBzdHJpbmcuRXF1YWxzKHMuS2V5LCBrZXksIFN0cmluZ0NvbXBhcmlzb24uQ3VycmVudEN1bHR1cmVJZ25vcmVDYXNlKSkpO1xuICAgICAgICB9XG5cbiAgICB9XG59IiwidXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBCcmlkZ2UuSHRtbDU7XG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbi5Nb2RlbDtcbnVzaW5nIE5ld3RvbnNvZnQuSnNvbjtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgcHVibGljIGNsYXNzIENvbXBsZXhPYmplY3ROYXZpZ2F0aW9uSGlzdG9yeSA6IElCcm93c2VySGlzdG9yeU1hbmFnZXJcbiAgICB7XG4gICAgICAgIHB1YmxpYyB2b2lkIFB1c2hTdGF0ZShzdHJpbmcgcGFnZUlkLCBEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzID0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGJhc2VVcmwgPSBOYXZpZ2F0aW9uVXRpbGl0eS5CdWlsZEJhc2VVcmwocGFnZUlkKTtcblxuICAgICAgICAgICAgV2luZG93Lkhpc3RvcnkuUHVzaFN0YXRlKG51bGwsIHN0cmluZy5FbXB0eSxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzICE9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgPyBzdHJpbmcuRm9ybWF0KFwiezB9PXsxfVwiLGJhc2VVcmwsR2xvYmFsLkJ0b2EoSnNvbkNvbnZlcnQuU2VyaWFsaXplT2JqZWN0KHBhcmFtZXRlcnMpKSk6IGJhc2VVcmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIFVybERlc2NyaXB0b3IgUGFyc2VVcmwoKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgcmVzID0gbmV3IFVybERlc2NyaXB0b3IoKTtcblxuICAgICAgICAgICAgdmFyIGhhc2ggPSBXaW5kb3cuTG9jYXRpb24uSGFzaDtcbiAgICAgICAgICAgIGhhc2ggPSBoYXNoLlJlcGxhY2UoXCIjXCIsIFwiXCIpO1xuXG4gICAgICAgICAgICBpZiAoc3RyaW5nLklzTnVsbE9yRW1wdHkoaGFzaCkpIHJldHVybiByZXM7XG5cbiAgICAgICAgICAgIHZhciBlcXVhbEluZGV4ID0gaGFzaC5JbmRleE9mKCc9Jyk7XG4gICAgICAgICAgICBpZiAoZXF1YWxJbmRleCA9PSAtMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXMuUGFnZUlkID0gaGFzaDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXMuUGFnZUlkID0gaGFzaC5TdWJzdHJpbmcoMCwgZXF1YWxJbmRleCk7ICBcblxuICAgICAgICAgICAgdmFyIGRvdWJsZVBvaW50c0luZHggPSBlcXVhbEluZGV4ICsgMTtcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gaGFzaC5TdWJzdHJpbmcoZG91YmxlUG9pbnRzSW5keCwgaGFzaC5MZW5ndGggLSBkb3VibGVQb2ludHNJbmR4KTtcblxuICAgICAgICAgICAgaWYgKHN0cmluZy5Jc051bGxPckVtcHR5KHBhcmFtZXRlcnMpKSByZXR1cm4gcmVzOyAvLyBubyBwYXJhbWV0ZXJzXG5cbiAgICAgICAgICAgIHZhciBkZWNvZGVkID0gR2xvYmFsLkF0b2IocGFyYW1ldGVycyk7XG4gICAgICAgICAgICB2YXIgZGVzZXJpYWxpemVkID0gSnNvbkNvbnZlcnQuRGVzZXJpYWxpemVPYmplY3Q8RGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4+KGRlY29kZWQpO1xuXG4gICAgICAgICAgICByZXMuUGFyYW1ldGVycyA9IGRlc2VyaWFsaXplZDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgIH1cbn0iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5MaW5xO1xudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcbnVzaW5nIEJyaWRnZS5qUXVlcnkyO1xuXG5uYW1lc3BhY2UgQnJpZGdlLk5hdmlnYXRpb25cbntcbiAgICBwdWJsaWMgY2xhc3MgUGFnZURlc2NyaXB0b3IgOiBJUGFnZURlc2NyaXB0b3JcbiAgICB7XG4gICAgICAgIHB1YmxpYyBQYWdlRGVzY3JpcHRvcigpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuQXV0b0VuYWJsZVNwYWZBbmNob3JzID0gKCkgPT4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgS2V5IHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIEZ1bmM8c3RyaW5nPiBIdG1sTG9jYXRpb24geyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgRnVuYzxJQW1Mb2FkYWJsZT4gUGFnZUNvbnRyb2xsZXIgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgRnVuYzxib29sPiBDYW5CZURpcmVjdExvYWQgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgQWN0aW9uIFByZXBhcmVQYWdlIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIGJvb2wgU2VxdWVudGlhbERlcGVuZGVuY2llc1NjcmlwdExvYWQgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgRnVuYzxzdHJpbmc+IFJlZGlyZWN0UnVsZXMgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgRnVuYzxib29sPiBBdXRvRW5hYmxlU3BhZkFuY2hvcnMgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgRnVuYzxJRW51bWVyYWJsZTxzdHJpbmc+PiBEZXBlbmRlbmNpZXNTY3JpcHRzIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICBcbiAgICAgICAgcHVibGljIGJvb2wgRnVsbFNjcmVlbiB7IGdldDsgc2V0OyB9XG4gICAgfVxuXG4gICAgXG59IiwidXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uTGlucTtcbnVzaW5nIFN5c3RlbS5UZXh0O1xudXNpbmcgQnJpZGdlLkh0bWw1O1xudXNpbmcgQnJpZGdlLk5hdmlnYXRpb24uTW9kZWw7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuTmF2aWdhdGlvblxue1xuICAgIHB1YmxpYyBjbGFzcyBRdWVyeVBhcmFtZXRlck5hdmlnYXRpb25IaXN0b3J5IDogSUJyb3dzZXJIaXN0b3J5TWFuYWdlclxuICAgIHtcbiAgICAgICAgcHVibGljIHZvaWQgUHVzaFN0YXRlKHN0cmluZyBwYWdlSWQsIERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMgPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgYmFzZVVybCA9IE5hdmlnYXRpb25VdGlsaXR5LkJ1aWxkQmFzZVVybChwYWdlSWQpO1xuXG4gICAgICAgICAgICBXaW5kb3cuSGlzdG9yeS5QdXNoU3RhdGUobnVsbCwgc3RyaW5nLkVtcHR5LFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMgIT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICA/IHN0cmluZy5Gb3JtYXQoXCJ7MH17MX1cIixiYXNlVXJsLEJ1aWxkUXVlcnlQYXJhbWV0ZXIocGFyYW1ldGVycykpOiBiYXNlVXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBVcmxEZXNjcmlwdG9yIFBhcnNlVXJsKClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHJlcyA9IG5ldyBVcmxEZXNjcmlwdG9yKCk7XG4gICAgICAgICAgICByZXMuUGFyYW1ldGVycyA9IG5ldyBEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PigpO1xuXG4gICAgICAgICAgICB2YXIgaGFzaCA9IFdpbmRvdy5Mb2NhdGlvbi5IYXNoO1xuICAgICAgICAgICAgaGFzaCA9IGhhc2guUmVwbGFjZShcIiNcIiwgXCJcIik7XG5cbiAgICAgICAgICAgIGlmIChzdHJpbmcuSXNOdWxsT3JFbXB0eShoYXNoKSkgcmV0dXJuIHJlcztcblxuICAgICAgICAgICAgdmFyIGVxdWFsSW5kZXggPSBoYXNoLkluZGV4T2YoJz8nKTtcbiAgICAgICAgICAgIGlmIChlcXVhbEluZGV4ID09IC0xKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlcy5QYWdlSWQgPSBoYXNoO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcy5QYWdlSWQgPSBoYXNoLlN1YnN0cmluZygwLCBlcXVhbEluZGV4KTsgIFxuXG4gICAgICAgICAgICB2YXIgZG91YmxlUG9pbnRzSW5keCA9IGVxdWFsSW5kZXggKyAxO1xuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBoYXNoLlN1YnN0cmluZyhkb3VibGVQb2ludHNJbmR4LCBoYXNoLkxlbmd0aCAtIGRvdWJsZVBvaW50c0luZHgpO1xuXG4gICAgICAgICAgICBpZiAoc3RyaW5nLklzTnVsbE9yRW1wdHkocGFyYW1ldGVycykpIHJldHVybiByZXM7IC8vIG5vIHBhcmFtZXRlcnNcblxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgc3BsaXR0ZWRCeURvdWJsZUFuZCA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuVG9MaXN0PHN0cmluZz4ocGFyYW1ldGVycy5TcGxpdChcIiZcIikpO1xuICAgICAgICAgICAgc3BsaXR0ZWRCeURvdWJsZUFuZC5Gb3JFYWNoKChTeXN0ZW0uQWN0aW9uPHN0cmluZz4pKGYgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgc3BsaXR0ZWQgPSBmLlNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgICAgICByZXMuUGFyYW1ldGVycy5BZGQoc3BsaXR0ZWRbMF0sR2xvYmFsLkRlY29kZVVSSUNvbXBvbmVudChzcGxpdHRlZFsxXSkpO1xuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgQnVpbGRRdWVyeVBhcmFtZXRlcihEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAocGFyYW1ldGVycyA9PSBudWxsIHx8ICFTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkFueTxLZXlWYWx1ZVBhaXI8c3RyaW5nLG9iamVjdD4+KHBhcmFtZXRlcnMpKSByZXR1cm4gc3RyaW5nLkVtcHR5O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgc3RyQnVpbGRlciA9IG5ldyBTdHJpbmdCdWlsZGVyKFwiP1wiKTtcbiAgICAgICAgICAgIGZvcmVhY2ggKHZhciBrZXlWYWx1ZVBhaXIgaW4gcGFyYW1ldGVycylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdHJCdWlsZGVyLkFwcGVuZChHbG9iYWwuRW5jb2RlVVJJQ29tcG9uZW50KGtleVZhbHVlUGFpci5LZXkpKTtcbiAgICAgICAgICAgICAgICBzdHJCdWlsZGVyLkFwcGVuZChcIj1cIik7XG4gICAgICAgICAgICAgICAgc3RyQnVpbGRlci5BcHBlbmQoR2xvYmFsLkVuY29kZVVSSUNvbXBvbmVudChrZXlWYWx1ZVBhaXIuVmFsdWUuVG9TdHJpbmcoKSkpO1xuICAgICAgICAgICAgICAgIHN0ckJ1aWxkZXIuQXBwZW5kKFwiJlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlcyA9IHN0ckJ1aWxkZXIuVG9TdHJpbmcoKS5UcmltRW5kKCcmJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiByZXM7XG5cbiAgICAgICAgfVxuXG4gICAgfVxufSIsInVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbjtcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuU3BhZlxyXG57XHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgY2xhc3MgTG9hZGFibGVWaWV3TW9kZWwgOiBWaWV3TW9kZWxCYXNlLCBJQW1Mb2FkYWJsZVxyXG4gICAge1xyXG4gICAgICAgIHByb3RlY3RlZCBMaXN0PElWaWV3TW9kZWxMaWZlQ3ljbGU+IFBhcnRpYWxzIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgT25Mb2FkKERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLkFwcGx5QmluZGluZ3MoKTtcclxuICAgICAgICAgICAgZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LlRvVGVtcChcImtleTFcIix0aGlzLlBhcnRpYWxzKSE9bnVsbD9nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbUxhbWJkYSgoKT0+Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21UZW1wPExpc3Q8SVZpZXdNb2RlbExpZmVDeWNsZT4+KFwia2V5MVwiKS5Gb3JFYWNoKChTeXN0ZW0uQWN0aW9uPElWaWV3TW9kZWxMaWZlQ3ljbGU+KShmPT4gZi5Jbml0KHBhcmFtZXRlcnMpKSkpOm51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIE9uTGVhdmUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2xvYmFsOjpCcmlkZ2UuU2NyaXB0LlRvVGVtcChcImtleTJcIix0aGlzLlBhcnRpYWxzKSE9bnVsbD9nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbUxhbWJkYSgoKT0+Z2xvYmFsOjpCcmlkZ2UuU2NyaXB0LkZyb21UZW1wPExpc3Q8SVZpZXdNb2RlbExpZmVDeWNsZT4+KFwia2V5MlwiKS5Gb3JFYWNoKChTeXN0ZW0uQWN0aW9uPElWaWV3TW9kZWxMaWZlQ3ljbGU+KShmPT5mLkRlSW5pdCgpKSkpOm51bGw7XHJcbiAgICAgICAgICAgIGJhc2UuUmVtb3ZlQmluZGluZ3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgT25CZWZvcmVCaW5kaW5nKERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBPbkJpbmRpbmdEb25lKERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgIH1cclxuXG4gICAgXG5wcml2YXRlIExpc3Q8SVZpZXdNb2RlbExpZmVDeWNsZT4gX19Qcm9wZXJ0eV9fSW5pdGlhbGl6ZXJfX1BhcnRpYWxzPW5ldyBMaXN0PElWaWV3TW9kZWxMaWZlQ3ljbGU+KCk7fVxyXG59IiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBCcmlkZ2UualF1ZXJ5MjtcbnVzaW5nIFJldHlwZWQ7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuU3BhZlxue1xuICAgIHB1YmxpYyBhYnN0cmFjdCBjbGFzcyBQYXJ0aWFsTW9kZWwgOiAgSVZpZXdNb2RlbExpZmVDeWNsZVxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSBkb20uSFRNTERpdkVsZW1lbnQgX3BhcnRpYWxFbGVtZW50O1xuXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cbiAgICAgICAgLy8vIEVsZW1lbnQgaWQgb2YgdGhlIHBhZ2UgXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgICAgIC8vLyA8cmV0dXJucz48L3JldHVybnM+XG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBzdHJpbmcgRWxlbWVudElkKCk7XG4gICAgICAgIFxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBIdG1sTG9jYXRpb25cbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IHN0cmluZyBIdG1sVXJsIHsgZ2V0OyB9XG5cblxuICAgICAgICAvLy8gPHN1bW1hcnk+XG4gICAgICAgIC8vLyBJbml0IHBhcnRpYWxcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwicGFyYW1ldGVyc1wiPmRhdGEgZm9yIGluaXQgdGhlIHBhcnRpYWxzPC9wYXJhbT5cbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBJbml0KERpY3Rpb25hcnk8c3RyaW5nLG9iamVjdD4gcGFyYW1ldGVycylcbiAgICAgICAge1xuXG4gICAgICAgICAgICBqUXVlcnkuR2V0KHRoaXMuSHRtbFVybCwgbnVsbCwgKEFjdGlvbjxvYmplY3Qsc3RyaW5nLGpxWEhSPikoKG8sIHMsIGFyZzMpID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5PbkJlZm9yZUJpbmRpbmcocGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFydGlhbEVsZW1lbnQgPSBuZXcgZG9tLkhUTUxEaXZFbGVtZW50XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbm5lckhUTUwgPSBvLlRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gZG9tLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKEVsZW1lbnRJZCgpKTtcbiAgICAgICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkPGRvbS5IVE1MRGl2RWxlbWVudD4odGhpcy5fcGFydGlhbEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGtub2Nrb3V0LmtvLmFwcGx5QmluZGluZ3ModGhpcywgdGhpcy5fcGFydGlhbEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuT25CaW5kaW5nRG9uZShwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gQ2FsbGVkIHdoZW4gaHRtbCBpcyBsb2FkZWQgYnV0IGtvIGlzIG5vdCBiaW5kZWRcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwicGFyYW1ldGVyc1wiPjwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgT25CZWZvcmVCaW5kaW5nKERpY3Rpb25hcnk8c3RyaW5nLG9iamVjdD4gcGFyYW1ldGVycyl7fVxuICAgICAgICBcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxuICAgICAgICAvLy8gQ2FsbGVkIHdoZW4gaHRtbCBpcyBsb2FkZWQgYW5kIGtvIGlzIGJpbmRlZCBcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwicGFyYW1ldGVyc1wiPjwvcGFyYW0+XG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgT25CaW5kaW5nRG9uZShEaWN0aW9uYXJ5PHN0cmluZyxvYmplY3Q+IHBhcmFtZXRlcnMpe31cblxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIERlSW5pdCgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGtvIGNvbnRhaW5zIHRoaXMgbm9kZVxuICAgICAgICAgICAgaWYgKHRoaXMuX3BhcnRpYWxFbGVtZW50ID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBkYXRhID0ga25vY2tvdXQua28uZGF0YUZvcih0aGlzLl9wYXJ0aWFsRWxlbWVudCk7XG4gICAgICAgICAgICBpZiAoZGF0YSA9PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGtub2Nrb3V0LmtvLnJlbW92ZU5vZGUodGhpcy5fcGFydGlhbEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGludGVyZmFjZSBJVmlld01vZGVsTGlmZUN5Y2xlXG4gICAge1xuICAgICAgICB2b2lkIEluaXQoRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycyk7XG4gICAgICAgIHZvaWQgRGVJbml0KCk7XG4gICAgfVxufVxuXG5cblxuIiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBCcmlkZ2UuSHRtbDU7XG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbi5Nb2RlbDtcblxubmFtZXNwYWNlIEJyaWRnZS5OYXZpZ2F0aW9uXG57XG4gICAgcHVibGljIGNsYXNzIEJyaWRnZU5hdmlnYXRvcldpdGhSb3V0aW5nIDogQnJpZGdlTmF2aWdhdG9yXG4gICAge1xuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IElCcm93c2VySGlzdG9yeU1hbmFnZXIgX2Jyb3dzZXJIaXN0b3J5TWFuYWdlcjtcblxuICAgICAgICBwdWJsaWMgQnJpZGdlTmF2aWdhdG9yV2l0aFJvdXRpbmcoSU5hdmlnYXRvckNvbmZpZ3VyYXRvciBjb25maWd1cmF0aW9uLCBJQnJvd3Nlckhpc3RvcnlNYW5hZ2VyIGJyb3dzZXJIaXN0b3J5TWFuYWdlcikgOiBiYXNlKGNvbmZpZ3VyYXRpb24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIF9icm93c2VySGlzdG9yeU1hbmFnZXIgPSBicm93c2VySGlzdG9yeU1hbmFnZXI7XG4gICAgICAgICAgICBXaW5kb3cuT25Qb3BTdGF0ZSArPSBlID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHVybEluZm8gPSBfYnJvd3Nlckhpc3RvcnlNYW5hZ2VyLlBhcnNlVXJsKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5OYXZpZ2F0ZVdpdGhvdXRQdXNoU3RhdGUoc3RyaW5nLklzTnVsbE9yRW1wdHkodXJsSW5mby5QYWdlSWQpID8gY29uZmlndXJhdGlvbi5Ib21lSWQgOiB1cmxJbmZvLlBhZ2VJZCwgdXJsSW5mby5QYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHZvaWQgTmF2aWdhdGVXaXRob3V0UHVzaFN0YXRlKHN0cmluZyBwYWdlSWQsIERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMgPSBudWxsKVxuICAgICAgICB7XG4gICAgICAgICAgICBiYXNlLk5hdmlnYXRlKHBhZ2VJZCwgcGFyYW1ldGVycyk7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgTmF2aWdhdGUoc3RyaW5nIHBhZ2VJZCwgRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycyA9IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIF9icm93c2VySGlzdG9yeU1hbmFnZXIuUHVzaFN0YXRlKHBhZ2VJZCxwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIGJhc2UuTmF2aWdhdGUocGFnZUlkLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIEluaXROYXZpZ2F0aW9uKClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHBhcnNlZCA9IF9icm93c2VySGlzdG9yeU1hbmFnZXIuUGFyc2VVcmwoKTtcblxuICAgICAgICAgICAgaWYgKHN0cmluZy5Jc051bGxPckVtcHR5KHBhcnNlZC5QYWdlSWQpKVxuICAgICAgICAgICAgICAgIGJhc2UuSW5pdE5hdmlnYXRpb24oKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBiYXNlLkVuYWJsZVNwYWZBbmNob3JzKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcGFnZSA9IHRoaXMuQ29uZmlndXJhdGlvbi5HZXRQYWdlRGVzY3JpcHRvckJ5S2V5KHBhcnNlZC5QYWdlSWQpO1xuICAgICAgICAgICAgICAgIGlmIChwYWdlID09IG51bGwpIHRocm93IG5ldyBFeGNlcHRpb24oc3RyaW5nLkZvcm1hdChcIlBhZ2Ugbm90IGZvdW5kIHdpdGggSUQgezB9XCIscGFyc2VkLlBhZ2VJZCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgbm90IG51bGwgYW5kIGV2YWx1YXRpb24gaXMgZmFsc2UgZmFsbGJhY2sgdG8gaG9tZVxuICAgICAgICAgICAgICAgIGlmIChwYWdlLkNhbkJlRGlyZWN0TG9hZCAhPSBudWxsICYmICFwYWdlLkNhbkJlRGlyZWN0TG9hZC5JbnZva2UoKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIF9icm93c2VySGlzdG9yeU1hbmFnZXIuUHVzaFN0YXRlKHRoaXMuQ29uZmlndXJhdGlvbi5Ib21lSWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLk5hdmlnYXRlV2l0aG91dFB1c2hTdGF0ZSh0aGlzLkNvbmZpZ3VyYXRpb24uSG9tZUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLk5hdmlnYXRlKHBhcnNlZC5QYWdlSWQscGFyc2VkLlBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXG4gICAgIFxuICAgICAgICBcbiAgICB9XG59IiwidXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIEJyaWRnZS5qUXVlcnkyO1xyXG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbjtcclxudXNpbmcgQnJpZGdlLlNwYWYuVmlld01vZGVscztcclxuXHJcbm5hbWVzcGFjZSBCcmlkZ2UuU3BhZlxyXG57XHJcbiAgICBjbGFzcyBDdXN0b21Sb3V0ZXNDb25maWcgOiBCcmlkZ2VOYXZpZ2F0b3JDb25maWdCYXNlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIElMaXN0PElQYWdlRGVzY3JpcHRvcj4gQ3JlYXRlUm91dGVzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWw6OkJyaWRnZS5TY3JpcHQuQ2FsbEZvcihuZXcgTGlzdDxJUGFnZURlc2NyaXB0b3I+KCksKF9vMSk9PntfbzEuQWRkKG5ldyBQYWdlRGVzY3JpcHRvclxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENhbkJlRGlyZWN0TG9hZCA9ICgpPT50cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIEh0bWxMb2NhdGlvbiA9ICgpPT5cInBhZ2VzL2hvbWUuaHRtbFwiLCAvLyB5b3V0IGh0bWwgbG9jYXRpb25cclxuICAgICAgICAgICAgICAgICAgICBLZXkgPSBTcGFmQXBwLkhvbWVJZCxcclxuICAgICAgICAgICAgICAgICAgICBQYWdlQ29udHJvbGxlciA9ICgpID0+IFNwYWZBcHAuQ29udGFpbmVyLlJlc29sdmU8SG9tZVZpZXdNb2RlbD4oKVxyXG4gICAgICAgICAgICAgICAgfSk7X28xLkFkZChuZXcgUGFnZURlc2NyaXB0b3JcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBDYW5CZURpcmVjdExvYWQgPSAoKT0+dHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBIdG1sTG9jYXRpb24gPSAoKT0+XCJwYWdlcy9zZWNvbmQuaHRtbFwiLCAvLyB5b3V0IGh0bWwgbG9jYXRpb25cclxuICAgICAgICAgICAgICAgICAgICBLZXkgPSBTcGFmQXBwLlNlY29uZElkLFxyXG4gICAgICAgICAgICAgICAgICAgIFBhZ2VDb250cm9sbGVyID0gKCkgPT4gU3BhZkFwcC5Db250YWluZXIuUmVzb2x2ZTxTZWNvbmRWaWV3TW9kZWw+KClcclxuICAgICAgICAgICAgICAgIH0pO3JldHVybiBfbzE7fSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgYm9vbCBEaXNhYmxlQXV0b1NwYWZBbmNob3JzT25OYXZpZ2F0ZSB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBqUXVlcnkgQm9keSB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBIb21lSWQgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XG5cbiAgICBcbnByaXZhdGUgYm9vbCBfX1Byb3BlcnR5X19Jbml0aWFsaXplcl9fRGlzYWJsZUF1dG9TcGFmQW5jaG9yc09uTmF2aWdhdGU9dHJ1ZTtwcml2YXRlIGpRdWVyeSBfX1Byb3BlcnR5X19Jbml0aWFsaXplcl9fQm9keT1qUXVlcnkuU2VsZWN0KFwiI3BhZ2VCb2R5XCIpO3ByaXZhdGUgc3RyaW5nIF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19Ib21lSWQ9U3BhZkFwcC5Ib21lSWQ7fVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgQnJpZGdlLkh0bWw1O1xudXNpbmcgQnJpZGdlLk5hdmlnYXRpb247XG51c2luZyBzcGFmLmRlc2t0b3A7XG5cbm5hbWVzcGFjZSBCcmlkZ2UuU3BhZi5WaWV3TW9kZWxzXG57XG4gICAgcHVibGljIGNsYXNzIEhvbWVWaWV3TW9kZWwgOiBMb2FkYWJsZVZpZXdNb2RlbFxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBJTmF2aWdhdG9yIF9uYXZpZ2F0b3I7XG5wdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIEVsZW1lbnRJZCgpXHJcbntcclxuICAgIHJldHVybiBTcGFmQXBwLkhvbWVJZDtcclxufVxuICAgICAgICBwdWJsaWMgc3RyaW5nIFRlc3QgeyBnZXQ7IHNldDsgfVxuXG4gICAgICAgIHB1YmxpYyBIb21lVmlld01vZGVsKElOYXZpZ2F0b3IgbmF2aWdhdG9yKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9uYXZpZ2F0b3IgPSBuYXZpZ2F0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBPbkJlZm9yZUJpbmRpbmcoRGljdGlvbmFyeTxzdHJpbmcsIG9iamVjdD4gcGFyYW1ldGVycylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHNvY2tldHRvbmUgPSBuZXcgU29ja2V0dG9uZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLlRlc3QgPSBcIkFudGFuaSFcIjtcbiAgICAgICAgICAgIGJhc2UuT25CZWZvcmVCaW5kaW5nKHBhcmFtZXRlcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgT25CaW5kaW5nRG9uZShEaWN0aW9uYXJ5PHN0cmluZywgb2JqZWN0PiBwYXJhbWV0ZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICBiYXNlLk9uQmluZGluZ0RvbmUocGFyYW1ldGVycyk7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIkJpbmRpbmcgRG9uZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIFNheUhlbGxvSnMoKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcImhlbGxvXCIpO1xuXG4gICAgICAgICAgICBHbG9iYWwuQWxlcnQoXCJIZWxsbyFcIik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBHb1RvUGFnZTIoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9uYXZpZ2F0b3IuTmF2aWdhdGUoU3BhZkFwcC5TZWNvbmRJZCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBCcmlkZ2UuSHRtbDU7XG51c2luZyBCcmlkZ2UuTmF2aWdhdGlvbjtcblxubmFtZXNwYWNlIEJyaWRnZS5TcGFmLlZpZXdNb2RlbHNcbntcbiAgICBwdWJsaWMgY2xhc3MgU2Vjb25kVmlld01vZGVsIDogTG9hZGFibGVWaWV3TW9kZWxcbiAgICB7XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgSU5hdmlnYXRvciBfbmF2aWdhdG9yO1xucHVibGljIG92ZXJyaWRlIHN0cmluZyBFbGVtZW50SWQoKVxyXG57XHJcbiAgICByZXR1cm4gU3BhZkFwcC5TZWNvbmRJZDtcclxufVxuICAgICAgICBwdWJsaWMgU2Vjb25kVmlld01vZGVsKElOYXZpZ2F0b3IgbmF2aWdhdG9yKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9uYXZpZ2F0b3IgPSBuYXZpZ2F0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBPbkJpbmRpbmdEb25lKERpY3Rpb25hcnk8c3RyaW5nLCBvYmplY3Q+IHBhcmFtZXRlcnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiV2VsY29tZSFcIik7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBCYWNrVG9Ib21lKClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fbmF2aWdhdG9yLk5hdmlnYXRlKFNwYWZBcHAuSG9tZUlkKTtcbiAgICAgICAgfVxuICAgIH1cbn0iXQp9Cg==
