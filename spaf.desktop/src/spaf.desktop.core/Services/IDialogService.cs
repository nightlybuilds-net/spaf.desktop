namespace spaf.desktop.core.Services
{
    public interface IDialogService
    {
        /// <summary>
        /// Show open file dialog
        /// </summary>
        /// <returns>full path of selected file. NULL if no file selected</returns>
        string OpenFileDialog(); // todo add method params
    }
}