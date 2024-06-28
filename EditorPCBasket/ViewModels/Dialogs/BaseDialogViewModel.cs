using EpcbUtils.Dialogs;
using MaterialDesignThemes.Wpf;
using Prism.Mvvm;

namespace Editor_PCBasket___Mou.ViewModels.Dialogs
{
	public abstract class BaseDialogViewModel : BindableBase
	{
		public BaseDialogViewModel(DialogOptions options)
		{
			DialogMessage = options.DialogMessage;
			Title = options.Title;
			ButtonText = options.ButtonText;
			Icon = options.Icon;
		}

		private string _dialogMessage;
		public string DialogMessage
		{
			get { return _dialogMessage; }
			set { SetProperty(ref _dialogMessage, value); }
		}

		private string _buttonText;
		public string ButtonText
		{
			get { return _buttonText; }
			set { SetProperty(ref _buttonText, value); }
		}

		private string _title;
		public string Title
		{
			get { return _title; }
			set { SetProperty(ref _title, value.ToUpper()); }
		}

		private PackIconKind _icon;
		public PackIconKind Icon
		{
			get { return _icon; }
			set
			{
				SetProperty(ref _icon, value);
				IconSize = value == PackIconKind.None ? 0 : 48;
			}
		}

		private int _iconSize;
		public int IconSize
		{
			get { return _iconSize; }
			set { SetProperty(ref _iconSize, value); }
		}
	}
}
