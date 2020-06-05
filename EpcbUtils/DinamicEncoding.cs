using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EpcbUtils
{
	public class DinamicEncoding : Encoding
	{
		private char[] conversionArray = new[] { 'a', '\'', 'c', 'b', 'e', 'd', 'g', 'f', 'i', 'h', 'k', 'j', 'm', 'l', 'o', 'n', 'q', 'p', 's', 'r', 'u', 't', 'w', 'v', 'y', 'x', '{', 'z', 
												 '}', '|', ' ', '~', 'A', '@', 'C', 'B', 'E', 'D', 'G', 'F', 'I', 'H', 'K', 'J', 'M', 'L', 'O', 'N', 'Q', 'P', 'S', 'R', 'U', 'T', 'W', 'V', 
												 'Y', 'X', '[', 'Z', ']', '\\', '_', '^', '!', ' ', '#', '"', '%', '$', '\'', '&', ')', '(', '+', '*', '-', ',', '/', '.', '1', '0', '3',
												 '2', '5', '4', '7', '6', '9', '8', '=', '=', '=', '<', '?', '>', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=',
												 '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', 'á', 'à', 'ã', 'â', 'å', 'ä', 'ç', 'æ', 'é', 'è', 'ë', 'ê', 'í',
												 'ì', 'ï', 'î', 'ñ', ' ', 'ó', 'ò', 'õ', 'ô', '÷', 'ö', 'ù', 'ø', 'û', 'ú', 'ý', 'ü', 'ÿ', 'B', 'Á', 'À', 'Ã', 'Â', 'Å', 'Ä', 'Ç', 'Æ', 'É', 'È', 
												 'Ë', 'Ê', 'Í', 'Ì', 'Ï', 'Î', 'Ñ', 'D', 'Ó', 'Ò', 'Õ', 'Ô', 'x', 'Ö', 'Ù', 'Ø', 'Û', 'Ú', 'Ý', 'Ü', 'ß', 'D', '¡', '.', '£', '¢', '¥', ' ', '§',
												 '.', '©', '¨', '«', 'ª', '.', '¬', '.', '®', '±', '°', '.', '.', 'µ', '´', '•', '¶', '.', '.', '.', '.', '.', '.', '¿','=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=',
												 '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', };

		public override byte[] GetBytes(string s)
		{
			var bytes = new byte[s.Length];

			for (var i = 0; i < s.Length; i++)
			{
				bytes[i] = GetByte(s[i]);
			}
			return bytes;
		}
		public override string GetString(byte[] bytes)
		{
			var result = "";

			for (var i = 0; i < bytes.Length; i++)
			{
				result += conversionArray[bytes[i]];
			}

			return result;
		}
		public override int GetByteCount(char[] chars, int index, int count)
		{
			return chars.Length;
		}
		public override int GetBytes(char[] chars, int charIndex, int charCount, byte[] bytes, int byteIndex)
		{
			for (var i = 0; i < charCount; i++)
			{
				bytes[byteIndex + i] = GetByte(chars[charIndex + i]);
			}
			return charCount;
		}
		public override int GetCharCount(byte[] bytes, int index, int count)
		{
			return bytes.Length;
		}

		public override int GetChars(byte[] bytes, int byteIndex, int byteCount, char[] chars, int charIndex)
		{
			for (var i = 0; i < byteCount; i++)
			{
				chars[charIndex + i] = conversionArray[bytes[byteIndex + i]];
			}

			return byteCount;
		}

		public override int GetMaxByteCount(int charCount)
		{
			return charCount;
		}

		public override int GetMaxCharCount(int byteCount)
		{
			return byteCount;
		}

		private byte GetByte(char c)
		{
			for (var i = 0; i < conversionArray.Length; i++)
			{
				if (conversionArray[i] == c)
					return (byte)i;
			}

			return 99;
		}
	}
}
