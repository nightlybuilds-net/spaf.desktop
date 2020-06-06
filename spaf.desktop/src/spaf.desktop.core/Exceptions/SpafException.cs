using System;
using System.Runtime.Serialization;

namespace spaf.desktop.core.Exceptions
{
    [Serializable]
    public class SpafException : Exception
    {
        //
        // For guidelines regarding the creation of new exception types, see
        //    http://msdn.microsoft.com/library/default.asp?url=/library/en-us/cpgenref/html/cpconerrorraisinghandlingguidelines.asp
        // and
        //    http://msdn.microsoft.com/library/default.asp?url=/library/en-us/dncscol/html/csharp07192001.asp
        //

        public SpafException()
        {
        }

        public SpafException(string message) : base(message)
        {
        }

        public SpafException(string message, Exception inner) : base(message, inner)
        {
        }

        protected SpafException(
            SerializationInfo info,
            StreamingContext context) : base(info, context)
        {
        }
    }
}