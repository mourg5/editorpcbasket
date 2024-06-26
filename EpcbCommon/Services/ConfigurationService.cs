using Config.Net;
using EpcbCommon.Contracts;

namespace EpcbCommon.Services
{
	public class ConfigurationService : IConfigurationService
	{
		public ConfigurationService()
		{
			Config = new ConfigurationBuilder<IConfiguration>()
				.UseAppConfig()
				.Build();
		}

		public IConfiguration Config { get; private set; }
	}
}
