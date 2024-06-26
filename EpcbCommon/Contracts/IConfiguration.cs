using System.ComponentModel;

namespace EpcbCommon.Contracts
{
	public interface IConfiguration
	{
		string PcbPath { get; set; }

		[DefaultValue((short)1999)]
		short StartingYear { get; set; }
		
		bool SettingsCompleted { get; set; }
		
		bool UseEurNacionality { get; set; }
		bool UseCotNacionality { get; set; }
	}
}
