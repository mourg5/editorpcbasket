using EpcbModel;
using Prism.Mvvm;

namespace Editor_PCBasket___Mou.ViewModels
{
	public class AbilitiesViewModel : BindableBase, IAbilities
	{
		private bool _isVeloz;

		public bool IsVeloz
		{
			get { return _isVeloz; }
			set { SetProperty(ref _isVeloz, value); }
		}

		private bool _isAtletico;

		public bool IsAtletico
		{
			get { return _isAtletico; }
			set { SetProperty(ref _isAtletico, value); }
		}

		private bool _isIntimidador;

		public bool IsIntimidador
		{
			get { return _isIntimidador; }
			set { SetProperty(ref _isIntimidador, value); }
		}

		private bool _isTirador;

		public bool IsTirador
		{
			get { return _isTirador; }
			set { SetProperty(ref _isTirador, value); }
		}

		private bool _isCreador;

		public bool IsCreador
		{
			get { return _isCreador; }
			set { SetProperty(ref _isCreador, value); }
		}

		private bool _isDefensor;

		public bool IsDefensor
		{
			get { return _isDefensor; }
			set { SetProperty(ref _isDefensor, value); }
		}
	}
}
