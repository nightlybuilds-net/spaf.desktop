using System;

namespace spaf.desktop.core
{
    public interface IRemoteTest
    {
        void Prova(string name, int age);
    }

    public class RemoteTest : IRemoteTest
    {
        public void Prova(string name, int age)
        {
            Console.WriteLine($"Name: {name}, Age {age}");
        }
    }
}