using EpcbUtils.Dialogs;
using MaterialDesignThemes.Wpf;
using Prism.Commands;

namespace Editor_PCBasket___Mou.ViewModels.Dialogs
{
	public class InputDialogViewModel : BaseDialogViewModel
	{
		public InputDialogViewModel(DialogOptions options)
			: base(options)
		{
			SecondButtonText = options.SecondButtonText;
			InitializeCommands();
		}

		private void InitializeCommands()
		{
			AcceptCommand = new DelegateCommand(() =>
			{
				DialogHost.CloseDialogCommand.Execute(InputText, null);
			});
		}

		private string _inputText;
		private string _secondButtonText;

		public DelegateCommand AcceptCommand { get; set; }

		public string SecondButtonText
		{
			get { return _secondButtonText; }
			set { SetProperty(ref _secondButtonText, value); }
		}

		public string InputText
		{
			get { return _inputText; }
			set { SetProperty(ref _inputText, value); }
		}
	}
}
