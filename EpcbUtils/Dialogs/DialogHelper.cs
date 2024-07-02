using MaterialDesignThemes.Wpf;
using System;
using System.Threading.Tasks;

namespace EpcbUtils.Dialogs
{
	public static class DialogHelper
	{
		public static event ShowDialogEventHandler OnShowDialog;
		public static event EventHandler<DialogOptions> OnShowDialogOnUiThread;
		public static event EventHandler OnCloseDialog;
		public delegate Task<object> ShowDialogEventHandler(object sender, DialogOptions options, object args = null);

		public static void ShowSimpleDialog(DialogOptions options)
		{
			OnShowDialog?.Invoke("", options);
		}

		public static void ShowSimpleDialog(string message, PackIconKind icon = PackIconKind.None, string title = "")
		{
			OnShowDialog?.Invoke("", new DialogOptions()
			{
				Type = DialogEnums.DialogType.SimpleDialog,
				DialogMessage = message,
				Title = title,
				ButtonText = "Aceptar",
				Icon = icon
			});
		}

		public static async Task<string> ShowInputDialog(string message, PackIconKind icon = PackIconKind.None, string title = "")
		{
			if (OnShowDialog == null) return "";

			var result = await OnShowDialog.Invoke("", new DialogOptions()
			{
				Type = DialogEnums.DialogType.InputDialog,
				DialogMessage = message,
				Title = title,
				ButtonText = "Cancelar",
				SecondButtonText = "Aceptar",
				Icon = icon
			});

			if (result == null) return string.Empty;
			return result.ToString();
		}

		public static void ShowProballersImportDialog()
		{
			OnShowDialog?.Invoke("", new DialogOptions()
			{
				Type = DialogEnums.DialogType.ProballersImportDialog, 
				Title = "Importar equipo desde Proballers",
				ButtonText = "Cancelar",
				SecondButtonText = "Aceptar", 
				Icon = PackIconKind.WebSync
			});
		}

		//public static async Task<InstrumentSetting?> ShowAddInstrumentDialog(InstrumentType type)
		//{
		//	if (OnShowDialog == null) return null;

		//	var result = await OnShowDialog.Invoke("", new DialogOptions()
		//	{
		//		Type = DialogEnums.DialogType.AddInstrumentDialog,
		//		ButtonText = SoniaResources.Common_Cancel,
		//		SecondButtonText = SoniaResources.Common_Accept,
		//		Icon = PackIconKind.PlusNetworkOutline
		//	}, type);

		//	return (InstrumentSetting)result;
		//}

		public static void ShowDialogOnUiThread(DialogOptions options)
		{
			OnShowDialogOnUiThread?.Invoke("", options);
		}

		public static void ShowWaitingDialog(string message)
		{
			OnShowDialogOnUiThread?.Invoke("", new DialogOptions()
			{
				DialogMessage = message,
				Type = DialogEnums.DialogType.WaitingDialog,
				Icon = PackIconKind.TimerSand
			});
		}

		public static void CloseDialog()
		{
			OnCloseDialog?.Invoke("", null);
		}
	}
}

