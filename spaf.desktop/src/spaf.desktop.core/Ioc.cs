namespace spaf.desktop.core
{
    internal static class Ioc
    {
        public static IContainer Container { get; private set; }

        // /// <summary>
        // /// Register all content page
        // /// </summary>
        // public static void RegisterPages()
        // {
        //     ZeroApp.RegisterMany(type => type.IsClass && !type.IsAbstract && type.IsSubclassOf(typeof(ContentPage)));
        // }
        //
        // /// <summary>
        // /// Register all viewmodel that extend ZeroBaseModel
        // /// </summary>
        // public static void RegisterViewModels()
        // {
        //     ZeroApp.RegisterMany(type => type.IsClass && !type.IsAbstract && type.IsSubclassOf(typeof(ZeroBaseModel)));
        // }
        //
        

        internal static void UseContainer(IContainer container)
        {
            Container = container;
        }
    }
}