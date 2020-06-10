using EpcbUtils.Messages;
using GalaSoft.MvvmLight.Messaging;
using System;
using System.IO;

namespace EpcbUtils
{
	public static class LoggerUtils
	{
		private static StreamWriter _logger;

		public static string LogFilePath { get; set; }

		public static void LogException(Exception ex)
		{
			_logger = File.AppendText(LogFilePath);
			_logger.WriteLine("[" + DateTime.Now.ToString() + "] " + ex.ToString());
			_logger.Close();
		}

		public static void LogString(string str)
		{
			_logger = File.AppendText(LogFilePath);
			_logger.WriteLine("[" + DateTime.Now.ToString() + "] " + str);
			_logger.Close();

			Messenger.Default.Send(new StatusMessage() { Message = str });
		}

		public static void CloseLogger()
		{
			_logger.Close();
		}
	}
}
