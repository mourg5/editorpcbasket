using EpcbUtils.Messages;
using GalaSoft.MvvmLight.Messaging;
using System;
using System.IO;
using System.Windows.Threading;

namespace EpcbUtils
{
	public static class LoggerUtils
	{
		private static StreamWriter _logger;

		public static string LogFilePath { get; set; }

		public static void LogException(Exception ex)
		{
			try
			{
				Dispatcher.CurrentDispatcher.Invoke(new Action(() =>
				{
					_logger = File.AppendText(LogFilePath);
					_logger.WriteLine("[" + DateTime.Now.ToString() + "] " + ex.ToString());
					_logger.Close();
				}));
			}
			catch (Exception)
			{

			}
		}

		public static void LogString(string str)
		{
			Dispatcher.CurrentDispatcher.Invoke(new Action(() =>
			{
				_logger = File.AppendText(LogFilePath);
				_logger.WriteLine("[" + DateTime.Now.ToString() + "] " + str);
				_logger.Close();

				Messenger.Default.Send(new StatusMessage() { Message = str });
			}));
		}

		public static void CloseLogger()
		{
			_logger.Close();
		}
	}
}
