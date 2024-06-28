using MaterialDesignThemes.Wpf;
using static EpcbUtils.Dialogs.DialogEnums;

namespace EpcbUtils.Dialogs
{
	public class DialogOptions
	{
		public DialogType Type { get; set; }
		public PackIconKind Icon { get; set; } = PackIconKind.None;
		public string DialogMessage { get; set; }
		public string ButtonText { get; set; }
		public string SecondButtonText { get; set; }
		public string Title { get; set; } = string.Empty;
	}
}
